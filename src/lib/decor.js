function hashOf(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const TAPE_KINDS = ['gingham', 'stars'];
const TAPE_CORNERS = ['top-left', 'top-right'];

export function washiFor(id) {
  const hash = hashOf(id);
  return {
    kind: TAPE_KINDS[hash % TAPE_KINDS.length],
    corner: TAPE_CORNERS[Math.floor(hash / 3) % TAPE_CORNERS.length],
    rotate: ((hash % 24) - 12) + (hash % 2 === 0 ? 4 : -4),
  };
}
