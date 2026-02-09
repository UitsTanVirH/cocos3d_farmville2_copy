import { _decorator, Component, Camera, Node, EventTouch, input, Input, PhysicsSystem, geometry } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TapDetector')
export class TapDetector extends Component {

    @property(Camera)
    public camera3D: Camera = null!;

    private m_targets: Set<Node> = new Set();
    private callback: ((node: Node) => void) | null = null;

    private m_collisionMask : number = 0;

    onEnable() {
        input.on(Input.EventType.TOUCH_START, this.onTouch, this);
    }

    onDisable() {
        input.off(Input.EventType.TOUCH_START, this.onTouch, this);
    }

    public registerTarget(node: Node, collisionMask : number) {
        this.m_targets.add(node);
        this.m_collisionMask = collisionMask;
    }

    public unregisterTarget(node: Node) {
        this.m_targets.delete(node);
    }

    public setCallback(cb: (node: Node) => void) {
        this.callback = cb;
    }

    private onTouch(event: EventTouch) {
        if (!this.camera3D || this.m_targets.size === 0) return;

        const loc = event.getLocation();
        const ray = this.camera3D.screenPointToRay(loc.x, loc.y);

        const result = PhysicsSystem.instance.raycastClosest(ray, this.m_collisionMask);
        if (!result) return;

        const hitNode = PhysicsSystem.instance.raycastClosestResult.collider.node;

        if (this.m_targets.has(hitNode)) {
            if (this.callback) this.callback(hitNode);
        }
    }
}
