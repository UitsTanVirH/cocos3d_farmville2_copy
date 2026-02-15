import { _decorator, Vec3, math } from 'cc';
import { StackingStrategy } from './StackingStrategy';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';

const { ccclass, property } = _decorator;

@ccclass('RandomPileStackingStrategy')
export class RandomPileStackingStrategy extends StackingStrategy {

    @property public Radius = 1.2;
    @property public MaxHeight = 3;
    @property public HeightStep = 0.15;

    getLocalPosition(b: BackPackObjectBehavior, index: number): Vec3 {
        const angle = math.randomRange(0, Math.PI * 2);
        const r = math.randomRange(0, this.Radius);

        const h = Math.floor(index * this.HeightStep / b.SpacingUnit.y);

        return new Vec3(
            Math.cos(angle) * r,
            h * b.SpacingUnit.y,
            Math.sin(angle) * r
        );
    }

    isOverflow(index: number): boolean {
        return index * this.HeightStep >= this.MaxHeight;
    }
}
