import { _decorator, Component, Vec3, Node} from 'cc';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';

const { ccclass } = _decorator;

@ccclass('StackingStrategy')
export abstract class StackingStrategy extends Component {

    abstract getLocalPosition(behavior: BackPackObjectBehavior, index: number, existing: Node[]): Vec3;

    getLocalRotation?(behavior: BackPackObjectBehavior, index: number, localPos: Vec3 ): Vec3;

    isOverflow?(index: number): boolean;
}

