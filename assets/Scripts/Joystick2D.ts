import { _decorator, Component, EventMouse, EventTouch, Node, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Joystick2D')
export class Joystick2D extends Component {

    @property(Node)
    public Base: Node = null;

    @property(Node)
    public Thumb: Node = null;

    private m_baseUiTransform: UITransform = null;
    private m_thumbUiTransform: UITransform = null;

    private m_thumbInitialPos: Vec2 = new Vec2();
    private m_touching = false;
    private m_startPos: Vec2 = new Vec2();
    private m_direction: Vec2 = new Vec2();   
    private smoothedDir: Vec2 = new Vec2();  

    private m_maxRadius: number = 0;

    private DEAD_ZONE: number = 0.1;   // 10% dead zone
    private SMOOTHING: number = 1.0;   // 0.0–1.0, higher = snappier

    start() {
        if (!this.Base || !this.Thumb) {
            throw Error("Joystick2D Base or Thumb Node not provided!");
        }

        this.m_baseUiTransform = this.Base.getComponent(UITransform);
        this.m_thumbUiTransform = this.Thumb.getComponent(UITransform);

        if (!this.m_baseUiTransform || !this.m_thumbUiTransform) {
            throw Error("Joystick2D nodes must have UITransform!");
        }

        this.m_thumbInitialPos = this.Thumb.getPosition().toVec2();
        this.m_maxRadius = this.m_baseUiTransform.width / 2;

        this.Base.on(Node.EventType.TOUCH_START, this.onPointerDown, this);
        this.Base.on(Node.EventType.TOUCH_MOVE, this.onPointerMove, this);
        this.Base.on(Node.EventType.TOUCH_END, this.onPointerUp, this);
        this.Base.on(Node.EventType.TOUCH_CANCEL, this.onPointerUp, this);

        this.Base.on(Node.EventType.MOUSE_DOWN, this.onPointerDown, this);
        this.Base.on(Node.EventType.MOUSE_MOVE, this.onPointerMove, this);
        this.Base.on(Node.EventType.MOUSE_UP, this.onPointerUp, this);
    }

    update(deltaTime: number) 
    {
        this.smoothedDir.lerp(this.m_direction, this.SMOOTHING);
    }

    public getDirection(): Vec2 {
        if (this.m_direction.lengthSqr() < this.DEAD_ZONE * this.DEAD_ZONE) {
            return new Vec2(0, 0);
        }
        return this.m_direction.clone();
    }

    public getSmoothedDirection(): Vec2 {
        if (this.smoothedDir.lengthSqr() < this.DEAD_ZONE * this.DEAD_ZONE) {
            return new Vec2(0, 0);
        }
        return this.smoothedDir.clone();
    }

    public getRoundedDirection(): Vec2 {
        if (this.smoothedDir.lengthSqr() < this.DEAD_ZONE * this.DEAD_ZONE) {
            return new Vec2(0, 0);
        }
        const norm = this.smoothedDir.clone();
        return new Vec2(
            Math.round(norm.x * 10) / 10,
            Math.round(norm.y * 10) / 10
        );
    }

    public onPointerDown(event: EventTouch | EventMouse) {
        this.m_touching = true;

        const pointerPos: Vec3 = event.getLocation().toVec3();

        const startPos = this.m_baseUiTransform.convertToNodeSpaceAR(pointerPos);
        this.m_startPos = startPos.toVec2();

        this.onPointerMove(event);
    }

    public onPointerMove(event: EventTouch | EventMouse) {
        if (!this.m_touching) return;

        const pos = this.m_baseUiTransform.convertToNodeSpaceAR(event.getLocation().toVec3());
        const offset = pos.toVec2().subtract(this.m_startPos);

        let distance = offset.length();
        let clampedOffset = offset.clone();
        if (distance > this.m_maxRadius) {
            clampedOffset = offset.normalize().multiplyScalar(this.m_maxRadius);
            distance = this.m_maxRadius;
        }

        const newThumbPos = this.m_thumbInitialPos.clone().add(clampedOffset);
        this.Thumb.setPosition(newThumbPos.x, newThumbPos.y);

        this.m_direction.set(
            clampedOffset.x / this.m_maxRadius,
            clampedOffset.y / this.m_maxRadius
        );
    }

    public onPointerUp(event?: EventTouch | EventMouse) {
        this.m_touching = false;

        this.Thumb.setPosition(this.m_thumbInitialPos.toVec3());
        this.m_direction.set(0, 0);
    }

    public Stop() {
        this.onPointerUp();
    }

    public StopInputEvents() {
        this.Base.off(Node.EventType.TOUCH_START, this.onPointerDown, this);
        this.Base.off(Node.EventType.TOUCH_MOVE, this.onPointerMove, this);
        this.Base.off(Node.EventType.TOUCH_END, this.onPointerUp, this);
        this.Base.off(Node.EventType.TOUCH_CANCEL, this.onPointerUp, this);

        this.Base.off(Node.EventType.MOUSE_DOWN, this.onPointerDown, this);
        this.Base.off(Node.EventType.MOUSE_MOVE, this.onPointerMove, this);
        this.Base.off(Node.EventType.MOUSE_UP, this.onPointerUp, this);
    }
}
