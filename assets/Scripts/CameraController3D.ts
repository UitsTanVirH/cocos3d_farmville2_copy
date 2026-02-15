import { _decorator, Component, EventMouse, EventTouch, Input, input, math, Node, Vec2 } from 'cc';
import { CameraBehavior3D } from './CameraBehavior3D';
const { ccclass, property } = _decorator;

@ccclass('CameraController3D')
export class CameraController3D extends Component {

    @property
    public UseTouchZoom = false;

    @property
    public UseMouseZoom = false;

    @property({visible : function(){return this.UseTouchZoom === true || this.UseMouseZoom === true;}})
    public MinZoom = 5;

    @property({visible : function(){return this.UseTouchZoom === true || this.UseMouseZoom === true;}})
    public MaxZoom = 20;

    @property({visible : function(){return this.UseTouchZoom === true || this.UseMouseZoom === true;}})
    public ZoomSpeed = 1;

    @property
    public UseTouchHorizontalSwipe = false;

    @property
    public UseMouseHorizontalSwipe = false;

    @property
    public UseTouchVerticalSwipe = false;

    @property
    public UseMouseVerticalSwipe = false;

    @property({visible : function() {
        return this.UseTouchHorizontalSwipe || this.UseMouseHorizontalSwipe ||
         this.UseTouchVerticalSwipe || this.UseMouseVerticalSwipe;
    }})
    public SwipeSpeed = 5.0;


    private m_cameraBehaviorCompo : CameraBehavior3D = null;
    private m_lastPinchDistance = 0.0;

    private m_pointerOnScreen = false;
    private m_pointedLocation : Vec2 = new Vec2();

    start() 
    {

        if(this.UseTouchZoom || this.UseTouchHorizontalSwipe || this.UseTouchVerticalSwipe)
        {
            input.on(Input.EventType.TOUCH_START, this.onPointerDown, this);
            input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
            input.on(Input.EventType.TOUCH_END, this.onPointerUp, this);
        }

        if(this.UseMouseZoom)
        {
            input.on(Input.EventType.MOUSE_WHEEL, this.onMouseScroll, this);
        }

        if(this.UseMouseHorizontalSwipe || this.UseMouseVerticalSwipe)
        {
            input.on(Input.EventType.MOUSE_DOWN, this.onPointerDown, this);

            input.on(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

            input.on(Input.EventType.MOUSE_UP, this.onPointerUp, this);

        }

        this.m_cameraBehaviorCompo = this.node.getComponent(CameraBehavior3D);

        if(!this.m_cameraBehaviorCompo)
        {
            throw Error("CameraController3D CameraBehavior3D component not found!");
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.MOUSE_WHEEL, this.onMouseScroll, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onMouseMove, this);

        input.off(Input.EventType.TOUCH_START, this.onPointerDown, this);
        input.off(Input.EventType.TOUCH_END, this.onPointerUp, this);

        input.off(Input.EventType.MOUSE_DOWN, this.onPointerDown, this);
        input.off(Input.EventType.MOUSE_UP, this.onPointerUp, this);
    }

    update(deltaTime: number) {
        
    }

    private onMouseScroll(event : EventMouse)
    {
        if(this.UseMouseZoom)
        {
            const delta = event.getScrollY();

            this.m_cameraBehaviorCompo.Radius -= delta * 0.01 * this.ZoomSpeed;
            this.m_cameraBehaviorCompo.Radius = math.clamp(this.m_cameraBehaviorCompo.Radius, this.MinZoom, this.MaxZoom);   
        }
    }

    private onMouseMove(event : EventMouse)
    {
        if(this.m_pointerOnScreen)
        {
            const touch = event.getLocation();
            const dir = new Vec2();
            Vec2.subtract(dir, touch, this.m_pointedLocation);
            dir.normalize();
                    
            if(this.UseMouseHorizontalSwipe)
            {
                const delta = this.m_pointedLocation.x - touch.x;
                this.m_cameraBehaviorCompo.yaw += delta * 0.01 * this.SwipeSpeed;
            }
            
            if(this.UseMouseVerticalSwipe)
            {
                const delta = this.m_pointedLocation.y - touch.y;
                this.m_cameraBehaviorCompo.pitch += delta * 0.01 * this.SwipeSpeed;
            }

            this.m_pointedLocation = touch;
        }
    }

    private onPointerDown(event : EventTouch | EventMouse)
    {
        this.m_pointerOnScreen = true;
        this.m_pointedLocation = event.getLocation();

        if(event instanceof EventTouch)
        {
            const touches = event.getAllTouches();

            if(touches.length >= 2)
            {
                const touch1 = touches[0].getLocation();
                const touch2 = touches[1].getLocation();
                this.m_lastPinchDistance = Vec2.distance(touch1, touch2);
            }
        }
    }

    private onPointerUp(event : EventTouch | EventMouse)
    {
        this.m_pointerOnScreen = false;
        this.m_pointedLocation = event.getLocation();
    }

    private onTouchMove(event : EventTouch)
    {
        const touches = event.getAllTouches();

            if(touches.length >= 2)
            {
                if(this.UseMouseZoom)
                {
                    const touch1 = touches[0].getLocation();
                    const touch2 = touches[1].getLocation();
                    const currentDistance = Vec2.distance(touch1, touch2);

                    if(currentDistance > 0)
                    {
                        const delta = currentDistance - this.m_lastPinchDistance;

                        this.m_cameraBehaviorCompo.Radius -= delta * 0.01 * this.ZoomSpeed;

                        this.m_cameraBehaviorCompo.Radius = math.clamp(this.m_cameraBehaviorCompo.Radius, this.MinZoom, this.MaxZoom);
                    }

                    this.m_lastPinchDistance = currentDistance;
                }
            }
            else if(touches.length === 1)
            {
                if(this.m_pointerOnScreen)
                {
                    const touch = touches[0].getLocation();
                    const dir = new Vec2();
                    Vec2.subtract(dir, touch, this.m_pointedLocation);
                    dir.normalize();
                    
                    if(this.UseTouchHorizontalSwipe)
                    {
                        const delta = this.m_pointedLocation.x - touch.x;
                        this.m_cameraBehaviorCompo.yaw += delta * 0.01 * this.SwipeSpeed;
                    }
                    
                    if(this.UseTouchVerticalSwipe)
                    {
                        const delta = this.m_pointedLocation.y - touch.y;
                        this.m_cameraBehaviorCompo.pitch += delta * 0.01 * this.SwipeSpeed;
                    }

                    this.m_pointedLocation = touch;
                }
            }
    }
}


