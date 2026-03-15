export class EntityManager {
    static "__#private@#instance": any;
    static init(render: any, physics: any, scene: any, world: any): void;
    static getInstance(): any;
    constructor(render: any, physics: any, scene: any, world: any);
    scene: any;
    world: any;
    get entities(): any[];
    create(entity: any, position: any, rotation: any, scale: any): {
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
    dispose(entity: any): void;
    update(): void;
}
/**
 * @type {Entity}
 */
export class Entity {
    constructor(name?: string);
    name: any;
    uuid: any;
    position: any;
    rotation: any;
    scale: any;
    geometry: any;
    material: any;
    colliderDesc: any;
    rigidBodyDesc: any;
    children: any;
    setPosition(position: any): this;
    setRotation(rotation: any): this;
    setGeometry(geometry: any): this;
    setMaterial(material: any): this;
    setCollider(colliderDesc: any): this;
    setRigidBody(rigidBodyDesc: any): this;
    add(entity: any, position?: any, rotation?: any): void;
    clone(): Entity;
}
//# sourceMappingURL=entity.d.ts.map