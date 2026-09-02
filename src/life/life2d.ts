import {
  COLOR_ALIVE,
  COLOR_DEAD,
  COLOR_GRID,
  GRID_N,
  type Layout,
  type LifeBackend,
} from './constants';
import { step } from './rules';

export function createCanvas2dLife(canvas: HTMLCanvasElement): LifeBackend | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const n = GRID_N;
  let cur = new Uint8Array(n * n);
  let nxt = new Uint8Array(n * n);
  let layout: Layout = { cssW: 0, cssH: 0, padX: 0, padY: 0, cell: 0 };
  let dpi = window.devicePixelRatio || 1;

  return {
    resize(next) {
      layout = next;
      dpi = window.devicePixelRatio || 1;
    },

    draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = COLOR_DEAD;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { padX, padY, cell } = layout;
      if (cell <= 0) return;

      ctx.save();
      ctx.scale(dpi, dpi);
      ctx.fillStyle = COLOR_ALIVE;
      const gap = cell > 2 ? 0.5 : 0;
      const w = Math.max(0.5, cell - gap);
      for (let y = 0; y < n; y += 1) {
        const row = y * n;
        for (let x = 0; x < n; x += 1) {
          if (cur[row + x]) {
            ctx.fillRect(padX + x * cell + gap * 0.5, padY + y * cell + gap * 0.5, w, w);
          }
        }
      }

      const gridRight = padX + n * cell;
      const gridBottom = padY + n * cell;
      ctx.strokeStyle = COLOR_GRID;
      ctx.lineWidth = 1;
      ctx.lineCap = 'square';
      ctx.beginPath();
      for (let i = 0; i <= n; i += 1) {
        const x = padX + i * cell;
        ctx.moveTo(x, padY);
        ctx.lineTo(x, gridBottom);
      }
      for (let j = 0; j <= n; j += 1) {
        const y = padY + j * cell;
        ctx.moveTo(padX, y);
        ctx.lineTo(gridRight, y);
      }
      ctx.stroke();
      ctx.restore();
    },

    step() {
      step(cur, nxt, n);
      const prev = cur;
      cur = nxt;
      nxt = prev;
    },

    setCell(index, value) {
      cur[index] = value ? 1 : 0;
    },

    toggle(index) {
      cur[index] ^= 1;
      return cur[index];
    },

    clear() {
      cur.fill(0);
      nxt.fill(0);
    },

    dispose() {
      /* canvas 2d has no GPU resources */
    },
  };
}
