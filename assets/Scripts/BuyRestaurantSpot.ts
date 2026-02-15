import { _decorator, Component, instantiate, math, Node, Prefab, SpriteFrame, SpriteRenderer, tween, v3 } from 'cc';
import { TriggerSpot, TriggerSpotEvent } from './TriggerSpot';
import { BackpackBehavior } from './BackpackBehavior';
import { ObjectType } from './BackPackObjectBehavior';
import { Mover, MoveType } from './Mover';
import { RestaurantTableBehavior } from './RestaurantTableBehavior';
import { CollectSpotBehavior } from './CollectSpotBehavior';
const { ccclass, property } = _decorator;

export enum BuyRestaurantSpotEvent
{
    TABLE_BOUGHT = "TableBought"
}

@ccclass('BuyRestaurantSpot')
export class BuyRestaurantSpot extends Component {
    
    @property(Node)
    public RestaurantTableParent : Node = null;

    @property(Prefab)
    public RestaurantTablePrefab : Prefab = null;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property
    public Value = 10;

    @property(Node)
    public TriggerSpotNode : Node = null;

    @property([SpriteFrame])
    public NumberSprites : SpriteFrame[] = [];

    @property(SpriteRenderer)
    public CounterSpriteRenderer : SpriteRenderer = null;

    @property(SpriteRenderer)
    public SecondaryCounterSpriteRenderer : SpriteRenderer = null;

    private m_hasEntered = false;

    private m_collectCount = 0;
    
    start() 
    {
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_ENTER, this.onTriggerEnter, this);
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_EXIT, this.onTriggerExit, this);    }

    update(deltaTime: number) 
    {
        if(!this.m_hasEntered) return;

            if(this.Backpack.GetCoinCount() == 0) return;

            const top = this.Backpack.GetCoin();

            Mover.move(MoveType.ARC, 
                {
                    node : top,
                    start : top.getWorldPosition(),
                    end : this.node.getWorldPosition(),
                    duration : 0.2,
                    arcHeight : 5,
                    onComplete : () =>
                    {
                        top.destroy();
                        this.m_collectCount++;

                        if(this.CounterSpriteRenderer)
                        {
                            if(this.SecondaryCounterSpriteRenderer && this.SecondaryCounterSpriteRenderer.isValid)
                            {
                                this.SecondaryCounterSpriteRenderer.node.destroy();
                            }

                            const collectLeft = this.Value - this.m_collectCount;

                            this.CounterSpriteRenderer.spriteFrame = this.NumberSprites[collectLeft];
                        }

                        if(this.m_collectCount >= this.Value)
                        {
                            this.m_collectCount = 0;
                            this.spawnTable();
                            this.m_hasEntered = false;
                        }
                    }
                }
            );
    }

    private onTriggerEnter()
    {
        this.m_hasEntered = true;
    }

    private onTriggerExit()
    {
        this.m_hasEntered = false;
    }

    private spawnTable()
    {
         const table = instantiate(this.RestaurantTablePrefab);
        
        this.RestaurantTableParent.addChild(table);

        table.setWorldPosition(this.node.getWorldPosition());
        table.worldPositionY = 0.42;

        table.setScale(0, 0, 0);

        const cashStockpile = table.getChildByName("CashStockpile");
        const collectSpotBhv = cashStockpile.getComponent(CollectSpotBehavior);
        collectSpotBhv.Backpack = this.Backpack;

        const tableBehavior = table.getComponent(RestaurantTableBehavior);
        tableBehavior.Backpack = this.Backpack;

        this.RestaurantTableParent.emit(BuyRestaurantSpotEvent.TABLE_BOUGHT);

        tween(table).to(0.4, {scale : v3(1, 1, 1)}, {easing : 'elasticOut'}).call(()=>
        {
            this.scheduleOnce(()=>
            {
                this.node.destroy();
            }, 0.2);
        }).start();
    }
}


