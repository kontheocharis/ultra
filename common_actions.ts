import {
  Action,
  Command,
  command,
  Layer,
  Mode,
  Operator,
  SetLayer,
  SetMode,
  SetOperator,
  SetSpecifier,
  Specifier,
  VAR,
} from "./base.ts";
import { UltraOpts } from "./mod.ts";
import { Daemon, sendToDaemon } from "./daemon.ts";
import { EventHandler, registerEventHandler } from "./yabai_events.ts";
import { powar } from "./deps.ts";
import { CommonBindings } from "./common_bindings.ts";

export type SetUltraVars = {
  [V in keyof typeof VAR]?: {
    mode: Mode;
    layer: Layer;
    operator: Operator;
    application: string;
    specifier: Specifier;
  }[V];
};

export const defaultVarValues: SetUltraVars = {
  mode: "native",
  layer: "none",
  operator: "normal",
  specifier: "none",
};

export type CompassDirection = "north" | "south" | "east" | "west";
export type Direction = "next" | "prev";

export class CommonActions {
  constructor(public opts: UltraOpts, private bindings: CommonBindings) {}

  focusWindow = (direction: CompassDirection): Command => {
    return command(`${this.opts.yabaiCliPath} -m window --focus ${direction}`);
  };

  moveWindow = (direction: CompassDirection): Command => {
    return command(`${this.opts.yabaiCliPath} -m window --warp ${direction}`);
  };

  resizeWindow = (resize_command: string): Command => {
    return command(
      `${this.opts.yabaiCliPath} -m window --resize ${resize_command}`,
    );
  };

  focusSpace = (direction: Direction): Action => {
    if (direction == "next") {
      return this.bindings.binding("right_arrow", ["left_control"]);
    } else {
      return this.bindings.binding("left_arrow", ["left_control"]);
    }
  };

  focusDisplay = (direction: Direction): Command => {
    return command(`${this.opts.yabaiCliPath} -m display --focus ${direction}`);
  };

  moveToDisplay = (direction: Direction): Command => {
    return command(
      `${this.opts.yabaiCliPath} -m window --display ${direction}`,
    );
  };

  closeWindow = (): Command => {
    return command(`${this.opts.yabaiCliPath} -m window --close`);
  };

  toggleFloat = (): Command => {
    return command(
      `${this.opts.yabaiCliPath} -m window --toggle float; ${this.opts.yabaiCliPath} -m window --grid 6:4:1:1:2:4`,
    );
  };

  toggleZen = (): Command => {
    return command(
      `${this.opts.yabaiCliPath} -m window --toggle float; ${this.opts.yabaiCliPath} -m window --grid 1:4:1:1:2:1`,
    );
  };

  toggleFullscreen = (): Command => {
    return command(
      `${this.opts.yabaiCliPath} -m window --toggle native-fullscreen`,
    );
  };

  setUltraVarsFromCli = (data: SetUltraVars): Command => {
    return command(
      `${this.opts.karabinerCliPath} --set-variables '${
        JSON.stringify(
          Object.fromEntries(
            (Object.entries(data) as [keyof typeof VAR, string][]).map(
              ([k, v]) => [VAR[k], v],
            ),
          ),
        )
      }'`,
    );
  };

  applescript = (cmd: string): Command => {
    return command(`osascript -e ${JSON.stringify(cmd)}`);
  };

  actionAsCommand = (
    action: Command | SetMode | SetLayer | SetOperator | SetSpecifier,
  ): Command => {
    switch (action.kind) {
      case "command":
        return action;
      case "set-mode":
        return this.setUltraVarsFromCli({ mode: action.mode });
      case "set-layer":
        return this.setUltraVarsFromCli({ layer: action.layer });
      case "set-operator":
        return this.setUltraVarsFromCli({ operator: action.operator });
      case "set-specifier":
        return this.setUltraVarsFromCli({ specifier: action.specifier });
    }
  };

  executeCommand = (command: Command): Promise<powar.Output> => {
    return powar.execute(command.command);
  };

  sendToDaemon = <D>(spec: Daemon<D>, data: D): Command => {
    return sendToDaemon(spec, data);
  };

  registerEventHandler = (handler: EventHandler): Command => {
    return registerEventHandler(this.opts, handler);
  };
}
