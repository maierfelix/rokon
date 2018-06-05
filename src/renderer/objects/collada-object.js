import WebGLObject from "./object";

/**
 * A collada object
 * @class ColladaObject
 * @extends WebGLObject
 */
export default class ColladaObject extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.animated = !!opts.animated;
    this.rotate.x = 180;
  }
};

ColladaObject.prototype.createMesh = function(mesh) {
  let data = this.data;
  data.vertices = new Float32Array(mesh.vertices);
  data.normals = new Float32Array(mesh.normals);
  data.uvs = new Float32Array(mesh.uvs);
  data.indices = new Uint16Array(mesh.indices);
  this.createLoader();
};
