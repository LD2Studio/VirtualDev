import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';

import { Input } from './core/inputs';
import { Outliner } from './ui/outliner';
import { EntityManager, Entity } from './core/entity';

import { version } from '../package.json';

export { Entity };

/**
 * Application options
 * 
 * @typedef {Object} AppOptions
 * @property {string} [name=''] - A name for the application
 * @property {boolean} [interactive=false] - Enable interactive mode
 * @property {boolean} [vr=false] - Enable VR mode
 * @property {boolean} [ar=false] - Enable AR mode
 * @property {boolean} [monitor=false] - Enable monitor mode
 * @property {boolean} [antialias=false] - Enable antialiasing
 */

/**
 * Class to create a 3D virtual world application
 */
export class App {
    /**
     * Construct a new application
     * 
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    constructor(renderEngine, parameters = {}) {
        // console.log( renderEngine );
        this.MODULE = renderEngine;
        this.webgl = this.MODULE.WebGLRenderer !== undefined;

        const {
            name = 'Untitled',
            interactive = false,
            vr = false,
            ar = false,
            monitor = false,
            antialias = false
        } = parameters;

        this.name = document.title === '' ? name : document.title;
        this.name = `${this.name} ${interactive ? '(Interactive)' : ''}`;
        document.title = this.name;

        /**
         * The rendering system
         * @type {THREE.WebGLRenderer|THREE.WebGPURenderer}
         */
        this.renderer = null;
        if (this.webgl) {
            this.renderer = new this.MODULE.WebGLRenderer({
                antialias
            });
        }
        else {
            this.renderer = new this.MODULE.WebGPURenderer({
                antialias
            });
        }
        console.log(`VirtualDev v${version} - ${this.webgl ? 'WebGL' : 'WebGPU'} renderer`);

        if (this.renderer) {
            this.renderer.setSize(window.innerWidth, window.innerHeight, false);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            this.renderer.domElement.style.width = '100%';
            this.renderer.domElement.style.height = '100%';
            document.body.appendChild( this.renderer.domElement );
            const canvas = this.renderer.domElement;

            if ( canvas.parentNode.localName === 'body') {
                canvas.parentNode.style.margin = 0;
                canvas.parentNode.style.height = '100vh';
            }
        }
 
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
        this.inputs = new Input();

        this.interactive = interactive;
        this.interactiveProps = {};
        if (this.interactive) {
            this.interactiveProps.orbitalControls = new OrbitControls( this.camera, this.renderer.domElement );
            this.interactiveProps.orbitalControls.enableDamping = true;
            this.outliner = new Outliner(
                this.scene, this.camera,
                this.interactiveProps.orbitalControls
             );
        }

        // VR
        if (vr) {
            document.body.appendChild(VRButton.createButton(this.renderer));
            this.renderer.xr.enabled = true;
        }
        // AR
        if (ar) {
            document.body.appendChild(XRButton.createButton(this.renderer));
            this.renderer.xr.enabled = true;
        }
        // Monitor
        this.stats = null;
        if (monitor) {
            const Stats = import('./extras/stats-gl/main.js')
                .then((Stats) => {
                    this.stats = new Stats.default( {
                        trackGPU: true
                    });
                    document.body.appendChild(this.stats.dom);
                    this.stats.init( this.renderer );
                })
        }

        // Entities Manager
        // Instanciate Entity Manager
        EntityManager.init( this.scene );
        this.sceneTree = EntityManager.getInstance();

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
            if (this.stats) {
                this.stats.update();
                if (!this.webgl) {
                    this.renderer.resolveTimestampsAsync( THREE.TimestampQuery.RENDER );
                }
            }
            this.onBeforeRender(time, deltaTime);
            this.renderer.render( this.scene, this.camera );
            this.onAfterRender(time, deltaTime);
        }

        this.renderer.setAnimationLoop( renderLoop );

        this.onRender = (time, deltaTime) => {
            // console.log('onRender');
        };
        this.onBeforeRender = (time, deltaTime) => {
            // console.log('onBeforeRender');
        };
        this.onAfterRender = (time, deltaTime) => {
            // console.log('onAfterRender');
        };

        window.addEventListener( 'resize', () => {
            // Update camera
            this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
            this.camera.updateProjectionMatrix();
            // Update renderer
            this.renderer.setSize( this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);
        });
    }

    static #instance = null;

    /**
     * Initialize the application
     * 
     * @param {THREE} renderEngine - The rendering engine (WebGL/WebGPU)
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    static init(renderEngine, parameters) {
        if (this.#instance === null) {
            this.#instance = new App(renderEngine, parameters);
        }
        return this.#instance;
    }
    static getInstance() {
        if (this.#instance === null) {
            return null;
        }
        return this.#instance;
    }
}
