import * as THREE from 'three';
import * as VDEV from 'virtualdev';

const app = VDEV.App.init(THREE, {
    name: 'VirtualDev - Hello WebGL',
    interactive: true,
    monitor: true,
});

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshMatcapMaterial()
);
app.scene.add(cube);

