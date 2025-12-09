export * from "./base.ts";
export type { Daemon, ExecutionTarget } from "./daemon.ts";

import { Action, Command, Mode } from "./base.ts";
import { powar } from "./deps.ts";
import { installDaemonLaunch } from "./daemon.ts";
import { CommonActions, defaultVarValues } from "./common_actions.ts";
import { CommonBindings } from "./common_bindings.ts";
import { BindingConfigGen, MappingCreate } from "./kb_binding_config_gen.ts";

export interface UltraOpts extends powar.ModuleConfig {
  shellWrapper: (cmd: string) => string;
  karabinerWrite: {
    profileName: string;
    configPath: string;
  };
  karabinerCliPath: string;
  yabaiCliPath: string;
  daemonLaunch?: { name: string; path: string }[];
  setup?: (U: Ultra, p: powar.ModuleApi) => void;
}

export type ActionHook = {
  after: "set-mode";
  action: (mode: Mode) => Action;
};

export interface Ultra extends powar.Module {
  addMappings: (entries: MappingCreate[]) => void;
  addStartup: (command: Command) => void;
  addActionHook: (hook: ActionHook) => void;
  commonActions: CommonActions;
  commonBindings: CommonBindings;
  opts: UltraOpts;
}

export function ultra(opts: UltraOpts): Ultra {
  return new UltraImpl(opts);
}

class UltraImpl implements Ultra {
  private startupCommands: string[] = [];
  private configGen: BindingConfigGen;
  private actionHooks: ActionHook[] = [];

  name: string;
  path: string;
  dependsOn?: string[];

  constructor(public opts: UltraOpts) {
    this.name = this.opts.name;
    this.path = this.opts.path;
    this.dependsOn = this.opts.dependsOn;
    this.commonBindings = new CommonBindings();
    this.commonActions = new CommonActions(opts, this.commonBindings);
    this.configGen = new BindingConfigGen(this.opts, this.actionHooks);
  }
  addActionHook = (hook: ActionHook) => {
    this.actionHooks.push(hook);
  };

  commonActions: CommonActions;
  commonBindings: CommonBindings;

  addStartup = (command: Command): void => {
    this.startupCommands.push(this.opts.shellWrapper(command.command));
  };

  addMappings = (entries: MappingCreate[]): void => {
    this.configGen.addMappings(entries);
  };

  action = async (p: powar.ModuleApi): Promise<void> => {
    if (typeof this.opts.setup !== "undefined") {
      await this.opts.setup(this, p);
      p.info(`Ran Ultra setup`);
    }

    await this.configGen.install(p);
    p.info(`Installed Ultra configuration`);

    await p.exec(
      this.commonActions.setUltraVarsFromCli(defaultVarValues).command,
    );
    p.info(`Set default Ultra variables`);

    if (typeof this.opts.daemonLaunch !== "undefined") {
      for (const daemon of this.opts.daemonLaunch) {
        await installDaemonLaunch(p, daemon.name, daemon.path);
        p.info(`Installed Ultra daemon: ${daemon.name}`);
      }
    }

    for (const command of this.startupCommands) {
      await p.exec(command);
    }
    if (this.startupCommands.length > 0) {
      p.info(`Executed ${this.startupCommands.length} startup command(s)`);
    }
  };
}
