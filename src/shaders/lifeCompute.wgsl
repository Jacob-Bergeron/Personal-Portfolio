struct ComputeUni {
  n: u32,
}

@group(0) @binding(0) var<storage, read> src: array<u32>;
@group(0) @binding(1) var<storage, read_write> dst: array<u32>;
@group(0) @binding(2) var<uniform> uni: ComputeUni;

fn neighbor(x: i32, y: i32, n: i32) -> u32 {
  if (x < 0 || y < 0 || x >= n || y >= n) {
    return 0u;
  }
  return src[u32(y) * u32(n) + u32(x)];
}

@compute @workgroup_size(8, 8)
fn computeMain(@builtin(global_invocation_id) id: vec3u) {
  let n = uni.n;
  if (id.x >= n || id.y >= n) {
    return;
  }

  let x = i32(id.x);
  let y = i32(id.y);
  let ni = i32(n);
  var count = 0u;
  for (var dy = -1; dy <= 1; dy = dy + 1) {
    for (var dx = -1; dx <= 1; dx = dx + 1) {
      if (dx == 0 && dy == 0) {
        continue;
      }
      count += neighbor(x + dx, y + dy, ni);
    }
  }

  let i = id.y * n + id.x;
  let alive = src[i];
  let next = select(
    select(0u, 1u, count == 3u),
    select(0u, 1u, count == 2u || count == 3u),
    alive == 1u,
  );
  dst[i] = next;
}
