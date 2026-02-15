import { _decorator, animation, Component, instantiate, Node, Prefab, SpriteFrame, SpriteRenderer, tween, v3 } from 'cc';
import { BackpackBehavior } from './BackpackBehavior';
import { TriggerSpot, TriggerSpotEvent } from './TriggerSpot';
import { ObjectType } from './BackPackObjectBehavior';
import { Mover, MoveType } from './Mover';
const { ccclass, property } = _decorator;

@ccclass('BuyChefSpot')
export class BuyChefSpot extends Component {

    @property(Prefab)
    public ChefPrefab : Prefab = null;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property
    public Value : number = 10;

    @property(Node)
    public TriggerSpotNode : Node = null;

    @property
    public CollectDelay : number = 0.2;

    @property(Node)
    public CookTriggerNode : Node = null;

    @property([SpriteFrame])
    public NumberSprites : SpriteFrame[] = [];

    @property(SpriteRenderer)
    public CounterSpriteRenderer : SpriteRenderer = null;

    private m_hasEntered = false;

    private m_elapsedTime = 0;

    private m_collectCount = 0;

    start() 
    {
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_ENTER, this.onTriggerEnter, this);
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_EXIT, this.onTriggerExit, this);
    }

    update(deltaTime: number) 
    {
        if(!this.m_hasEntered) return;

        this.m_elapsedTime += deltaTime;

        if(this.m_elapsedTime >= this.CollectDelay)
        {
            this.m_elapsedTime = 0;

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
                            const collectLeft = this.Value - this.m_collectCount;

                            this.CounterSpriteRenderer.spriteFrame = this.NumberSprites[collectLeft];
                        }

                        if(this.m_collectCount >= this.Value)
                        {
                            this.m_collectCount = 0;
                            this.spawnFisherman();
                            this.m_hasEntered = false;
                        }
                    }
                }
            );
        }
    }

    private onTriggerEnter()
    {
        this.m_hasEntered = true;
    }

    private onTriggerExit()
    {
        this.m_hasEntered = false;
    }

    private spawnFisherman()
    {
        const chef = instantiate(this.ChefPrefab);

        this.node.scene.addChild(chef);

        chef.setWorldPosition(this.node.getWorldPosition());
        chef.worldPositionY = -0.3;


        const animationController = chef.children[0].getComponent(animation.AnimationController);
        animationController.setValue("Run", true);

        chef.eulerAngles = v3(0, 90, 0);


        tween(chef).to(0.5, {worldPosition : this.CookTriggerNode.getWorldPosition()}).call(()=>
        {
            this.CookTriggerNode.emit("chefbought");
            this.node.emit("chefbought");

            animationController.setValue("Run", false);
            chef.eulerAngles = v3(0, 0, 0);

            this.CookTriggerNode.active = false;                

            this.node.destroy();

        }, this).start();
    }
}


