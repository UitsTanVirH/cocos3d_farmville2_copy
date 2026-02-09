import { _decorator, Component, Node } from "cc";
import { AdEvent, AdManager } from "./AdManager";
import { pulseNode } from "./Helper";
const { ccclass, property } = _decorator;

@ccclass("PlayableUICanvasFix")
export class PlayableUICanvasFix extends Component {
  start() {}

  update(deltaTime: number) {}

  protected onLoad(): void {
    AdManager.on(AdEvent.VIEWABLE_CHANGE, this.onViewableChange.bind(this));
  }

  private onViewableChange(
    percentage: number,
    visibleRect: any,
    occlusionRectangles: any[],
  ) {
    console.log(`Ad viewable percentage: ${percentage}`);
    pulseNode(this.node, 1, 0.2, 1.01);
  }
}
