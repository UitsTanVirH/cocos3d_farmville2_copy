import { _decorator, Camera, CCFloat, Component, easing, Enum, math, Node, v3, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export enum CameraType {
    STATIC,
    FOLLOW
}

@ccclass('CameraBehavior3D')
export class CameraBehavior3D extends Component {

    @property({ type: Enum(CameraType) })
    public CameraType: CameraType = CameraType.STATIC;

    @property({ type: Node, visible: function () { return this.CameraType === CameraType.FOLLOW; } })
    public NodeToFollow: Node = null;

    @property({ visible() { return this.CameraType === CameraType.FOLLOW } })
    public yaw: number = 0; // Degrees

    @property({ visible() { return this.CameraType === CameraType.FOLLOW } })
    public pitch: number = 20; // Degrees

    @property({ visible() { return this.CameraType === CameraType.FOLLOW } })
    public Radius = 5;

    @property({ visible() { return this.CameraType === CameraType.FOLLOW }, type: CCFloat })
    public EasingTime = 0.2; // 0 - 1

    public UpdateYawPitch = true;
    public UpdateRadius = true;

    private m_targetPos = new Vec3();
    private m_cameraOffset = new Vec3();
    private m_currentPos: Vec3 = new Vec3();
    private m_desiredPos: Vec3 = new Vec3();

    start() {
        if (this.CameraType === CameraType.FOLLOW && !this.NodeToFollow) {
            throw new Error("No node was provided for the camera to follow!");
        }

        this.EasingTime = math.clamp(this.EasingTime, 0, 1);
    }

    update(deltaTime: number) {
        if (!(this.CameraType === CameraType.FOLLOW) || !this.NodeToFollow) return;

        this.EasingTime = math.clamp(this.EasingTime, 0, 1);

        this.m_targetPos = this.NodeToFollow.getWorldPosition().clone();

        if (this.UpdateYawPitch) {
            const yawRad = math.toRadian(this.yaw);
            const pitchRad = math.toRadian(this.pitch);
            const x = this.Radius * Math.cos(pitchRad) * Math.sin(yawRad);
            const y = this.Radius * Math.sin(pitchRad);
            const z = this.Radius * Math.cos(pitchRad) * Math.cos(yawRad);
            this.m_cameraOffset.set(x, y, z);
        } else {
            this.m_cameraOffset = this.node.forward;
            Vec3.normalize(this.m_cameraOffset, this.m_cameraOffset);
            Vec3.multiplyScalar(this.m_cameraOffset, this.m_cameraOffset, -this.Radius);
        }

        Vec3.add(this.m_desiredPos, this.m_targetPos, this.m_cameraOffset);
        this.m_currentPos = this.node.getWorldPosition().clone();

        Vec3.lerp(this.m_currentPos, this.m_currentPos, this.m_desiredPos, this.EasingTime);
        this.node.setWorldPosition(this.m_currentPos);
        this.node.lookAt(this.m_targetPos);
    }

    public setLockedCamera(lock: boolean) {
        this.UpdateYawPitch = !lock;
    }
}
