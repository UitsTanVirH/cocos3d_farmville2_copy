import {
  _decorator,
  Component,
  EventMouse,
  EventTouch,
  Input,
  input,
  Node,
  tween,
  UIOpacity,
} from "cc";
import { Joystick2D } from "./Joystick2D";
import { TapDetector } from "./TapDetector";
const { ccclass, property } = _decorator;

@ccclass("JoystickBehavior")
export class JoystickBehavior extends Component {
  @property(Node)
  public JoystickNode: Node = null;

  @property(Node)
  public IgnoreNode: Node = null;

  @property(TapDetector)
  public TapHelper: TapDetector = null;

  private m_isPointerDown = false;

  private m_ignoredObjHit = false;

  start() {
    input.on(Input.EventType.MOUSE_DOWN, this.onPointerDown, this);

    input.on(Input.EventType.TOUCH_START, this.onPointerDown, this);

    input.on(Input.EventType.MOUSE_MOVE, this.onPointerMove, this);

    input.on(Input.EventType.TOUCH_MOVE, this.onPointerMove, this);

    input.on(Input.EventType.MOUSE_UP, this.onPointerUp, this);

    input.on(Input.EventType.TOUCH_END, this.onPointerUp, this);

    const joystick = this.JoystickNode.getComponent(Joystick2D);

    joystick.StopInputEvents();

    const opacity = this.JoystickNode.getComponent(UIOpacity);

    this.TapHelper.registerTarget(this.IgnoreNode, 1 << 6);

    this.TapHelper.setCallback((node) => {
      if (!(node == this.IgnoreNode)) return;

      this.m_ignoredObjHit = true;
    });

    tween(opacity).to(0.3, { opacity: 10 }).start();
  }

  update(deltaTime: number) {}

  private onPointerDown(event: EventTouch | EventMouse) {
    if (this.m_ignoredObjHit) {
      //this.m_ignoredObjHit = false;
      return;
    }

    this.m_isPointerDown = true;

    const pointLoc = event.getUILocation();

    this.JoystickNode.setWorldPosition(pointLoc.x, pointLoc.y, 0);

    const joystick = this.JoystickNode.getComponent(Joystick2D);

    joystick.onPointerDown(event);

    const opacity = this.JoystickNode.getComponent(UIOpacity);

    tween(opacity).to(0.1, { opacity: 255 }).start();
  }

  private onPointerMove(event: EventTouch | EventMouse) {
    if (!this.m_isPointerDown) return;

    const joystick = this.JoystickNode.getComponent(Joystick2D);

    const opacity = this.JoystickNode.getComponent(UIOpacity);

    if (opacity.opacity < 240) tween(opacity).to(0.1, { opacity: 255 }).start();

    joystick.onPointerMove(event);
  }

  private onPointerUp(event: EventTouch | EventMouse) {
    this.m_ignoredObjHit = false;

    this.m_isPointerDown = false;

    const joystick = this.JoystickNode.getComponent(Joystick2D);
    joystick.onPointerUp(event);

    const opacity = this.JoystickNode.getComponent(UIOpacity);

    tween(opacity).to(0.3, { opacity: 10 }).start();
  }

  public StopAllEvents() {
    input.off(Input.EventType.MOUSE_DOWN, this.onPointerDown, this);

    input.off(Input.EventType.TOUCH_START, this.onPointerDown, this);

    input.off(Input.EventType.MOUSE_MOVE, this.onPointerMove, this);

    input.off(Input.EventType.TOUCH_MOVE, this.onPointerMove, this);

    input.off(Input.EventType.MOUSE_UP, this.onPointerUp, this);

    input.off(Input.EventType.TOUCH_END, this.onPointerUp, this);
  }
}
