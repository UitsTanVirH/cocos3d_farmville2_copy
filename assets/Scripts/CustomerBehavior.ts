import { _decorator, animation, Billboard, Camera, Component, instantiate, math, MeshRenderer, Node, Prefab, quat, Quat, SpriteFrame, SpriteRenderer, tween, v3, Vec3 } from 'cc';
import { Chair, RestaurantTableBehavior } from './RestaurantTableBehavior';
import { Mover, MoveType } from './Mover';
import { State, StateManager } from './StateManager';
import { billboard } from './billboard';
import { BackpackBehavior } from './BackpackBehavior';
const { ccclass, property } = _decorator;

export enum CustomerEvent
{
    CUSTOMER_REACHED = "CustomerReached",
    SIT_COMPLETE = "CustomerSitComplete",
    ORDER_PLACED = "OrderPlaced",
    ORDER_SATISFIED = "OrderSatisfied",
    LUNCH_COMPLETE = "LunchComplete"
}

export enum CustomerState
{
    IDLE = "IdleState",
    WALK = "WalkState",
    SIT = "SitState",
    SERVE = "ServeState",
    EAT = "EatState"
}

class CustomerStateContext
{
    public SelfNode : Node = null;

    public AnimationController : animation.AnimationController = null;

    public WalkPath : Vec3[] = [];
    public WalkTime : number[] = [];
    public CurrentWalkIndex : number = 0;

    public TargetRot : Quat = new Quat();

    public MoveTime : number = 0;

    public EatTime : number = 0;

    public OrderCount : number = 0;
    public ServedItems : Node[] = [];
}

class IdleState implements State<CustomerStateContext>
{
    name: string = CustomerState.IDLE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    OnEnter?(context: CustomerStateContext): void | Promise<void> {
        context.AnimationController.setValue("Idle", true);
    }

    OnExit?(context: CustomerStateContext): void | Promise<void> {
        context.AnimationController.setValue("Idle", false);
    }

    OnUpdate?(context: CustomerStateContext, deltaTime: number): void {
    }    
}

class WalkState implements State<CustomerStateContext>
{
    name: string = CustomerState.WALK;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_offset : Vec3 = new Vec3(0, -0.3, 0);

    OnEnter(context: CustomerStateContext): void {
        context.AnimationController.setValue("Walk", true);
        this.walkToNextPoint(context);
        context.SelfNode.worldPositionY = -0.3;
    }

    OnExit(context: CustomerStateContext): void {
        context.AnimationController.setValue("Walk", false);
    }

    private walkToNextPoint(context: CustomerStateContext) {
        if (context.CurrentWalkIndex >= context.WalkPath.length) {
            context.SelfNode.emit(CustomerEvent.CUSTOMER_REACHED, context.SelfNode);
            return;
        }

        const target = context.WalkPath[context.CurrentWalkIndex];

        const dir = new Vec3();
        Vec3.subtract(dir, target, context.SelfNode.getWorldPosition());
        dir.normalize();

        const rot = new Quat();
        Quat.fromViewUp(rot, dir, Vec3.UP);
        context.SelfNode.setRotation(rot);

        tween(context.SelfNode)
            .to(context.WalkTime[context.CurrentWalkIndex], {
                worldPositionX: target.x,
                worldPositionZ: target.z
            })
            .call(() => {
                context.CurrentWalkIndex++;

                if (context.CurrentWalkIndex >= context.WalkPath.length) {
                    context.SelfNode.setRotation(context.TargetRot);
                    context.SelfNode.setPosition(
                        context.SelfNode.getPosition().add(this.m_offset)
                    );
                    context.SelfNode.emit(CustomerEvent.CUSTOMER_REACHED, context.SelfNode);
                } else {
                    this.walkToNextPoint(context);
                }
            })
            .start();
    }
}


class SitState implements State<CustomerStateContext>
{
    name: string = CustomerState.SIT;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_sitComplete = false;

    OnEnter?(context: CustomerStateContext): void | Promise<void> {
        context.AnimationController.setValue("Sit", true);
        context.SelfNode.worldPositionY = 0.285;
    }

    OnExit?(context: CustomerStateContext): void | Promise<void> {
        context.AnimationController.setValue("Sit", false);
        this.m_sitComplete = false;

    }

