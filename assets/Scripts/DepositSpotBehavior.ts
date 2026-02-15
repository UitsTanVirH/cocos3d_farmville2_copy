import { _decorator, Component, Enum, Node } from 'cc';
import { TriggerSpotEvent } from './TriggerSpot';
import { StockpileBehavior } from './StockpileBehavior';
import { BackpackBehavior } from './BackpackBehavior';
import { Mover, MoveType } from './Mover';
import { ObjectType } from './BackPackObjectBehavior';
const { ccclass, property } = _decorator;

export enum RequirementSpotEvent
{
    ITEM_SENT = "ItemSent",
}

@ccclass('DepositSpotBehavior')
export class DepositSpotBehavior extends Component {
    
    @property(Node)
    public TriggerSpotNode : Node = null;

    @property({type : Enum(ObjectType)})
    public RequirementType : ObjectType = ObjectType.NONE;

    @property(StockpileBehavior)
    public TargetStockpile? : StockpileBehavior = null;

    @property(Node)
    public TargetNode? : Node = null;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property
    public DepositDelay : number = 0.3;

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
        if(this.RequirementType === ObjectType.NONE) return;

        if(this.m_isCollecting)
        {
            this.m_elapsedTime += deltaTime;

            if(this.m_elapsedTime > this.DepositDelay)
            {
                this.m_elapsedTime = 0;

                if(!this.Backpack.isEmpty() && (this.Backpack.GetTopType() === this.RequirementType))
                {
                    if(this.TargetStockpile && !this.TargetStockpile.isFull())
                    {
                        const item = this.Backpack.DropTop();
                        this.TargetStockpile.Stock(item);

                        return;
                    }
                    
                    if(this.TargetNode)
                    {
                        const item = this.Backpack.DropTop();

                        Mover.move(MoveType.ARC,
                            {
                                node : item,
                                start : item.getWorldPosition(),
                                end : this.TargetNode.getWorldPosition(),
                                duration: 0.5,
                                arcHeight: 2,
                                onComplete : () => this.node.emit(RequirementSpotEvent.ITEM_SENT)
                            }
                        );
                    }
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


