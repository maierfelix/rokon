import {
  uid,
  loadText
} from "../../utils";

import MD5Object from "../objects/md5-object";

import MD5 from "../md5";

/**
 * A md5 file loader
 * @class MD5FileLoader
 */
export default class MD5FileLoader {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.path = opts.path;
    this.loaded = false;
  }
};

MD5FileLoader.prototype.fromPath = function(path) {
  this.path = path;
  this.loaded = false;
  return new Promise(resolve => {
    let model = new MD5.Md5Mesh();
    model.load(gl, path, () => {
      let mesh = {
        vertices: model.vertArray
      };
      let object = this.renderer.createObject(MD5Object, { useMesh: mesh });
      console.log(object);
      object.buffers.vertices = model.vertBuffer;
      object.buffers.indices = model.indexBuffer;
      this.loaded = true;
      object.model = model;
      resolve(object);
    });
  });
};
