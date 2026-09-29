import { createCanvas2dLife } from './life2d';
import { tryCreateGpuLife } from './lifeGpu';
export async function createLifeBackend(canvas) {
    try {
        const gpu = await tryCreateGpuLife(canvas);
        if (gpu)
            return gpu;
    }
    catch {
        /* adapter/device/shader compile can throw; fall through to 2d */
    }
    return createCanvas2dLife(canvas);
}
