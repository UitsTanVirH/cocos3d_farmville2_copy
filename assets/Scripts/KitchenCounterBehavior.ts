import { _decorator, animation, Component, instantiate, Node, ParticleSystem, Prefab, v3, Vec3 } from 'cc';
import { StockpileBehavior } from './StockpileBehavior';
import { Mover, MoveType } from './Mover';
import { TriggerSpot, TriggerSpotEvent } from './TriggerSpot';
import { AudioContent } from './AudioContent';
import { GlobalAudioManager } from './GlobalAudioManager';
const { ccclass, property } = _decorator;

@ccclass('KitchenCounterBehavior')
export class KitchenCounterBehavior extends Component {
    
    @property(StockpileBehavior)
    public KitchenCounterRawStockpile : StockpileBehavior = null;
    
    @property(StockpileBehavior)
    public KitchenCounterCookedStockpile : StockpileBehavior = null;

    @property(Node)
    public Stove : Node = null;

    @property(Prefab)
    public CoockedFishPrefab : Prefab = null;

    @property
    public CookingTime : number = 1.0;

    @property(Node)
    public KitchenCookTriggerSpotNode : Node = null;

    @property(animation.AnimationController)
    public StoveAnimationController : animation.AnimationController = null;

    @property public ArcHeight : number = 2;
    @property(Vec3) public ScaleFromRatio : Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) public ScaleToRatio : Vec3 = new Vec3(1, 1, 1);


    private m_elapsedTime = 0;

    private m_lastCooked = true;

    private m_canCook = false;

    private m_smokeParticle : ParticleSystem = null;

    private m_fireParticle : ParticleSystem = null;


    private m_grillAC : AudioContent = null;

    start() 
    {
        this.KitchenCookTriggerSpotNode.on(TriggerSpotEvent.TARGET_ENTER, this.onCookTriggerEnter, this);
        this.KitchenCookTriggerSpotNode.on(TriggerSpotEvent.TARGET_EXIT, this.onCookTriggerExit, this);

        this.KitchenCookTriggerSpotNode.once("chefbought", this.onCookTriggerEnter, this);

        this.m_smokeParticle = this.node.getChildByName("SmokeEffect").getComponent(ParticleSystem);
        this.m_fireParticle = this.node.getChildByName("FireEffect").getComponent(ParticleSystem);

        this.stopParticle();

        this.m_grillAC = this.getComponent(AudioContent);
    }

    update(deltaTime: number) 
    {

        if(!this.m_canCook) return;

        if(this.m_lastCooked && !this.KitchenCounterRawStockpile.isEmpty() && !this.KitchenCounterCookedStockpile.isFull())
        {
            if(this.StoveAnimationController)
            {
                if(this.StoveAnimationController.getValue("Cooking") === false)
                {
                    this.StoveAnimationController.setValue("Cooking", true);
                }
            }

            this.m_elapsedTime += deltaTime;

            if(this.m_elapsedTime >= this.CookingTime)
            {
                this.m_elapsedTime = 0;

                this.m_lastCooked = false;

                const item = this.KitchenCounterRawStockpile.GetLast();

                const currentScale = item.getScale();

                Mover.move(MoveType.ARC, 
                    {
                        node : item,
                        start : item.getWorldPosition(),
                        end : this.Stove.getWorldPosition(),
                        duration : this.CookingTime * 0.5,
                        arcHeight : this.ArcHeight,
                        onComplete : () =>
                        {
                            item.destroy();
                            
                            const cookedFish = instantiate(this.CoockedFishPrefab);
                            
                            const plate = cookedFish.getChildByName("Plate");
                            plate.active = false;

                            this.Stove.scene.addChild(cookedFish);
                            cookedFish.setWorldPosition(this.Stove.getWorldPosition().add(v3(0, 0.1, 0)));

                            GlobalAudioManager.instance.playOneShot(this.m_grillAC);

                            this.scheduleOnce(() =>
                            {
                                plate.active = true;
                                const plateCurrScale = plate.getScale();
                                plate.setScale(0, 0, 0);

                                const onUpdate = (ratio : number) =>
                                {
                                    plate.setScale(plateCurrScale.clone().multiplyScalar(ratio));
                                }

                                this.KitchenCounterCookedStockpile.Stock(cookedFish, onUpdate);

                                this.m_lastCooked = true;
                            }, 0.1);

                        }
                    },
                    currentScale.clone().multiply(this.ScaleFromRatio),
                    currentScale.clone().multiply(this.ScaleToRatio)
                )

            }
        }
        else
        {
            if(this.StoveAnimationController)
            {
                if(this.StoveAnimationController.getValue("Cooking") === true)
                {
                    this.StoveAnimationController.setValue("Cooking", false);
                }
            }

        }
    }

    private onCookTriggerEnter()
    {
        this.m_canCook = true;
        
        this.startParticle();

    }

    private onCookTriggerExit()
    {
        this.m_canCook = false;

        this.stopParticle();

        if(this.StoveAnimationController)
            this.StoveAnimationController.setValue("Cooking", false);
    }

    private startParticle()
    {
        if(this.m_smokeParticle.isPlaying || this.m_fireParticle.isPlaying) return;

        this.m_smokeParticle.play();
        this.m_fireParticle.play();
    }

    private stopParticle()
    {
        this.m_smokeParticle.stop();
        this.m_fireParticle.stop();
    }
 
}


