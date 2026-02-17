const entities = [];

export class EntityManager {
    constructor( scene, physics ) {
        this.scene = scene;
        // this.physics = physics

        // Array of physics object
        this._phyObjects = [];
    }

    static #instance = null;

    static init(scene, physics) {
        if (this.#instance === null) {
            this.#instance = new EntityManager(scene, physics);
        }
    }

    static getInstance() {
        if (this.#instance === null) {
            return null;
        }
        return this.#instance;
    }

    add( entity ) {
        entities.push( entity );
        // console.log('add entity: ', entity);
        entity.children.forEach( c => {
            // console.log(c);
            if (c.isObject3D) {
                this.scene.add(c);
            }
            else if (c.rigidBody !== undefined) {
                this._phyObjects.push(c);
            }
        })
    }

    remove( entity ) {

    }

    update() {
        // console.log(this._phyObjects);
        this._phyObjects.forEach( obj => {
            // console.log(obj)
            if (obj.rigidBody !== undefined) {
                // console.log(obj.rigidBody);
                if (obj.rigidBody.isDynamic()) {
                    // console.log('Obj is dynamic');
                    obj.mesh.position.copy(obj.rigidBody.translation());
                    obj.mesh.quaternion.copy(obj.rigidBody.rotation());
                }
            }
        })
    }
}

export class Entity {
    constructor( name ) {
        // console.log(`Create ${name}`);
        this.name = name;
        this.children = [];
    }

    init() {

    }

    add(child) {
        this.children.push(child);
    }

    remove(child) {
        this.children = this.children.filter( c => c !== child);
    }
}

