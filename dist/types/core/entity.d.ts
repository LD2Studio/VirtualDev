/**
 * Entity manager
 */
export class EntityManager {
    static "__#private@#instance": any;
    static init(render: any, physics: any, scene: any, world: any): void;
    static getInstance(): any;
    constructor(render: any, physics: any, scene: any, world: any);
    scene: any;
    world: any;
    get entities(): any[];
    /**
     * Create an instance of an entity in the world
     * @param {*} entity
     * @param {*} position
     * @param {*} rotation
     * @returns
     */
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
    dispose(entity: any): void;
    attach(entity1: any, entity2: any, jointParameters?: {}): {
        impulseJoint: any;
        /**
         * Sets the motor velocity for the impulse joint
         * @param {number} velocity - The motor velocity (radians per second)
         * @param {number} [factor=0] - The factor to apply to the motor velocity (0 = infinite force)
         */
        setMotorVelocity(velocity: number, factor?: number): void;
        _targetVelocity: number;
        targetVelocity: number;
        setMotorPosition(targetPos: any, stiffness?: number, damping?: number): void;
    };
    update(): void;
    createModel(model: any, initialPosition?: any): any;
}
/**
 * Class to create an entity
 */
export class Entity {
    constructor(name?: string);
    name: string;
    uuid: `${string}-${string}-${string}-${string}-${string}`;
    position: any;
    rotation: any;
    scale: any;
    mesh: any;
    geometry: any;
    material: any;
    colliderDesc: any;
    rigidBodyDesc: any;
    children: any[];
    setPosition(position: any): this;
    setRotation(rotation: any): this;
    setMesh(mesh: any): this;
    setGeometry(geometry: any, offset?: any, rotation?: any): this;
    setMaterial(material: any): this;
    setCollider(colliderDesc: any, offset?: any, rotation?: any): this;
    setColliders(collidersDesc: any): this;
    collidersDesc: any;
    setRigidBody(rigidBodyDesc: any): this;
    add(entity: any, position?: any, rotation?: any): any;
    clone(): Entity;
}
//# sourceMappingURL=entity.d.ts.map