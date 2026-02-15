import { _decorator, Vec3 } from 'cc';
import { StackingStrategy } from './StackingStrategy';
import { BackPackObjectBehavior } from './BackPackObjectBehavior';

const { ccclass, property } = _decorator;

@ccclass('GridStackingStrategy')
export class GridStackingStrategy extends StackingStrategy {

    @property public RowCount = 5;
    @property public ColumnCount = 5;
    @property public MaxHeight = 5;

    @property public OffsetX = 0.1;
    @property public OffsetY = 0.1;
    @property public OffsetZ = 0.1;

    getLocalPosition(b: BackPackObjectBehavior, index: number): Vec3 {
        const row = index % this.RowCount;
        const col = Math.floor(index / this.RowCount) % this.ColumnCount;
        const h = Math.floor(index / (this.RowCount * this.ColumnCount));

        return new Vec3(
            (row - (this.RowCount - 1) / 2) * (b.SpacingUnit.x + this.OffsetX),
            h * (b.SpacingUnit.y + this.OffsetY),
            (col - (this.ColumnCount - 1) / 2) * (b.SpacingUnit.z + this.OffsetZ)
        );
    }

    isOverflow(index: number): boolean {
        const h = Math.floor(index / (this.RowCount * this.ColumnCount));
        return h >= this.MaxHeight;
    }
}