    OnUpdate?(context: CustomerStateContext, deltaTime: number): void {
        
        if(this.m_sitComplete) return;

        const motionStatus = context.AnimationController.getCurrentStateStatus(0);
        
        if(motionStatus.progress >= 0.1)
        {
            this.m_sitComplete = true;
            context.SelfNode.emit(CustomerEvent.SIT_COMPLETE, context.SelfNode);
        }
    
    }    
}

class ServeState implements State<CustomerStateContext>
{
    name: string = CustomerState.SERVE;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_servedFishCount : number = 0;

    private m_orderedSatisfied = false;

    OnEnter?(context: CustomerStateContext): void | Promise<void> 
    {
    }

    OnExit?(context: CustomerStateContext): void | Promise<void> 
    {
        context.ServedItems.splice(0, context.ServedItems.length);

        this.m_orderedSatisfied = false;

        context.OrderCount = 0;
        this.m_servedFishCount = 0;
    }

    OnUpdate?(context: CustomerStateContext, deltaTime: number): void 
    {
        if(this.m_orderedSatisfied) return;

        const arrLength = context.ServedItems.length;

        if(arrLength > 0)
        {
            for(let i = 0; i < arrLength; i++)
            {
                const item = context.ServedItems[i];

                Mover.move(MoveType.ARC, 
                {
                    node : item,
                    start : item.getWorldPosition(),
                    end : context.SelfNode.getWorldPosition(),
                    duration : 0.1 * i,
                    arcHeight : 4,
                    onComplete : () =>
                    {
                        item.destroy();

                        this.m_servedFishCount++;
                    }
                }
                );
            }

            context.ServedItems = [];
        }

        if(this.m_servedFishCount >= context.OrderCount)
        {
            context.SelfNode.emit(CustomerEvent.ORDER_SATISFIED, context.SelfNode);

            this.m_orderedSatisfied = true;
        }
    }    
}

class EatState implements State<CustomerStateContext>
{
    name: string = CustomerState.EAT;
    preEnterDelayMs: number;
    postEnterDelayMs: number;
    preExitDelayMs: number;
    postExitDelayMs: number;

    private m_elapsedTime = 0;

    private m_eatComplete = false;

    OnEnter?(context: CustomerStateContext): void | Promise<void> {
        context.AnimationController.setValue("Eat", true);
    }

    OnExit?(context: CustomerStateContext): void | Promise<void> {
        context.AnimationController.setValue("Eat", false);
        this.m_elapsedTime = 0;

        this.m_eatComplete = false;

        context.SelfNode.setPosition(context.SelfNode.getPosition().add(v3(0, -0.3, 0)));

    }

    OnUpdate?(context: CustomerStateContext, deltaTime: number): void 
    {

        if(this.m_eatComplete) return;

        this.m_elapsedTime += deltaTime;

        if(this.m_elapsedTime >= context.EatTime)
        {
            this.m_elapsedTime = 0;
            this.m_eatComplete = true;

            context.SelfNode.emit(CustomerEvent.LUNCH_COMPLETE, context.SelfNode);  
        }
    }    
}

@ccclass('CustomerBehavior')
export class CustomerBehavior extends Component {
    
    @property(RestaurantTableBehavior)
    public TargetTableBehavior : RestaurantTableBehavior = null;

    @property
    public MoveTime : number = 2.0;

    @property(Prefab)
    public CashPrefab : Prefab = null;

    @property(Prefab)
    public CashIconPrefab : Prefab = null;

    @property(Camera)
    public MainCamera : Camera = null;

    @property(Node)
    public CashUiNode : Node = null;

    @property(Node)
    public CanvasNode : Node = null;

    @property(animation.AnimationController)
    public AnimationController : animation.AnimationController = null;

    @property(Node)
    public BillboardNode : Node = null;

    @property([SpriteFrame])
    public NumberSprites : SpriteFrame[] = [];

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    private m_customerContext : CustomerStateContext = new CustomerStateContext();

    private m_stateManager : StateManager<CustomerStateContext> = null;

    private m_targetChair : Chair = null;

    private m_orderedFishCount = 5;

    private m_eatTime : number = 2;

