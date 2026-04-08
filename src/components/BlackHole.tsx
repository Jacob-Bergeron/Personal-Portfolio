import { useEffect, useRef } from 'react';
import '../styles/BlackHole.css';

type EaseName = 'linear' | 'outCubic' | 'outExpo' | 'inExpo';

type Disc = {
  p: number;
  sx: number;
  sy: number;
  w: number;
  h: number;
  x: number;
  y: number;
  a: number;
};

type Dot = {
  d: Disc;
  a: number;
  c: string;
  p: number;
  o: number;
};

type RenderState = {
  width: number;
  height: number;
  dpi: number;
};

const easing = {
  linear: (t: number) => t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  outExpo: (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t: number) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
};

function tweenValue(start: number, end: number, p: number, ease: EaseName = 'linear') {
  return start + (end - start) * easing[ease](p);
}

function BlackHole() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let render: RenderState = { width: 0, height: 0, dpi: window.devicePixelRatio || 1 };
    let discs: Disc[] = [];
    let dots: Dot[] = [];
    let rafId = 0;

    const setCanvasSize = () => {
      const rect = root.getBoundingClientRect();
      render = {
        width: rect.width,
        height: rect.height,
        dpi: window.devicePixelRatio || 1,
      };

      canvas.width = Math.max(1, Math.floor(render.width * render.dpi));
      canvas.height = Math.max(1, Math.floor(render.height * render.dpi));
    };

    const tweenDisc = (disc: Disc) => {
      const startX = render.width * 0.5;
      const startY = 0;
      const startW = render.width;
      const startH = render.height;

      const scaleX = tweenValue(1, 0, disc.p, 'outCubic');
      const scaleY = tweenValue(1, 0, disc.p, 'outExpo');

      disc.sx = scaleX;
      disc.sy = scaleY;
      disc.w = startW * scaleX;
      disc.h = startH * scaleY;
      disc.x = startX;
      disc.y = startY + disc.p * startH;
      return disc;
    };

    const setDiscs = () => {
      discs = [];
      const totalDiscs = 150;
      for (let i = 0; i < totalDiscs; i += 1) {
        discs.push(
          tweenDisc({
            p: i / totalDiscs,
            sx: 1,
            sy: 1,
            w: 0,
            h: 0,
            x: 0,
            y: 0,
            a: 0,
          }),
        );
      }
    };

    const setDots = () => {
      dots = [];
      const totalDots = 20000;
      for (let i = 0; i < totalDots; i += 1) {
        const disc = discs[Math.floor(discs.length * Math.random())];
        dots.push({
          d: disc,
          a: 0,
          c: `rgb(0, ${150 + Math.random() * 50}, ${150 + Math.random() * 105})`,
          p: Math.random(),
          o: Math.random(),
        });
      }
    };

    const setSizes = () => {
      setCanvasSize();
      setDiscs();
      setDots();
    };

    const moveDiscs = () => {
      for (const disc of discs) {
        disc.p = (disc.p + 0.0003) % 1;
        tweenDisc(disc);

        const p = disc.sx * disc.sy;
        let a = 1;
        if (p < 0.01) a = Math.pow(Math.min(p / 0.01, 1), 3);
        else if (p > 0.2) a = 1 - Math.min((p - 0.2) / 0.8, 1);
        disc.a = a;
      }
    };

    const moveDots = () => {
      for (const dot of dots) {
        const v = tweenValue(0, 0.001, 1 - dot.d.sx * dot.d.sy, 'inExpo');
        dot.p = (dot.p + v) % 1;
      }
    };

    const drawDiscs = () => {
      ctx.strokeStyle = '#0329';
      ctx.lineWidth = 1;
      for (const disc of discs) {
        ctx.beginPath();
        ctx.globalAlpha = disc.a;
        ctx.ellipse(disc.x, disc.y + disc.h, disc.w, disc.h, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.closePath();
      }
    };

    const drawDots = () => {
      for (const dot of dots) {
        const { d, a, p, c, o } = dot;
        const sizeScale = d.sx * d.sy;
        const angle = a + Math.PI * 2 * p;
        const x = d.x + Math.cos(angle) * d.w;
        const y = d.y + Math.sin(angle) * d.h;

        ctx.fillStyle = c;
        ctx.globalAlpha = d.a * o;
        ctx.beginPath();
        ctx.arc(x, y + d.h, 1 + sizeScale * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(render.dpi, render.dpi);
      moveDiscs();
      moveDots();
      drawDiscs();
      drawDots();
      ctx.restore();
      rafId = requestAnimationFrame(tick);
    };

    const onResize = () => setSizes();

    setSizes();
    window.addEventListener('resize', onResize);
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="black-hole" ref={rootRef} aria-hidden="true">
      <canvas className="js-canvas" ref={canvasRef} />
    </div>
  );
}

export default BlackHole;
