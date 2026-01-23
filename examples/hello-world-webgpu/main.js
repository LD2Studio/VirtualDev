import * as VDEV from 'virtualdev/webgpu';

const app = new VDEV.App({
    name: "Hello World WebGPU",
    interactive: true,
});

const cube = new VDEV.Mesh(
    new VDEV.BoxGeometry(1, 1, 1),
    new VDEV.MeshBasicMaterial()
);
app.scene.add(cube);
