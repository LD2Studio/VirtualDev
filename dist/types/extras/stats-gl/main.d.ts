import { PanelTexture } from "./panelTexture.js";
import { StatsGLCapture } from "./statsGLNode.js";
import { StatsProfiler } from "./profiler.js";
import { TextureCaptureWebGL } from "./textureCapture.js";
import { TextureCaptureWebGPU } from "./textureCapture.js";
declare let Stats: {
    new ({ trackGPU, trackCPT, trackHz, trackFPS, logsPerSecond, graphsPerSecond, samplesLog, samplesGraph, precision, minimal, horizontal, mode }?: {
        trackGPU?: boolean;
        trackCPT?: boolean;
        trackHz?: boolean;
        trackFPS?: boolean;
        logsPerSecond?: number;
        graphsPerSecond?: number;
        samplesLog?: number;
        samplesGraph?: number;
        precision?: number;
        minimal?: boolean;
        horizontal?: boolean;
        mode?: number;
    }): {
        fpsPanel: any;
        msPanel: any;
        gpuPanel: any;
        gpuPanelCompute: any;
        vsyncPanel: PanelVSync;
        workerCpuPanel: Panel;
        texturePanels: Map<any, any>;
        texturePanelRow: HTMLDivElement;
        textureCaptureWebGL: TextureCaptureWebGL;
        textureCaptureWebGPU: TextureCaptureWebGPU;
        textureSourcesWebGL: Map<any, any>;
        textureSourcesWebGPU: Map<any, any>;
        texturePreviewWidth: number;
        texturePreviewHeight: number;
        lastRendererWidth: number;
        lastRendererHeight: number;
        textureUpdatePending: boolean;
        updateCounter: number;
        lastMin: {};
        lastMax: {};
        lastValue: {};
        VSYNC_RATES: {
            refreshRate: number;
            frameTime: number;
        }[];
        detectedVSync: {
            refreshRate: number;
            frameTime: number;
        };
        frameTimeHistory: any[];
        HISTORY_SIZE: number;
        VSYNC_THRESHOLD: number;
        lastFrameTime: number;
        externalData: any;
        hasNewExternalData: boolean;
        isWorker: boolean;
        averageWorkerCpu: {
            logs: any[];
            graph: any[];
        };
        handleClick: (event: any) => void;
        handleResize: () => void;
        mode: number;
        horizontal: boolean;
        minimal: boolean;
        dom: HTMLDivElement;
        _panelId: number;
        initializeDOM(): void;
        setupEventListeners(): void;
        /**
         * Compute and update texture preview dimensions based on renderer aspect ratio
         */
        updateTexturePreviewDimensions(): void;
        onWebGPUTimestampSupported(): void;
        onGPUTrackingInitialized(): void;
        setData(data: any): void;
        update(): void;
        updateFromExternalData(): void;
        totalCpuDuration: number;
        updateFromInternalData(): void;
        renderPanels(): void;
        prevTextTime: number;
        prevGraphTime: number;
        resetCounters(): void;
        renderCount: number;
        beginTime: number;
        resizePanel(panel: any): void;
        addPanel(panel: any): any;
        showPanel(id: any): void;
        /**
         * Add a new texture preview panel
         * @param name - Label for the texture panel
         * @returns The created PanelTexture instance
         */
        addTexturePanel(name: any): PanelTexture;
        /**
         * Set texture source for a panel (Three.js render target)
         * Auto-detects WebGL/WebGPU and extracts native handles
         * @param name - Panel name
         * @param source - Three.js RenderTarget or native texture
         */
        setTexture(name: any, source: any): void;
        /**
         * Set WebGL framebuffer source with explicit dimensions
         * @param name - Panel name
         * @param framebuffer - WebGL framebuffer
         * @param width - Texture width
         * @param height - Texture height
         */
        setTextureWebGL(name: any, framebuffer: any, width: any, height: any): void;
        /**
         * Set texture from ImageBitmap (for worker mode)
         * @param name - Panel name
         * @param bitmap - ImageBitmap transferred from worker
         * @param sourceWidth - Optional source texture width for aspect ratio
         * @param sourceHeight - Optional source texture height for aspect ratio
         */
        setTextureBitmap(name: any, bitmap: any, sourceWidth: any, sourceHeight: any): void;
        /**
         * Remove a texture panel
         * @param name - Panel name to remove
         */
        removeTexturePanel(name: any): void;
        /**
         * Capture and update all texture panels
         * Called automatically during renderPanels at graphsPerSecond rate
         */
        updateTexturePanels(): Promise<void>;
        /**
         * Capture StatsGL nodes registered by the addon
         */
        captureStatsGLNodes(): void;
        detectVSync(currentTime: any): void;
        updatePanelComponents(panel: any, averageArray: any, precision: any, shouldUpdateText: any, shouldUpdateGraph: any, suffix?: string): void;
        updatePanel(panel: any, averageArray: any, precision?: number): void;
        get domElement(): HTMLDivElement;
        /**
         * Dispose of all resources. Call when done using Stats.
         */
        dispose(): void;
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
        prevCpuTime: number;
        init(canvasOrGL: any): Promise<void>;
        handleNativeWebGPU(device: any): boolean;
        initializeWebGPUTiming(): void;
        handleThreeRenderer(renderer: any): boolean;
        handleWebGPURenderer(renderer: any): Promise<boolean>;
        info: any;
        initializeWebGL(canvasOrGL: any): boolean;
        initializeGPUTracking(): void;
        getTimestampWrites(): {
            querySet: any;
            beginningOfPassWriteIndex: number;
            endOfPassWriteIndex: number;
        };
        begin(encoder: any): void;
        end(encoder: any): void;
        resolveTimestampsAsync(): Promise<number>;
        _resolveTimestamps(readBuffer: any): Promise<number>;
        processGpuQueries(): void;
        processWebGPUTimestamps(): void;
        beginProfiling(marker: any): void;
        endProfiling(startMarker: any, endMarker: any, measureName: any): void;
        calculateFps(): number;
        updateAverages(): void;
        addToAverage(value: any, averageArray: any): void;
        getData(): {
            fps: any;
            cpu: any;
            gpu: any;
            gpuCompute: any;
        };
        patchThreeWebGPU(renderer: any): void;
        patchThreeRenderer(renderer: any): void;
    };
    Panel: typeof Panel;
    PanelTexture: typeof PanelTexture;
};
import { PanelVSync } from "./panelVsync.js";
import { Panel } from "./panel.js";
export { PanelTexture, StatsGLCapture, StatsProfiler, TextureCaptureWebGL, TextureCaptureWebGPU, Stats as default };
//# sourceMappingURL=main.d.ts.map