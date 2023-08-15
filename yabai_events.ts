import { Command, command } from "./base.ts";
import { slugify } from "./deps.ts";

export type EventHandler =
  | {
      kind: "application_launched";
      label: string;
      action: (processId: string) => Command;
    }
  | {
      kind: "application_terminated";
      label: string;
      action: (processId: string) => Command;
    }
  | {
      kind: "application_front_switched";
      label: string;
      action: (processId: string, recentProcessId: string) => Command;
    }
  | {
      kind: "application_activated";
      label: string;
      action: (processId: string) => Command;
    };

export function registerEventHandler(handler: EventHandler): Command {
  const label = slugify(handler.label);
  const action = (() => {
    switch (handler.kind) {
      case "application_launched":
        return handler.action("$YABAI_PROCESS_ID");
      case "application_terminated":
        return handler.action("$YABAI_PROCESS_ID");
      case "application_front_switched":
        return handler.action("$YABAI_PROCESS_ID", "$YABAI_RECENT_PROCESS_ID");
      case "application_activated":
        return handler.action("$YABAI_PROCESS_ID");
    }
  })();

  const actionFile = `/tmp/ultra-event-handler-${label}`;
  Deno.writeTextFileSync(actionFile, action.command);
  return command(
    `(yabai -m signal --remove ${label} || true) && yabai -m signal --add event=${handler.kind} action='/bin/sh ${actionFile}' label=${label}`
  );
}
