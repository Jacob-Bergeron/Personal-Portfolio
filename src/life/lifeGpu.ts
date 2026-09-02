import computeShader from '../shaders/lifeCompute.wgsl?raw';
import renderShader from '../shaders/lifeRender.wgsl?raw';
import {
  COLOR_ALIVE_RGB,
  COLOR_DEAD_RGB,
  COLOR_GRID_RGBA,
  GRID_N,
  type Layout,
  type LifeBackend,
} from './constants';
import { step } from './rules';

const WORKGROUP = 8;
const CELL_BYTES = 4;

const RENDER_UNI_BYTES = 80;

function writeF32(view: DataView, offset: number, value: number) {
  view.setFloat32(offset, value, true);
}

function writeRenderUniforms(view: DataView, layout: Layout) {
  writeF32(view, 0, layout.cssW);
  writeF32(view, 4, layout.cssH);
  writeF32(view, 8, layout.padX);
  writeF32(view, 12, layout.padY);
  writeF32(view, 16, layout.cell);
  writeF32(view, 20, GRID_N);
  writeF32(view, 32, COLOR_DEAD_RGB[0]);
  writeF32(view, 36, COLOR_DEAD_RGB[1]);
  writeF32(view, 40, COLOR_DEAD_RGB[2]);
  writeF32(view, 44, 1);
  writeF32(view, 48, COLOR_ALIVE_RGB[0]);
  writeF32(view, 52, COLOR_ALIVE_RGB[1]);
  writeF32(view, 56, COLOR_ALIVE_RGB[2]);
  writeF32(view, 60, 1);
  writeF32(view, 64, COLOR_GRID_RGBA[0]);
  writeF32(view, 68, COLOR_GRID_RGBA[1]);
  writeF32(view, 72, COLOR_GRID_RGBA[2]);
  writeF32(view, 76, COLOR_GRID_RGBA[3]);
}

function shaderHasError(info: GPUCompilationInfo) {
  return info.messages.some((m) => m.type === 'error');
}

