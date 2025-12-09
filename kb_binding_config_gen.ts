import { powar } from "./deps.ts";
import {
  Action,
  Binding,
  Context,
  fillContextDefaults,
  Mapping,
  VAR,
} from "./base.ts";
import { kb } from "./deps.ts";
import { ActionHook, UltraOpts } from "./mod.ts";

export type MappingCreate = [Binding, [Context, (Action | Action[])[]][]];

function mappings(entries: MappingCreate[]): Mapping[] {
  return entries.map(([binding, byContext]) => ({
    binding,
    byContext: byContext.map(([context, targets]) => ({
      context: fillContextDefaults(context),
      targets,
    })),
  }));
}

export class BindingConfigGen {
  private kbManipulators: kb.Manipulator[] = [];
  constructor(private opts: UltraOpts, private actionHooks: ActionHook[]) {}

  install = async (p: powar.ModuleApi) => {
    const mods = new kb.KarabinerComplexModifications();
    p.info("Generated Karabiner complex modifications");
    mods.addRule({
      description: "Ultra",
      manipulators: this.kbManipulators,
    });

    await mods.writeToProfile(
      this.opts.karabinerWrite.profileName,
      this.opts.karabinerWrite.configPath,
    );

    p.info(
      `Installed to '${this.opts.karabinerWrite.configPath}' under profile ${this.opts.karabinerWrite.profileName}`,
    );
  };

  addMappings = (entries: MappingCreate[]): void => {
    for (const { binding, byContext } of mappings(entries)) {
      this.kbManipulators.push(
        ...this.encodeMappingAsManipulators({ binding, byContext }),
      );
    }
  };

  private encodeMappingAsManipulators = ({
    binding,
    byContext,
  }: Mapping): kb.Manipulator[] => {
    return byContext.map(({ context, targets }) => {
      const ctx = fillContextDefaults(context);

      const anyModifierOpt = binding.anyModifer == true
        ? { optional: ["any" as kb.Key] }
        : undefined;

      const modifiers = typeof binding.modifiers !== "undefined"
        ? {
          modifiers: {
            mandatory: binding.modifiers as kb.Key[],
            ...anyModifierOpt,
          },
        }
        : typeof anyModifierOpt !== "undefined"
        ? { modifiers: anyModifierOpt }
        : {};

      return {
        type: "basic",
        from: {
          key_code: binding.key as kb.Key,
          ...modifiers,
        },
        conditions: this.encodeContextConditions(ctx),
        ...this.encodeBindingActions(targets),
      };
    });
  };

  private encodeContextConditions = (context: Context): kb.Condition[] => {
    function toMapArray<T, U>(
      value: T | readonly T[] | null | undefined,
      map: (value: T) => U,
    ): readonly U[] {
      if (typeof value === "undefined" || value === null) {
        return [];
      }
      if (Array.isArray(value)) {
        return value.map(map);
      }
      return [map(value as T)];
    }
    return [
      ...toMapArray(context.mode, (mode) => ({
        type: "variable_if" as const,
        name: VAR["mode"],
        value: mode,
      })),
      ...toMapArray(context.notMode, (mode) => ({
        type: "variable_unless" as const,
        name: VAR["mode"],
        value: mode,
      })),
      ...toMapArray(context.operator, (op) => ({
        type: "variable_if" as const,
        name: VAR["operator"],
        value: op,
      })),
      ...toMapArray(context.layer, (layer) => ({
        type: "variable_if" as const,
        name: VAR["layer"],
        value: layer,
      })),
      ...toMapArray(context.application, (app) => ({
        type: "frontmost_application_if" as const,
        bundle_identifiers: [app],
      })),
      ...toMapArray(context.specifier, (spec) => ({
        type: "variable_if" as const,
        name: VAR["specifier"],
        value: spec,
      })),
      ...toMapArray(context.extra, (cond) => cond),
    ];
  };

  private encodeBindingActions = (
    targets: readonly (Action | readonly Action[])[],
  ): Pick<kb.Manipulator, "to" | "to_after_key_up"> => {
    type Ret = Pick<kb.Manipulator, "to" | "to_after_key_up">;
    return targets
      .flat()
      .flatMap((target): Ret[] => {
        switch (target.kind) {
          case "binding":
            return [
              {
                to: [
                  {
                    key_code: target.key as kb.Key,
                    modifiers: target.modifiers as kb.Key[],
                  },
                ],
              },
            ];
          case "command":
            return [
              {
                to: [
                  {
                    shell_command: this.opts.shellWrapper(target.command),
                  },
                ],
              },
            ];
          case "set-mode": {
            const after = this.actionHooks.flatMap((hook) => {
              switch (hook.after) {
                case "set-mode":
                  return [
                    this.encodeBindingActions([hook.action(target.mode)]),
                  ];
                default:
                  return [];
              }
            });
            return [
              {
                to: [
                  {
                    set_variable: {
                      name: VAR["mode"],
                      value: target.mode,
                    },
                  },
                ],
              },
              ...after,
            ];
          }
          case "set-layer":
            return [
              {
                to: [
                  {
                    key_code: "vk_none" as kb.Key,
                  },
                  {
                    set_variable: {
                      name: VAR["layer"],
                      value: target.layer,
                    },
                  },
                ],
                to_after_key_up: [
                  {
                    key_code: "vk_none" as kb.Key,
                  },
                  {
                    set_variable: {
                      name: VAR["layer"],
                      value: "none",
                    },
                  },
                ],
              },
            ];
          case "set-operator":
            return [
              {
                to: [
                  {
                    set_variable: {
                      name: VAR["operator"],
                      value: target.operator,
                    },
                  },
                ],
              },
            ];
          case "set-specifier":
            return [
              {
                to: [
                  {
                    set_variable: {
                      name: VAR["specifier"],
                      value: target.specifier,
                    },
                  },
                ],
              },
            ];
        }
      })
      .reduce(
        (acc, val): Ret => ({
          to: [...(acc.to ?? []), ...(val.to ?? [])],
          to_after_key_up: [
            ...(acc.to_after_key_up ?? []),
            ...(val.to_after_key_up ?? []),
          ],
        }),
      );
  };
}
