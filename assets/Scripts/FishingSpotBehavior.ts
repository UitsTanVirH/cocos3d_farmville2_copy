import { _decorator, Camera, Component, EventTouch, Input, input, instantiate, Node, NodeEventType, Prefab, tween, v3, Vec3 } from 'cc';
import { TriggerSpot, TriggerSpotEvent } from './TriggerSpot';
import { State, StateManager } from './StateManager';
import { StockpileBehavior } from './StockpileBehavior';
import { TapDetector } from './TapDetector';
import { pulseNode } from './Helper';
const { ccclass, property } = _decorator;

class FishingSpotContext
{
    public ProducePrefab : Prefab = null;
    public Stockpile : StockpileBehavior = null;

    public IsFisherManBought : boolean = false;

    public HandNode : Node = null;
}

export enum FishingSpotState
{
    INITIAL_STATE = "InitialState",
    PRODUCE_STATE = "ProduceState"
}

class InitialState implements State<FishingSpotContext>
{
    name: string = FishingSpotState.INITIAL_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    OnEnter?(context: FishingSpotContext): void | Promise<void> {
        
        if(context.HandNode.active)
        {
            context.HandNode.active = false;
        }
    }
    OnExit?(context: FishingSpotContext): void | Promise<void> {
        
    }
    OnUpdate?(context: FishingSpotContext, deltaTime: number): void {
        
    }    
}


export class ProduceState implements State<FishingSpotContext> {
    name: string = FishingSpotState.PRODUCE_STATE;
    preEnterDelayMs = 0;
    postEnterDelayMs = 0;
    preExitDelayMs = 0;
    postExitDelayMs = 0;

    private m_fishinRodNode: Node = null!;
    private m_currentContext: FishingSpotContext = null!;
    private m_tapDetector: TapDetector = null!;

    private m_canTap = true;

    private m_captureDelay = 1;
    private m_elapsedTime = 0

    private m_camera : Camera = null;

    constructor(fishingRodNode: Node, tapDetector: TapDetector, camera : Camera) {
        this.m_fishinRodNode = fishingRodNode;
        this.m_tapDetector = tapDetector;

        this.m_fishinRodNode.eulerAngles = v3(-47, 90, 180);

        this.m_camera = camera;
    }

    OnEnter(context: FishingSpotContext): void {
        this.m_currentContext = context;

        if(!context.IsFisherManBought)
        {
           // this.m_tapDetector.registerTarget(this.m_fishinRodNode, 1 << 5);

            //context.HandNode.active = true;

            // pulseNode(context.HandNode);

            // this.m_tapDetector.setCallback((node) => {
            //     if (node === this.m_fishinRodNode) {
            //         this.onFishingRodTap();
            //     }
            // });
        }
    }

    OnExit(): void {
        //this.m_tapDetector.unregisterTarget(this.m_fishinRodNode);
    }

    OnUpdate(context: FishingSpotContext, deltaTime: number): void {
        if(context.IsFisherManBought)
        {
            this.m_elapsedTime += deltaTime;

            if(this.m_elapsedTime >= this.m_captureDelay)
            {
                this.m_elapsedTime = 0;
                this.spawnFish();
            }
        }
        else
        {
            if(context.HandNode.active)
            {
            // const handPos = this.m_camera.worldToScreen(this.m_fishinRodNode.getWorldPosition());
                //handPos.z = 0;
                const handPos  = this.m_camera.convertToUINode(this.m_fishinRodNode.getWorldPosition(), context.HandNode.parent);
                context.HandNode.setPosition(handPos);

            }

            this.m_elapsedTime += deltaTime;

            if(this.m_elapsedTime >= this.m_captureDelay * 0.5)
            {
                this.m_elapsedTime = 0;
                this.onFishingRodTap();
            }
        }

    }

