export class EntityManager {
    static "__#private@#instance": any;
    static init(render: any, physics: any, scene: any, world: any): void;
    static getInstance(): any;
    constructor(render: any, physics: any, scene: any, world: any);
    scene: any;
    world: any;
    get entities(): any[];
    create(entity: any): {
        /**
         * - A name for the entity
         */
        name?: string;
        /**
         * - The position of the entity
         */
        position?: THREE.Vector3;
        /**
         * - The rotation of the entity
         */
        rotation?: THREE.Euler;
        /**
         * - The scale of the entity
         */
        scale?: THREE.Vector3;
    };
    remove(entity: any): void;
    update(): void;
}
/**
 * @type {Entity}
 */
export class Entity {
    constructor(name: any);
    name: any;
    uuid: any;
    position: any;
    rotation: any;
    scale: any;
    geometry: any;
    material: any;
    colliderDesc: any;
    rigidBodyDesc: any;
    setGeometry(geometry: any): void;
    setMaterial(material: any): void;
    setCollider(colliderDesc: any): void;
    setRigidBody(rigidBodyDesc: any): void;
}
//# sourceMappingURL=entity.d.ts.map