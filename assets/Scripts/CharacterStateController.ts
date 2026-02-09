import {
  _decorator,
  animation,
  CharacterController,
  Component,
  Node,
} from "cc";
import { State, StateManager } from "./StateManager";
import { CharacterControllerBehavior } from "./CharacterController";
const { ccclass, property } = _decorator;

export enum CharacterState {
  IDLE = "IdleState",
  RUN = "RunState",
  WALK = "WalkState",
}

class CharacterStateContext {
  public AnimationController: animation.AnimationController = null;
}

class IdleState implements State<CharacterStateContext> {
  name: string = CharacterState.IDLE;
  preEnterDelayMs: number = 0;
  postEnterDelayMs: number = 0;
  preExitDelayMs: number = 0;
  postExitDelayMs: number = 0;

  OnEnter?(context: CharacterStateContext): void | Promise<void> {
    context.AnimationController.setValue("Idle", true);
  }

  OnExit?(context: CharacterStateContext): void | Promise<void> {
    context.AnimationController.setValue("Idle", false);
  }

  OnUpdate?(context: CharacterStateContext, deltaTime: number): void {}
}

class RunState implements State<CharacterStateContext> {
  name: string = CharacterState.RUN;
  preEnterDelayMs: number = 0;
  postEnterDelayMs: number = 0;
  preExitDelayMs: number = 0;
  postExitDelayMs: number = 0;

  OnEnter?(context: CharacterStateContext): void | Promise<void> {
    context.AnimationController.setValue("Run", true);
  }

  OnExit?(context: CharacterStateContext): void | Promise<void> {
    context.AnimationController.setValue("Run", false);
  }

  OnUpdate?(context: CharacterStateContext, deltaTime: number): void {}
}

class WalkState implements State<CharacterStateContext> {
  name: string = CharacterState.WALK;
  preEnterDelayMs: number = 0;
  postEnterDelayMs: number = 0;
  preExitDelayMs: number = 0;
  postExitDelayMs: number = 0;

  OnEnter?(context: CharacterStateContext): void | Promise<void> {
    context.AnimationController.setValue("Walk", true);
  }

  OnExit?(context: CharacterStateContext): void | Promise<void> {
    context.AnimationController.setValue("Walk", false);
  }

  OnUpdate?(context: CharacterStateContext, deltaTime: number): void {}
}

@ccclass("CharacterStateController")
export class CharacterStateController extends Component {
  @property(animation.AnimationController)
  public AnimationController: animation.AnimationController = null;

  @property(CharacterControllerBehavior)
  public CharacterControllerBehavior: CharacterControllerBehavior = null;

  private m_characterStateContext: CharacterStateContext =
    new CharacterStateContext();

  private m_stateManager: StateManager<CharacterStateContext> = null;

  start() {
    this.m_characterStateContext.AnimationController = this.AnimationController;

    let idleState = new IdleState();
    let walkState = new WalkState();
    let runState = new RunState();

    this.m_stateManager = new StateManager<CharacterStateContext>(
      this.m_characterStateContext,
      (e) => {
        // console.log(`[CharacterStateTransition] ${e.from} -> ${e.to}`);
      },
    );

    this.m_stateManager.RegisterState(idleState);
    this.m_stateManager.RegisterState(walkState);
    this.m_stateManager.RegisterState(runState);

    this.m_stateManager.ChangeState(CharacterState.IDLE);
  }

  update(deltaTime: number) {
    const vel = this.CharacterControllerBehavior.GetCharacterVelocity();

    const velLength = vel.length();

    if (
      this.m_stateManager.GetCurrentStateName() !== CharacterState.RUN &&
      velLength > 0
    ) {
      this.m_stateManager.ChangeState(CharacterState.RUN);
    } else if (
      this.m_stateManager.GetCurrentStateName() !== CharacterState.IDLE &&
      velLength === 0
    ) {
      this.m_stateManager.ChangeState(CharacterState.IDLE);
    }
  }
}
