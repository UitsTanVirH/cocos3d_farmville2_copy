import { _decorator, Component, Node } from 'cc';
import { AudioContent } from './AudioContent';
import { BackpackEvent } from './BackpackBehavior';
import { BackPackObjectBehavior, ObjectType } from './BackPackObjectBehavior';
import { GlobalAudioManager } from './GlobalAudioManager';
const { ccclass, property } = _decorator;

@ccclass('CollectAudioPlayer')
export class CollectAudioPlayer extends Component {

    @property(Node)
    public BackpackNode : Node = null;


    private m_collectAC : AudioContent = null;

    private m_cashCollectAC : AudioContent = null;

    start() 
    {
        const audioContents = this.BackpackNode.getComponents(AudioContent);

        this.m_collectAC = audioContents[0];
        this.m_cashCollectAC = audioContents[1];

        this.BackpackNode.on(BackpackEvent.ITEM_COLLECTED, this.onItemCollect, this);
    }

    update(deltaTime: number) {
        
    }

    private onItemCollect(behavior : BackPackObjectBehavior)
    {
        if(behavior.ObjectType == ObjectType.COIN)
        {
            GlobalAudioManager.instance.playOneShot(this.m_cashCollectAC);
        }
        else
        {
            GlobalAudioManager.instance.playOneShot(this.m_collectAC);
        }
    }
}


