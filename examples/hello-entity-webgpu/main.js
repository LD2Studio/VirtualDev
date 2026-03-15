import * as THREE from 'three/webgpu';
import { App, Entity } from 'virtualdev';

const app = new App(THREE, null, {
    interactive: true,
});

const cube = new Entity('Cube')
    .setGeometry( new THREE.BoxGeometry() )
    .setMaterial( new THREE.MeshMatcapMaterial({ color: 'red' }) )
    .setPosition(new THREE.Vector3(0, 1, 0))

const cube_1 = app.sceneTree.create(cube);