    private onFishingRodTap() {
        if (this.m_currentContext.Stockpile.isFull() || !this.m_canTap)
        {
            return;
        }

        if(this.m_currentContext.HandNode.active)
        {
            this.m_currentContext.HandNode.active = false;
        }

        this.m_canTap = false;

        const fish = instantiate(this.m_currentContext.ProducePrefab);

        const fishSpawnPos = this.m_fishinRodNode.getChildByName("FishSpawnPos");

        fishSpawnPos.addChild(fish);
        fish.setPosition(0, 0, 0);

        const forward = this.m_fishinRodNode.forward.clone();
        forward.normalize();

        const startPos = this.m_fishinRodNode.worldPosition.clone();
        const endPos = startPos.clone().add(forward.multiplyScalar(0.5));
        endPos.y += 0.15;

        tween(this.m_fishinRodNode).to(0.2, {eulerAngles : v3(-107.6, 90, 180)}).call(()=>
        {
            tween(fish)
                .to(0.2, { worldPosition: endPos }, { easing: 'quadOut' })
                .call(() => {
                    this.m_currentContext.Stockpile.Stock(fish);
                })
                .start();

                tween(this.m_fishinRodNode).to(0.2, { eulerAngles : v3(-47, 90, 180)}).call(()=>
                {
                    this.m_canTap = true;
                }, this).start();
        }, this).start();

    }

    private spawnFish()
    {
        if (this.m_currentContext.Stockpile.isFull())
        {
            
            return;
        }

        const fish = instantiate(this.m_currentContext.ProducePrefab);

        const fishSpawnPos = this.m_fishinRodNode.getChildByName("FishSpawnPos");

        fishSpawnPos.addChild(fish);
        fish.setPosition(0, 0, 0);

        const forward = this.m_fishinRodNode.forward.clone();
        forward.normalize();

        const startPos = this.m_fishinRodNode.worldPosition.clone();
        const endPos = startPos.clone().add(forward.multiplyScalar(0.5));
        endPos.y += 0.15;

        tween(this.m_fishinRodNode).to(0.2, {eulerAngles : v3(-107.6, 90, 180)}).call(()=>
        {
            tween(fish)
                .to(0.2, { worldPosition: endPos }, { easing: 'quadOut' })
                .call(() => {
                    this.m_currentContext.Stockpile.Stock(fish);
                })
                .start();

                tween(this.m_fishinRodNode).to(0.2, { eulerAngles : v3(-47, 90, 180)}).call(()=>
                {
                }, this).start();
        }, this).start();
    }
}


@ccclass('FishingSpotBehavior')
export class FishingSpotBehavior extends Component {
    
    @property(Node)
    public TriggerSpotNode : Node = null;

    @property(Prefab)
    public ProducePrefab : Prefab = null;

    @property(Node)
    public FishingRodNode : Node = null;

    @property(TapDetector)
    public TapHelper : TapDetector = null;

    @property(StockpileBehavior)
    public Stockpile : StockpileBehavior = null;

    @property(Camera)
    public MainCamera : Camera = null;

    @property(Node)
    public HandNode : Node = null;

    private m_fishingSpotContext : FishingSpotContext = new FishingSpotContext();

    private m_stateManager : StateManager<FishingSpotContext> = null;

    
    start() 
    {
        this.m_fishingSpotContext.ProducePrefab = this.ProducePrefab;
        this.m_fishingSpotContext.Stockpile = this.Stockpile;

        this.m_fishingSpotContext.HandNode = this.HandNode;

        this.m_stateManager = new StateManager<FishingSpotContext>(this.m_fishingSpotContext,(e) =>
        {
            console.log(`[FishingSpotTransition] ${e.from} -> ${e.to}`);
        });

        const initState = new InitialState();
        const produceState = new ProduceState(this.FishingRodNode, this.TapHelper, this.MainCamera);

        this.m_stateManager.RegisterState(initState);
        this.m_stateManager.RegisterState(produceState);

        this.m_stateManager.ChangeState(FishingSpotState.INITIAL_STATE);
        

        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_ENTER, this.onTargetEnter, this);
        this.TriggerSpotNode.on(TriggerSpotEvent.TARGET_EXIT, this.onTargetExit, this);

        this.TriggerSpotNode.on("fishermanbought", this.onFisherManBought, this);
    }

    update(deltaTime: number) 
    {
        this.m_stateManager.Update(deltaTime);    
    }

    private onTargetEnter()
    {
        if(!this.m_fishingSpotContext.IsFisherManBought == true)
            this.m_stateManager.ChangeState(FishingSpotState.PRODUCE_STATE);
    }

    private onTargetExit()
    {
        if(!this.m_fishingSpotContext.IsFisherManBought == true)
            this.m_stateManager.ChangeState(FishingSpotState.INITIAL_STATE);
    }

    private onFisherManBought()
    {
        this.m_fishingSpotContext.IsFisherManBought = true;
        this.HandNode.active = false;
        this.m_stateManager.ChangeState(FishingSpotState.PRODUCE_STATE);
    }
}


