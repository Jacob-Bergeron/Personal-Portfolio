/// <reference types="vite/client" />
/// <reference types="@webgpu/types" />

interface ImportMetaEnv {
  readonly VITE_CONTACT_EMAIL?: string;
}

declare module '*.wgsl?raw' {
  const src: string;
  export default src;
}
