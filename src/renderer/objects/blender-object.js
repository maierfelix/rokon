import WebGLObject from "./object";

/**
 * A blender object
 * @class BlenderObject
 * @extends WebGLObject
 */
export default class BlenderObject extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
  }
};

BlenderObject.prototype.createMesh = function(mesh) {
  let data = this.data;
  data.vertices = new Float32Array(mesh.vertices);
  data.normals = new Float32Array(mesh.vertexNormals);
  data.uvs = new Float32Array(mesh.textures);
  data.indices = new Uint16Array(mesh.indices);
  this.createLoader();
};
