import WebGLObject from "./object";

/**
 * A simple 2d sprite
 * @class Sprite
 * @extends WebGLObject
 */
export default class Sprite extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.isSprite = true;
  }
};

/**
 * Create sprite's data
 */
Sprite.prototype.createMesh = function() {
  let data = this.data;
  data.vertices = new Float32Array([
    -0.5, -0.5, +0.0,
    +0.5, -0.5, +0.0,
    +0.5, +0.5, +0.0,
    -0.5, +0.5, +0.0,
    -0.5, -0.5, -0.5,
    -0.5, +0.5, -0.5,
    +0.5, +0.5, -0.5,
    +0.5, -0.5, -0.5
  ]);
  data.normals = new Float32Array([
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0
  ]);
  data.uvs = new Float32Array([
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0
  ]);
  data.indices = new Uint16Array([
    0, 1, 2, 2, 3, 0,
    0, 3, 2, 2, 1, 0
  ]);
};
