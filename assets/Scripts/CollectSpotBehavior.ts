import { _decorator, Component, Node } from 'cc';
import { TriggerSpotEvent } from './TriggerSpot';
import { StockpileBehavior } from './StockpileBehavior';
import { BackpackBehavior } from './BackpackBehavior';
const { ccclass, property } = _decorator;

@ccclass('CollectSpotBehavior')
export class CollectSpotBehavior extends Component {
    
    @property(Node)
    public TriggerSpotNode : Node = null;

    @property(StockpileBehavior)
    public Stockpile : StockpileBehavior = null;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property
    public CollectDelay : number = 0.3;


    private m_elapsedTime = 0;

    private m_isCollecting = false;
    
    start() 
    {  
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_ENTER, this.onTargetEnter, this);
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_EXIT, this.onTargetExit, this);

    }

    protected onDestroy(): void {
        this.TriggerSpotNode.off(TriggerSpotEvent.TARGET_ENTER, this.onTargetEnter, this);
        this.TriggerSpotNode.off(TriggerSpotEvent.TARGET_EXIT, this.onTargetExit, this);
    }

    update(deltaTime: number) 
    {
        if(this.m_isCollecting)
        {
            this.m_elapsedTime += deltaTime;

            if(this.m_elapsedTime > this.CollectDelay)
            {
                this.m_elapsedTime = 0;

                if(this.Backpack.CanStack() && !this.Stockpile.isEmpty())
                {
                    const item = this.Stockpile.GetLast();

                    this.Backpack.Collect(item);
                }
            }
        }
    }

    private onTargetEnter()
    {
        this.m_isCollecting = true;
    }

    private onTargetExit()
    {
        this.m_isCollecting = false;
    }
}


