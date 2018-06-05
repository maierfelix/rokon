import {
  uid,
  loadText
} from "../../utils";

import BlenderObject from "../objects/blender-object";

import WebGLObjectLoader from "webgl-obj-loader";

/**
 * A .obj file loader
 * @class ObjectFileLoader
 */
export default class ObjectFileLoader {
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

ObjectFileLoader.prototype.fromPath = function(path) {
  this.path = path;
  this.loaded = false;
  return new Promise(resolve => {
    loadText(path).then(txt => {
      let mesh = new WebGLObjectLoader.Mesh(txt);
      let object = this.renderer.createObject(BlenderObject, { useMesh: mesh });
      resolve(object);
    });
  });
};
