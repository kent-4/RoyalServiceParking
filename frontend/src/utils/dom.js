export function query(selector, root = document) {
  return root.querySelector(selector);
}
