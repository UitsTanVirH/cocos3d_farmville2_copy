import { _decorator, Component, Enum, Node, Sprite, SpriteFrame, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum ObjectType
{
    NONE = "None",
    FISH = "Fish",
    GRILLED_FISH = "GrilledFish",
    COIN = "Coin"
}

@ccclass('BackPackObjectBehavior')
export class BackPackObjectBehavior extends Component 
{
 
    @property({type : Enum(ObjectType)})
    public ObjectType : ObjectType = ObjectType.NONE;
    
    @property(Vec3)
    public BackPackRot : Vec3 = new Vec3();

    @property(Vec3)
    public SpacingUnit : Vec3 = new Vec3();

    @property
    public Value : number = 4;

    @property(SpriteFrame)
    public Icon : SpriteFrame = null;

    start() 
    {

    }

    update(deltaTime: number) {
        
    }
}