    private m_countNode : Node = null;

    private m_currentlyServed : number = 0;

    start() 
    {
        this.m_customerContext.SelfNode = this.node;
        this.m_customerContext.MoveTime = this.MoveTime;

        this.m_customerContext.AnimationController = this.AnimationController;

        this.m_customerContext.EatTime = this.m_eatTime;

        this.m_stateManager = new StateManager<CustomerStateContext>(this.m_customerContext, (e) =>
        {
            console.log(`[CustomerStateTransition] ${e.from} -> ${e.to}`);
        });

        const idleState = new IdleState();
        const walkState = new WalkState();
        const sitState = new SitState();
        const serveState = new ServeState();
        const eatState = new EatState();

        this.m_stateManager.RegisterState(idleState);
        this.m_stateManager.RegisterState(walkState);
        this.m_stateManager.RegisterState(sitState);
        this.m_stateManager.RegisterState(serveState);
        this.m_stateManager.RegisterState(eatState);


        this.m_targetChair = this.TargetTableBehavior.GetEmptyChair();
        
        if(!this.m_targetChair) return;

       // this.TargetTableBehavior.ReserveChairNode(this.m_targetChair.node, this.node);

        const plate = this.m_targetChair.node.getChildByName("CookedFish");
        plate.active = false;

        this.m_targetChair.isEmpty = false;

        // tween(this.node).to(this.MoveTime, {worldPositionX : this.m_targetChair.node.worldPositionX, worldPositionZ :  this.m_targetChair.node.worldPositionZ}).call(()=>
        // {
        //     this.TargetTableBehavior.ReserveChairNode(this.m_targetChair.node, this.node);

        //     this.node.emit(CustomerEvent.CUSTOMER_REACHED, this.node);
        //     this.m_targetChair.customerNode = this.node;
        //     this.placeOrder();
        // }).start();


        const chairWorldPos = this.m_targetChair.node.getWorldPosition();
        chairWorldPos.y = 0;

        this.m_customerContext.WalkPath = [
            this.node.parent.getWorldPosition().clone().add(v3(this.m_targetChair.node.x < 0 ? -2 : 2, 0, 0)),
            this.m_targetChair.node.getWorldPosition().clone().add(v3(this.m_targetChair.node.x < 0 ? -2 : 2, 0, 0)),
            chairWorldPos
        ];

        this.m_customerContext.WalkTime = [0.2, this.MoveTime, 0.5];

        this.m_customerContext.CurrentWalkIndex = 0;

        const dir = this.m_targetChair.node.forward.clone();
        dir.normalize();
        Quat.fromViewUp(this.m_customerContext.TargetRot, dir, Vec3.UP);

        this.m_stateManager.ChangeState(CustomerState.WALK);

        this.node.once(CustomerEvent.CUSTOMER_REACHED, this.onCustomerReachedTable, this);

        this.node.once(CustomerEvent.ORDER_PLACED, this.onOrderPlaced, this);

        this.node.once(CustomerEvent.SIT_COMPLETE, this.onCustomerSitComplete, this);

        this.node.once(CustomerEvent.ORDER_SATISFIED, this.onOrderStaisfied, this);

        this.node.once(CustomerEvent.LUNCH_COMPLETE, this.onLunchComplete, this);

        this.BillboardNode.getComponent(billboard).camera = this.node.scene.getChildByName("Main Camera").getComponent(Camera);

        this.m_countNode = this.BillboardNode.getChildByName("Count");

        this.BillboardNode.active = false;
    }

    update(deltaTime: number) {
        this.m_stateManager.Update(deltaTime);
    }

