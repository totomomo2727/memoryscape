export function rotationFor(id, spread = 4) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return ((hash % (spread * 200)) / 100) - spread;
}
