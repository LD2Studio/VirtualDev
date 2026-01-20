import * as THREE from "three";
import { WebGLRenderer } from "three";
export * from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
class RenderSystem extends WebGLRenderer {
  constructor() {
    super();
    this.setSize(window.innerWidth, window.innerHeight, false);
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.domElement.style.width = "100%";
    this.domElement.style.height = "100%";
    document.body.appendChild(this.domElement);
    const canvas = this.domElement;
    if (canvas.parentNode.localName === "body") {
      canvas.parentNode.style.margin = 0;
      canvas.parentNode.style.height = "100vh";
    }
  }
}
const REVISION = "0.0.1";
class App {
  /**
   * Construct a new game application
   * 
   * @param {AppOptions} [parameters] - The configuration parameter
   */
  constructor(parameters = {}) {
    const {
      name = "Untitled - VirtualDev",
      interactive = false
    } = parameters;
    this.name = name;
    document.title = this.name;
    this.renderer = new RenderSystem();
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(6316128);
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
    this.camera.position.z = 5;
    this.interactive = interactive;
    this.interactiveProps = {};
    if (this.interactive) {
      this.interactiveProps.orbitalControls = new OrbitControls(this.camera, this.renderer.domElement);
      this.interactiveProps.orbitalControls.enableDamping = true;
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
      this.renderer.render(this.scene, this.camera);
    };
    this.renderer.setAnimationLoop(renderLoop);
    this.onRender = (time, deltaTime) => {
    };
    window.addEventListener("resize", () => {
      this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);
    });
  }
}
export {
  App,
  REVISION
};
