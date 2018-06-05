import {
  uid,
  calculateTangentsBitangents
} from "../utils";

import * as WEBGL_TYPE from "./types";

/**
 * A loader
 * @class ObjectLoader
 */
export default class ObjectLoader {
  /**
   * @param {WebGLRenderer} renderer
   * @param {WebGLObject} object
   * @constructor
   */
  constructor(renderer, object) {
    this.uid = uid();
    this.object = object;
    this.renderer = renderer;
    this.gl = this.renderer.gl;
    this.buffers = {
      vertices: null,
      normals: null,
      uvs: null,
      tangents: null,
      bitangents: null,
      indices: null
    };
    this.ready = false;
    this.load();
  }
};

/**
 * Create all buffers
 * @param {Object} data
 */
ObjectLoader.prototype.createBuffers = function(data) {
  let gl = this.gl;
  let buffers = this.buffers;
  if (data.vertices) buffers.vertices = gl.createBuffer();
  if (data.normals) buffers.normals = gl.createBuffer();
  if (data.uvs) buffers.uvs = gl.createBuffer();
  if (data.tangents) buffers.tangents = gl.createBuffer();
  if (data.bitangents) buffers.bitangents = gl.createBuffer();
  if (data.debugNormals) buffers.debugNormals = gl.createBuffer();
  if (data.indices) buffers.indices = gl.createBuffer();
};

/**
 * Load everything
 */
ObjectLoader.prototype.load = function() {
  let gl = this.gl;
  let object = this.object;
  let buffers = this.buffers;
  let data = object.data;
  // calculate other stuff
  if (data.indices) {
    let result = calculateTangentsBitangents(object);
    data.tangents = result.tangents;
    data.bitangents = result.bitangents;
    data.debugNormals = result.debugNormals;
  }
  // buffers are not created yet
  if (!this.ready) {
    this.createBuffers(data);
    this.ready = true;
  }
  if (data.vertices) this.updateBuffer(buffers.vertices, data.vertices, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  if (data.normals) this.updateBuffer(buffers.normals, data.normals, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  if (data.uvs) this.updateBuffer(buffers.uvs, data.uvs, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  if (data.tangents) this.updateBuffer(buffers.tangents, data.tangents, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  if (data.bitangents) this.updateBuffer(buffers.bitangents, data.bitangents, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  if (data.debugNormals) this.updateBuffer(buffers.debugNormals, data.debugNormals, gl.ARRAY_BUFFER, gl.STATIC_DRAW);
  if (data.indices) this.updateBuffer(buffers.indices, data.indices, gl.ELEMENT_ARRAY_BUFFER, gl.STATIC_DRAW);
};

/**
 * Update a buffer
 * @param {WebGLBuffer} buffer
 * @param {TypedArray} data
 * @param {Number} target
 * @param {Number} usage
 */
ObjectLoader.prototype.updateBuffer = function(buffer, data, target, usage) {
  let gl = this.gl;
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, usage);
  gl.bindBuffer(target, null);
};
