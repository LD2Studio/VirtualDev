"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const THREE = require("three");
const OrbitControls_js = require("three/addons/controls/OrbitControls.js");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const THREE__namespace = /* @__PURE__ */ _interopNamespaceDefault(THREE);
class RenderSystem extends THREE.WebGLRenderer {
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
    this.scene = new THREE__namespace.Scene();
    this.scene.background = new THREE__namespace.Color(6316128);
    this.camera = new THREE__namespace.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1e3);
    this.camera.position.z = 5;
    this.interactive = interactive;
    this.interactiveProps = {};
    if (this.interactive) {
      this.interactiveProps.orbitalControls = new OrbitControls_js.OrbitControls(this.camera, this.renderer.domElement);
    }
    const renderLoop = () => {
      if (interactive) {
        this.interactiveProps.orbitalControls.update();
      }
      this.renderer.render(this.scene, this.camera);
    };
    this.renderer.setAnimationLoop(renderLoop);
    window.addEventListener("resize", () => {
      this.camera.aspect = this.renderer.domElement.clientWidth / this.renderer.domElement.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.renderer.domElement.clientWidth, this.renderer.domElement.clientHeight, false);
    });
  }
}
exports.App = App;
exports.REVISION = REVISION;
Object.keys(THREE).forEach((k) => {
  if (k !== "default" && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
    enumerable: true,
    get: () => THREE[k]
  });
});
