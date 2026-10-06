/**
 * Keyboard input handler with activeElement typing suppression,
 * diagonal vector normalization, and movement detection.
 */
export class Keyboard {
  keys: Record<string, boolean> = {};
  disabled: boolean = false;
  private onMoveKeyCallbacks: Array<() => void> = [];

  constructor() {
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  private isTyping(): boolean {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag === 'input' ||
      tag === 'textarea' ||
      tag === 'select' ||
      (el as HTMLElement).isContentEditable
    );
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.isTyping() || this.disabled) return;
    this.keys[e.code] = true;

    // Check if movement key was pressed to notify listeners (e.g. cancel click-to-move)
    if (
      e.code === 'KeyW' || e.code === 'KeyS' || e.code === 'KeyA' || e.code === 'KeyD' ||
      e.code === 'ArrowUp' || e.code === 'ArrowDown' || e.code === 'ArrowLeft' || e.code === 'ArrowRight'
    ) {
      for (const cb of this.onMoveKeyCallbacks) {
        cb();
      }
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private onBlur = () => {
    this.keys = {};
  };

  onMoveKeyPressed(cb: () => void) {
    this.onMoveKeyCallbacks.push(cb);
  }

  dispose() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.onMoveKeyCallbacks = [];
  }

  /**
   * Returns normalized movement vector (x: left/right, z: forward/backward).
   * Positive z = forward (W / Up), Positive x = left (A / Left).
   */
  getMoveVector(): { x: number; z: number; run: boolean; isMoving: boolean } {
    if (this.disabled || this.isTyping()) {
      return { x: 0, z: 0, run: false, isMoving: false };
    }

    let z = 0;
    let x = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) z += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) z -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x += 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x -= 1;

    const len = Math.hypot(x, z);
    if (len > 0.001) {
      x /= len;
      z /= len;
    }

    const run = !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'];
    return { x, z, run, isMoving: len > 0.001 };
  }

  get z(): number {
    return this.getMoveVector().z;
  }

  get x(): number {
    return this.getMoveVector().x;
  }

  get run(): boolean {
    return this.getMoveVector().run;
  }

  get hasActiveInput(): boolean {
    return this.getMoveVector().isMoving;
  }
}
