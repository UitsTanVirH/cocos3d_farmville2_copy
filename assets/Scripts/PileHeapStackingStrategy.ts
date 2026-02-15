import { _decorator, Vec3, math } from 'cc';
import { StackingStrategy } from './StackingStrategy';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';

const { ccclass, property } = _decorator;

@ccclass('PileHeapStackingStrategy')
export class PileHeapStackingStrategy extends StackingStrategy {

    @property
    public BaseRadius = 0.4;
    @property
    public RadiusGrowth = 0.08;
    @property
    public HeightStep = 0.12;
    @property
    public MaxRadius = 1.6;

    private heightMap: { pos: Vec3; height: number }[] = [];

    getLocalPosition( behavior: BackPackObjectBehavior, index: number, existing: any[] ): Vec3 {

        if (index === 0) {
            const pos = Vec3.ZERO.clone();
            this.heightMap.push({ pos, height: this.HeightStep });
            return pos;
        }

        let bestPos: Vec3 | null = null;
        let lowestHeight = Number.MAX_VALUE;

        const samples = 12;
        const radius = Math.min(
            this.BaseRadius + index * this.RadiusGrowth,
            this.MaxRadius
        );

        for (let i = 0; i < samples; i++) {
            const angle = (i / samples) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;

            const height = this.sampleHeight(x, z);

            if (height < lowestHeight) {
                lowestHeight = height;
                bestPos = new Vec3(x, height, z);
            }
        }

        const finalPos = bestPos!;
        this.heightMap.push({
            pos: finalPos.clone(),
            height: finalPos.y + this.HeightStep
        });

        return finalPos;
    }

    private sampleHeight(x: number, z: number): number {
        let maxY = 0;

        for (const h of this.heightMap) {
            const dx = h.pos.x - x;
            const dz = h.pos.z - z;
            const distSq = dx * dx + dz * dz;

            if (distSq < 0.2 * 0.2) {
                maxY = Math.max(maxY, h.height);
            }
        }

        return maxY;
    }

    getLocalRotation( _: BackPackObjectBehavior, __: number, localPos: Vec3 ): Vec3 {
        const angle = Math.atan2(localPos.x, localPos.z);
        return new Vec3(0, math.toDegree(angle) + 180, 0);
    }
}
