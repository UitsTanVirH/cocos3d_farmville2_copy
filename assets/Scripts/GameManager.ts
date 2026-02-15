import { _decorator, Collider, Component, Input, input, Label, Node } from 'cc';
import { State, StateManager } from './StateManager';
import { CompassArrow } from './CompassArrow';
import { BackpackBehavior } from './BackpackBehavior';
import { ObjectType } from './BackPackObjectBehavior';
import { StockpileBehavior } from './StockpileBehavior';
import { CompassBehavior } from './CompassBehavior';
import { TriggerSpot } from './TriggerSpot';
import { BuyRestaurantSpotEvent } from './BuyRestaurantSpot';
import { AudioContent } from './AudioContent';
import { GlobalAudioManager } from './GlobalAudioManager';
import { AdAdapter, AdapterType, AdEvent, AdManager, AdState, MRAIDAdAdapter } from './AdManager';
const { ccclass, property } = _decorator;

export enum GameEvent
{
    INITIAL_STATE_DONE = "InitialStateDone",
    CAPTURE_FISH_STATE_DONE = "CaptureFishStateDone",
    COLLECT_RAW_FISH_STATE_DONE = "CollectRawFishStateDone",
    DROP_FISH_STATE_DONE = "DropFishStateDone",
    COOK_FISH_STATE_DONE = "CookFishStateDone",
    GRILLED_FISH_COLLECT_STATE_DONE = "GrilledFishCollectStateDone",
    FISH_SERVE_STATE_DONE = "FishServeStateDone",
    UNLOCKED_STATE_DONE = "UnlockedStateDone"
}

export enum GameState
{
    INITIAL = "InitialState",
    CAPTURE_FISH_STATE = "CaptureFishState",
    COLLECT_RAW_FISH_STATE = "CollectRawFishState",
    DROP_FISH_STATE = "DropFishState",
    COOK_FISH_STATE = "CookFishState",
    GRILLED_FISH_COLLECT_STATE = "GrilledFishCollectState",
    FISH_SERVE_STATE = "FishServeState",
    UNLOCKED_STATE = "UnlockedState",
    END_STATE = "EndState"
}

class GameContext
{
    public GameManagerNode : Node = null;

    public Backpack : BackpackBehavior = null;

    public CompassArrow : CompassArrow =  null;

    public CaptureFishTriggerNode : Node = null;

    public RawFishStockpile : StockpileBehavior = null;

    public CollectRawFishTriggerNode : Node = null;

    public DropFishTriggerNode : Node = null;

    public CookFishTriggerNode : Node = null;

    public CookFishStockpile : StockpileBehavior = null;

    public GrilledFishCollectTriggerNode : Node = null;

    public ServeTriggerNode : Node = null;

    public CashCollectTriggerNode : Node = null;

    public BuyFishermanTriggerNode : Node = null;

    public BuyChefTriggerNode : Node = null;

    public RestaurantParentNode : Node = null;

    public BuyRestaurantTriggerNode1 : Node = null;

    public BuyRestaurantTriggerNode2 : Node = null;

    public EndScreenNode : Node = null;

    public InstructionsLabel : Label = null;
}


class InitialState implements State<GameContext>
{
    name: string = GameState.INITIAL;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        context.EndScreenNode.active = false;
        context.CaptureFishTriggerNode.active = false;
        context.DropFishTriggerNode.active = false;
        context.CookFishTriggerNode.active = false;
        context.GrilledFishCollectTriggerNode.active = false;
        context.ServeTriggerNode.active = false;
        context.CollectRawFishTriggerNode.active = false;

        context.BuyRestaurantTriggerNode1.active = false;

        context.BuyRestaurantTriggerNode2.active = false;

        context.CashCollectTriggerNode.getComponent(TriggerSpot).enabled = false;
        context.CashCollectTriggerNode.getComponent(Collider).enabled = false;


        context.BuyChefTriggerNode.active = false;

        context.BuyFishermanTriggerNode.active = false;

        context.CompassArrow.getComponent(CompassBehavior).enabled = false;


