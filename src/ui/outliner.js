import { Pane } from 'tweakpane';
import { REVISION } from 'three';

class Outliner extends Pane {
    constructor(scene, camera, camControl, renderer) {
        super({
            title: 'Outliner', expanded: false,
        })
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this._cameraProps = this.addFolder({
            title: '📸 Camera', expanded: false,
        });

        {
            const positionFolder = this._cameraProps.addFolder({
                title: 'Position',
            });

            positionFolder.addBinding(this.camera.position, 'x', {
                readonly: true, label: 'X',
            });

            positionFolder.addBinding(this.camera.position, 'y', {
                readonly: true, label: 'Y',
            });

            positionFolder.addBinding(this.camera.position, 'z', {
                readonly: true, label: 'Z',
            });
        }

        {
            const targetFolder = this._cameraProps.addFolder({
                title: 'Target',
            });

            targetFolder.addBinding(camControl.target, 'x', {
                readonly: true, label: 'X',
            });

            targetFolder.addBinding(camControl.target, 'y', {
                readonly: true, label: 'Y',
            });

            targetFolder.addBinding(camControl.target, 'z', {
                readonly: true, label: 'Z',
            });
        }

        this._gpuProps = {
            backend: renderer.isWebGLRenderer ? 'WebGL' :
                renderer.isWebGPURenderer ? renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2' : 'Unknown',
        }
        {
            const gpuFolder = this.addFolder({
                title: `📈 GPU (Three.js r${REVISION})`, expanded: false,
            });

            gpuFolder.addBinding(this._gpuProps, 'backend', {
                readonly: true, label: 'Backend',
            });
        }
    }

    update() {
        this._gpuProps.backend = this.renderer.isWebGLRenderer ? 'WebGL' :
            this.renderer.isWebGPURenderer ? this.renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2' : 'Unknown';
    }
}

export { Outliner };