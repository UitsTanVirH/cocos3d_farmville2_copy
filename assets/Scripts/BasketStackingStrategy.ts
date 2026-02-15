import { _decorator, Component, Vec3, math } from 'cc';
import { StackingStrategy } from './StackingStrategy';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';

const { ccclass, property } = _decorator;

@ccclass('BasketStackingStrategy')
export class BasketStackingStrategy extends StackingStrategy {

    @property
    public MaxItems = 30;

    @property
    public BucketRadius = 0.35;

    @property
    public ItemsPerRing = 6;

    @property
    public LayerHeight = 0.08;

    @property
    public InwardTiltDeg = 18;

    @property
    public VerticalJitter = 0.015;

    isOverflow(index: number): boolean {
        return index >= this.MaxItems;
    }

    getLocalPosition(
        _: BackPackObjectBehavior,
        index: number
    ): Vec3 {

        const ring = Math.floor(index / this.ItemsPerRing);
        const slot = index % this.ItemsPerRing;

        const angleStep = (Math.PI * 2) / this.ItemsPerRing;
        const angle = slot * angleStep;

        const radius =
            this.BucketRadius *
            math.clamp01(1.0 - ring * 0.15);

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const y =
            ring * this.LayerHeight +
            math.randomRange(-this.VerticalJitter, this.VerticalJitter);

        return new Vec3(x, y, z);
    }

    getLocalRotation(
        _: BackPackObjectBehavior,
        __: number,
        localPos: Vec3
    ): Vec3 {

        const dir = localPos.clone().multiplyScalar(-1);
        dir.y = 0;

        if (dir.lengthSqr() < 0.0001) {
            return new Vec3(0, 0, 0);
        }

        dir.normalize();

        const yaw = math.toDegree(Math.atan2(dir.x, dir.z));

        const pitch = this.InwardTiltDeg;

        return new Vec3(pitch, yaw, 90);
    }
}
