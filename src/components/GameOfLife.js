import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Group, Title } from '@mantine/core';
import '../styles/GameOfLife.css';
import { GRID_N } from '../life/constants';
import { createLifeBackend } from '../life/createBackend';
/** Milliseconds between generations (slider adjusts this). */
const DEFAULT_STEP_MS = 100;
const MIN_STEP_MS = 20;
const MAX_STEP_MS = 280;
/** Stop automatically after this wall-clock duration so the loop cannot run indefinitely. */
const MAX_RUN_MS = 120000;
function GameOfLife() {
    const rootRef = useRef(null);
    const canvasRef = useRef(null);
    const backendRef = useRef(null);
    const layoutRef = useRef({
        cssW: 0,
        cssH: 0,
        padX: 0,
        padY: 0,
        cell: 0,
    });
    const runningRef = useRef(false);
    const runStartedAtRef = useRef(0);
    const lastStepRef = useRef(0);
    const dragValueRef = useRef(null);
    const lastCellRef = useRef(null);
    const stepMsRef = useRef(DEFAULT_STEP_MS);
    const [running, setRunning] = useState(false);
    const [stepMs, setStepMs] = useState(DEFAULT_STEP_MS);
    useEffect(() => {
        runningRef.current = running;
    }, [running]);
    useEffect(() => {
        stepMsRef.current = stepMs;
    }, [stepMs]);
    const screenToCell = useCallback((clientX, clientY) => {
        const canvas = canvasRef.current;
        const layout = layoutRef.current;
        if (!canvas || layout.cell <= 0)
            return null;
        const r = canvas.getBoundingClientRect();
        const px = clientX - r.left;
        const py = clientY - r.top;
        const gx = Math.floor((px - layout.padX) / layout.cell);
        const gy = Math.floor((py - layout.padY) / layout.cell);
        if (gx < 0 || gy < 0 || gx >= GRID_N || gy >= GRID_N)
            return null;
        return { x: gx, y: gy };
    }, []);
    useEffect(() => {
        const root = rootRef.current;
        const canvas = canvasRef.current;
        if (!root || !canvas)
            return;
        const n = GRID_N;
        let cancelled = false;
        let rafId = 0;
        let backend = null;
        const setCanvasSize = () => {
            const rect = root.getBoundingClientRect();
            const dpi = window.devicePixelRatio || 1;
            const cssW = rect.width;
            const cssH = rect.height;
            canvas.width = Math.max(1, Math.floor(cssW * dpi));
            canvas.height = Math.max(1, Math.floor(cssH * dpi));
            const cell = Math.min(cssW, cssH) / n;
            const padX = (cssW - cell * n) * 0.5;
            const padY = (cssH - cell * n) * 0.5;
            layoutRef.current = { cssW, cssH, padX, padY, cell };
            backend?.resize(layoutRef.current);
        };
        const paintAt = (clientX, clientY, mode) => {
            if (runningRef.current || !backend)
                return;
            const cellPos = screenToCell(clientX, clientY);
            if (!cellPos)
                return;
            const idx = cellPos.y * n + cellPos.x;
            if (mode === 'toggle') {
                dragValueRef.current = backend.toggle(idx);
            }
            else if (dragValueRef.current !== null) {
                const last = lastCellRef.current;
                if (last && last.x === cellPos.x && last.y === cellPos.y)
                    return;
                backend.setCell(idx, dragValueRef.current);
            }
            lastCellRef.current = cellPos;
            backend.draw();
        };
        const onPointerDown = (e) => {
            if (runningRef.current)
                return;
            canvas.setPointerCapture(e.pointerId);
            lastCellRef.current = null;
            dragValueRef.current = null;
            paintAt(e.clientX, e.clientY, 'toggle');
        };
        const onPointerMove = (e) => {
            if (runningRef.current)
                return;
            if ((e.buttons & 1) === 0)
                return;
            if (dragValueRef.current === null)
                return;
            paintAt(e.clientX, e.clientY, 'drag');
        };
        const onPointerUp = (e) => {
            try {
                canvas.releasePointerCapture(e.pointerId);
            }
            catch {
                /* not captured */
            }
            dragValueRef.current = null;
            lastCellRef.current = null;
        };
        const tick = (t) => {
            if (cancelled)
                return;
            if (document.visibilityState === 'hidden') {
                rafId = requestAnimationFrame(tick);
                return;
            }
            if (backend && runningRef.current) {
                if (t - runStartedAtRef.current >= MAX_RUN_MS) {
                    runningRef.current = false;
                    setRunning(false);
                }
                else if (t - lastStepRef.current >= stepMsRef.current) {
                    lastStepRef.current = t;
                    backend.step();
                }
            }
            backend?.draw();
            rafId = requestAnimationFrame(tick);
        };
        const onResize = () => {
            setCanvasSize();
        };
        const start = async () => {
            const created = await createLifeBackend(canvas);
            if (cancelled) {
                created?.dispose();
                return;
            }
            if (!created)
                return;
            backend = created;
            backendRef.current = created;
            setCanvasSize();
            window.addEventListener('resize', onResize);
            canvas.addEventListener('pointerdown', onPointerDown);
            canvas.addEventListener('pointermove', onPointerMove);
            canvas.addEventListener('pointerup', onPointerUp);
            canvas.addEventListener('pointercancel', onPointerUp);
            rafId = requestAnimationFrame(tick);
        };
        void start();
        return () => {
            cancelled = true;
            window.removeEventListener('resize', onResize);
            canvas.removeEventListener('pointerdown', onPointerDown);
            canvas.removeEventListener('pointermove', onPointerMove);
            canvas.removeEventListener('pointerup', onPointerUp);
            canvas.removeEventListener('pointercancel', onPointerUp);
            cancelAnimationFrame(rafId);
            backend?.dispose();
            backendRef.current = null;
        };
    }, [screenToCell]);
    const handleRun = useCallback(() => {
        if (runningRef.current)
            return;
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
        backendRef.current?.clear();
    }, []);
    return (_jsxs("div", { className: "game-of-life-wrap", "data-aos": "fade-up", children: [_jsx("header", { className: "game-of-life-header", children: _jsx("a", { className: "game-of-life-title-link", href: "https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life", target: "_blank", rel: "noopener noreferrer", children: _jsx(Title, { order: 3, className: "game-of-life-title", children: "Conway's Game of Life" }) }) }), _jsx("div", { className: "game-of-life", ref: rootRef, role: "presentation", children: _jsx("canvas", { ref: canvasRef, className: running ? undefined : 'game-of-life-canvas--editable', "aria-label": "Conway's Game of Life grid. When simulation is stopped, click or drag to toggle cells." }) }), _jsxs("div", { className: "game-of-life-controls", children: [_jsxs(Group, { className: "game-of-life-toolbar", gap: "sm", justify: "center", wrap: "wrap", children: [_jsx(Button, { onClick: handleRun, disabled: running, variant: "filled", children: "Run" }), _jsx(Button, { onClick: handleStop, disabled: !running, variant: "default", children: "Stop" }), _jsx(Button, { onClick: handleClear, variant: "outline", children: "Clear" })] }), _jsxs("div", { className: "game-of-life-speed", children: [_jsx("label", { className: "game-of-life-speed-label", htmlFor: "game-of-life-speed", children: "Speed" }), _jsxs("div", { className: "game-of-life-speed-row", children: [_jsx("span", { className: "game-of-life-speed-hint", "aria-hidden": "true", children: "fast" }), _jsx("input", { id: "game-of-life-speed", className: "game-of-life-speed-input", type: "range", min: MIN_STEP_MS, max: MAX_STEP_MS, step: 5, value: stepMs, onChange: (e) => setStepMs(Number(e.target.value)), "aria-valuetext": `${stepMs} milliseconds between steps. Lower is faster.` }), _jsx("span", { className: "game-of-life-speed-hint", "aria-hidden": "true", children: "slow" })] }), _jsxs("span", { className: "game-of-life-speed-value", children: [stepMs, " ms"] })] })] })] }));
}
export default GameOfLife;