        context.CompassArrow.scheduleOnce(() => {
        context.GameManagerNode.emit(GameEvent.INITIAL_STATE_DONE); 
        console.log("Transition");
        }, 2.0);     
    }

    OnExit?(context: GameContext): void | Promise<void> {
        
    }

    OnUpdate?(context: GameContext, deltaTime: number): void {
        
    }
    
}

class CaptureFishState implements State<GameContext>
{
    name: string = GameState.CAPTURE_FISH_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_fishToCapture = 20;
    private m_isDone = false;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        context.CaptureFishTriggerNode.active = true;
        context.CompassArrow.SetVisible(true);
        context.CompassArrow.target = context.CaptureFishTriggerNode;

        context.InstructionsLabel.string = "Capture Fish!";
    }

    OnExit?(context: GameContext): void | Promise<void> 
    {
        context.CaptureFishTriggerNode.active = false;
    }

    OnUpdate?(context: GameContext, deltaTime: number): void 
    {
        if(this.m_isDone) return;

        const count = context.RawFishStockpile.GetCount();

        if(count >= this.m_fishToCapture)
        {
            this.m_isDone = true;

            context.GameManagerNode.emit(GameEvent.CAPTURE_FISH_STATE_DONE);
        }
    }
    
}

class CollectRawFishState implements State<GameContext>
{
    name: string = GameState.COLLECT_RAW_FISH_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_fishToCollect = 20;
    private m_isDone = false;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        context.CollectRawFishTriggerNode.active = true;
        context.CompassArrow.SetVisible(true);
        context.CompassArrow.target = context.CollectRawFishTriggerNode;

        context.InstructionsLabel.string = "Collect Captured Fish!";
    }

    OnExit?(context: GameContext): void | Promise<void> 
    {
        context.CollectRawFishTriggerNode.active = false;
    }

    OnUpdate?(context: GameContext, deltaTime: number): void 
    {
        if(this.m_isDone) return;

        const count = context.Backpack.GetTypeCount(ObjectType.FISH);

        if(count >= this.m_fishToCollect)
        {
            this.m_isDone = true;

            context.GameManagerNode.emit(GameEvent.COLLECT_RAW_FISH_STATE_DONE);
        }
    }
    
}

class DropFishState implements State<GameContext>
{
    name: string = GameState.DROP_FISH_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_fishToDrop = 20;
    private m_isDone = false;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        context.DropFishTriggerNode.active = true;
        context.CompassArrow.SetVisible(true);
        context.CompassArrow.target = context.DropFishTriggerNode;

        context.InstructionsLabel.string = "Drop Captured Fish!";
    }

    OnExit?(context: GameContext): void | Promise<void> {
        context.DropFishTriggerNode.active = false;
    }

    OnUpdate?(context: GameContext, deltaTime: number): void {
        if(this.m_isDone) return;

        const count = context.Backpack.GetTypeCount(ObjectType.FISH);

        if(count <= 0 || !count)
        {
            this.m_isDone = true;

            context.GameManagerNode.emit(GameEvent.DROP_FISH_STATE_DONE);
        }
    }
    
}

class CookFishState implements State<GameContext>
{
    name: string = GameState.COOK_FISH_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_fishToCook = 20;
    private m_isDone = false;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        context.CookFishTriggerNode.active = true;
        context.CompassArrow.SetVisible(true);
        context.CompassArrow.target = context.CookFishTriggerNode;

        context.InstructionsLabel.string = "Cook Captured Fish!";

    }

    OnExit?(context: GameContext): void | Promise<void> {
        context.CookFishTriggerNode.active = false;
    }

    OnUpdate?(context: GameContext, deltaTime: number): void {
        if(this.m_isDone) return;

        const count = context.CookFishStockpile.GetCount();

        if(count >= this.m_fishToCook)
        {
            this.m_isDone = true;

            context.GameManagerNode.emit(GameEvent.COOK_FISH_STATE_DONE);
        }
    }
    
}

