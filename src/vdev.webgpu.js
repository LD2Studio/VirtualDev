import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/addons/controls/OrbitControls';

export * from 'three/webgpu';
import { RenderSystem } from './renderers/rendersystem.webgpu';

// TODO
//

/**
 * Application options
 * 
 * @typedef {Object} AppOptions
 * @property {string} [name=''] - A name for the application
 * @property {boolean} [interactive=false] - Enable interactive mode
 */

const REVISION = '0.0.1';

/**
 * Create a new game application
 *
 * The rendering is done using WebGPU
 * @type {Object}
 */
class App {
    /**
     * Construct a new game application
     * 
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    constructor( parameters = {} ) {
        const {
            name = 'Untitled - VirtualDev',
             interactive = false,
        } = parameters;

        this.name = name;
        document.title = this.name;

        /**
         * The rendering system
         * @type {THREE.WebGPURenderer}
         */
        this.renderer = new RenderSystem();

        /**
         * The scene
         * @type {THREE.Scene}
         */
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x606060 );

        /**
         * The camera
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        this.interactive = interactive;
        this.interactiveProps = {};
        if (this.interactive) {
            this.interactiveProps.orbitalControls = new OrbitControls( this.camera, this.renderer.domElement );
        }

        this._clock = new THREE.Clock();
        this._lastTime = this._clock.getElapsedTime();

        const renderLoop = () => {
            const time = this._clock.getElapsedTime();
            const deltaTime = time - this._lastTime;
            this._lastTime = time;

            this.onRender(time, deltaTime);

            if (interactive) {
                this.interactiveProps.orbitalControls.update();
            }
            this.renderer.render( this.scene, this.camera );
        }

        this.renderer.setAnimationLoop( renderLoop );

        this.onRender = (time, deltaTime) => {
            // console.log('onRender');
        };

        window.addEventListener( 'resize', () => {
            // Update camera
            this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
            this.camera.updateProjectionMatrix();
            // Update renderer
            this.renderer.setSize( this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);
        });
    }
}

export { App, REVISION };