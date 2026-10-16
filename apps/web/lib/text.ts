/** Escapes text for safe placement inside HTML. */
export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** A header value must be one line; strip anything that could add another. */
export function singleLine(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}