class GrilledFishCollectState implements State<GameContext> {
  name: string = GameState.GRILLED_FISH_COLLECT_STATE;
  preEnterDelayMs: number;
  postEnterDelayMs: number;
  preExitDelayMs: number;
  postExitDelayMs: number;

  private m_fishToCollect = 10;
  private m_isDone = false;

  OnEnter?(context: GameContext): void | Promise<void> {
    context.GrilledFishCollectTriggerNode.active = true;
    context.CompassArrow.SetVisible(true);
    context.CompassArrow.target = context.GrilledFishCollectTriggerNode;

    context.InstructionsLabel.string = "Collect Cooked Fish!";
  }

  OnExit?(context: GameContext): void | Promise<void> {
    context.GrilledFishCollectTriggerNode.active = false;
  }

  OnUpdate?(context: GameContext, deltaTime: number): void {
    if (this.m_isDone) return;

    const count = context.Backpack.GetTypeCount(ObjectType.GRILLED_FISH);

    if (count >= this.m_fishToCollect) {
      this.m_isDone = true;

      context.GameManagerNode.emit(GameEvent.GRILLED_FISH_COLLECT_STATE_DONE);
    }
  }
}

class FishServeState implements State<GameContext>
{
    name: string = GameState.FISH_SERVE_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_fishToDrop = 20;
    private m_isDone = false;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        context.ServeTriggerNode.active = true;
        context.CompassArrow.SetVisible(true);
        context.CompassArrow.target = context.ServeTriggerNode;

        context.InstructionsLabel.string = "Serve Cooked Fish!";
    }

    OnExit?(context: GameContext): void | Promise<void> {
        context.ServeTriggerNode.active = false;
    }

    OnUpdate?(context: GameContext, deltaTime: number): void {
        if(this.m_isDone) return;

        const count = context.Backpack.GetTypeCount(ObjectType.GRILLED_FISH);

        if(count <= 0 || !count)
        {
            this.m_isDone = true;

            context.GameManagerNode.emit(GameEvent.FISH_SERVE_STATE_DONE);
        }
    }
}

class UnlockedState implements State<GameContext>
{
    name: string = GameState.UNLOCKED_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_currentContext : GameContext = null;

    private m_tableUnlocked : number = 0;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
        this.m_currentContext = context;

        context.CaptureFishTriggerNode.active = true;
        context.DropFishTriggerNode.active = true;
        context.CookFishTriggerNode.active = true;
        context.GrilledFishCollectTriggerNode.active = true;
        context.ServeTriggerNode.active = true;
        context.CollectRawFishTriggerNode.active = true;

        context.BuyChefTriggerNode.active = true;
        context.BuyFishermanTriggerNode.active = true;

        context.InstructionsLabel.node.parent.active = false;

        context.BuyRestaurantTriggerNode1.active = true;

        context.CashCollectTriggerNode.getComponent(TriggerSpot).enabled = true;
        context.CashCollectTriggerNode.getComponent(Collider).enabled = true;

        context.CompassArrow.getComponent(CompassBehavior).enabled = true;

        context.RestaurantParentNode.on(BuyRestaurantSpotEvent.TABLE_BOUGHT, this.onTableBought, this);

        // context.BuyChefTriggerNode.on("chefbought", () =>
        // {
        //     context.GameManagerNode.emit(GameEvent.UNLOCKED_STATE_DONE);
        // }, this);    
    }

    OnExit?(context: GameContext): void | Promise<void> 
    {
        
    }

    OnUpdate?(context: GameContext, deltaTime: number): void 
    {
        
    }

    private onTableBought()
    {
        this.m_tableUnlocked++;

        if(!this.m_currentContext.BuyRestaurantTriggerNode2?.active)
        {
            this.m_currentContext.BuyRestaurantTriggerNode2.active = true;
        }

        if(this.m_tableUnlocked >= 2)
        {
            this.m_currentContext.GameManagerNode.emit(GameEvent.UNLOCKED_STATE_DONE);
        }
    }
    
}

