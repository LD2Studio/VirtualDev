import * as THREE from 'three';
import * as VDEV from 'virtualdev';

const app = new VDEV.App(THREE, null, {
    name: 'VirtualDev - Hello WebGL',
    interactive: true,
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshMatcapMaterial()
);
app.scene.add(cube);
