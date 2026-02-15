import { Vec3 } from 'cc';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';

export interface IStackingStrategy {
    getLocalPosition(backpackObject: BackPackObjectBehavior,index: number): Vec3;

    isOverflow(index: number): boolean;

    reset?(): void;
}
