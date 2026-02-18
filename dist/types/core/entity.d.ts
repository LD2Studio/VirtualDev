export class EntityManager {
    static "__#private@#instance": any;
    static init(scene: any, physics: any): void;
    static getInstance(): any;
    constructor(scene: any, physics: any);
    scene: any;
    _phyObjects: any[];
    add(entity: any): void;
    remove(entity: any): void;
    update(): void;
}
export class Entity {
    constructor(name: any);
    name: any;
    children: any[];
    init(): void;
    add(child: any): void;
    remove(child: any): void;
}
//# sourceMappingURL=entity.d.ts.map