    public serve(items : Node[])
    {
        this.m_customerContext.ServedItems = items;

        this.m_currentlyServed += items.length;

        const currentSpriteIndex = this.m_orderedFishCount - this.m_currentlyServed;

        this.m_countNode.getComponent(SpriteRenderer).spriteFrame = this.NumberSprites[currentSpriteIndex];

        // Mover.move(MoveType.ARC, 
        // {
        //     node : item,
        //     start : item.getWorldPosition(),
        //     end : this.m_targetChair.node.getWorldPosition(),
        //     duration : 0.3,
        //     arcHeight : 3,
        //     onComplete : () =>
        //     {
        //         item.destroy();

        //         this.m_servedFishCount++;

        //         if(this.m_servedFishCount >= this.m_orderedFishCount)
        //         {
        //             this.node.emit(CustomerEvent.ORDER_SATISFIED, this.node);



        //             this.m_canEat = true;

        //             this.scheduleOnce(() =>
        //             {
        //                 this.node.emit(CustomerEvent.LUNCH_COMPLETE, this.node);

        //                 this.TargetTableBehavior.MakeChairNodeEmpty(this.m_targetChair.node);

        //                 tween(this.node).to(this.MoveTime, {worldPositionX : this.node.parent.worldPositionX, worldPositionZ :  this.node.parent.worldPositionZ}).call(()=>
        //                 {
        //                     this.node.destroy();
        //                 }).start();

        //             }, this.m_eatTime);
        //         }
        //     }
        // });
    }
    
    public GetOrderCount()
    {
        return this.m_orderedFishCount - this.m_currentlyServed;
    }

    private placeOrder()
    {
        this.BillboardNode.active = true;

        this.m_orderedFishCount = math.randomRangeInt(5, 9);

        this.m_customerContext.OrderCount = this.m_orderedFishCount;

        this.m_countNode.getComponent(SpriteRenderer).spriteFrame = this.NumberSprites[this.m_orderedFishCount];

        this.m_customerContext.EatTime = this.m_orderedFishCount * 0.5;

        this.node.emit(CustomerEvent.ORDER_PLACED, this.node);
    }

    private onLunchComplete()
    {
        for(let i = 0; i < this.m_orderedFishCount / 4; i++)
        {
            const cash = instantiate(this.CashPrefab);
            cash.setWorldPosition(this.node.getWorldPosition());
            cash.children[0].getComponent(MeshRenderer).enabled = false;

            //this.TargetTableBehavior.GetCashStockpile().Stock(cash);

            this.Backpack.Collect(cash);
        }

            const cashIcon = instantiate(this.CashIconPrefab);
            const cashIconWorldPos = this.MainCamera.worldToScreen(this.node.getWorldPosition());
            this.CanvasNode.addChild(cashIcon);
            cashIcon.setWorldPosition(cashIconWorldPos);

            const cashMovePos = this.CashUiNode.getWorldPosition();

            // tween(cashIcon).to(5, {worldPosition : cashMovePos}, {easing : 'quadIn'}).call(()=>
            // {
            //     cashIcon.destroy();
            // }).start();

            Mover.move(MoveType.ARC,
            {
                node : cashIcon,
                start : cashIcon.getWorldPosition(),
                end : cashMovePos,
                duration : 0.5,
                arcHeight : -25,
                onComplete : () =>
                {
                    cashIcon.destroy();
                }
            });

        this.m_customerContext.WalkPath = [
            this.node.getWorldPosition().clone().add(v3( this.m_targetChair.node.x < 0 ? -2 : 2, 0, 0)),
            this.node.parent.getWorldPosition()
        ];

        this.m_customerContext.WalkTime = [0.7, this.MoveTime];

        this.m_customerContext.CurrentWalkIndex = 0;
        this.m_stateManager.ChangeState(CustomerState.WALK);

        const plate = this.m_targetChair.node.getChildByName("CookedFish");
        plate.active = false;

        this.TargetTableBehavior.MakeChairNodeEmpty(this.m_targetChair.node);

        this.scheduleOnce(()=>
        {
            this.node.destroy();
        }, this.MoveTime + 1);
    }

    private onCustomerReachedTable()
    {
        this.m_stateManager.ChangeState(CustomerState.SIT);
    }

    private onCustomerSitComplete()
    {
        this.TargetTableBehavior.ReserveChairNode(this.m_targetChair.node, this.node);
        this.m_targetChair.customerNode = this.node;
        this.placeOrder();
    }

    private onOrderPlaced()
    {
        this.m_stateManager.ChangeState(CustomerState.SERVE);
    }

    private onOrderStaisfied()
    {
        const plate = this.m_targetChair.node.getChildByName("CookedFish");
        plate.active = true;

        this.BillboardNode.active = false;

        this.m_stateManager.ChangeState(CustomerState.EAT);
    }

}


