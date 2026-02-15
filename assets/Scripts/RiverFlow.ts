import { _decorator, Component, MeshRenderer, Vec4, Material, renderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('RiverMover')
export class RiverMover extends Component {

    @property
    speedX: number = 0.5;

    @property
    speedY: number = 0.0;

    @property
    tilingScale: number = 10; 

    private _material: Material | null = null;
    private _pass: renderer.Pass | null = null;
    private _handle: number = 0;
    
    private _offsetX: number = 0;
    private _offsetY: number = 0;

    start() {
        const meshRenderer = this.getComponent(MeshRenderer);
        if (meshRenderer) {
            this._material = meshRenderer.material;
            
            if (this._material && this._material.passes.length > 0) {
                this._pass = this._material.passes[0];


                this._handle = this._pass.getHandle('mainTiling_Offset');
                
                if (!this._handle) {
                    this._handle = this._pass.getHandle('tilingOffset');
                }

                if (this._handle) {
                     console.log("RiverMover: Successfully connected to GPU Handle.");
                } else {
                    console.error("RiverMover: Could not find Tiling handle. Check shader.");
                }
            }
        } else {
            console.error("RiverMover: No MeshRenderer found on this node.");
        }
    }

    update(deltaTime: number) {
        if (this._pass && this._handle) {
            this._offsetX += this.speedX * deltaTime;
            this._offsetY += this.speedY * deltaTime;

            if (this._offsetX > 1) this._offsetX -= 1;
            if (this._offsetY > 1) this._offsetY -= 1;

            this._pass.setUniform(this._handle, new Vec4(
                this.tilingScale, 
                this.tilingScale, 
                this._offsetX,    
                this._offsetY     
            ));
        }
    }
}