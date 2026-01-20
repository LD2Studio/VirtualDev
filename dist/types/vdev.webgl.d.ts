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
 * Application options
 *
 * @typedef {Object} AppOptions
 * @property {string} [name=''] - A name for the application
 * @property {boolean} [interactive=false] - Enable interactive mode
 */
/**
 * Create a new game application
 *
 * The rendering is done using WebGL
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
     * @type {THREE.WebGLRenderer}
     */
    renderer: THREE.WebGLRenderer;
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
    _clock: any;
    _lastTime: any;
    onRender: (time: any, deltaTime: any) => void;
}
export const REVISION: "0.0.1";
//# sourceMappingURL=vdev.webgl.d.ts.map