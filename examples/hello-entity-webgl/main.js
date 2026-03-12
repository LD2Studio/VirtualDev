import * as THREE from 'three';
import * as VDEV from 'virtualdev';

const app = new VDEV.App(THREE, null, {
    interactive: true,
});


// Create cube entity
const cube = new VDEV.Entity('Cube');
cube.setGeometry( new THREE.BoxGeometry() );
cube.setMaterial( new THREE.MeshMatcapMaterial({ color: 'red' }) );
cube.position = new THREE.Vector3(0, 2, 0);

app.sceneTree.create(cube);