class EndState implements State<GameContext>
{
    name: string = GameState.END_STATE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    OnEnter?(context: GameContext): void | Promise<void> 
    {
       context.EndScreenNode.active = true;

       AdManager.gameEnd();
    }

    OnExit?(context: GameContext): void | Promise<void> {
        
    }

    OnUpdate?(context: GameContext, deltaTime: number): void {
        
    }
    
}

@ccclass('GameManager')
export class GameManager extends Component {
   

    @property(CompassArrow)
    public CompassArrow : CompassArrow =  null;

    @property(Node)
    public CaptureFishTriggerNode : Node = null;

    @property(StockpileBehavior)
    public RawFishStockpile : StockpileBehavior = null;

    @property(Node)
    public RawFishCollectTriggerNode : Node = null;

    @property(Node)
    public DropFishTriggerNode : Node = null;

    @property(Node)
    public CookFishTriggerNode : Node = null;

    @property(Node)
    public GrilledFishCollectTriggerNode : Node = null;

    @property(Node)
    public InitialServeTriggerNode : Node = null;

    @property(StockpileBehavior)
    public CookedFishStockpile : StockpileBehavior = null;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property(Node)
    public BuyFishermanTriggerNode : Node = null;

    @property(Node)
    public BuyChefTriggerNode : Node = null;

    @property(Node)
    public EndScreenNode : Node = null;

    @property(Node)
    public InstructionsNode : Node = null;

    @property(Node)
    public CashCollectTriggerNode : Node = null;

    @property(Node)
    public BuyRestaurantTriggerNode1 : Node = null;

    @property(Node)
    public BuyRestaurantTriggerNode2 : Node = null;

    @property(Node)
    public RestaurantParentNode : Node = null;

    @property(Node)
    public PersistedCTANode : Node = null;


    private m_instructionsLabel : Label = null;

    private m_gameContext : GameContext = new GameContext();

    private m_stateManager : StateManager<GameContext> = null;

    private m_bgmAC : AudioContent = null;

    private m_winAC : AudioContent = null;
   
