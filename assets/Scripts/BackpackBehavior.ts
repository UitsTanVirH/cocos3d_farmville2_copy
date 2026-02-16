import { _decorator, Component, Node, Vec3, Label, tween, Prefab, instantiate } from 'cc';
import { BackPackObjectBehavior, ObjectType } from "./BackpackObjectBehavior";
import { Mover, MoveType } from './Mover'

const { ccclass, property } = _decorator;

export enum BackpackEvent
{
    ITEM_COLLECTED = "ItemCollected",
    ITEM_REMOVED = "ItemRemoved"
}


@ccclass('BackpackBehavior')
export class BackpackBehavior extends Component {

    @property(Node) public Backpack: Node = null!;

    @property public SwingUpOffset: number = 1.0;
    @property(Vec3) public ScaleFromRatio : Vec3 = new Vec3(1, 1, 1);
    @property(Vec3) public ScaleToRatio : Vec3 = new Vec3(1, 1, 1);
    @property public CollectDuration: number = 0.5;
    @property public MaxStackCount: number = 30;

    @property(Prefab) public CashPrefab: Prefab = null;


    private m_stackedObjects: Node[] = [];
    private m_reservedCount = 0;

    private m_objectCount = new Map<ObjectType, number>();
    private m_currentCoinCount = 0;

    start() {
        this.UpdateCoinCount(0);
    }

    update(deltaTime: number) {

    }

    public Collect(objectNode: Node) {

        if(!objectNode) return;

        const behavior = objectNode.getComponent(BackPackObjectBehavior);
        if (!behavior || !this.Backpack) return;

        const totalReserved = this.m_stackedObjects.length;

        if (totalReserved >= this.MaxStackCount) return;

        if(behavior.ObjectType !== ObjectType.COIN)
            this.m_stackedObjects.push(objectNode);

        const worldPos = objectNode.getWorldPosition();
        const worldRot = objectNode.getWorldRotation();

        this.Backpack.addChild(objectNode);
        objectNode.setWorldPosition(worldPos);
        objectNode.setWorldRotation(worldRot);

        let reservedYOffset = 0;
        for (const obj of this.m_stackedObjects) {
            const b = obj.getComponent(BackPackObjectBehavior);
            reservedYOffset += b ? b.SpacingUnit.y : 0;
        }

        this.m_reservedCount++;

        const typ = behavior.ObjectType;
        const prev = this.m_objectCount.get(typ) ?? 0;
        this.m_objectCount.set(typ, prev + 1);

        const startPos = worldPos.clone();

        const endPointGetter = () => {
            const wp = behavior.ObjectType === ObjectType.COIN ? this.node.parent.getWorldPosition() : this.Backpack.worldPosition.clone();

            return new Vec3(
                wp.x,
                wp.y + reservedYOffset,
                wp.z
            );
        };

        const currentScale = objectNode.getScale();

        Mover.move(
            MoveType.ARC,
            {
                node: objectNode,
                start: startPos,
                duration: this.CollectDuration,
                arcHeight: this.SwingUpOffset,
                endPointGetter,
                onComplete: () => (behavior.ObjectType === ObjectType.COIN) ? this.onCoinCollected(objectNode) : this.OnCollected(objectNode)
            }
        );
    }

    private OnCollected(item: Node) {
        const node = item;
        const behavior = node.getComponent(BackPackObjectBehavior);
        if (!behavior) return;

        const endWorld = item.worldPosition.clone();
        const finalLocal = new Vec3();
        this.Backpack.inverseTransformPoint(finalLocal, endWorld);
        node.setPosition(finalLocal);

        node.eulerAngles = behavior.BackPackRot;

        const origScale = node.getScale().clone();
        const small = origScale.clone().multiplyScalar(0.85);

        tween(node)
            .to(0.08, { scale: small }, { easing: 'quadIn' })
            .to(0.14, { scale: origScale }, { easing: 'bounceOut' })
            .start();

        this.m_reservedCount = Math.max(0, this.m_reservedCount - 1);

        this.node.emit(BackpackEvent.ITEM_COLLECTED, behavior);
    }

    private onCoinCollected(item : Node)
    {
        const node = item;
        const behavior = node.getComponent(BackPackObjectBehavior);
        if (!behavior) return;

        if(behavior.ObjectType === ObjectType.COIN)
        {
            //const top = this.m_stackedObjects.pop()!;
            const b = node.getComponent(BackPackObjectBehavior);

            if (b) {
                this.m_reservedCount = Math.max(0, this.m_reservedCount - 1);
                this.m_currentCoinCount++;
                console.log("Destroyed");
            }
        }
        this.node.emit(BackpackEvent.ITEM_COLLECTED, behavior);

        node.destroy();
    }


    public DropTop(): Node | null {
        if (this.m_stackedObjects.length === 0) return null;

        const top = this.m_stackedObjects.pop()!;
        const b = top.getComponent(BackPackObjectBehavior);

        if (b) {
            this.m_reservedCount = Math.max(0, this.m_reservedCount - 1);

            const typ = b.ObjectType;
            const prev = this.m_objectCount.get(typ) ?? 0;
            const next = Math.max(0, prev - 1);

            if (next > 0) this.m_objectCount.set(typ, next);
            else this.m_objectCount.delete(typ);
        }

        this.node.emit(BackpackEvent.ITEM_REMOVED, b);
        return top;
    }

    public GetCoin()
    {
        const coin = instantiate(this.CashPrefab);
        this.node.addChild(coin);
        coin.setWorldPosition(this.node.parent.getWorldPosition());
        this.m_currentCoinCount--;
        this.node.emit(BackpackEvent.ITEM_REMOVED, coin.getComponent(BackPackObjectBehavior));
        return coin;
    }

    public GetTop() {
        return this.m_stackedObjects[this.m_stackedObjects.length - 1];
    }

    public GetTopType() {
        if (this.m_stackedObjects.length === 0) return null;
        const b = this.m_stackedObjects[this.m_stackedObjects.length - 1]
            .getComponent(BackPackObjectBehavior);
        return b ? b.ObjectType : null;
    }

    public GetTypeCount(type : ObjectType)
    {
        return this.m_objectCount.get(type);
    }

    public Clear() {
        for (const obj of this.m_stackedObjects) obj.destroy();
        this.m_stackedObjects.length = 0;

        this.m_reservedCount = 0;
        this.m_objectCount.clear();
    }

    public UpdateCoinCount(v: number) {
        this.m_currentCoinCount += v;
    }

    public GetCoinCount() { return this.m_currentCoinCount; }

    public CanStack() {
        return this.m_stackedObjects.length < this.MaxStackCount;
    }

    public isEmpty() {
        return this.m_stackedObjects.length === 0;
    }
}
