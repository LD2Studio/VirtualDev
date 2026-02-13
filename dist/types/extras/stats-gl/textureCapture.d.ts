export const DEFAULT_PREVIEW_HEIGHT: 48;
export const DEFAULT_PREVIEW_WIDTH: 90;
export class TextureCaptureWebGL {
    constructor(gl: any, width?: number, height?: number);
    previewFbo: any;
    previewTexture: any;
    gl: any;
    previewWidth: number;
    previewHeight: number;
    pixels: Uint8Array<ArrayBuffer>;
    flippedPixels: Uint8Array<ArrayBuffer>;
    /**
     * Resize preview dimensions
     */
    resize(width: any, height: any): void;
    initResources(): void;
    capture(source: any, sourceWidth: any, sourceHeight: any, _sourceId?: string): Promise<ImageBitmap>;
    flipY(pixels: any, width: any, height: any): Uint8Array<ArrayBuffer>;
    removeSource(_sourceId: any): void;
    dispose(): void;
}
export class TextureCaptureWebGPU {
    constructor(device: any, width?: number, height?: number);
    previewTexture: any;
    stagingBuffer: any;
    blitPipeline: any;
    sampler: any;
    bindGroupLayout: any;
    initialized: boolean;
    device: any;
    previewWidth: number;
    previewHeight: number;
    pixelsBuffer: Uint8ClampedArray<ArrayBuffer>;
    /**
     * Resize preview dimensions
     */
    resize(width: any, height: any): void;
    createSizeResources(): void;
    initResources(): Promise<void>;
    capture(source: any): Promise<ImageBitmap>;
    dispose(): void;
}
export function extractWebGLSource(target: any, gl: any): {
    framebuffer: any;
    width: any;
    height: any;
};
export function extractWebGPUSource(target: any, backend: any): any;
//# sourceMappingURL=textureCapture.d.ts.map