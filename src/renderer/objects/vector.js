import WebGLObject from "./object";

/**
 * A simple vector
 * @class Vector
 * @extends WebGLObject
 */
export default class Vector extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    super(opts);
  }
};

Vector.prototype.createMesh = function() {
  let data = this.data;
  data.vertices = new Float32Array(6);
};

/**
 * Returns the native texture
 * @return {WebGLTexture}
 */
Vector.prototype.getNativeTexture = function() {
  return this.texture.native;
};
