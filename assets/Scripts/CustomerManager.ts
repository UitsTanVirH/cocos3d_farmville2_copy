import { _decorator, Camera, Component, instantiate, math, Node, Prefab } from 'cc';
import { RestaurantTableBehavior, RestaurantTableEvent } from './RestaurantTableBehavior';
import { CustomerBehavior } from './CustomerBehavior';
import { BackpackBehavior } from './BackpackBehavior';
const { ccclass, property } = _decorator;

@ccclass('CustomerManager')
export class CustomerManager extends Component {
    
    @property(Node)
    public RestaurantTableParent : Node = null;

    @property([Prefab])
    public CustomerPrefabs : Prefab[] = [];

    @property
    public SpawnDelay : number = 3.5;

    @property(BackpackBehavior)
    public Backpack : BackpackBehavior = null;

    @property(Camera)
    public MainCamera : Camera = null;

    @property(Node)
    public CashUiNode : Node = null;

    @property(Prefab)
    public CashIconPrefab : Prefab = null;

    @property(Node)
    public CanvasNode : Node = null;

    start() 
    {
        this.RestaurantTableParent.on(RestaurantTableEvent.TABLE_EMPTY, this.spawnCustomer, this);
    }

    update(deltaTime: number) {
        
    }

    private spawnCustomer(tableNode : Node)
    {        
        const tableBehavior = tableNode.getComponent(RestaurantTableBehavior);

        for(let i = 0; i < tableBehavior.GetChairCount(); i++)
        {
            this.scheduleOnce(() =>
            {
                
            const customer = instantiate(this.CustomerPrefabs[math.randomRangeInt(0, this.CustomerPrefabs.length)]);

            this.node.addChild(customer);

            customer.setPosition(math.randomRangeInt(-5, 5), -0.3, 0);

            const customerBehavior = customer.getComponent(CustomerBehavior);
            customerBehavior.TargetTableBehavior = tableBehavior;
            customerBehavior.Backpack = this.Backpack;
            customerBehavior.MainCamera = this.MainCamera;
            customerBehavior.CashUiNode = this.CashUiNode;
            customerBehavior.CashIconPrefab = this.CashIconPrefab;
            customerBehavior.CanvasNode = this.CanvasNode;

            }, i * 1.2);
        }
    }
}


