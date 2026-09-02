struct RenderUniforms {
  size: vec2f,
  pad: vec2f,
  cell: f32,
  gridN: f32,
  _pad: vec2f,
  dead: vec4f,
  alive: vec4f,
  gridLine: vec4f,
}

@group(0) @binding(0) var<storage, read> cells: array<u32>;
@group(0) @binding(1) var<uniform> uni: RenderUniforms;

struct VsOut {
  @builtin(position) pos: vec4f,
  @location(0) clip: vec2f,
}

@vertex
fn vs(@builtin(vertex_index) i: u32) -> VsOut {
  var pos = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0),
  );
  let clip = pos[i];
  var out: VsOut;
  out.pos = vec4f(clip, 0.0, 1.0);
  out.clip = clip;
  return out;
}

@fragment
fn fs(in: VsOut) -> @location(0) vec4f {
  let css = vec2f(
    (in.clip.x * 0.5 + 0.5) * uni.size.x,
    (0.5 - in.clip.y * 0.5) * uni.size.y,
  );
  let n = uni.gridN;
  let cell = uni.cell;
  if (cell <= 0.0) {
    return uni.dead;
  }

  let gx = (css.x - uni.pad.x) / cell;
  let gy = (css.y - uni.pad.y) / cell;
  if (gx < 0.0 || gy < 0.0 || gx >= n || gy >= n) {
    return uni.dead;
  }

  let ix = u32(floor(gx));
  let iy = u32(floor(gy));
  let alive = cells[iy * u32(n) + ix] != 0u;

  let gap = select(0.0, 0.5, cell > 2.0);
  let localX = fract(gx) * cell;
  let localY = fract(gy) * cell;
  let inner =
    localX >= gap * 0.5 &&
    localY >= gap * 0.5 &&
    localX <= cell - gap * 0.5 &&
    localY <= cell - gap * 0.5;
  var base = select(uni.dead, uni.alive, alive && inner);

  let dist =
    min(
      min(fract(gx), 1.0 - fract(gx)),
      min(fract(gy), 1.0 - fract(gy)),
    ) * cell;
  if (dist < 0.5) {
    base = vec4f(mix(base.rgb, uni.gridLine.rgb, uni.gridLine.a), 1.0);
  }
  return base;
}
