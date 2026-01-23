import { Pane } from 'tweakpane';

class Outliner extends Pane {
    constructor(scene, camera) {
        super({
            title: 'Outliner', expanded: false,
        })
        this.scene = scene;
        this.camera = camera;

        this._cameraProps = this.addFolder({
            title: '📸 Camera',
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
    }
}

export { Outliner };