import { _decorator, Component, Node, Sprite } from 'cc';
import { pulseNode } from './Helper';
const { ccclass, property } = _decorator;

@ccclass('SpriteUpdater')
export class SpriteUpdater extends Component {
    private m_sprite: Sprite | null = null;
    start() 
    {
        this.m_sprite = this.getComponent(Sprite);

        //pulseNode(this.node, 100, 2, 1.2);
    }

    update(deltaTime: number) 
    {
    }
}


