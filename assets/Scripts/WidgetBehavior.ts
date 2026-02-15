import { _decorator, Component, Node, UITransform, Vec3, Size, view, ccenum} from 'cc';

const { ccclass, property, executeInEditMode } = _decorator;

export enum AlignMode 
{
    ONCE = 0,
    ALWAYS = 1,
    ON_WINDOW_RESIZE = 2,
}

ccenum(AlignMode);

@ccclass('WidgetBehavior')
@executeInEditMode
export class WidgetBehavior extends Component 
{

    @property({ type: Node })
    public target: Node | null = null;

    @property({ group: { name: 'Horizontal', id: 'h' } })
    public isAlignLeft = false;

    @property({ group: { name: 'Horizontal', id: 'h' }, visible(this: WidgetBehavior) { return this.isAlignLeft; } })
    public left = 0;

    @property({ group: { name: 'Horizontal', id: 'h'} })
    public isAlignRight = false;

    @property({ group: { name: 'Horizontal', id: 'h' }, visible(this: WidgetBehavior) { return this.isAlignRight; } })
    public right = 0;

    @property({ group: { name: 'Horizontal', id: 'h' } })
    public isAlignHorizontalCenter = false;

    @property({ group: { name: 'Horizontal', id: 'h' }, visible(this: WidgetBehavior) { return this.isAlignHorizontalCenter; } })
    public horizontalCenter = 0;

    @property({ group: { name: 'Horizontal', id: 'h' } })
    public isAbsoluteLeft = true;

    @property({ group: { name: 'Horizontal', id: 'h' } })
    public isAbsoluteRight = true;

    @property({ group: { name: 'Horizontal', id: 'h' } })
    public isAbsoluteHorizontalCenter = true;

    @property({ group: { name: 'Vertical', id: 'v' } })
    public isAlignTop = false;

    @property({ group: { name: 'Vertical', id: 'v' }, visible(this: WidgetBehavior) { return this.isAlignTop; } })
    public top = 0;

    @property({ group: { name: 'Vertical', id: 'v' } })
    public isAlignBottom = false;

    @property({ group: { name: 'Vertical', id: 'v' }, visible(this: WidgetBehavior) { return this.isAlignBottom; } })
    public bottom = 0;

    @property({ group: { name: 'Vertical', id: 'v' } })
    public isAlignVerticalCenter = false;

    @property({ group: { name: 'Vertical', id: 'v' }, visible(this: WidgetBehavior) { return this.isAlignVerticalCenter; } })
    public verticalCenter = 0;

    @property({ group: { name: 'Vertical', id: 'v' } })
    public isAbsoluteTop = true;

    @property({ group: { name: 'Vertical', id: 'v' } })
    public isAbsoluteBottom = true;

    @property({ group: { name: 'Vertical', id: 'v' } })
    public isAbsoluteVerticalCenter = true;

    @property({ type: AlignMode })
    public alignMode: AlignMode = AlignMode.ON_WINDOW_RESIZE;


    private m_dirty = true;


    onEnable () 
    {
        this.m_dirty = true;

        if (this.alignMode === AlignMode.ON_WINDOW_RESIZE) 
        {
            view.on('canvas-resize', this.m_markDirty, this);
        }
    }

    onDisable () 
    {
        view.off('canvas-resize', this.m_markDirty, this);
    }

    update () 
    {
        if (this.alignMode === AlignMode.ALWAYS && this.m_dirty) 
        {
            this.updateAlignment();
        }
    }

    public updateAlignment () 
    {
        this.m_dirty = false;

        const target = this.target || this.node.parent;
        if (!target) return;

        const targetUI = target.getComponent(UITransform);
        const selfUI = this.node.getComponent(UITransform);
        if (!targetUI || !selfUI) return;

        const parentSize = targetUI.contentSize;
        const parentAnchor = targetUI.anchorPoint;
        const selfSize = selfUI.contentSize;
        const selfAnchor = selfUI.anchorPoint;

        const pos = this.node.position.clone();

        if (this.isAlignLeft) 
        {
            const offset = this.isAbsoluteLeft ? this.left : parentSize.width * this.left;

            pos.x = -parentSize.width * parentAnchor.x + selfSize.width * selfAnchor.x + offset;
        }

        if (this.isAlignRight) 
        {
            const offset = this.isAbsoluteRight ? this.right : parentSize.width * this.right;

            pos.x = parentSize.width * (1 - parentAnchor.x) - selfSize.width * (1 - selfAnchor.x) - offset;
        }

        if (this.isAlignLeft && this.isAlignRight) 
        {
            const left = this.isAbsoluteLeft ? this.left : parentSize.width * this.left;
            const right = this.isAbsoluteRight ? this.right : parentSize.width * this.right;

            const width = parentSize.width - left - right;

            selfUI.setContentSize(width, selfSize.height);
        }

        if (this.isAlignHorizontalCenter) 
        {
            const offset = this.isAbsoluteHorizontalCenter ? this.horizontalCenter : parentSize.width * this.horizontalCenter;

            pos.x = offset;
        }

        if (this.isAlignTop) 
        {
            const offset = this.isAbsoluteTop ? this.top : parentSize.height * this.top;

            pos.y = parentSize.height * (1 - parentAnchor.y) - selfSize.height * (1 - selfAnchor.y) - offset;
        }

        if (this.isAlignBottom) 
        {
            const offset = this.isAbsoluteBottom ? this.bottom : parentSize.height * this.bottom;

            pos.y = -parentSize.height * parentAnchor.y + selfSize.height * selfAnchor.y + offset;
        }

        if (this.isAlignTop && this.isAlignBottom) 
        {
            const top = this.isAbsoluteTop ? this.top : parentSize.height * this.top;
            const bottom = this.isAbsoluteBottom ? this.bottom : parentSize.height * this.bottom;

            const height = parentSize.height - top - bottom;

            selfUI.setContentSize(selfSize.width, height);
        }

        if (this.isAlignVerticalCenter) 
        {
            const offset = this.isAbsoluteVerticalCenter ? this.verticalCenter : parentSize.height * this.verticalCenter;

            pos.y = offset;
        }

        this.node.setPosition(pos);
    }

    private m_markDirty () 
    {
        this.m_dirty = true;

        if (this.alignMode !== AlignMode.ONCE) 
        {
            this.updateAlignment();
        }
    }
}
