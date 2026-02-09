import { Node, Vec3 } from 'cc';

export interface MoveParams {
    node: Node;
    start: Vec3;
    end?: Vec3;                       
    duration: number;
    arcHeight?: number;
    endScale? : Vec3;
    onComplete?: () => void;
    onUpdate?: (ratio : number) => void;
    endPointGetter?: () => Vec3;     
}

export interface IMoveBehavior {
    initialize(params: MoveParams): void;
    update(dt: number): boolean;
}
