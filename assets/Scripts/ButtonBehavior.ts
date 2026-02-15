import { _decorator, Component, Node, Color, Sprite, SpriteFrame, Vec3, v3, tween, EventTouch, EventMouse, input, Input, UITransform, EventHandler, ccenum, } from 'cc';

const { ccclass, property, executeInEditMode } = _decorator;

export enum Transition 
{
    NONE = 0,
    COLOR = 1,
    SPRITE = 2,
    SCALE = 3,
}

ccenum(Transition);

export enum State 
{
    NORMAL,
    HOVER,
    PRESSED,
    DISABLED,
}

export enum ButtonEvent 
{
     CLICK = "Click", 
}

@ccclass('ButtonBehavior')
@executeInEditMode
export class ButtonBehavior extends Component {


    @property({ type: Node, displayOrder: 0, tooltip: 'Target node (usually same node)' })
    public target: Node | null = null;

    @property({ displayOrder: 1, tooltip: 'Is button interactable' })
    public interactable = true;

    @property({ type: Transition, displayOrder: 2, tooltip: 'Button transition type' })
    public transition: Transition = Transition.NONE;


    @property({ visible(this: ButtonBehavior) { return this.transition === Transition.COLOR; } })
    public normalColor: Color = Color.WHITE.clone();

    @property({ visible(this: ButtonBehavior) { return this.transition === Transition.COLOR; } })
    public hoverColor: Color = new Color(211, 211, 211, 255);

    @property({ visible(this: ButtonBehavior) { return this.transition === Transition.COLOR; } })
    public pressedColor: Color = Color.WHITE.clone();

    @property({ visible(this: ButtonBehavior) { return this.transition === Transition.COLOR; } })
    public disabledColor: Color = new Color(124, 124, 124, 255);


    @property({ type: SpriteFrame, visible(this: ButtonBehavior) { return this.transition === Transition.SPRITE; } })
    public normalSprite: SpriteFrame | null = null;

    @property({ type: SpriteFrame, visible(this: ButtonBehavior) { return this.transition === Transition.SPRITE; } })
    public hoverSprite: SpriteFrame | null = null;

    @property({ type: SpriteFrame, visible(this: ButtonBehavior) { return this.transition === Transition.SPRITE; } })
    public pressedSprite: SpriteFrame | null = null;

    @property({ type: SpriteFrame, visible(this: ButtonBehavior) { return this.transition === Transition.SPRITE; } })
    public disabledSprite: SpriteFrame | null = null;


    @property({ range: [0, 10], visible(this: ButtonBehavior) { return this.transition === Transition.SCALE; } })
    public duration = 0.1;

    @property({ visible(this: ButtonBehavior) { return this.transition === Transition.SCALE; } })
    public zoomScale = 1.2;


    @property({ type: [EventHandler], displayOrder: 100 })
    public clickEvents: EventHandler[] = [];

    public static Transition = Transition;
    get Transition() : Transition
    {
        return this.transition; 
    }

    set Transition(value: Transition)
    {
        this.transition = value;
        this.applyState(this.m_state, true);
    }

    public static EventType = ButtonEvent;


    private m_state: State = State.NORMAL;
    private m_pressed = false;
    private m_sprite: Sprite | null = null;
    private m_originalScale: Vec3 | null = null;



    protected onLoad() 
    {
        if (!this.target) 
        {
            this.target = this.node;
        }

        this.m_sprite = this.target.getComponent(Sprite);
        this.m_originalScale = this.target.scale.clone();

        this.applyState(this.interactable ? State.NORMAL : State.DISABLED, true);
    }

    protected onEnable() 
    {
        this.registerInput();
    }

    protected onDisable() 
    {
        this.unregisterInput();
    }


    private registerInput() 
    {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.node.on(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.on(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.on(Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    private unregisterInput() 
    {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);

        this.node.off(Node.EventType.MOUSE_ENTER, this.onMouseEnter, this);
        this.node.off(Node.EventType.MOUSE_LEAVE, this.onMouseLeave, this);
        this.node.off(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
        this.node.off(Node.EventType.MOUSE_UP, this.onMouseUp, this);
    }


    private onTouchStart(e: EventTouch) 
    {
        if (!this.interactable) return;
        this.m_pressed = true;
        this.applyState(State.PRESSED);
    }

    private onTouchEnd(e: EventTouch) 
    {
        if (!this.interactable || !this.m_pressed) return;
        this.m_pressed = false;
        this.applyState(State.NORMAL);
        this.emitClick();
    }

    private onTouchCancel(e: EventTouch) 
    {
        this.m_pressed = false;
        this.applyState(State.NORMAL);
    }

    private onMouseEnter(e: EventMouse) 
    {
        if (!this.interactable) return;
        this.applyState(State.HOVER);
    }

    private onMouseLeave(e: EventMouse) 
    {
        if (!this.interactable) return;
        if (!this.m_pressed) this.applyState(State.NORMAL);
    }

    private onMouseDown(e: EventMouse) 
    {
        if (!this.interactable) return;
        this.m_pressed = true;
        this.applyState(State.PRESSED);
    }

    private onMouseUp(e: EventMouse) 
    {
        if (!this.interactable || !this.m_pressed) return;
        this.m_pressed = false;
        this.applyState(State.NORMAL);
        this.emitClick();
    }

    private applyState(state: State, instant = false) 
    {
        this.m_state = state;

        switch (this.transition) 
        {
            case Transition.COLOR:  this.applyColor(state); break;
            case Transition.SPRITE: this.applySprite(state); break;
            case Transition.SCALE:  this.applyScale(state, instant); break;
        }
    }

    private applyColor(state: State) 
    {
        if (!this.m_sprite) return;

        switch (state) 
        {
            case State.NORMAL:   this.m_sprite.color = this.normalColor; break;
            case State.HOVER:    this.m_sprite.color = this.hoverColor; break;
            case State.PRESSED:  this.m_sprite.color = this.pressedColor; break;
            case State.DISABLED: this.m_sprite.color = this.disabledColor; break;
        }
    }

    private applySprite(state: State) 
    {
        if (!this.m_sprite) return;

        switch (state) 
        {
            case State.NORMAL:   this.m_sprite.spriteFrame = this.normalSprite; break;
            case State.HOVER:    this.m_sprite.spriteFrame = this.hoverSprite; break;
            case State.PRESSED:  this.m_sprite.spriteFrame = this.pressedSprite; break;
            case State.DISABLED: this.m_sprite.spriteFrame = this.disabledSprite; break;
        }
    }

    private applyScale(state: State, instant: boolean) 
    {
        if (!this.target || !this.m_originalScale) return;

        let scale = this.m_originalScale.clone();
        if (state === State.PRESSED) 
        {
            scale.multiplyScalar(this.zoomScale);
        }

        if (instant || this.duration <= 0) 
        {
            this.target.setScale(scale);
        } 
        else 
        {
            tween(this.target).stop().to(this.duration, { scale }).start();
        }
    }

    private emitClick() 
    {
        EventHandler.emitEvents(this.clickEvents, this);
        this.node.emit(ButtonEvent.CLICK);
    }
}
