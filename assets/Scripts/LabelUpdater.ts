import { _decorator, Component, Label, Node, Sprite } from 'cc';
import { pulseNode } from './Helper';
const { ccclass, property } = _decorator;

@ccclass('LabelUpdater')
export class LabelUpdater extends Component {
    private m_label: Label | null = null;
    start() 
    {
        this.m_label = this.getComponent(Label);

        pulseNode(this.node, 1, 0.2, 1.2);
    }

    update(deltaTime: number) {
        
    }
}


