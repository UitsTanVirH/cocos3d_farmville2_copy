import { _decorator, Component, Node, Vec3, math, tween, Tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CompassArrow')
export class CompassArrow extends Component {
    @property(Node)
    public player: Node = null!;

    @property
    public orbitRadius: number = 2.0;

    @property
    public smoothFactor: number = 8.0;

    @property
    public arrowForwardOffset: number = 0;

    @property
    public arrowPulseScale: number = 1.15;

    @property
    public arrowPulseSpeed: number = 0.6;

    @property
    public targetPulseScale: number = 1.1;

    @property
    public targetPulseSpeed: number = 0.8;

    private m_dir = new Vec3();
    private m_playerPos = new Vec3();
    private m_targetPos = new Vec3();
    private m_arrowPos = new Vec3();
    private m_currentTween: Tween<Node> | null = null;

    private m_arrowPulseTween: Tween<Node> | null = null;
    private m_targetPulseTween: Tween<Node> | null = null;

    private m_originalArrowScale = new Vec3();
    private m_originalTargetScale = new Vec3();
    private m_lastTarget: Node | null = null;

    public target: Node | null = null;

    onLoad() {
        this.node.getScale(this.m_originalArrowScale);
    }

    update(dt: number) {
        if (!this.player) return;

        // --- Handle target switching ---
        if (this.target !== this.m_lastTarget) {
            this.OnTargetChanged();
            this.m_lastTarget = this.target;
        }

        // No target: hide arrow
        if (!this.target || !this.target.isValid) {
            this.SetVisible(false);
            return;
        }

        this.SetVisible(true);

        // Get positions
        this.player.getWorldPosition(this.m_playerPos);
        this.target.getWorldPosition(this.m_targetPos);

        // Direction on XZ plane
        this.m_dir.set(
            this.m_targetPos.x - this.m_playerPos.x,
            1,
            this.m_targetPos.z - this.m_playerPos.z
        );

        if (this.m_dir.lengthSqr() < 2) {
            this.SetVisible(false);
            return;
        }

        this.m_dir.normalize();

        // Orbit arrow around player
        Vec3.scaleAndAdd(this.m_arrowPos, this.m_playerPos, this.m_dir, this.orbitRadius);

        const currentPos = this.node.worldPosition.clone();
        Vec3.lerp(currentPos, currentPos, this.m_arrowPos, Math.min(dt * this.smoothFactor, 1));
        this.node.setWorldPosition(currentPos);

        // Rotate arrow to face target
        const angleRad = Math.atan2(this.m_dir.x, this.m_dir.z);
        const targetAngle = math.toDegree(angleRad) + this.arrowForwardOffset;
        const currentEuler = this.node.eulerAngles.clone();
        const targetEuler = new Vec3(-90, targetAngle, 0);
        Vec3.lerp(currentEuler, currentEuler, targetEuler, Math.min(dt * this.smoothFactor, 1));
        this.node.eulerAngles = currentEuler;
    }

    /** Smoothly show or hide the arrow */
    public SetVisible(visible: boolean) {
        const targetScale = visible ? 1 : 0;
        if (this.node.scale.x === targetScale) return;

        tween(this.node)
            .to(0.15, { scale: new Vec3(targetScale, targetScale, targetScale) }, { easing: 'quadOut' })
            .start();
    }

    /** Called whenever the target changes */
    private OnTargetChanged() {
        // Stop previous pulsation
        if (this.m_targetPulseTween) {
            this.m_targetPulseTween.stop();
            this.m_targetPulseTween = null;
        }

        // Restore previous target scale
        if (this.m_lastTarget && this.m_originalTargetScale) {
            tween(this.m_lastTarget)
                .to(0.2, { scale: this.m_originalTargetScale }, { easing: 'quadOut' })
                .start();
        }

        // Start new target pulsation
        if (this.target) {
            this.m_originalTargetScale = this.target.scale.clone();
            this.StartTargetPulse();
        } else {
            this.StopPulsating();
        }
    }

    /** Starts pulsating effects for both arrow and current target */
    public StartPulsating() {
        this.StartArrowPulse();
        this.StartTargetPulse();
    }

    /** Stops pulsating and restores original scales */
    public StopPulsating() {
        if (this.m_arrowPulseTween) {
            this.m_arrowPulseTween.stop();
            this.m_arrowPulseTween = null;
            tween(this.node)
                .to(0.2, { scale: this.m_originalArrowScale }, { easing: 'quadOut' })
                .start();
        }

        if (this.m_targetPulseTween && this.target) {
            this.m_targetPulseTween.stop();
            this.m_targetPulseTween = null;
            tween(this.target)
                .to(0.2, { scale: this.m_originalTargetScale }, { easing: 'quadOut' })
                .start();
        }
    }

    private StartArrowPulse() {
        if (this.m_arrowPulseTween) return;

        const baseScale = this.m_originalArrowScale.clone();
        const up = baseScale.clone().multiplyScalar(this.arrowPulseScale);

        this.m_arrowPulseTween = tween(this.node)
            .repeatForever(
                tween()
                    .to(this.arrowPulseSpeed, { scale: up }, { easing: 'quadInOut' })
                    .to(this.arrowPulseSpeed, { scale: baseScale }, { easing: 'quadInOut' })
            )
            .start();
    }

    private StartTargetPulse() {
        if (!this.target || this.m_targetPulseTween) return;

        const baseScale = this.target.scale.clone();
        const up = baseScale.clone().multiplyScalar(this.targetPulseScale);

        this.m_targetPulseTween = tween(this.target)
            .repeatForever(
                tween()
                    .to(this.targetPulseSpeed, { scale: up }, { easing: 'quadInOut' })
                    .to(this.targetPulseSpeed, { scale: baseScale }, { easing: 'quadInOut' })
            )
            .start();
    }
}