export async function tryCreateGpuLife(canvas: HTMLCanvasElement): Promise<LifeBackend | null> {
  const gpu = navigator.gpu;
  if (!gpu) return null;

  let adapter: GPUAdapter | null;
  try {
    adapter = await gpu.requestAdapter();
  } catch {
    return null;
  }
  if (!adapter) return null;

  let device: GPUDevice;
  try {
    device = await adapter.requestDevice();
  } catch {
    return null;
  }

  const format = gpu.getPreferredCanvasFormat();
  const n = GRID_N;
  const cellCount = n * n;
  const gridBytes = cellCount * CELL_BYTES;

  const computeModule = device.createShaderModule({ code: computeShader });
  const renderModule = device.createShaderModule({ code: renderShader });
  const [computeInfo, renderInfo] = await Promise.all([
    computeModule.getCompilationInfo(),
    renderModule.getCompilationInfo(),
  ]);
  if (shaderHasError(computeInfo) || shaderHasError(renderInfo)) {
    device.destroy();
    return null;
  }

  let computePipeline: GPUComputePipeline;
  let renderPipeline: GPURenderPipeline;
  let computeBgl: GPUBindGroupLayout;
  let renderBgl: GPUBindGroupLayout;
  try {
    computeBgl = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });
    renderBgl = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
      ],
    });
    computePipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [computeBgl] }),
      compute: { module: computeModule, entryPoint: 'computeMain' },
    });
    renderPipeline = device.createRenderPipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [renderBgl] }),
      vertex: { module: renderModule, entryPoint: 'vs' },
      fragment: {
        module: renderModule,
        entryPoint: 'fs',
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list' },
    });
  } catch {
    device.destroy();
    return null;
  }

  const mirror = new Uint8Array(cellCount);
  const nextMirror = new Uint8Array(cellCount);
  const staging = new Uint32Array(cellCount);

  let buffers: [GPUBuffer, GPUBuffer];
  let computeUni: GPUBuffer;
  let renderUni: GPUBuffer;
  let computeGroups: [GPUBindGroup, GPUBindGroup];
  let renderGroups: [GPUBindGroup, GPUBindGroup];
  try {
    buffers = [
      device.createBuffer({
        size: gridBytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      device.createBuffer({
        size: gridBytes,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
    ];
    computeUni = device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(computeUni, 0, new Uint32Array([n, 0, 0, 0]));
    renderUni = device.createBuffer({
      size: RENDER_UNI_BYTES,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    computeGroups = [
      device.createBindGroup({
        layout: computeBgl,
        entries: [
          { binding: 0, resource: { buffer: buffers[0] } },
          { binding: 1, resource: { buffer: buffers[1] } },
          { binding: 2, resource: { buffer: computeUni } },
        ],
      }),
      device.createBindGroup({
        layout: computeBgl,
        entries: [
          { binding: 0, resource: { buffer: buffers[1] } },
          { binding: 1, resource: { buffer: buffers[0] } },
          { binding: 2, resource: { buffer: computeUni } },
        ],
      }),
    ];
    renderGroups = [
      device.createBindGroup({
        layout: renderBgl,
        entries: [
          { binding: 0, resource: { buffer: buffers[0] } },
          { binding: 1, resource: { buffer: renderUni } },
        ],
      }),
      device.createBindGroup({
        layout: renderBgl,
        entries: [
          { binding: 0, resource: { buffer: buffers[1] } },
          { binding: 1, resource: { buffer: renderUni } },
        ],
      }),
    ];
  } catch {
    device.destroy();
    return null;
  }

  const renderUniBytes = new ArrayBuffer(RENDER_UNI_BYTES);
  const renderUniView = new DataView(renderUniBytes);

  const context = canvas.getContext('webgpu');
  if (!context) {
    device.destroy();
    return null;
  }

  let current = 0;
  let disposed = false;

  const writeCell = (index: number, value: number) => {
    staging[index] = value ? 1 : 0;
    device.queue.writeBuffer(buffers[current], index * CELL_BYTES, staging.subarray(index, index + 1));
  };

  const configure = () => {
    context.configure({
      device,
      format,
      alphaMode: 'opaque',
    });
  };

  try {
    configure();
  } catch {
    try {
      context.unconfigure();
    } catch {
      /* ignore */
    }
    device.destroy();
    return null;
  }

  return {
    resize(layout) {
      if (disposed) return;
      writeRenderUniforms(renderUniView, layout);
      device.queue.writeBuffer(renderUni, 0, renderUniBytes);
      configure();
    },

    draw() {
      if (disposed) return;
      try {
        const encoder = device.createCommandEncoder();
        const pass = encoder.beginRenderPass({
          colorAttachments: [
            {
              view: context.getCurrentTexture().createView(),
              loadOp: 'clear',
              storeOp: 'store',
              clearValue: {
                r: COLOR_DEAD_RGB[0],
                g: COLOR_DEAD_RGB[1],
                b: COLOR_DEAD_RGB[2],
                a: 1,
              },
            },
          ],
        });
        pass.setPipeline(renderPipeline);
        pass.setBindGroup(0, renderGroups[current]);
        pass.draw(3);
        pass.end();
        device.queue.submit([encoder.finish()]);
      } catch {
        disposed = true;
      }
    },

    step() {
      if (disposed) return;
      const encoder = device.createCommandEncoder();
      const pass = encoder.beginComputePass();
      pass.setPipeline(computePipeline);
      pass.setBindGroup(0, computeGroups[current]);
      pass.dispatchWorkgroups(Math.ceil(n / WORKGROUP), Math.ceil(n / WORKGROUP));
      pass.end();
      device.queue.submit([encoder.finish()]);
      current ^= 1;
      step(mirror, nextMirror, n);
      mirror.set(nextMirror);
    },

    setCell(index, value) {
      const v = value ? 1 : 0;
      mirror[index] = v;
      writeCell(index, v);
    },

    toggle(index) {
      const v = mirror[index] ^ 1;
      mirror[index] = v;
      writeCell(index, v);
      return v;
    },

    clear() {
      mirror.fill(0);
      nextMirror.fill(0);
      staging.fill(0);
      device.queue.writeBuffer(buffers[0], 0, staging);
      device.queue.writeBuffer(buffers[1], 0, staging);
      current = 0;
    },

    dispose() {
      if (disposed) return;
      disposed = true;
      try {
        context.unconfigure();
      } catch {
        /* ignore */
      }
      buffers[0].destroy();
      buffers[1].destroy();
      computeUni.destroy();
      renderUni.destroy();
      device.destroy();
    },
  };
}
