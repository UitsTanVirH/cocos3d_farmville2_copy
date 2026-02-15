import { _decorator, Component, Node, Vec3, Quat } from 'cc';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';
import { Mover, MoveType } from './Mover';
import { StackingStrategy } from './StackingStrategy';

const { ccclass, property } = _decorator;

export enum StockpileEvent {
    ITEM_COLLECTED = "ItemCollected",
}

@ccclass('StockpileBehavior')
export class StockpileBehavior extends Component {

    @property(StackingStrategy)
    public stackingStrategy: StackingStrategy | null = null;

    @property public ArcHeight = 2.0;
    @property public TweenTime = 0.6;

    @property(Vec3) public ScaleFromRatio = new Vec3(1, 1, 1);
    @property(Vec3) public ScaleToRatio   = new Vec3(1, 1, 1);

    protected m_storedObjects: Node[] = [];
    protected m_isFull = false;
    protected m_isEmpty = true;

    public Stock(objectNode: Node, onUpdate?: (ratio: number) => void) {
        if (!objectNode || this.m_isFull || !this.stackingStrategy)
        {
            objectNode.destroy();
            return;
        }

        const index = this.m_storedObjects.length;

        if (this.stackingStrategy.isOverflow?.(index)) {
            this.m_isFull = true;
            objectNode.destroy();
            return;
        }

        const behavior = objectNode.getComponent(BackPackObjectBehavior);
        if (!behavior) return;

        const originalWorldScale = objectNode.getWorldScale().clone();

        const localOffset = this.stackingStrategy.getLocalPosition(
            behavior,
            index,
            this.m_storedObjects
        );

        const pileWorldPos = this.node.worldPosition.clone();
        const pileWorldRot = this.node.worldRotation.clone();

        const rotatedOffset = new Vec3();
        Vec3.transformQuat(rotatedOffset, localOffset, pileWorldRot);

        const targetWorldPos = pileWorldPos.add(rotatedOffset);

        const startPos = objectNode.worldPosition.clone();
        const tempPos  = objectNode.worldPosition.clone();
        const tempRot  = objectNode.worldRotation.clone();

        this.node.addChild(objectNode);
        objectNode.setWorldPosition(tempPos);
        objectNode.setWorldRotation(tempRot);
        objectNode.setRotation(Quat.IDENTITY);

        const currentScale = objectNode.getScale().clone();
        
        this.m_storedObjects.push(objectNode);

        Mover.move(
            MoveType.ARC,
            {
                node: objectNode,
                start: startPos,
                end: targetWorldPos,
                duration: this.TweenTime,
                arcHeight: this.ArcHeight,

                onComplete: () => {
                    this.m_isEmpty = false;

                    const localRot = this.stackingStrategy.getLocalRotation?.( behavior, index, localOffset );

                    if (localRot) { objectNode.setRotationFromEuler( localRot.x, localRot.y, localRot.z );
                    } else {
                        objectNode.eulerAngles = behavior.BackPackRot;
                    }

                    objectNode.setWorldScale(originalWorldScale);
                    this.node.emit(StockpileEvent.ITEM_COLLECTED);
                },

                onUpdate
            },
            currentScale.clone().multiply(this.ScaleFromRatio),
            currentScale.clone().multiply(this.ScaleToRatio)
        );
    }

    public GetLast(): Node | null {
        if (this.m_storedObjects.length === 0) return null;

        const node = this.m_storedObjects.pop()!;
        this.m_isFull = false;
        this.m_isEmpty = this.m_storedObjects.length === 0;
        return node;
    }

    public GetCount() {
        return this.m_storedObjects.length;
    }

    public isFull() {
        return this.m_isFull;
    }

    public isEmpty() {
        return this.m_isEmpty;
    }
}
