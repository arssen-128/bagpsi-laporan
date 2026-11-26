export const byId = (id) => document.getElementById(id);

export function setText(id, value) {
  const node = byId(id);
  if (node) node.textContent = value ?? "";
}

export function setStatus(node, message, isError = false) {
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("error", Boolean(isError));
  node.classList.toggle("status-error", Boolean(isError));
}

export function createElement(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
