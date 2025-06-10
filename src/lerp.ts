import { clamp, sum } from "@petit-kit/utils";

class LerpWithInertia {
  private _current: number;
  private _target: number;
  private _lerp: number;
  private _originLerp: number;
  private _bounds = { start: 0, end: 0 };
  private _inertia = 0;
  private _values: number[] = [];

  constructor(start: number, lerp = 0.25) {
    this._current = start;
    this._target = start;
    this._lerp = lerp;
    this._originLerp = lerp;
  }
  shouldTick() {
    const diff = this._current - (this._target + this._inertia);
    return Math.abs(diff) > 0.1;
  }
  setCurrent(current: number) {
    this._current = current;
  }
  setBounds(start: number, end: number) {
    this._bounds = { start, end };
    this._current = clamp(this._bounds.start, this._current, this._bounds.end);
    this._target = clamp(this._bounds.start, this._target, this._bounds.end);
  }
  setTarget(target: number, lerp = this._originLerp) {
    this._target = clamp(this._bounds.start, target, this._bounds.end);
    this._lerp = lerp;
  }
  setDelta(delta: number, lerp = this._originLerp) {
    this.setTarget(this._target + delta, lerp);
  }
  tick() {
    this._inertia *= 0.955;
    this._target += this._inertia;
    this._current += (this._target - this._current) * this._lerp;
    this._current = clamp(this._bounds.start, this._current, this._bounds.end);
    return this._current;
  }
  resetInertia() {
    this._inertia = 0;
    this._values = [];
  }
  incrementInertia(value: number) {
    this._values.push(value);
    if (this._values.length > 5) this._values.shift();
  }
  computeInertia() {
    this._inertia = this._values.length
      ? sum(this._values) / this._values.length
      : 0;
  }
  getTarget() {
    return this._target;
  }
  getCurrent() {
    return this._current;
  }
  getBounds() {
    return this._bounds;
  }
  getProgress() {
    return this._current / (this._bounds.end - this._bounds.start) || 0;
  }
}

export default LerpWithInertia;
