import { createCanvas2dLife } from './life2d';
import { tryCreateGpuLife } from './lifeGpu';
import type { LifeBackend } from './constants';

export async function createLifeBackend(canvas: HTMLCanvasElement): Promise<LifeBackend | null> {
  try {
    const gpu = await tryCreateGpuLife(canvas);
    if (gpu) return gpu;
  } catch {
    /* adapter/device/shader compile can throw; fall through to 2d */
  }
  return createCanvas2dLife(canvas);
}
