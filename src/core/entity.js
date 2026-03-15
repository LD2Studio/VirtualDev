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

    create( entity, position, rotation, scale ) {
        // console.log('create entity: ', entity);

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
            rigidBody = this.world.createRigidBody(entity.rigidBodyDesc);
            const collider = this.world.createCollider(entity.colliderDesc, rigidBody);
            rigidBody.setTranslation(entity.position);
            rigidBody.setRotation(new THREE.Quaternion().setFromEuler(entity.rotation));
        }

        const addChild = (entityChild, meshParent, rigidBody, parentMatrix) => {
            if (entityChild.geometry === null || entityChild.geometry instanceof THREE.BufferGeometry === false) {
                console.error('Geometry is not defined');
                return;
            }
            
            const meshChild = new THREE.Mesh(entityChild.geometry, entityChild.material);
            meshChild.position.copy(entityChild.position);
            meshChild.rotation.copy(entityChild.rotation);
            meshChild.scale.copy(entityChild.scale);
            meshParent.add(meshChild);

            const childMatrix = new THREE.Matrix4().compose(
                entityChild.position,
                new THREE.Quaternion().setFromEuler(entityChild.rotation),
                entityChild.scale
            );
            const matrix = new THREE.Matrix4().multiplyMatrices(parentMatrix, childMatrix);
            // console.log('matrix: ', matrix);

            if (entityChild.colliderDesc) {
                if (rigidBody) {
                    const position = new THREE.Vector3();
                    const rotation = new THREE.Quaternion();
                    const scale = new THREE.Vector3();
                    matrix.decompose(position, rotation, scale);
                    entityChild.colliderDesc.setTranslation(...position);
                    entityChild.colliderDesc.setRotation(rotation);
                    const collider = this.world.createCollider(entityChild.colliderDesc, rigidBody); 
                }
            }
            entityChild.children.forEach( (c) => {
                addChild(c, meshChild, rigidBody, matrix);
            })
        }

        entity.children.forEach( (c) => {
            addChild(c, mesh, rigidBody, new THREE.Matrix4());
        })

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
            },
            set rotation(rot) {
                mesh.rotation.copy(rot);
                if (this.rigidBody) {
                    const q = new THREE.Quaternion().setFromEuler(rot)
                    this.rigidBody.setRotation(q);
                }
            }
        }

        this.scene.add(mesh);

        entities.push(instance);

        return instance;
    }

    dispose( entity ) {

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
    constructor( name = '' ) {
        this.name = name;
        this.uuid = crypto.randomUUID();
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);

        this.geometry = null;
        this.material = new THREE.MeshBasicMaterial();
        this.colliderDesc = null;
        this.rigidBodyDesc = null;

        this.children = [];
    }

    setPosition(position) {
        this.position = position;
        return this;
    }

    setRotation(rotation) {
        this.rotation = rotation;
        return this;
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

    add(entity, position = null, rotation = null) {
        if (position !== null) {
            entity.position = position;
        }
        if (rotation !== null) {
            entity.rotation = rotation;
        }
        this.children.push( entity );
    }

    clone() {
        const entityCloned = new Entity( this.name );
        entityCloned.geometry = this.geometry.clone();
        entityCloned.material = this.material.clone();
        switch (this.colliderDesc.shape.type) {
            case RAPIER.ShapeType.Cuboid:
                const halfExtents = this.colliderDesc.shape.halfExtents
                entityCloned.colliderDesc = RAPIER.ColliderDesc.cuboid(
                    halfExtents.x, halfExtents.y, halfExtents.z
                );
                break;
        }
        return entityCloned;
    }
}

