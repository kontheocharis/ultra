import { powar } from "./deps.ts";
import { TextLineStream, slugify } from "./deps.ts";
import { Action, Binding, Command } from "./base.ts";
import { Ultra, UltraOpts } from "./mod.ts";
import { CommonActions } from "./common_actions.ts";
import { CommonBindings } from "./common_bindings.ts";
export interface UltraDaemonOpts<Ds> extends UltraOpts {
  daemons: (U: UltraDaemon<Ds>, p: powar.ModuleApi) => Ds;
}

export interface UltraDaemon<Ds> extends powar.Module {
  commonActions: CommonActions;
  commonBindings: CommonBindings;
  opts: UltraDaemonOpts<Ds>;
}

// deno-lint-ignore no-explicit-any
export function daemon<Ds extends Daemon<any>[]>(
  opts: UltraDaemonOpts<Ds>
): UltraDaemon<Ds> {
  return new UltraDaemonImpl(opts);
}
class UltraDaemonImpl<Ds extends Daemon<unknown>[]> implements UltraDaemon<Ds> {
  name: string;
  path: string;
  dependsOn?: string[];
  commonActions: CommonActions;
  commonBindings: CommonBindings;
  daemons: UltraDaemonOpts<Ds>["daemons"];

  constructor(public opts: UltraDaemonOpts<Ds>) {
    this.name = this.opts.name;
    this.path = this.opts.path;
    this.dependsOn = this.opts.dependsOn;
    this.daemons = this.opts.daemons;
    this.commonBindings = new CommonBindings();
    this.commonActions = new CommonActions(opts, this.commonBindings);
  }

  action = async (p: powar.ModuleApi): Promise<void> => {
    await Promise.all(
      this.daemons(this, p).map(async (d) => {
        try {
          await launchDaemon(d, this, p);
        } catch (e) {
          p.warn(`Error when launching daemon ${d.name}: ${e}`);
        }
      })
    );
  };
}

export type ExecutionTarget = Exclude<Action, Binding>;

export interface Daemon<D> {
  name: string;
  startup?: <Ds>(U: UltraDaemon<Ds>, p: powar.ModuleApi) => Promise<void>;
  handleMessage: <Ds>(
    message: D,
    U: UltraDaemon<Ds>,
    p: powar.ModuleApi
  ) => Promise<void>;
}
export function sendToDaemon<D>(spec: Daemon<D>, data: D): Command {
  return {
    kind: "command",
    command: `echo ${JSON.stringify(
      JSON.stringify(data)
    )} | socat - UNIX-CONNECT:${getUnixSocketPathForDaemon(spec)}`,
  };
}

export async function launchDaemon<D, Ds>(
  spec: Daemon<D>,
  U: UltraDaemon<Ds>,
  p: powar.ModuleApi
): Promise<never> {
  const listener = await getUnixSocketConnForDaemon(spec);
  p.info(`Listening for messages on ${getUnixSocketPathForDaemon(spec)}`);

  if (typeof spec.startup !== "undefined") {
    await spec.startup(U, p);
    p.info(`Ran startup for daemon ${spec.name}`);
  }

  while (true) {
    try {
      const conn = await listener.accept();
      (async () => {
        for await (const line of conn.readable
          .pipeThrough(new TextDecoderStream())
          .pipeThrough(new TextLineStream())) {
          try {
            const jsonData = JSON.parse(line);
            await spec.handleMessage(jsonData, U, p);
          } catch (e) {
            p.warn(`Error when handling message: ${e}`);
          }
        }
      })();
    } catch (e) {
      p.warn(`Daemon error: ${e}`);
    }
  }
}

function getUnixSocketPathForDaemon<D>(spec: Daemon<D>): string {
  return `/tmp/${slugify(spec.name)}.ultra_daemon`;
}

async function getUnixSocketConnForDaemon<D>(
  spec: Daemon<D>
): Promise<Deno.Listener> {
  const path = getUnixSocketPathForDaemon(spec);
  await powar.execute(`rm -f ${path}`);
  return await Deno.listen({ transport: "unix", path });
}

export async function installDaemonLaunch(
  p: powar.ModuleApi,
  name: string,
  launchPath: string
): Promise<void> {
  const daemonPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>Label</key>
	<string>${name}</string>
	<key>ProgramArguments</key>
	<array>
		<string>/bin/zsh</string>
		<string>-c</string>
		<string>${launchPath}</string>
	</array>
	<key>RunAtLoad</key>
	<true/>
	<key>KeepAlive</key>
	<true/>
	<key>StandardErrorPath</key>
	<string>/tmp/daemon-${name}-out.log</string>
	<key>StandardOutPath</key>
	<string>/tmp/daemon-${name}-err.log</string>
</dict>
</plist>
`;
  const plistPath = `$HOME/Library/LaunchAgents/${name}.plist`;
  await p.installContents([[daemonPlist, plistPath]]);
  await p.exec(`launchctl unload -w "${plistPath}" || true`);
  await p.exec(`launchctl load -w "${plistPath}" || exit`);
}
