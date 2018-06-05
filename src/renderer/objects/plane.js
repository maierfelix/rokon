import WebGLObject from "./object";

/**
 * A simple Plane
 * @class Plane
 * @extends WebGLObject
 */
export default class Plane extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
  }
};

/**
 * Create data
 */
Plane.prototype.createMesh = function() {
  let data = this.data;
  data.vertices = new Float32Array([
    -1, +1,
    -1, -1,
    +1, +1,
    +1, -1
  ]);
};
