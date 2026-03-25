import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { App, Entity } from 'virtualdev';

await RAPIER.init();

const app = new App(THREE, RAPIER, {
    interactive: true,
    monitor: true,
});

app.camera.position.set(0, 2, 4.5);

// Create cube entity
const cube = new Entity('Cube')
    .setGeometry( new THREE.BoxGeometry(1,1,1) )
    .setMaterial( new THREE.MeshMatcapMaterial({ color: 'red' }) )
    .setCollider( RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5) )
    .setRigidBody( RAPIER.RigidBodyDesc.dynamic() )

const cube_1 = app.sceneTree.create(cube);
cube_1.position = new THREE.Vector3(1, 2, 0);

const cube_2 = app.sceneTree.create(cube);
cube_2.setPosition(-1, 2.5, 0);
cube_2.setRotation(0, 0, Math.PI / 6);

const floorModel = new Entity('Floor')
    .setGeometry( new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2) )
    .setMaterial( new THREE.MeshMatcapMaterial({ color: 'green' }) )
    .setCollider( RAPIER.ColliderDesc.cuboid(5, 0.1, 5).setTranslation(0, -0.1, 0) )

const floor_1 = app.sceneTree.create(floorModel);