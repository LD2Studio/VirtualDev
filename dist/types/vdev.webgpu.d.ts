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
};
/**
 * Create a new game application
 *
 * The rendering is done using WebGPU
 * @type {Object}
 */
export class App {
    /**
     * Construct a new game application
     *
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    constructor(parameters?: AppOptions);
    name: string;
    /**
     * The rendering system
     * @type {THREE.WebGPURenderer}
     */
    renderer: THREE.WebGPURenderer;
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
    interactive: boolean;
    interactiveProps: {};
}
/**
 * Application options
 *
 * @typedef {Object} AppOptions
 * @property {string} [name=''] - A name for the application
 * @property {boolean} [interactive=false] - Enable interactive mode
 */
export const REVISION: "0.0.1";
//# sourceMappingURL=vdev.webgpu.d.ts.map