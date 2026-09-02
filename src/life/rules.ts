export function countNeighbors(cur: Uint8Array, n: number, x: number, y: number) {
  let c = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    const yy = y + dy;
    if (yy < 0 || yy >= n) continue;
    const row = yy * n;
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const xx = x + dx;
      if (xx >= 0 && xx < n && cur[row + xx]) c += 1;
    }
  }
  return c;
}

export function step(cur: Uint8Array, next: Uint8Array, n: number) {
  for (let y = 0; y < n; y += 1) {
    const row = y * n;
    for (let x = 0; x < n; x += 1) {
      const idx = row + x;
      const neighbors = countNeighbors(cur, n, x, y);
      const alive = cur[idx];
      next[idx] =
        (alive === 1 && (neighbors === 2 || neighbors === 3)) ||
        (alive === 0 && neighbors === 3)
          ? 1
          : 0;
    }
  }
}
