import * as VDEV from 'virtualdev/webgpu';
import * as THREE from 'three/webgpu';

const app = new VDEV.App({
    name: "Hello World WebGPU"
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
);
app.scene.add(cube);