    start() 
    {

        this.m_gameContext.GameManagerNode = this.node;
        this.m_gameContext.CompassArrow = this.CompassArrow;
        this.m_gameContext.CaptureFishTriggerNode = this.CaptureFishTriggerNode;
        this.m_gameContext.DropFishTriggerNode = this.DropFishTriggerNode;
        this.m_gameContext.CookFishTriggerNode = this.CookFishTriggerNode;
        this.m_gameContext.GrilledFishCollectTriggerNode = this.GrilledFishCollectTriggerNode;
        this.m_gameContext.ServeTriggerNode = this.InitialServeTriggerNode;

        this.m_gameContext.RawFishStockpile = this.RawFishStockpile;
        this.m_gameContext.CollectRawFishTriggerNode = this.RawFishCollectTriggerNode;

        this.m_gameContext.CookFishStockpile = this.CookedFishStockpile;

        this.m_gameContext.CaptureFishTriggerNode = this.CaptureFishTriggerNode;

        this.m_gameContext.Backpack = this.Backpack;

        this.m_gameContext.BuyChefTriggerNode = this.BuyChefTriggerNode;

        this.m_gameContext.BuyFishermanTriggerNode = this.BuyFishermanTriggerNode;

        this.m_gameContext.EndScreenNode = this.EndScreenNode;

        this.m_gameContext.CashCollectTriggerNode = this.CashCollectTriggerNode;

        this.m_gameContext.RestaurantParentNode = this.RestaurantParentNode;

        this.m_gameContext.BuyRestaurantTriggerNode1 = this.BuyRestaurantTriggerNode1;

        this.m_gameContext.BuyRestaurantTriggerNode2 = this.BuyRestaurantTriggerNode2;

        this.m_instructionsLabel = this.InstructionsNode.getChildByName("Text").getComponent(Label);
        this.m_gameContext.InstructionsLabel = this.m_instructionsLabel;

        this.m_stateManager = new StateManager<GameContext>(this.m_gameContext, (e)=>
        {
            console.log(`[GameStateTransition] ${e.from} -> ${e.to}`);
        });

        const initialState = new InitialState();
        const captureFishState = new CaptureFishState();
        const collectRawFishState = new CollectRawFishState();
        const dropFishState = new DropFishState();
        const cookFishState = new CookFishState();
        const grilledFishCollectState = new GrilledFishCollectState();
        const serveState = new FishServeState();
        const unlockedState = new UnlockedState();
        const endState = new EndState();

        this.m_stateManager.RegisterState(initialState);
        this.m_stateManager.RegisterState(captureFishState);
        this.m_stateManager.RegisterState(collectRawFishState);
        this.m_stateManager.RegisterState(dropFishState);
        this.m_stateManager.RegisterState(cookFishState);
        this.m_stateManager.RegisterState(grilledFishCollectState);
        this.m_stateManager.RegisterState(serveState);
        this.m_stateManager.RegisterState(unlockedState);
        this.m_stateManager.RegisterState(endState);


        this.m_stateManager.ChangeState(GameState.INITIAL);

        this.node.once(GameEvent.INITIAL_STATE_DONE, this.onInitialStateDone, this);
        this.node.once(GameEvent.CAPTURE_FISH_STATE_DONE, this.onCaptureFishStateDone, this);
        this.node.once(GameEvent.COLLECT_RAW_FISH_STATE_DONE, this.onRawFishCollectStateDone, this);

        this.node.once(GameEvent.DROP_FISH_STATE_DONE, this.onDropFishStateDone, this);
        this.node.once(GameEvent.COOK_FISH_STATE_DONE, this.onCookFishStateDone, this);
        this.node.once(GameEvent.GRILLED_FISH_COLLECT_STATE_DONE, this.onGrilledFishCollectStateDone, this);
        this.node.once(GameEvent.FISH_SERVE_STATE_DONE, this.onFishServeStateDone, this);

        this.node.once(GameEvent.UNLOCKED_STATE_DONE, this.onUnlockedStateDone, this);

        const audioContents = this.node.getComponents(AudioContent);

        this.m_bgmAC = audioContents[0];
        this.m_winAC = audioContents[1];


        const playBgm = () =>
        {
            if(GlobalAudioManager.instance.getBGMPlayer().playing) return;

            GlobalAudioManager.instance.playBGM(this.m_bgmAC);
        };

        input.once(Input.EventType.TOUCH_START, playBgm, this);

        if(AdManager.getAdAdapter().GetAdapterType() === AdapterType.MRAID)
        {                
            AdManager.on(AdEvent.VIEWABLE_CHANGE, playBgm.bind(this));
        }

        AdManager.gameReady();        
    }

    update(deltaTime: number) 
    {
        this.m_stateManager.Update(deltaTime);    
    }

    private onInitialStateDone()
    {
        this.m_stateManager.ChangeState(GameState.CAPTURE_FISH_STATE);
    }

    private onCaptureFishStateDone()
    {
        this.m_stateManager.ChangeState(GameState.COLLECT_RAW_FISH_STATE);
    }

    private onRawFishCollectStateDone()
    {
        this.m_stateManager.ChangeState(GameState.DROP_FISH_STATE);
    }


    private onDropFishStateDone()
    {
        this.m_stateManager.ChangeState(GameState.COOK_FISH_STATE);
    }

    private onCookFishStateDone()
    {
        this.m_stateManager.ChangeState(GameState.GRILLED_FISH_COLLECT_STATE);
    }

    private onGrilledFishCollectStateDone()
    {
        this.m_stateManager.ChangeState(GameState.FISH_SERVE_STATE);
    }

    private onFishServeStateDone()
    {
        this.m_stateManager.ChangeState(GameState.UNLOCKED_STATE);
    }

    private onUnlockedStateDone()
    {
        this.PersistedCTANode.active = false;
        
        this.m_stateManager.ChangeState(GameState.END_STATE);
        GlobalAudioManager.instance.playOneShot(this.m_winAC);
    }
}


