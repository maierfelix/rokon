import WebGLObject from "./object";

/**
 * A simple quad
 * @class Quad
 * @extends WebGLObject
 */
export default class Quad extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    super(opts);
  }
};

Quad.prototype.createMesh = function() {
  let data = this.data;
  data.vertices = new Float32Array([
    -1, +1,
    -1, -1,
    +1, +1,
    +1, -1
  ]);
};

/**
 * Returns the native texture
 * @return {WebGLTexture}
 */
Quad.prototype.getNativeTexture = function() {
  return this.texture.native;
};
