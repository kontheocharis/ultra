import { kb } from "./deps.ts";

export const MODES = [
  "normal",
  "insert",
  "native",
  "passthrough",
  "visual",
  "search",
] as const;
export type Mode = (typeof MODES)[number];

export const LAYERS = [
  "none",
  "application",
  "window",
  "resize",
  "move",
] as const;
export type Layer = (typeof LAYERS)[number];

export const OPERATORS = ["normal", "delete", "change", "yank"] as const;
export type Operator = (typeof OPERATORS)[number];

export const SPECIFIERS = ["none", "in", "around"] as const;
export type Specifier = (typeof SPECIFIERS)[number];

export const VAR = {
  mode: "ultra_mode",
  layer: "ultra_layer",
  operator: "ultra_operator",
  specifier: "ultra_specifier",
} as const;
export type Var = (typeof VAR)[keyof typeof VAR];

export type Application = string;

export interface Command {
  kind: "command";
  command: string;
}

export interface SetMode {
  kind: "set-mode";
  mode: Mode;
}

export interface SetLayer {
  kind: "set-layer";
  layer: Layer;
}

export interface SetOperator {
  kind: "set-operator";
  operator: Operator;
}

export interface SetSpecifier {
  kind: "set-specifier";
  specifier: Specifier;
}

export type Action =
  | Binding
  | Command
  | SetMode
  | SetLayer
  | SetOperator
  | SetSpecifier;

export interface Binding {
  kind: "binding";
  key: ExtendedKey;
  modifiers: readonly ExtendedKey[];
  specifier: Specifier;
}

export type ExtendedKey =
  | kb.Key
  | "vk_none"
  | "page_up"
  | "page_down"
  | "home"
  | "end"
  | "control"
  | "command"
  | "shift"
  | "equal_sign"
  | "f12";

// Here null means "doesn't matter", i.e. perform the target action regardless
// of the current value of the context variable.

export interface Context {
  mode?: Mode | null;
  notMode?: Mode | readonly Mode[];
  operator?: Operator | null;
  layer?: Layer | null;
  application?: Application | null;
  specifier?: Specifier | null;
}

export function fillContextDefaults({
  mode = null,
  notMode = "passthrough",
  operator = "normal",
  layer = "none",
  application = null,
  specifier = "none",
}: Context): Context {
  return {
    mode,
    notMode,
    operator,
    layer,
    application,
    specifier,
  };
}

export function context(context: Context): Context {
  return context;
}

export interface ContextMapping {
  context: Context;
  targets: readonly (Action | readonly Action[])[];
}

export interface Mapping {
  binding: Binding;
  byContext: ContextMapping[];
}

export function command(command: string): Command {
  return {
    kind: "command",
    command,
  };
}

export function setMode(mode: Mode): SetMode {
  return {
    kind: "set-mode",
    mode,
  };
}

export function setLayer(layer: Layer): SetLayer {
  return {
    kind: "set-layer",
    layer,
  };
}

export function setOperator(operator: Operator): SetOperator {
  return {
    kind: "set-operator",
    operator,
  };
}

export function setSpecifier(specifier: Specifier): SetSpecifier {
  return {
    kind: "set-specifier",
    specifier,
  };
}
