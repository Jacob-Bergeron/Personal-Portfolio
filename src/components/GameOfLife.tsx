import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Group,Title } from '@mantine/core';
import '../styles/GameOfLife.css';

const GRID_N = 32;
/** Milliseconds between generations (slider adjusts this). */
const DEFAULT_STEP_MS = 100;
const MIN_STEP_MS = 20;
const MAX_STEP_MS = 280;
/** Stop automatically after this wall-clock duration so the loop cannot run indefinitely. */
const MAX_RUN_MS = 120_000;

/** Neutral panel fill so the grid reads apart from the page (--dark-green is #111d13). */
const COLOR_DEAD = '#0c0c0f';
const COLOR_ALIVE = '#c7d1c8';
/** Cell border lines (light green, visible on dark panel). */
const COLOR_GRID = 'rgba(199, 209, 200, 0.4)';

type Layout = {
  cssW: number;
  cssH: number;
  padX: number;
  padY: number;
  cell: number;
};

function countNeighbors(cur: Uint8Array, n: number, x: number, y: number) {
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

function step(cur: Uint8Array, next: Uint8Array, n: number) {
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

function GameOfLife() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layoutRef = useRef<Layout>({
    cssW: 0,
    cssH: 0,
    padX: 0,
    padY: 0,
    cell: 0,
  });

  const curRef = useRef<Uint8Array>(new Uint8Array(GRID_N * GRID_N));
  const nxtRef = useRef<Uint8Array>(new Uint8Array(GRID_N * GRID_N));

  const runningRef = useRef(false);
  const runStartedAtRef = useRef(0);
  const lastStepRef = useRef(0);
  const dragValueRef = useRef<number | null>(null);
  const lastCellRef = useRef<{ x: number; y: number } | null>(null);
  const stepMsRef = useRef(DEFAULT_STEP_MS);

  const [running, setRunning] = useState(false);
  const [stepMs, setStepMs] = useState(DEFAULT_STEP_MS);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

  useEffect(() => {
    stepMsRef.current = stepMs;
  }, [stepMs]);

  const screenToCell = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const layout = layoutRef.current;
    if (!canvas || layout.cell <= 0) return null;
    const r = canvas.getBoundingClientRect();
    const px = clientX - r.left;
    const py = clientY - r.top;
    const gx = Math.floor((px - layout.padX) / layout.cell);
    const gy = Math.floor((py - layout.padY) / layout.cell);
    if (gx < 0 || gy < 0 || gx >= GRID_N || gy >= GRID_N) return null;
    return { x: gx, y: gy };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const n = GRID_N;
    let dpi = window.devicePixelRatio || 1;
    let rafId = 0;

    const setCanvasSize = () => {
      const rect = root.getBoundingClientRect();
      dpi = window.devicePixelRatio || 1;
      const cssW = rect.width;
      const cssH = rect.height;
      canvas.width = Math.max(1, Math.floor(cssW * dpi));
      canvas.height = Math.max(1, Math.floor(cssH * dpi));
      const cell = Math.min(cssW, cssH) / n;
      const padX = (cssW - cell * n) * 0.5;
      const padY = (cssH - cell * n) * 0.5;
      layoutRef.current = { cssW, cssH, padX, padY, cell };
    };

    const draw = () => {
      const cur = curRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = COLOR_DEAD;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { padX, padY, cell } = layoutRef.current;
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
    };

    const paintAt = (clientX: number, clientY: number, mode: 'toggle' | 'drag') => {
      if (runningRef.current) return;
      const cellPos = screenToCell(clientX, clientY);
      if (!cellPos) return;
      const idx = cellPos.y * n + cellPos.x;
      const cur = curRef.current;

      if (mode === 'toggle') {
        cur[idx] ^= 1;
        dragValueRef.current = cur[idx];
      } else if (dragValueRef.current !== null) {
        const last = lastCellRef.current;
        if (last && last.x === cellPos.x && last.y === cellPos.y) return;
        cur[idx] = dragValueRef.current;
      }
      lastCellRef.current = cellPos;
      draw();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (runningRef.current) return;
      canvas.setPointerCapture(e.pointerId);
      lastCellRef.current = null;
      dragValueRef.current = null;
      paintAt(e.clientX, e.clientY, 'toggle');
    };

    const onPointerMove = (e: PointerEvent) => {
      if (runningRef.current) return;
      if ((e.buttons & 1) === 0) return;
      if (dragValueRef.current === null) return;
      paintAt(e.clientX, e.clientY, 'drag');
    };

    const onPointerUp = (e: PointerEvent) => {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* not captured */
      }
      dragValueRef.current = null;
      lastCellRef.current = null;
    };

    const tick = (t: number) => {
      if (document.visibilityState === 'hidden') {
        rafId = requestAnimationFrame(tick);
        return;
      }

      if (runningRef.current) {
        if (t - runStartedAtRef.current >= MAX_RUN_MS) {
          runningRef.current = false;
          setRunning(false);
        } else if (t - lastStepRef.current >= stepMsRef.current) {
          lastStepRef.current = t;
          const cur = curRef.current;
          const nxt = nxtRef.current;
          step(cur, nxt, n);
          curRef.current = nxt;
          nxtRef.current = cur;
        }
      }

      draw();
      rafId = requestAnimationFrame(tick);
    };

    const onResize = () => {
      setCanvasSize();
    };

    setCanvasSize();
    window.addEventListener('resize', onResize);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerUp);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerUp);
      cancelAnimationFrame(rafId);
    };
  }, [screenToCell]);

  const handleRun = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setRunning(true);
    runStartedAtRef.current = performance.now();
    lastStepRef.current = performance.now();
  }, []);

  const handleStop = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
  }, []);

  const handleClear = useCallback(() => {
    runningRef.current = false;
    setRunning(false);
    curRef.current.fill(0);
    nxtRef.current.fill(0);
  }, []);


  return (
    <div className="game-of-life-wrap">
      <header className="game-of-life-header">
        <a
          className="game-of-life-title-link"
          href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Title order={3} className="game-of-life-title">
            Conway&apos;s Game of Life
          </Title>
        </a>
        {/*
        <Text size="sm" className="game-of-life-caption" c="dimmed">
          Click or drag to place live cells, then run the simulation.
        </Text>
          */}
      </header>
      <div
        className="game-of-life"
        ref={rootRef}
        role="presentation"
      >
        <canvas
          ref={canvasRef}
          className={running ? undefined : 'game-of-life-canvas--editable'}
          aria-label="Conway's Game of Life grid. When simulation is stopped, click or drag to toggle cells."
        />
      </div>
      <div className="game-of-life-controls">
        <Group className="game-of-life-toolbar" gap="sm" justify="center" wrap="wrap">
          <Button onClick={handleRun} disabled={running} variant="filled">
            Run
          </Button>
          <Button onClick={handleStop} disabled={!running} variant="default">
            Stop
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
        </Group>
        <div className="game-of-life-speed">
          <label className="game-of-life-speed-label" htmlFor="game-of-life-speed">
            Speed
          </label>
          <div className="game-of-life-speed-row">
            <span className="game-of-life-speed-hint" aria-hidden="true">
              fast
            </span>
            <input
              id="game-of-life-speed"
              className="game-of-life-speed-input"
              type="range"
              min={MIN_STEP_MS}
              max={MAX_STEP_MS}
              step={5}
              value={stepMs}
              onChange={(e) => setStepMs(Number(e.target.value))}
              aria-valuetext={`${stepMs} milliseconds between steps. Lower is faster.`}
            />
            <span className="game-of-life-speed-hint" aria-hidden="true">
              slow
            </span>
          </div>
          <span className="game-of-life-speed-value">{stepMs} ms</span>
        </div>
      </div>
    </div>
  );
}

export default GameOfLife;
