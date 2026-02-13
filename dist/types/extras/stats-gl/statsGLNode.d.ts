export class StatsGLCapture {
    constructor(THREE: any, width?: number, height?: number);
    nodes: Map<any, any>;
    width: number;
    height: number;
    THREE: any;
    /**
     * Update capture dimensions (e.g., on resize)
     */
    resize(width: any, height: any): void;
    register(name: any, targetNode: any): any;
    capture(name: any, renderer: any): Promise<ImageBitmap>;
    remove(name: any): void;
    /**
     * Dispose all capture resources
     */
    dispose(): void;
}
//# sourceMappingURL=statsGLNode.d.ts.map