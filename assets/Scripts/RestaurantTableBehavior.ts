import { _decorator, Component, Node } from 'cc';
import { TriggerSpotEvent } from './TriggerSpot';
import { BackpackBehavior } from './BackpackBehavior';
import { CustomerBehavior } from './CustomerBehavior';
import { ObjectType } from './BackPackObjectBehavior';
import { CollectSpotBehavior } from './CollectSpotBehavior';
import { StockpileBehavior } from './StockpileBehavior';
const { ccclass, property } = _decorator;

export enum RestaurantTableEvent
{
    TABLE_EMPTY = "TableEmpty",
    TABLE_FULL = "TableFull"
}

export class Chair
{
    public node : Node = null;
    public isEmpty = true;
    public customerNode : Node = null;

    constructor(node : Node , isEmpty : boolean)
    {
        this.node = node;
        this.isEmpty = isEmpty;
    }
}

@ccclass('RestaurantTableBehavior')
export class RestaurantTableBehavior extends Component 
{
    
    @property(Node)
    public ServeTriggerNode : Node = null;

    @property([Node])
    public Chairs : Node[] = [];

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property
    public ServingDelay : number = 0.2;

    private m_chairs : Chair[] = [];

    private m_emptyChairCount : number = 0;

    private m_isServing = false;
    
    private m_elapsedTime = 0;

    private m_cashStockpileNode : Node = null;

    start() 
    {
        this.Chairs.forEach((value)=>
        {
            this.m_chairs.push(new Chair(value, true));
        }, this);

        this.m_emptyChairCount = this.m_chairs.length;

        this.node.emit(RestaurantTableEvent.TABLE_EMPTY, this.node);

        this.m_cashStockpileNode = this.node.getChildByName("CashStockpile");

        this.m_cashStockpileNode.getComponent(CollectSpotBehavior).Backpack = this.Backpack;

        this.ServeTriggerNode.on(TriggerSpotEvent.TARGET_ENTER, this.serveEnter, this);
        this.ServeTriggerNode.on(TriggerSpotEvent.TARGET_EXIT, this.serveExit, this);
    }

    update(deltaTime: number) 
    {
        if(this.m_isServing)
        {
            for(let i = 0; i < this.m_chairs.length; i++)
            {
                const chair = this.m_chairs[i];

                if(chair.isEmpty || !chair.customerNode) continue;

                const customerBehavior = chair.customerNode?.getComponent(CustomerBehavior);

                if(customerBehavior)
                {
                    const items : Node[] = [];

                    const customerDemand = customerBehavior.GetOrderCount();

                    for(let i = 0; i < customerDemand; i++)
                    {
                        const topType = this.Backpack.GetTopType();

                        if(topType && topType === ObjectType.GRILLED_FISH)
                        {
                            items.push(this.Backpack.DropTop());
                        }

                    }

                    customerBehavior.serve(items);
                }
            }

            // this.m_elapsedTime += deltaTime;

            // if(this.m_elapsedTime >= this.ServingDelay)
            // {
            //     this.m_elapsedTime = 0;

            //     for(let i = 0; i < this.m_chairs.length; i++)
            //     {
            //         const chair = this.m_chairs[i];

            //         if(chair.isEmpty || !chair.customerNode) continue;

            //         const customerBehavior = chair.customerNode?.getComponent(CustomerBehavior);

            //         if(customerBehavior)
            //         {
            //             const topType = this.Backpack.GetTopType();

            //             if(topType === ObjectType.GRILLED_FISH)
            //             {
            //                 const top = this.Backpack.DropTop();

            //                 if(top)
            //                 {
            //                     customerBehavior.serve(top);
            //                 }
            //             }
            //         }
            //     }
            // }
        }    
    }

    public GetEmptyChair() : Chair
    {
        const chair = this.m_chairs.find((value) => 
        {
            return value.isEmpty === true;
        }, this);

        return chair;
    }

    public GetFullChair() : Chair
    {
        const chair = this.m_chairs.find((value) => 
        {
            return value.isEmpty === false;
        }, this);

        return chair;
    }

    public MakeChairNodeEmpty(node : Node)
    {
        const chair = this.m_chairs.find((value) => 
        {
            return value.node === node;
        }, this);

        if(chair && !chair.isEmpty)
        {
            chair.isEmpty = true;
            chair.customerNode = null;

            this.m_emptyChairCount++;

            if(this.m_emptyChairCount >= this.m_chairs.length)
            {
                this.m_emptyChairCount = 0;

                this.node.emit(RestaurantTableEvent.TABLE_EMPTY, this.node);
                console.log("TableEmpty");
            }
        }
    }

    public ReserveChairNode(chairNode : Node, customerNode : Node)
    {
        const chair = this.m_chairs.find((value) => 
        {
            return value.node === chairNode;
        }, this);

        if(chair && chair.isEmpty)
        {
            chair.isEmpty = false;
            chair.customerNode = customerNode;

            this.m_emptyChairCount--;

            if(this.m_emptyChairCount <= 0)
            {
                this.m_emptyChairCount = 0

                this.node.emit(RestaurantTableEvent.TABLE_FULL, this.node);
            }
        }
    }

    public GetChairCount() 
    {
        return this.m_chairs.length;
    }

    public GetCashStockpile() : StockpileBehavior
    {
        return this.m_cashStockpileNode.getComponent(StockpileBehavior);
    }

    private serveEnter()
    {
        this.m_isServing = true;
    }

    private serveExit()
    {
        this.m_isServing = false;
    }
}


