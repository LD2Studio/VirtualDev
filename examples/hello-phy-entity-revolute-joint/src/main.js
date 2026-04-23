import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { App, Entity } from 'virtualdev';

await RAPIER.init();

const app = new App(THREE, RAPIER, {
    interactive: true,
    monitor: true,
});

app.camera.position.set(2, 4, 7.3);

// Create floor
const floorModel = new Entity('Floor')
    .setGeometry( new THREE.PlaneGeometry(10, 10).rotateX(-Math.PI / 2) )
    .setMaterial( new THREE.MeshMatcapMaterial({ color: 'green' }) )
    .setCollider( RAPIER.ColliderDesc.cuboid(5, 0.1, 5).setTranslation(0, -0.1, 0) )

const floor_1 = app.sceneTree.create(floorModel);

// Create cube entity
const redCube = new Entity('Red Cube')
    .setGeometry( new THREE.BoxGeometry(1,1,1) )
    .setMaterial( new THREE.MeshMatcapMaterial({ color: 'red' }) )
    .setCollider( RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5) )
    .setRigidBody( RAPIER.RigidBodyDesc.dynamic() )

const yellowCube = new Entity('Yellow Cube')
    .setGeometry( new THREE.BoxGeometry(1,1,1) )
    .setMaterial( new THREE.MeshMatcapMaterial({ color: 'yellow' }) )
    .setCollider( RAPIER.ColliderDesc.cuboid(0.5, 0.5, 0.5) )
    .setRigidBody( RAPIER.RigidBodyDesc.fixed() )

const cube_1 = app.sceneTree.create(yellowCube);
cube_1.position = new THREE.Vector3(0, 3, 0);

const cube_2 = app.sceneTree.create(redCube);
cube_2.setPosition(-2, 3, 0);

const cube_3 = app.sceneTree.create(redCube);
cube_3.setPosition(-2, 3, 2);

app.sceneTree.attach(cube_1, cube_2, {
    jointType: 'revolute',
    jointAxe: new THREE.Vector3(0, 0, 1),
    jointPosition: cube_1.position,
});

const joint_2_3 = app.sceneTree.attach(cube_2, cube_3, {
    jointType: 'revolute',
    jointAxe: new THREE.Vector3(0, 0, 1),
    jointPosition: cube_2.position,
});

// joint_2_3.targetVelocity = 0;