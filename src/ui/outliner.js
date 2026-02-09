import { Pane } from 'tweakpane';

class Outliner extends Pane {
    constructor(scene, camera, camControl) {
        super({
            title: 'Outliner', expanded: false,
        })
        this.scene = scene;
        this.camera = camera;

        this._cameraProps = this.addFolder({
            title: '📸 Camera', expanded: false,
        });

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
}

export { Outliner };