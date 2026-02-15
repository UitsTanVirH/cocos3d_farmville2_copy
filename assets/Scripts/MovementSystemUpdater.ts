import { _decorator, Component, Node } from 'cc';
import { MovementSystem } from './MovementSystem';
const { ccclass, property } = _decorator;

@ccclass('MovementSystemUpdater')
export class MovementSystemUpdater extends Component {
    start() {

    }

    update(deltaTime: number) {
        MovementSystem.update(deltaTime);
    }
}


