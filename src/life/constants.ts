export const GRID_N = 32;

export const COLOR_DEAD = '#0c0c0f';
export const COLOR_ALIVE = '#c7d1c8';
export const COLOR_GRID = 'rgba(199, 209, 200, 0.4)';

export const COLOR_DEAD_RGB = [12 / 255, 12 / 255, 15 / 255] as const;
export const COLOR_ALIVE_RGB = [199 / 255, 209 / 255, 200 / 255] as const;
export const COLOR_GRID_RGBA = [199 / 255, 209 / 255, 200 / 255, 0.4] as const;

export type Layout = {
  cssW: number;
  cssH: number;
  padX: number;
  padY: number;
  cell: number;
};

export type LifeBackend = {
  resize: (layout: Layout) => void;
  draw: () => void;
  step: () => void;
  setCell: (index: number, value: number) => void;
  toggle: (index: number) => number;
  clear: () => void;
  dispose: () => void;
};
