import * as VDEV from 'virtualdev'

const app = new VDEV.App({
    name: 'Hello World WebGL'
});

const cube = new VDEV.Mesh(
    new VDEV.BoxGeometry(1, 1, 1),
    new VDEV.MeshBasicMaterial()
);
app.scene.add(cube);

