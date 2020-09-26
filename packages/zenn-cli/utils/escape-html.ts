const entityMap = {
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
  ">": "&gt;",
  "&": "&amp;",
};

export function escapeHtml(text: string) {
  return text?.replace(/[&<>"'/]/g, (s: string) => entityMap[s]);
}
