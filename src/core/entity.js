const entities = [];

let THREE;
let RAPIER;

export class EntityManager {
    constructor( render, physics, scene, world ) {
        this.scene = scene;
        this.world = world;
        THREE = render;
        RAPIER = physics;
    }

    static #instance = null;

    static init(render, physics, scene, world) {
        if (this.#instance === null) {
            this.#instance = new EntityManager(render, physics, scene, world);
        }
    }

    static getInstance() {
        if (this.#instance === null) {
            return null;
        }
        return this.#instance;
    }

    get entities() {
        return entities;
    }

    create( entity ) {
        // console.log('create entity: ', entity);
        // console.log(entity.geometry instanceof THREE.BufferGeometry);

        if (entity.geometry === null || entity.geometry instanceof THREE.BufferGeometry === false) {
            console.error('Geometry is not defined');
            return;
        }
        const mesh = new THREE.Mesh(entity.geometry, entity.material);

        mesh.position.copy(entity.position);
        mesh.rotation.copy(entity.rotation);
        mesh.scale.copy(entity.scale);

        let rigidBody = null;
        if (entity.rigidBodyDesc && entity.colliderDesc) {
            // console.log('create rigid body');
            rigidBody = this.world.createRigidBody(entity.rigidBodyDesc);
            const collider = this.world.createCollider(entity.colliderDesc, rigidBody);
            rigidBody.setTranslation(entity.position);
        }

        /**
         * @typedef {Object} EntityInstance
         * @property {string} [name=''] - A name for the entity
         * @property {THREE.Vector3} [position=new THREE.Vector3(0, 0, 0)] - The position of the entity
         * @property {THREE.Euler} [rotation=new THREE.Euler(0, 0, 0)] - The rotation of the entity
         * @property {THREE.Vector3} [scale=new THREE.Vector3(1, 1, 1)] - The scale of the entity
         * 
         */

        /**
         * @type {EntityInstance}
         */
        const instance = {
            name: entity.name,
            position: entity.position,
            rotation: entity.rotation,
            scale: entity.scale,
            uuid: crypto.randomUUID(),
            mesh: mesh,
            rigidBody: rigidBody,
            set position(pos) {
                mesh.position.copy(pos);
                if (this.rigidBody) {
                    this.rigidBody.setTranslation(pos);
                }
            }
        }

        this.scene.add(mesh);

        entities.push(instance);

        return instance;
    }

    remove( entity ) {

    }

    update() {
        entities.forEach( obj => {
            if (obj.rigidBody) {
                // console.log(obj.rigidBody);
                if (obj.rigidBody.isDynamic()) {
                    // console.log('Obj is dynamic');
                    obj.mesh.position.copy(obj.rigidBody.translation());
                    obj.mesh.quaternion.copy(obj.rigidBody.rotation());
                }
            }
        });
    }
}

/**
 * @type {Entity}
 */

export class Entity {
    constructor( name ) {
        // console.log(`Create ${name}`);
        this.name = name;
        this.uuid = crypto.randomUUID();
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);

        this.geometry = null;
        this.material = new THREE.MeshBasicMaterial();
        this.colliderDesc = null;
        this.rigidBodyDesc = null;
    }

    setGeometry(geometry) {
        this.geometry = geometry;
        return this;
    }

    setMaterial(material) {
        this.material = material;
        return this;
    }

    setCollider(colliderDesc) {
        this.colliderDesc = colliderDesc;
        return this;
    }

    setRigidBody(rigidBodyDesc) {
        this.rigidBodyDesc = rigidBodyDesc;
        return this;
    }
}

