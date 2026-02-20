export { Entity };
/**
 * Class to create a 3D virtual world application
 */
export class App {
    /**
     * Construct a new application
     *
     * @param {Object} renderEngine - The rendering engine (WebGL/WebGPU)
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    constructor(renderEngine: any, physicsEngine?: any, parameters?: AppOptions);
    webgl: boolean;
    name: string;
    /**
     * The rendering system
     * @type {THREE.WebGLRenderer|THREE.WebGPURenderer}
     */
    renderer: THREE.WebGLRenderer | THREE.WebGPURenderer;
    /**
     * The scene
     * @type {THREE.Scene}
     */
    scene: THREE.Scene;
    /**
     * The camera
     * @type {THREE.PerspectiveCamera}
     */
    camera: THREE.PerspectiveCamera;
    /**
     * The input manager
     * @example
     * this.inputs.actions = [
     *     { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
     *     { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
     *     { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
     *     { name: 'right', keys: ['ArrowRight', 'KeyD'] },
     *     { name: 'run', keys: ['ShiftLeft', 'ShiftRight']}
     * ]
     *
     * this.onRender = (time, deltaTime) => {
     *      if (app.inputs.isPressed('forward')) {
     *          // do something
     *      }
     * }
     */
    inputs: any;
    interactive: boolean;
    interactiveProps: {};
    outliner: Outliner;
    stats: {
        fpsPanel: any;
        msPanel: any;
        gpuPanel: any;
        gpuPanelCompute: any;
        vsyncPanel: import("./extras/stats-gl/panelVsync").PanelVSync;
        workerCpuPanel: import("./extras/stats-gl/panel").Panel;
        texturePanels: Map<any, any>;
        texturePanelRow: HTMLDivElement;
        textureCaptureWebGL: import("./extras/stats-gl/textureCapture").TextureCaptureWebGL;
        textureCaptureWebGPU: import("./extras/stats-gl/textureCapture").TextureCaptureWebGPU;
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
        addTexturePanel(name: any): import("./extras/stats-gl/panelTexture").PanelTexture;
        setTexture(name: any, source: any): void;
        setTextureWebGL(name: any, framebuffer: any, width: any, height: any): void;
        setTextureBitmap(name: any, bitmap: any, sourceWidth: any, sourceHeight: any): void;
        removeTexturePanel(name: any): void;
        updateTexturePanels(): Promise<void>;
        captureStatsGLNodes(): void;
        detectVSync(currentTime: any): void;
        updatePanelComponents(panel: any, averageArray: any, precision: any, shouldUpdateText: any, shouldUpdateGraph: any, suffix?: string): void;
        updatePanel(panel: any, averageArray: any, precision?: number): void;
        get domElement(): HTMLDivElement;
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
    sceneTree: any;
    _clock: THREE.Clock;
    _lastTime: number;
    _firstRender: boolean;
    onRender: (time: any, deltaTime: any) => void;
    onBeforeRender: (time: any, deltaTime: any) => void;
    onAfterRender: (time: any, deltaTime: any) => void;
    #private;
}
/**
 * Application options
 */
export type AppOptions = {
    /**
     * - A name for the application
     */
    name?: string;
    /**
     * - Enable interactive mode
     */
    interactive?: boolean;
    /**
     * - Enable VR mode
     */
    vr?: boolean;
    /**
     * - Enable AR mode
     */
    ar?: boolean;
    /**
     * - Enable monitor mode
     */
    monitor?: boolean;
    /**
     * - Rendering options
     */
    renderOptions?: THREE.WebGLRenderer.Options;
};
import { Entity } from './core/entity';
import * as THREE from 'three';
import { Outliner } from './ui/outliner';
//# sourceMappingURL=virtualdev.d.ts.map