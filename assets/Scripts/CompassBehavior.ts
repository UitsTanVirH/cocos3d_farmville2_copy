import { _decorator, Component, Node } from 'cc';
import { RestaurantManager } from './RestaurantManager';
import { BackpackBehavior } from './BackpackBehavior';
import { CompassArrow } from './CompassArrow';
import { ObjectType } from "./BackpackObjectBehavior";
import { StockpileBehavior } from './StockpileBehavior';
const { ccclass, property } = _decorator;

@ccclass('CompassBehavior')
export class CompassBehavior extends Component {
    
    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property(CompassArrow)
    public Compass : CompassArrow = null;

    @property(Node)
    public CaptureFishTriggerNode : Node = null;

    @property(Node)
    public CollectCapturedRawFishTriggerNode : Node = null;

    @property(Node)
    public KitchenRawFishDropTriggerNode : Node = null;

    @property(Node)
    public CookTriggerNode : Node = null;

    @property(Node)
    public CollectCookedFishTriggerNode : Node = null;

    @property(RestaurantManager)
    public RestaurantManager : RestaurantManager = null;

    @property(Node)
    public BuyFishermanTriggerNode : Node = null;

    @property(Node)
    public BuyChefTriggerNode : Node = null;

    @property(StockpileBehavior)
    public CapturedRawFishStockpile : StockpileBehavior = null;

    @property(StockpileBehavior)
    public KitchenRawFishStockpile : StockpileBehavior = null;

    @property(StockpileBehavior)
    public KitchenCookedFishStockpile : StockpileBehavior = null;
    
    start() 
    {
        this.Compass.target = this.CaptureFishTriggerNode;
    }

    update(deltaTime: number) 
    {
       const topType = this.Backpack.GetTopType();    

       if(topType)
       {
            switch(topType)
            {
                case ObjectType.FISH:
                {
                    this.Compass.target = this.KitchenRawFishDropTriggerNode;
                    break;
                }

                case ObjectType.GRILLED_FISH:
                {
                    const emptyTable = this.RestaurantManager.GetFullTableNode();

                    if(emptyTable)
                    {
                        const serveTrigger = emptyTable.getChildByName("ServeTrigger");
                        this.Compass.target = serveTrigger;
                    }
                    else
                    {
                        this.Compass.target = null;
                    }

                    break;
                }

                case ObjectType.COIN:
                {
                    if(this.BuyFishermanTriggerNode && this.BuyFishermanTriggerNode.isValid)
                    {
                        this.Compass.target = this.BuyFishermanTriggerNode;
                    }
                    else if(this.BuyChefTriggerNode && this.BuyChefTriggerNode.isValid)
                    {
                        this.Compass.target = this.BuyChefTriggerNode;
                    }
                    else
                    {
                        this.Compass.target = null;
                    }
                }

            }
       }
       else
       {
            if(!this.CapturedRawFishStockpile.isEmpty())
            {
                this.Compass.target = this.CollectCapturedRawFishTriggerNode;
            }
            else if(!this.KitchenRawFishStockpile.isEmpty())
            {
                this.Compass.target = this.CookTriggerNode;
            }
            else if(!this.KitchenCookedFishStockpile.isEmpty())
            {
                this.Compass.target = this.CollectCookedFishTriggerNode;
            }
            else
            {
                if(this.CaptureFishTriggerNode)
                    this.Compass.target = this.CaptureFishTriggerNode;
                else
                    this.Compass.target = null;
            }
       }


       if(this.Compass.target)
       {
            this.Compass.SetVisible(true);
       }
       else
       {
            this.Compass.SetVisible(false);
       }
    }
}


