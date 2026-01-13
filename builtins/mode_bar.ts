import { Mode, VAR, setMode } from "../base.ts";
import { Daemon, daemon, sendToDaemon } from "../daemon.ts";
import { powar } from "../deps.ts";
import { Ultra, UltraOpts } from "../mod.ts";
import { registerEventHandler } from "../yabai_events.ts";

const KARABINER_STATE_FILE =
  "/Library/Application Support/org.pqrs/tmp/karabiner_grabber_manipulator_environment.json";

function colourForMode(mode: Mode): string {
  switch (mode) {
    case "normal":
      return "blue";
    case "insert":
      return "green";
    case "native":
      return "filled";
    case "passthrough":
      return "hollow";
    case "visual":
      return "orange";
    case "search":
      return "question";
    default:
      return "red";
  }
}

export async function refreshModeBar(p: powar.ModuleApi, mode: Mode) {
  const colour = colourForMode(mode);
  p.info(`Sending colour ${colour} for mode ${mode}`);
  return await p.exec("nc -4u -w0 localhost 1738", {
    stdin: colour,
  });
}

export async function installModeBar(U: Ultra, p: powar.ModuleApi) {
  U.addStartup(
    registerEventHandler(U.opts, {
      kind: "application_front_switched",
      label: "notify_app_switch_daemon",
      action: (processId: string) =>
        sendToDaemon(MODE_SWITCH_DAEMON, {
          kind: "app_switch",
          appName: processId,
        }),
    })
  );
  U.addActionHook({
    after: "set-mode",
    action: (mode) =>
      sendToDaemon(MODE_SWITCH_DAEMON, {
        kind: "mode_switch",
        newMode: mode,
      }),
  });
  await p.exec(`open -a AnyBar`);
}

export type ModeSwitchDaemonMessage =
  | {
      kind: "app_switch";
      appName: string;
    }
  | {
      kind: "mode_switch";
      newMode: Mode;
    };

let currentApp: string | null = null;
const modeByApp = new Map<string, Mode>();

export const MODE_SWITCH_DAEMON: Daemon<ModeSwitchDaemonMessage> = {
  name: "mode_switch_daemon",
  async startup(_, p) {
    await p.exec(`open -a AnyBar`);
  },
  async handleMessage(message: ModeSwitchDaemonMessage, U, p) {
    const { executeCommand, actionAsCommand } = U.commonActions;
    switch (message.kind) {
      case "mode_switch": {
        p.info(`Switching to mode ${message.newMode}`);
        if (currentApp !== null) {
          p.info(`Setting the mode of app ${currentApp} to ${message.newMode}`);
          modeByApp.set(currentApp, message.newMode);
        }
        await refreshModeBar(p, message.newMode);
        break;
      }
      case "app_switch": {
        p.info(`Switching to app ${message.appName}`);
        currentApp = message.appName;
        const mode = modeByApp.get(currentApp);
        if (typeof mode !== "undefined") {
          p.info(`Restoring the mode of app ${currentApp} to ${mode}`);
          await executeCommand(actionAsCommand(setMode(mode)));
          await refreshModeBar(p, mode);
        } else {
          p.info(`No mode set for app ${currentApp}, setting to native`);
          await executeCommand(actionAsCommand(setMode("native")));
          modeByApp.set(currentApp, "native");
          await refreshModeBar(p, "native");
        }
        break;
      }
    }
  },
};

export async function launchModeBarDaemon(config: UltraOpts) {
  await powar.runCli({
    rootPath: powar.dir(import.meta),
    modules: [
      daemon({
        ...config,
        name: "ultra_mode_switch_daemon",
        daemons: () => [MODE_SWITCH_DAEMON],
      }),
    ],
  });
}
