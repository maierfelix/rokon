import { uid } from "./utils";

/**
 * 3D vector
 * @class Vector3D
 */
export class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.uid = uid();
    this.array = new Float32Array([x, y, z]);
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    this.array[0] = x;
    this.array[1] = y;
    this.array[2] = z;
  }
  setVector(vec) {
    let vx = vec.x;
    let vy = vec.y;
    let vz = vec.z;
    this._x = vx;
    this._y = vy;
    this._z = vz;
    this.array[0] = vx;
    this.array[1] = vy;
    this.array[2] = vz;
  }
  setArray(arr) {
    let ax = arr[0];
    let ay = arr[1];
    let az = arr[2];
    this._x = ax;
    this._y = ay;
    this._z = az;
    this.array[0] = ax;
    this.array[1] = ay;
    this.array[2] = az;
  }
  toArray() {
    return this.array;
  }
  // getters
  get x() { return this._x; }
  get y() { return this._y; }
  get z() { return this._z; }
  // setters
  set x(v) { this._x = v; this.array[0] = v; }
  set y(v) { this._y = v; this.array[1] = v; }
  set z(v) { this._z = v; this.array[2] = v; }
};

/**
 * 3D vector detecting changes
 * @class MutableVector3D
 */
export class MutableVector3D extends Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    super(x, y, z);
    this.mutated = true;
  }
  set(x, y = x, z = x) {
    if (
      (this._x !== x) ||
      (this._y !== y) ||
      (this._z !== z)
    ) this.mutated = true;
    this._x = x;
    this._y = y;
    this._z = z;
    this.array[0] = x;
    this.array[1] = y;
    this.array[2] = z;
  }
  // getters
  get x() { return this._x; }
  get y() { return this._y; }
  get z() { return this._z; }
  // setters
  set x(v) { if (v !== this._x) this.mutated = true; this._x = v; this.array[0] = v; }
  set y(v) { if (v !== this._y) this.mutated = true; this._y = v; this.array[1] = v; }
  set z(v) { if (v !== this._z) this.mutated = true; this._z = v; this.array[2] = v; }
};
