const entities = [];

let THREE;
let RAPIER;

/**
 * Entity manager
 */
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

    /**
     * Create an instance of an entity in the world
     * @param {*} entity 
     * @param {*} position 
     * @param {*} rotation 
     * @param {*} scale 
     * @returns 
     */
    create( entity, position, rotation, scale ) {
        // console.log('create entity: ', entity);

        if (entity.mesh === null && (entity.geometry === null || entity.geometry instanceof THREE.BufferGeometry === false)) {
            console.error('Geometry is not defined');
            return;
        }
        const mesh = entity.mesh instanceof THREE.Mesh ? entity.mesh.clone() : new THREE.Mesh(entity.geometry, entity.material);

        mesh.position.copy(entity.position);
        mesh.rotation.copy(entity.rotation);
        mesh.scale.copy(entity.scale);

        let rigidBody = null;
        if (entity.colliderDesc) {
            if (entity.rigidBodyDesc === null) {
                entity.rigidBodyDesc = RAPIER.RigidBodyDesc.fixed();
            }
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
            setPosition: (x,y,z) => {
                let position;
                if (x instanceof THREE.Vector3) {
                    position = x;
                }
                else {
                    position = new THREE.Vector3(x,y,z);
                }
                mesh.position.copy(position);
                if (rigidBody) rigidBody.setTranslation(position);
            },
            set position(pos) { // Deprecated
                mesh.position.copy(pos);
                if (this.rigidBody) {
                    this.rigidBody.setTranslation(pos);
                }
            },
            get position() {
                return mesh.position;
            },
            setRotation: (x,y,z) => {
                let rotation;
                if (x instanceof THREE.Euler) {
                    rotation = x;
                }
                else {
                    rotation = new THREE.Euler(x,y,z);
                }
                mesh.rotation.copy(rotation);
                if (rigidBody) {
                    const q = new THREE.Quaternion().setFromEuler(rotation);
                    rigidBody.setRotation(q);
                }
            },
            set rotation(rot) { // Deprecated
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

    attach(entity1, entity2, jointParameters = {}) {
        const {
            jointType = 'fixed',
            jointPosition = null,
        } = jointParameters;

        let jointInstance = null;
        if (jointType === 'fixed') {
            let jointPositionComputed;
            // console.log('Fixed joint', entity1, entity2);
            if (jointPosition === null) {
                jointPositionComputed = new THREE.Vector3(0, 0, 0);
                jointPositionComputed.addVectors(entity1.mesh.position, entity2.mesh.position).multiplyScalar(0.5);
            }
            else {
                jointPositionComputed = jointPosition;
            }
            const anchor1 = entity1.mesh.clone().worldToLocal( jointPositionComputed.clone() );
            const anchor2 = entity2.mesh.clone().worldToLocal( jointPositionComputed.clone() );
            const jointDesc = RAPIER.JointData.fixed(
                anchor1,
                entity1.mesh.clone().quaternion.conjugate(),
                anchor2,
                entity2.mesh.clone().quaternion.conjugate()
            );
            jointInstance = this.world.createImpulseJoint(
                jointDesc,
                entity1.rigidBody,
                entity2.rigidBody,
                true
            );

            // console.log(jointInstance instanceof RAPIER.FixedImpulseJoint);
        }
        else if (jointType === 'revolute') {
            let jointPositionComputed;
            // console.log('Fixed joint', entity1, entity2);
            if (jointPosition === null) {
                jointPositionComputed = new THREE.Vector3(0, 0, 0);
                jointPositionComputed.addVectors(entity1.mesh.position, entity2.mesh.position).multiplyScalar(0.5);
            }
            else {
                jointPositionComputed = jointPosition;
            }
            const anchor1 = entity1.mesh.clone().worldToLocal( jointPositionComputed.clone() );
            const anchor2 = entity2.mesh.clone().worldToLocal( jointPositionComputed.clone() );
            const revoluteAxe = new THREE.Vector3(1,0,0);
            const jointDesc = RAPIER.JointData.revolute(
                anchor1,
                anchor2,
                revoluteAxe
            );
            jointInstance = this.world.createImpulseJoint(
                jointDesc,
                entity1.rigidBody,
                entity2.rigidBody,
                true
            );
        }
        return jointInstance;
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
 * Class to create an entity
 */

export class Entity {
    constructor( name = '' ) {
        this.name = name;
        this.uuid = crypto.randomUUID();
        this.position = new THREE.Vector3(0, 0, 0);
        this.rotation = new THREE.Euler(0, 0, 0);
        this.scale = new THREE.Vector3(1, 1, 1);
        this.mesh = null;
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

    setMesh(mesh) {
        this.mesh = mesh;
        return this;
    }

    setGeometry(geometry, offset = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0)) {
        this.geometry = geometry.clone()
            .applyQuaternion(new THREE.Quaternion().setFromEuler(rotation))
            .translate(offset.x, offset.y, offset.z)
        return this;
    }

    setMaterial(material) {
        this.material = material;
        return this;
    }

    setCollider(colliderDesc, offset = new THREE.Vector3(0, 0, 0), rotation = new THREE.Euler(0, 0, 0)) {
        this.colliderDesc = colliderDesc
            .setTranslation(offset.x, offset.y, offset.z)
            .setRotation(new THREE.Quaternion().setFromEuler(rotation));
        return this;
    }

    setRigidBody(rigidBodyDesc) {
        this.rigidBodyDesc = rigidBodyDesc;
        return this;
    }

    add(entity, position = null, rotation = null) {
        // console.log('Add child entity: ', entity);
        const addedEntity = entity.clone();
        if (position !== null) {
            addedEntity.position = position;
        }
        if (rotation !== null) {
            addedEntity.rotation = rotation;
        }
        this.children.push( addedEntity );

        return addedEntity;
    }

    clone() {
        const entityCloned = new Entity( this.name );
        entityCloned.position = this.position.clone();
        entityCloned.rotation = this.rotation.clone();
        entityCloned.geometry = this.geometry.clone();
        entityCloned.material = this.material.clone();
        switch (this.colliderDesc.shape.type) {
            case RAPIER.ShapeType.Cuboid:
                const halfExtents = this.colliderDesc.shape.halfExtents;
                entityCloned.colliderDesc = RAPIER.ColliderDesc.cuboid(
                    halfExtents.x, halfExtents.y, halfExtents.z
                );
                break;
            case RAPIER.ShapeType.Ball:
                entityCloned.colliderDesc = RAPIER.ColliderDesc.ball(this.colliderDesc.shape.radius);
                break;
            case RAPIER.ShapeType.Cylinder:
                const shape = this.colliderDesc.shape
                entityCloned.colliderDesc = RAPIER.ColliderDesc.cylinder(
                    shape.halfHeight, shape.radius
                );
                break;
            default:
                break;
        }
        return entityCloned;
    }
}
