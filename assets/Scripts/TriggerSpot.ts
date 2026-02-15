import { _decorator, Collider, Component, Enum, ITriggerEvent } from "cc";
const { ccclass, property } = _decorator;

export enum TriggerSpotType
{
    FISHING,
    COOKING,
    SERVING
}

export enum TriggerSpotEvent
{
    TARGET_ENTER = "TargetEnter",
    TARGET_EXIT = "TargetExit"
}

@ccclass('TriggerSpot')
export class TriggerSpot extends Component
{
    @property({type : Enum(TriggerSpotType)})
    public TargetType : TriggerSpotType = TriggerSpotType.FISHING;
    
    @property(Collider)
    public TriggerCollider : Collider;

    start() 
    {
        this.TriggerCollider = this.getComponent(Collider);

        if(this.TriggerCollider)
        {
            this.TriggerCollider.on('onTriggerEnter', this.OnTriggerEnter, this);
            this.TriggerCollider.on('onTriggerExit', this.OnTriggerExit, this);
        }
    }

    update(deltaTime: number) {
        
    }

    OnTriggerEnter?(event : ITriggerEvent) : void
    {
        this.node.emit(TriggerSpotEvent.TARGET_ENTER);
    }

    OnTriggerExit?(event : ITriggerEvent) : void
    {
        this.node.emit(TriggerSpotEvent.TARGET_EXIT);
    }
}