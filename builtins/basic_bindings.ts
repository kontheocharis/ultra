import { Binding, ExtendedKey } from "../base.ts";
import { binding } from "../common_bindings.ts";
import {
  setLayer,
  Ultra,
  setSpecifier,
  setOperator,
  context,
  command,
  setMode,
} from "../mod.ts";

export const LAYER_MOD = "left_command";

export function layerBinding(
  key: ExtendedKey,
  modifiers?: ExtendedKey[]
): Binding {
  return binding(key, [LAYER_MOD, ...(modifiers ?? [])]);
}

export function installBasicBindings(U: Ultra) {
  const {
    beginOfLine,
    binding,
    copy,
    pageBottom,
    pageDown,
    pageTop,
    pageUp,
    cut,
    endOfLine,
    enter,
    left,
    leftShift,
    nextOccurence,
    paste,
    previousOccurence,
    redo,
    right,
    search,
    undo,
    up,
    wordBack,
    wordForward,
    zoomFit,
    zoomIn,
    zoomOut,
    zoomReset,
    quit,
    down,
  } = U.commonBindings;

  const {
    toggleFullscreen,
    closeWindow: yabaiCloseWindow,
    toggleFloat,
    toggleZen,
    focusWindow,
    moveWindow,
    resizeWindow,
    focusDisplay,
    moveToDisplay,
    moveToSpace,
    focusSpace,
  } = U.commonActions;

  U.addMappings([
    [
      binding("right_shift"),
      [
        [
          context({
            notMode: ["passthrough", "native", "normal", "search"],
            operator: null,
            layer: null,
            specifier: null,
          }),
          [
            setLayer("none"),
            setSpecifier("none"),
            setOperator("normal"),
            setMode("normal"),
          ],
        ],
        [
          context({
            mode: "normal",
            operator: null,
            layer: null,
            specifier: null,
          }),
          [
            setLayer("none"),
            setSpecifier("none"),
            setOperator("normal"),
            binding("escape"),
          ],
        ],
        [
          context({
            mode: "search",
            operator: null,
            layer: null,
            specifier: null,
          }),
          [
            setLayer("none"),
            setSpecifier("none"),
            setOperator("normal"),
            setMode("normal"),
            binding("escape"),
          ],
        ],
        [context({ mode: "native" }), [binding("escape")]],
      ],
    ],
    [
      binding("right_shift", ["left_shift"]),
      [
        [
          context({
            notMode: "native",
            operator: null,
            layer: null,
            specifier: null,
          }),
          [
            setLayer("none"),
            setSpecifier("none"),
            setOperator("normal"),
            setMode("native"),
          ],
        ],
        [
          context({
            mode: "native",
          }),
          [
            setLayer("none"),
            setSpecifier("none"),
            setOperator("normal"),
            setMode("normal"),
          ],
        ],
        [
          context({
            mode: "passthrough",
            operator: null,
            layer: null,
            specifier: null,
          }),
          [
            setLayer("none"),
            setSpecifier("none"),
            setOperator("normal"),
            setMode("normal"),
          ],
        ],
      ],
    ],
    [
      binding("x"),
      [
        [context({ mode: "normal" }), [leftShift(right()), cut()]],
        [context({ mode: "visual" }), [cut(), setMode("normal")]],
      ],
    ],
    [
      binding("x", ["left_shift"]),
      [
        [
          context({ mode: "normal" }),
          [binding("delete_or_backspace", ["command"])],
        ],
      ],
    ],
    [
      binding("c"),
      [
        [context({ mode: "normal" }), [setOperator("change")]],
        [context({ mode: "visual" }), [cut(), setMode("insert")]],
        [
          context({ mode: "normal", operator: "change" }),
          [
            beginOfLine(),
            leftShift(endOfLine()),
            cut(),
            setOperator("normal"),
            setMode("insert"),
          ],
        ],
      ],
    ],
    [
      binding("c", ["shift"]),
      [
        [
          context({ mode: "normal" }),
          [leftShift(endOfLine()), cut(), setMode("insert")],
        ],
      ],
    ],
    [
      binding("i"),
      [
        [context({ mode: "normal" }), [setMode("insert")]],
        [context({ mode: "normal", operator: "change" }), [setSpecifier("in")]],
        [context({ mode: "normal", operator: "delete" }), [setSpecifier("in")]],
        [context({ mode: "normal", operator: "yank" }), [setSpecifier("in")]],
        [context({ mode: "visual" }), [setSpecifier("in")]],
      ],
    ],

    [
      binding("w"),
      [
        [
          context({ mode: "normal", operator: "change", specifier: "in" }),
          [
            wordBack(),
            leftShift(wordForward()),
            setSpecifier("none"),
            cut(),
            setOperator("normal"),
            setMode("insert"),
          ],
        ],
        [
          context({ mode: "normal", operator: "delete", specifier: "in" }),
          [
            wordBack(),
            leftShift(wordForward()),
            setSpecifier("none"),
            cut(),
            setOperator("normal"),
          ],
        ],
        [
          context({ mode: "normal", operator: "yank", specifier: "in" }),
          [
            wordBack(),
            leftShift(wordForward()),
            setSpecifier("none"),
            copy(),
            setOperator("normal"),
          ],
        ],
        [
          context({ mode: "visual", specifier: "in" }),
          [wordBack(), leftShift(wordForward()), setSpecifier("none")],
        ],
        [
          context({ mode: "normal", operator: "change", specifier: "around" }),
          [
            wordBack(),
            left(),
            leftShift(wordForward()),
            setSpecifier("none"),
            cut(),
            setOperator("normal"),
            setMode("insert"),
          ],
        ],
        [
          context({ mode: "normal", operator: "delete", specifier: "around" }),
          [
            wordBack(),
            left(),
            leftShift(wordForward()),
            setSpecifier("none"),
            cut(),
            setOperator("normal"),
          ],
        ],
        [
          context({ mode: "normal", operator: "yank", specifier: "around" }),
          [
            wordBack(),
            left(),
            leftShift(wordForward()),
            setSpecifier("none"),
            copy(),
            setOperator("normal"),
          ],
        ],
        [
          context({ mode: "visual", specifier: "around" }),
          [wordBack(), left(), leftShift(wordForward()), setSpecifier("none")],
        ],
      ],
    ],

    [binding("v"), [[context({ mode: "normal" }), [setMode("visual")]]]],
    [
      binding("v", ["left_shift"]),
      [
        [
          context({ mode: "normal" }),
          [beginOfLine(), leftShift(endOfLine()), setMode("visual")],
        ],
      ],
    ],
    [
      binding("o"),
      [
        [
          context({ mode: "normal" }),
          [endOfLine(), enter(), setMode("insert")],
        ],
      ],
    ],
    [
      binding("o", ["left_shift"]),
      [
        [
          context({ mode: "normal" }),
          [beginOfLine(), enter(), up(), setMode("insert")],
        ],
      ],
    ],

    [
      binding("a"),
      [
        [context({ mode: "normal" }), [right(), setMode("insert")]],
        [
          context({ mode: "normal", operator: "change" }),
          [setSpecifier("around")],
        ],
        [
          context({ mode: "normal", operator: "delete" }),
          [setSpecifier("around")],
        ],
        [
          context({ mode: "normal", operator: "yank" }),
          [setSpecifier("around")],
        ],
        [context({ mode: "visual" }), [setSpecifier("around")]],
      ],
    ],

    [
      binding("i", ["left_shift"]),
      [[context({ mode: "normal" }), [beginOfLine(), setMode("insert")]]],
    ],
    [
      binding("a", ["left_shift"]),
      [[context({ mode: "normal" }), [endOfLine(), setMode("insert")]]],
    ],
    [binding("u"), [[context({ mode: "normal" }), [undo()]]]],
    [binding("r", ["control"]), [[context({ mode: "normal" }), [redo()]]]],
    [
      binding("p"),
      [
        [context({ mode: "normal" }), [paste()]],
        [context({ mode: "visual" }), [paste(), setMode("normal")]],
      ],
    ],
    [
      binding("slash"),
      [[context({ mode: "normal" }), [search(), setMode("search")]]],
    ],
    [
      binding("return_or_enter"),
      [
        [
          context({ mode: "search" }),
          [binding("return_or_enter"), setMode("normal")],
        ],
      ],
    ],
    [
      binding("return_or_enter", ["command"]),
      [
        [
          context({ mode: "insert" }),
          [binding("return_or_enter"), setMode("normal")],
        ],
        [
          context({ mode: "search" }),
          [binding("return_or_enter"), setMode("normal")],
        ],
      ],
    ],
    [
      binding("escape"),
      [[context({ mode: "search" }), [binding("escape"), setMode("normal")]]],
    ],
    [binding("n"), [[context({ mode: "normal" }), [nextOccurence()]]]],
    [
      binding("n", ["left_shift"]),
      [[context({ mode: "normal" }), [previousOccurence()]]],
    ],
    [binding("equal_sign"), [[context({ mode: "normal" }), [zoomReset()]]]],
    [
      binding("equal_sign", ["left_shift"]),
      [[context({ mode: "normal" }), [zoomIn()]]],
    ],
    [binding("hyphen"), [[context({ mode: "normal" }), [zoomOut()]]]],
    [binding("s"), [[context({ mode: "normal" }), [zoomFit()]]]],
    [binding("a", [LAYER_MOD]), [[context({}), [setLayer("window")]]]],
    [binding("s", [LAYER_MOD]), [[context({}), [setLayer("application")]]]],
    [binding("r", [LAYER_MOD]), [[context({}), [setLayer("resize")]]]],
    [binding("d", [LAYER_MOD]), [[context({}), [setLayer("move")]]]],
  ]);

  U.addMappings([
    [layerBinding("d"), [[context({ layer: "window" }), [yabaiCloseWindow()]]]],
    [layerBinding("q"), [[context({ layer: "window" }), [quit()]]]],
    [
      layerBinding("n"),
      [[context({ layer: "window" }), [binding("n", ["command"])]]],
    ],
    [
      layerBinding("s"),
      [[context({ layer: "window" }), [binding("s", ["command"])]]],
    ],
    [
      layerBinding("y"),
      [[context({ layer: "window" }), [binding("d", ["command"])]]],
    ],
    // @@TODO:
    // [layerBinding("m"), [[context({ layer: "window" }), [toggleColourScheme()]]]],
    [
      layerBinding("8"),
      [[context({ layer: "window" }), [binding("a", ["command"])]]],
    ],
    [layerBinding("f"), [[context({ layer: "window" }), [toggleFullscreen()]]]],
    [layerBinding("c"), [[context({ layer: "window" }), [toggleFloat()]]]],
    [layerBinding("v"), [[context({ layer: "window" }), [toggleZen()]]]],
    [
      layerBinding("slash"),
      [[context({ layer: "window" }), [binding("f12")]]], // toggle input source @@TODO: does this even work?
    ],
    [
      layerBinding("return_or_enter"),
      [
        [
          context({ layer: "window" }),
          [command("$HOME/.scripts/macos/terminal")],
        ],
      ],
    ],
    [
      layerBinding("spacebar"),
      [
        [
          context({ layer: "window" }),
          [binding("f12", ["command"])], // bind cmd-f12 to spotlight/alfred for this to work
        ],
      ],
    ],
  ]);

  for (const [key, direction, resize_command] of [
    ["h", "west", "right:-20:0"],
    ["j", "south", "bottom:0:20"],
    ["k", "north", "bottom:0:-20"],
    ["l", "east", "right:20:0"],
  ] as const) {
    U.addMappings([
      [
        layerBinding(key),
        [
          [context({ layer: "window" }), [focusWindow(direction)]],
          [context({ layer: "move" }), [moveWindow(direction)]],
          [context({ layer: "resize" }), [resizeWindow(resize_command)]],
        ],
      ],
    ]);
  }

  for (const [key, direction] of [
    ["u", "prev"],
    ["p", "next"],
  ] as const) {
    U.addMappings([
      [
        layerBinding(key),
        [
          [context({ layer: "window" }), [focusSpace(direction)]],
          [context({ layer: "move" }), [moveToSpace(direction)]],
        ],
      ],
    ]);
  }

  for (const [key, direction] of [
    ["i", "prev"],
    ["o", "next"],
  ] as const) {
    U.addMappings([
      [
        layerBinding(key),
        [
          [context({ layer: "window" }), [focusDisplay(direction)]],
          [context({ layer: "move" }), [moveToDisplay(direction)]],
        ],
      ],
    ]);
  }

  for (const [key, direction] of [
    ["h", "west"],
    ["j", "south"],
    ["k", "north"],
    ["l", "east"],
  ] as const) {
    U.addMappings([
      [
        layerBinding(key),
        [[context({ layer: "application" }), [focusWindow(direction)]]],
      ],
      [
        layerBinding(key, ["left_shift"]),
        [[context({ layer: "window" }), [moveWindow(direction)]]],
      ],
    ]);
  }

  for (const [key, direction] of [
    ["u", "prev"],
    ["p", "next"],
  ] as const) {
    U.addMappings([
      [
        layerBinding(key),
        [[context({ layer: "window" }), [focusSpace(direction)]]],
      ],
      [
        layerBinding(key, ["left_shift"]),
        [[context({ layer: "window" }), [moveToSpace(direction)]]],
      ],
    ]);
  }

  for (const [[b, mod], direction] of [
    [["h"], left()],
    [["j"], down()],
    [["k"], up()],
    [["l"], right()],
    [["w"], wordForward()],
    [["e"], wordForward()],
    [["b"], wordBack()],
    [["0"], beginOfLine()],
    [["4", ["shift"]], endOfLine()],
  ] as const) {
    U.addMappings([
      [
        binding(b, mod),
        [
          [context({ mode: "normal" }), [direction]],
          [
            context({ mode: "normal", operator: "change" }),
            [
              leftShift(direction),
              cut(),
              setOperator("normal"),
              setMode("insert"),
            ],
          ],
          [
            context({ mode: "normal", operator: "delete" }),
            [leftShift(direction), cut(), setOperator("normal")],
          ],
          [
            context({ mode: "normal", operator: "yank" }),
            [leftShift(direction), copy(), setOperator("normal")],
          ],
          [context({ mode: "visual" }), [leftShift(direction)]],
        ],
      ],
    ]);
  }

  for (const [key, direction] of [
    ["h", left()],
    ["j", down()],
    ["k", up()],
    ["l", right()],
  ] as const) {
    U.addMappings([
      [
        binding(key, ["right_control"]),
        [
          [context({ mode: "insert" }), [direction]],
          [context({ mode: "native" }), [direction]],
          [context({ mode: "search" }), [direction]],
        ],
      ],
    ]);
  }

  for (const [[b, mod], direction] of [
    [["u", ["control"]], pageUp()],
    [["d", ["control"]], pageDown()],
    [["g"], pageTop()],
    [["g", ["left_shift"]], pageBottom()],
  ] as const) {
    U.addMappings([
      [
        binding(b, mod),
        [
          [context({ mode: "normal" }), [direction]],
          [context({ mode: "visual" }), [leftShift(direction)]],
        ],
      ],
    ]);
  }

  for (const [key, action, op] of [
    ["d", cut(), "delete"],
    ["y", copy(), "yank"],
  ] as const) {
    U.addMappings([
      [
        binding(key),
        [
          [context({ mode: "normal" }), [setOperator(op)]],
          [
            context({ mode: "normal", operator: op }),
            [
              beginOfLine(),
              leftShift(endOfLine()),
              action,
              setOperator("normal"),
            ],
          ],
          [context({ mode: "visual" }), [action, setMode("normal")]],
        ],
      ],
    ]);
  }
}
