import {
  uid,
  loadText,
  calculateTangents
} from "../../utils";

import ColladaObject from "../objects/collada-object";
import AnimatedObject from "../objects/animated-object";

import parseCollada from "collada-dae-parser";
import expandVertexData from "expand-vertex-data";

/**
 * A .dae file loader
 * @class ColladaFileLoader
 */
export default class ColladaFileLoader {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.path = opts.path;
    this.animated = !!opts.animated;
    this.loaded = false;
  }
};

ColladaFileLoader.prototype.fromPath = function(path) {
  this.path = path;
  this.loaded = false;
  return new Promise(resolve => {
    loadText(path).then(txt => {
      {
        let base = parseCollada(txt);
        let expanded = expandVertexData(base);
        let mesh = {
          indices: expanded.positionIndices,
          uvs: expanded.uvs,
          normals: expanded.normals,
          vertices: expanded.positions
        };
        let opts = {
          useMesh: mesh,
          animated: this.animated
        };
        if (opts.animated) opts.animation = base;
        let object = this.renderer.createObject(
          this.animated ? AnimatedObject : ColladaObject,
          opts
        );
        object.rotate.x = 180;
        resolve(object);
      }
      //let object = this.renderer.createObject(ColladaObject, { useMesh: mesh });
      //resolve(object);
    });
  });
};
