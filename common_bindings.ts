import { Binding, ExtendedKey, Specifier } from "./base.ts";

export function binding(
  key: ExtendedKey,
  modifiers?: readonly ExtendedKey[],
  specifier: Specifier = "none"
): Binding {
  return {
    kind: "binding",
    key,
    modifiers: modifiers ?? [],
    specifier,
  };
}

export class CommonBindings {
  binding = (
    key: ExtendedKey,
    modifiers?: readonly ExtendedKey[],
    specifier: Specifier = "none"
  ): Binding => {
    return binding(key, modifiers, specifier);
  };

  endOfLine = (): Binding => {
    return this.binding("right_arrow", ["right_command"]);
  };

  beginOfLine = (): Binding => {
    return this.binding("left_arrow", ["right_command"]);
  };

  wordForward = (): Binding => {
    return this.binding("right_arrow", ["left_alt"]);
  };

  wordBack = (): Binding => {
    return this.binding("left_arrow", ["left_alt"]);
  };

  cut = (): Binding => {
    return this.binding("x", ["right_command"]);
  };

  paste = (): Binding => {
    return this.binding("v", ["right_command"]);
  };

  copy = (): Binding => {
    return this.binding("c", ["right_command"]);
  };

  up = (): Binding => {
    return this.binding("up_arrow");
  };

  down = (): Binding => {
    return this.binding("down_arrow");
  };

  left = (): Binding => {
    return this.binding("left_arrow");
  };

  right = (): Binding => {
    return this.binding("right_arrow");
  };

  pageUp = (): Binding => {
    return this.binding("page_up");
  };

  pageDown = (): Binding => {
    return this.binding("page_down");
  };

  pageTop = (): Binding => {
    return this.binding("home");
  };

  pageBottom = (): Binding => {
    return this.binding("end");
  };

  search = (): Binding => {
    return this.binding("f", ["right_command"]);
  };

  nextOccurence = (): Binding => {
    return this.binding("g", ["right_command"]);
  };

  previousOccurence = (): Binding => {
    return this.binding("g", ["right_command", "left_shift"]);
  };

  undo = (): Binding => {
    return this.binding("z", ["right_command"]);
  };

  redo = (): Binding => {
    return this.binding("z", ["right_command", "left_shift"]);
  };

  zoomIn = (): Binding => {
    return this.binding("equal_sign", ["right_command"]);
  };

  zoomOut = (): Binding => {
    return this.binding("hyphen", ["right_command"]);
  };

  zoomReset = (): Binding => {
    return this.binding("0", ["right_command"]);
  };

  zoomFit = (): Binding => {
    return this.binding("9", ["right_command"]);
  };

  closeWindow = (): Binding => {
    return this.binding("w", ["right_command"]);
  };

  quit = (): Binding => {
    return this.binding("q", ["right_command"]);
  };

  spotlight = (): Binding => {
    return this.binding("spacebar");
  };

  noop = (): Binding => {
    return this.binding("vk_none");
  };

  enter = (): Binding => {
    return this.binding("return_or_enter");
  };

  mod = (mod: ExtendedKey | ExtendedKey[], binding: Binding): Binding => {
    return {
      ...binding,
      modifiers: [...binding.modifiers, ...(Array.isArray(mod) ? mod : [mod])],
    };
  };

  shift = (binding: Binding): Binding => {
    return this.mod("shift", binding);
  };

  leftShift = (binding: Binding): Binding => {
    return this.mod("left_shift", binding);
  };

  rightShift = (binding: Binding): Binding => {
    return this.mod("left_shift", binding);
  };
}
