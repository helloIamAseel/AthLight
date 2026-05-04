export type DeleteKind = "video" | "feedback" | "testSuite" | "item";

export function getDeleteContent(kind: DeleteKind, name?: string) {
  const cancelText = "Cancel";
  const confirmText = "Delete";

  if (kind === "feedback") {
    return {
      title: "Delete this feedback?",
      cancelText,
      confirmText,
      messagePrefix: 'The feedback ',
      itemStrong: name ? `"${name}"` : "",
      messageSuffix: " will be removed for both you and the player. This action can't be undone.",
    };
  }

  const label =
    kind === "video" ? "video" :
    kind === "testSuite" ? "test suite" :
    "item";

  const messagePrefix = "This will delete the " + label + (name ? " " : "");
  const itemStrong = name ? `"${name}"` : "";
  const messageSuffix = " for everyone.";

  return { title: "Are you sure?", cancelText, confirmText, messagePrefix, itemStrong, messageSuffix };
}
