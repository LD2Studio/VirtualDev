export class StatsCore {
    constructor({ trackGPU, trackCPT, trackHz, trackFPS, logsPerSecond, graphsPerSecond, samplesLog, samplesGraph, precision }?: {
        trackGPU?: boolean;
        trackCPT?: boolean;
        trackHz?: boolean;
        trackFPS?: boolean;
        logsPerSecond?: number;
        graphsPerSecond?: number;
        samplesLog?: number;
        samplesGraph?: number;
        precision?: number;
    });
    gl: any;
    ext: any;
    gpuDevice: any;
    gpuBackend: any;
    renderer: any;
    activeQuery: any;
    gpuQueries: any[];
    threeRendererPatched: boolean;
    webgpuNative: boolean;
    gpuQuerySet: any;
    gpuResolveBuffer: any;
    gpuReadBuffers: any[];
    gpuWriteBufferIndex: number;
    gpuFrameCount: number;
    pendingResolve: Promise<number>;
    frameTimes: any[];
    renderCount: number;
    totalCpuDuration: number;
    totalGpuDuration: number;
    totalGpuDurationCompute: number;
    averageFps: {
        logs: any[];
        graph: any[];
    };
    averageCpu: {
        logs: any[];
        graph: any[];
    };
    averageGpu: {
        logs: any[];
        graph: any[];
    };
    averageGpuCompute: {
        logs: any[];
        graph: any[];
    };
    trackGPU: boolean;
    trackCPT: boolean;
    trackHz: boolean;
    trackFPS: boolean;
    samplesLog: number;
    samplesGraph: number;
    precision: number;
    logsPerSecond: number;
    graphsPerSecond: number;
    prevGraphTime: number;
    beginTime: number;
    prevTextTime: number;
    prevCpuTime: number;
    init(canvasOrGL: any): Promise<void>;
    handleNativeWebGPU(device: any): boolean;
    initializeWebGPUTiming(): void;
    handleThreeRenderer(renderer: any): boolean;
    handleWebGPURenderer(renderer: any): Promise<boolean>;
    info: any;
    onWebGPUTimestampSupported(): void;
    initializeWebGL(canvasOrGL: any): boolean;
    initializeGPUTracking(): void;
    onGPUTrackingInitialized(): void;
    /**
     * Get timestampWrites configuration for WebGPU render pass.
     * Use this when creating your render pass descriptor.
     * @returns timestampWrites object or undefined if not tracking GPU
     */
    getTimestampWrites(): {
        querySet: any;
        beginningOfPassWriteIndex: number;
        endOfPassWriteIndex: number;
    };
    begin(encoder: any): void;
    end(encoder: any): void;
    /**
     * Resolve WebGPU timestamp queries. Call this after queue.submit().
     * Returns a promise that resolves to the GPU duration in milliseconds.
     */
    resolveTimestampsAsync(): Promise<number>;
    _resolveTimestamps(readBuffer: any): Promise<number>;
    processGpuQueries(): void;
    processWebGPUTimestamps(): void;
    beginProfiling(marker: any): void;
    endProfiling(startMarker: any, endMarker: any, measureName: any): void;
    calculateFps(): number;
    updateAverages(): void;
    addToAverage(value: any, averageArray: any): void;
    resetCounters(): void;
    getData(): {
        fps: any;
        cpu: any;
        gpu: any;
        gpuCompute: any;
    };
    patchThreeWebGPU(renderer: any): void;
    patchThreeRenderer(renderer: any): void;
    /**
     * Dispose of all resources. Call when done using the stats instance.
     */
    dispose(): void;
}
//# sourceMappingURL=core.d.ts.map