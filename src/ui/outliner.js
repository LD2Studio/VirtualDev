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
        // Camera position
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
        // Camera target
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
        // GPU monitoring
        {
            this._gpuFolder = this.addFolder({
                title: `📈 GPU (Three.js r${REVISION})`, expanded: false,
            });
        }
    }

    addGPUBinding() {
        const backend = this.renderer.isWebGLRenderer ? 'WebGL' :
            this.renderer.isWebGPURenderer ? this.renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2' : 'Unknown';
        this._gpuFolder.addBlade({
            view: 'text',
            label: 'Backend',
            parse: value => value,
            value: backend,
            disabled: true,
        });

        if (this.renderer.isWebGLRenderer) {
            const renderFolder = this._gpuFolder.addFolder({ title: '🖼️ Render' });
            renderFolder.addBinding( this.renderer.info.render, 'frame', { label: 'Frame ID', readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'calls', { label: 'DrawCalls', readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'triangles', { readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'points', { readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'lines', { readonly: true} );
            const memoryFolder = this._gpuFolder.addFolder({ title: '🖥️ Memory' });
            memoryFolder.addBinding( this.renderer.info.memory, 'geometries', { readonly: true} );
            memoryFolder.addBinding( this.renderer.info.memory, 'textures', { readonly: true} );
            const programsFolder = this._gpuFolder.addFolder({ title: '⚡ Shaders' });
            programsFolder.addBinding( this.renderer.info.programs, 'length', { readonly: true, label: 'Count'} );
        }
        else if (this.renderer.isWebGPURenderer) {
            const renderFolder = this._gpuFolder.addFolder({ title: '🖼️ Render' });
            renderFolder.addBinding( this.renderer.info, 'frame', { label: 'Frame ID', readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'drawCalls', { label: 'DrawCalls', readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'frameCalls', { label: 'FrameCalls', readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'triangles', { readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'points', { readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'lines', { readonly: true} );
            renderFolder.addBinding( this.renderer.info.render, 'timestamp', { readonly: true} );
            const memoryFolder = this._gpuFolder.addFolder({ title: '🖥️ Memory' });
            memoryFolder.addBinding( this.renderer.info.memory, 'geometries', { label: 'Geometries', readonly: true} );
            memoryFolder.addBinding( this.renderer.info.memory, 'textures', { label: 'Textures', readonly: true} );
        }
    }
}

export { Outliner };