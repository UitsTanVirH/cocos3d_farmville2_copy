import { _decorator, Component, Node, NodeEventType, Prefab } from 'cc';
import { RestaurantTableBehavior, RestaurantTableEvent } from './RestaurantTableBehavior';
const { ccclass, property } = _decorator;

@ccclass('RestaurantManager')
export class RestaurantManager extends Component {
    
    @property(Prefab)
    public TablePrefab : Prefab = null;


    private m_tables : Node[] = [];
    
    start() 
    {
        this.node.children.forEach((node) =>
        {
            this.m_tables.push(node);
            node.on(RestaurantTableEvent.TABLE_EMPTY, this.onTableEmpty, this);
        }, this);

        this.node.on(NodeEventType.CHILD_ADDED, this.onChildAdded, this);
    }

    update(deltaTime: number) {
        
    }

    private onChildAdded(node : Node)
    {
        this.m_tables.push(node);
        node.on(RestaurantTableEvent.TABLE_EMPTY, this.onTableEmpty, this); 
    }

    public GetEmptyTableNode() : Node
    {
        const emptyTable = this.m_tables.find((node) =>
        {
            const behavior = node.getComponent(RestaurantTableBehavior);

            const chair = behavior.GetEmptyChair();

            if(chair)
            {
                return true;
            }

            return false;
        })

        return emptyTable;
    }

    public GetFullTableNode() : Node
    {
        const fullTable = this.m_tables.find((node) =>
        {
            const behavior = node.getComponent(RestaurantTableBehavior);

            const chair = behavior.GetFullChair();

            if(chair)
            {
                return true;
            }

            return false;
        })

        return fullTable; 
    }

    private onTableEmpty(node : Node)
    {
        this.node.emit(RestaurantTableEvent.TABLE_EMPTY, node);
    }
}


