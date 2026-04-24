import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { XRButton } from 'three/addons/webxr/XRButton.js';

import RAPIER from '@dimforge/rapier3d-compat';

import { Input } from './core/inputs.js';
import { Outliner } from './ui/outliner.js';
import { EntityManager, Entity } from './core/entity.js';

import { version } from './version.js';

export { Entity, THREE, RAPIER };

/**
 * Application options
 * 
 * @typedef {Object} AppOptions
 * @property {string} [name=''] - A name for the application
 * @property {boolean} [interactive=false] - Enable interactive mode
 * @property {boolean} [vr=false] - Enable VR mode
 * @property {boolean} [ar=false] - Enable AR mode
 * @property {boolean} [monitor=false] - Enable monitor mode
 * @property {THREE.WebGLRenderer.Options} [renderOptions] - Rendering options
 */

let instance = null;    // Singleton instance
let RENDER_ENGINE = null;   // Render Engine used
let PHYSICS_ENGINE = null;  // Physics Engine used

const physics = {
    timeAcc: 0,
    isRunning: true,
    oneShot: false,
}

/**
 * Class to create a 3D virtual world application
 */
export class App {
    /**
     * Construct a new application
     * 
     * @param {THREE.WebGLRenderer|THREE.WebGPURenderer} renderEngine - The rendering engine (WebGL/WebGPU)
     * @param {Object} physicsEngine - The physics engine (Rapier)
     * @param {AppOptions} [parameters] - The configuration parameter
     */
    constructor(renderEngine, physicsEngine = null, parameters = {}) {
        if (instance) {
            return instance;
        }
        instance = this;

        RENDER_ENGINE = renderEngine;
        PHYSICS_ENGINE = physicsEngine;

        const {
            name = 'Untitled',
            interactive = false,
            vr = false,
            ar = false,
            monitor = false,
            renderOptions = {}
        } = parameters;

        this.name = document.title === '' ? name : document.title;
        this.name = `${this.name} ${interactive ? '(Interactive)' : ''}`;
        document.title = this.name;

        /**
         * The rendering system
         * @type {THREE.WebGLRenderer|THREE.WebGPURenderer}
         */
        this.renderer = null;
        if (RENDER_ENGINE.WebGLRenderer !== undefined) {
            this.renderer = new RENDER_ENGINE.WebGLRenderer(renderOptions);
        }
        else {
            this.renderer = new RENDER_ENGINE.WebGPURenderer(renderOptions);
        }
        console.log(`VirtualDev v${version} - ${RENDER_ENGINE.WebGLRenderer !== undefined ? 'WebGL' : 'WebGPU'} renderer`);

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

        /**
         * The camera
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
        this.camera.position.z = 5;

        if (physicsEngine !== null) {
            this.world = new PHYSICS_ENGINE.World({
                x: 0, y: -9.81, z: 0
            });

            console.log(`Physics Engine RAPIER v${PHYSICS_ENGINE.version()}`);

            // const ip = this.world.integrationParameters;
            // console.log(ip);
            // ip.contact_natural_frequency = 80;
            // ip.lengthUnit = 0.1;
            // ip.numInternalPgsIterations = 1;
            // ip.numSolverIterations = 10;

            // Colliders Helper
            this.colliderHelper = new THREE.LineSegments(
                new THREE.BufferGeometry(),
                new THREE.LineBasicMaterial({ color: 0xffffff, vertexColors: true, })
            );
            // colliderHelper.frustumCulled = false;
            this.scene.add(this.colliderHelper);

            this.updateCollidersHelper = () => {
                const { vertices, colors } = this.world.debugRender();
                this.colliderHelper.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
                this.colliderHelper.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
            }
        }
        else {
            this.world = null;
        }

        /**
         * The input manager
         * @example
         * app.inputs.map = [
         *     { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
         *     { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
         *     { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
         *     { name: 'right', keys: ['ArrowRight', 'KeyD'] },
         *     { name: 'run', keys: ['ShiftLeft', 'ShiftRight']}
         * ]
         *
         * app.onRender = (time, deltaTime) => {
         *      if (app.inputs.isPressed('forward')) {
         *          // do something
         *      }
         * }
         */
        this.inputs = new Input();

        if (interactive) {
            this.orbitalControls = new OrbitControls( this.camera, this.renderer.domElement );
            this.orbitalControls.enableDamping = true;
            this.outliner = new Outliner(
                this.scene, this.camera,
                this.orbitalControls,
                this.renderer
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

        // Instanciate Entity Manager
        EntityManager.init( RENDER_ENGINE, PHYSICS_ENGINE, this.scene, this.world );
        this.sceneTree = EntityManager.getInstance();

        this._clock = new THREE.Clock();
        this._lastTime = this._clock.getElapsedTime();
        this._firstRender = true;

        const renderLoop = () => {
            const time = this._clock.getElapsedTime();
            const deltaTime = time - this._lastTime;
            this._lastTime = time;

            if (this._firstRender) {
                // Add GPU binding on first render
                if (this.outliner) this.outliner.addGPUBinding();
                this._firstRender = false;
            }

            this.onRender(time, deltaTime);

            if (this.world) {
                // console.log(deltaTime);
                physics.timeAcc += deltaTime;
                const TIMESTEP = this.world.timestep;
                const MAX_STEPS = 5;

                let step_count = 0;
                while (physics.timeAcc >= TIMESTEP) {
                    if (physics.isRunning) {
                        this.world.step();
                        // console.log('phy step')
                        if (physics.oneShot) {
                            physics.oneShot = false;
                            physics.isRunning = false;
                        }
                    }
                    physics.timeAcc -= TIMESTEP;

                    step_count++;
                    if (step_count >= MAX_STEPS) {
                        physics.timeAcc = 0;
                        break;
                    }
                }
                this.sceneTree.update();
                if (interactive) {
                    this.updateCollidersHelper();
                }
            }

            if (interactive) {
                this.orbitalControls.update();
            }
            if (this.stats) {
                this.stats.update();
                if (RENDER_ENGINE.WebGLRenderer === undefined) {
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
}
