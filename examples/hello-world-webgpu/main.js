import * as THREE from 'three/webgpu';
import { createApp } from 'virtualdev';

const app = createApp( THREE, {
    name: "VirtualDev - Hello WebGPU",
    interactive: true,
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshMatcapMaterial()
);
app.scene.add(cube);
