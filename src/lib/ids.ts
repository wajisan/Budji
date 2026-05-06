export function newNotebookId(): string {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
  } catch {
    /* fall through */
  }
  return `budji-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
