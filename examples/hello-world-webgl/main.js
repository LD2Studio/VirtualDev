import * as VDEV from 'virtualdev'
import * as THREE from 'three'

// console.log(THREE.REVISION);
// console.log(VDEV.REVISION);

const app = new VDEV.App({
    name: 'Hello World WebGL'
});
// console.log(app.renderer);

const cube = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
);
app.scene.add(cube);





