export class StatsProfiler extends StatsCore {
    constructor(options?: {});
    textureCaptureWebGL: TextureCaptureWebGL;
    textureCaptureWebGPU: TextureCaptureWebGPU;
    update(): void;
    /**
     * Capture a texture/render target to ImageBitmap for transfer to main thread
     * @param source - Three.js RenderTarget, GPUTexture, or WebGLFramebuffer with dimensions
     * @param sourceId - Unique identifier for this texture source (for per-source PBO buffering)
     * @returns ImageBitmap suitable for postMessage transfer
     */
    captureTexture(source: any, sourceId?: string): Promise<ImageBitmap>;
    /**
     * Dispose texture capture resources
     */
    disposeTextureCapture(): void;
}
import { StatsCore } from "./core.js";
import { TextureCaptureWebGL } from "./textureCapture.js";
import { TextureCaptureWebGPU } from "./textureCapture.js";
//# sourceMappingURL=profiler.d.ts.map