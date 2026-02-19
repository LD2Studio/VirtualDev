import * as THREE from 'three/webgpu';
import * as VDEV from 'virtualdev';

const app = VDEV.App.init(THREE, {
    interactive: true,
    monitor: true,
});

const cubeMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshMatcapMaterial()
);

const cube = new VDEV.Entity('Cube');
cube.add(cubeMesh);
app.sceneTree.add(cube);
