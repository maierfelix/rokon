import {
  uid
} from "../utils";

export const BATCH_MAT3_SIZE = 3 * 3;
export const BATCH_MAT4_SIZE = 4 * 4;

export const BATCH_VEC2_SIZE = 2;
export const BATCH_VEC3_SIZE = 3;
export const BATCH_VEC4_SIZE = 4;

export const BATCH_FLOAT_SIZE = 1;

export const BATCH_BUFFER_UPDATE = {
  ALPHA: 1,
  GLOW: 2,
  MODEL: 3,
  FULL: 4
};

/**
 * Batch element class
 * @class WebGLBatchElement
 */
class WebGLBatchElement {
  /**
   * A data element inside a batch
   * @param {WebGLBatch} batch
   * @param {Number} offset
   * @param {Float32Array} data
   * @constructor
   */
  constructor(batch, offset, data) {
    this.offset = 0;
    this.data = null;
    this.batch = batch;
    this.modelMatrix = null;
    this.modelAlpha = null;
    this.modelGlow = null;
    this.normalMatrix = null;
    this.updateView(offset, data);
  }
};

/**
 * When the batch data changes we need to update our batch element's data view
 * @param {Number} offset
 * @param {Float32Array} data
 */
WebGLBatchElement.prototype.updateView = function(offset, data) {
  this.data = data;
  this.offset = offset;
  this.modelAlpha = data.modelAlpha.subarray(offset, offset + BATCH_FLOAT_SIZE);
  this.modelGlow = data.modelGlow.subarray(offset, offset + BATCH_FLOAT_SIZE);
  this.modelMatrix = data.modelMatrix.subarray(offset, offset + BATCH_MAT4_SIZE);
  //this.normalMatrix = data.normalMatrix.subarray(offset, offset + BATCH_MAT4_SIZE);
};

/**
 * A basic batch class
 * @class WebGLBatch
 */
export default class WebGLBatch {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.offset = 0;
    this.size = opts.size | 0;
    this.updates = 0;
    this.renderer = opts.renderer;
    this.gl = opts.gl;
    this.data = {
      buffers: {
        alpha: null,
        glow: null,
        model: null,
        normal: null
      },
      objects: [],
      elements: [],
      modelAlpha: null,
      modelGlow: null,
      modelMatrix: null,
      normalMatrix: null
    };
    this.template = null;
    this.init();
  }
};

/**
 * Initializes batch data and buffers
 */
WebGLBatch.prototype.init = function() {
  let data = this.data;
  let size = this.size;
  let elements = data.elements;
  this.allocateData();
  this.allocateElements();
  this.allocateBuffers();
};

/**
 * Allocates memory based on the batch's size
 */
WebGLBatch.prototype.allocateData = function() {
  let data = this.data;
  let size = this.size;
  data.modelAlpha = new Float32Array(BATCH_FLOAT_SIZE * size);
  data.modelGlow = new Float32Array(BATCH_FLOAT_SIZE * size);
  data.modelMatrix = new Float32Array(BATCH_MAT4_SIZE * size);
  //data.normalMatrix = new Float32Array(BATCH_MAT4_SIZE * size);
};

/**
 * Allocates elements based on the batch's size
 */
WebGLBatch.prototype.allocateElements = function() {
  let data = this.data;
  let size = this.size;
  let elements = data.elements;
  for (let ii = 0; ii < size; ++ii) {
    elements[ii] = new WebGLBatchElement(this, ii, data);
  };
};

/**
 * Allocates GPU buffers
 */
WebGLBatch.prototype.allocateBuffers = function() {
  let gl = this.gl;
  let data = this.data;
  let buffers = data.buffers;
  buffers.alpha = gl.createBuffer();
  buffers.glow = gl.createBuffer();
  buffers.model = gl.createBuffer();
  buffers.normal = gl.createBuffer();
  this.refreshBuffers(this.size);
};

/**
 * Sends the buffer data to the GPU
 * @param {Number} length - The length of used data
 */
WebGLBatch.prototype.refreshBuffers = function(length) {
  let gl = this.gl;
  let data = this.data;
  let buffers = data.buffers;
  this.updateBuffer(buffers.alpha, data.modelAlpha, gl.ARRAY_BUFFER, gl.STATIC_DRAW, length * BATCH_FLOAT_SIZE);
  this.updateBuffer(buffers.glow, data.modelGlow, gl.ARRAY_BUFFER, gl.STATIC_DRAW, length * BATCH_FLOAT_SIZE);
  this.updateBuffer(buffers.model, data.modelMatrix, gl.ARRAY_BUFFER, gl.STATIC_DRAW, length * BATCH_MAT4_SIZE);
  //this.updateBuffer(buffers.normal, data.normalMatrix, gl.ARRAY_BUFFER, gl.STATIC_DRAW, length * BATCH_MAT4_SIZE);
};

/**
 * Update a buffer
 * @param {WebGLBuffer} buffer
 * @param {TypedArray} data
 * @param {Number} target
 * @param {Number} usage
 * @param {Number} length
 */
WebGLBatch.prototype.updateBuffer = function(buffer, data, target, usage, length) {
  let gl = this.gl;
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, usage, 0, length);
  gl.bindBuffer(target, null);
};

/**
 * Update a buffer subset
 * @param {WebGLBuffer} buffer
 * @param {TypedArray} data
 * @param {Number} target
 * @param {Number} start
 * @param {Number} length
 */
WebGLBatch.prototype.updateBufferSubset = function(buffer, data, target, start, length) {
  let gl = this.gl;
  gl.bindBuffer(target, buffer);
  gl.bufferSubData(target, start * data.BYTES_PER_ELEMENT, data, 0, length);
  gl.bindBuffer(target, null);
  this.updates++;
};

/**
 * Sets the base offset to write data into the batch buffer
 * @param {Number} offset
 */
WebGLBatch.prototype.setOffset = function(offset) {
  this.offset = offset | 0;
};

/**
 * Writes data at the current offset into the given buffer's data
 * @param {Float32Array} buffer
 * @param {Float32Array} matrix
 */
WebGLBatch.prototype.writeArray = function(buffer, data) {
  let stride = (data.length | 0);
  let offset = (this.offset * stride) | 0;
  for (let ii = 0; ii < stride; ++ii) {
    buffer[(offset + ii) | 0] = data[ii | 0];
  };
};

/**
 * Writes a number at the current offset into the given buffer's data
 * @param {Float32Array} buffer
 * @param {Number} value
 */
WebGLBatch.prototype.writeNumber = function(buffer, value) {
  let stride = 0x1;
  let offset = (this.offset * stride) | 0;
  buffer[offset] = value;
};

/**
 * Adds an object to the object batch list
 * @param {WebGLObject} object - The object to add
 */
WebGLBatch.prototype.add = function(object) {
  let data = this.data;
  let elements = data.elements;
  let objects = this.data.objects;
  objects.push(object);
  object.batchElement = elements[objects.length - 1];
  this.updateObject(object, BATCH_BUFFER_UPDATE.FULL);
};

/**
 * Removes an object from the object batch list
 * @param {WebGLObject} object - The object to remove
 */
WebGLBatch.prototype.remove = function(object) {
  let objects = this.data.objects;
  for (let ii = 0; ii < objects.length; ++ii) {
    let item = objects[ii];
    if (item === object) {
      objects.splice(ii, 1);
      item.batchElement = null;
    }
  };
};

/**
 * Sets this object as the general template to use
 * @param {WebGLObject} object
 */
WebGLBatch.prototype.useTemplate = function(object) {
  this.template = object;
};

/**
 * Updates an batched object's data in the buffer
 * @param {WebGLObject} object - The batched object which needs an buffer update
 * @param {Number} kind - What kind of update
 */
WebGLBatch.prototype.updateObject = function(object, kind) {
  let gl = this.gl;
  let buffers = this.data.buffers;
  let element = object.batchElement;
  let isFullUpdate = kind === BATCH_BUFFER_UPDATE.FULL;
  // uAlpha
  if (kind === BATCH_BUFFER_UPDATE.ALPHA || isFullUpdate) {
    let data = this.data.modelAlpha;
    let offset = (element.offset * BATCH_FLOAT_SIZE) | 0;
    this.setOffset(element.offset);
    this.writeNumber(data, object.alpha);
    let subdata = data.subarray(offset, offset + BATCH_FLOAT_SIZE);
    this.updateBufferSubset(buffers.alpha, subdata, gl.ARRAY_BUFFER, offset, BATCH_FLOAT_SIZE);
  }
  // uGlowing
  if (kind === BATCH_BUFFER_UPDATE.GLOW || isFullUpdate) {
    let data = this.data.modelGlow;
    let offset = (element.offset * BATCH_FLOAT_SIZE) | 0;
    this.setOffset(element.offset);
    this.writeNumber(data, object.glow);
    let subdata = data.subarray(offset, offset + BATCH_FLOAT_SIZE);
    this.updateBufferSubset(buffers.glow, subdata, gl.ARRAY_BUFFER, offset, BATCH_FLOAT_SIZE);
  }
  // uModelMatrix, uNormalMatrix
  if (kind === BATCH_BUFFER_UPDATE.MODEL || isFullUpdate) {
    // model
    {
      let mModel = object.getModelMatrix();
      let data = this.data.modelMatrix;
      let offset = (element.offset * BATCH_MAT4_SIZE) | 0;
      this.setOffset(element.offset);
      this.writeArray(data, mModel);
      let subdata = data.subarray(offset, offset + BATCH_MAT4_SIZE);
      this.updateBufferSubset(buffers.model, subdata, gl.ARRAY_BUFFER, offset, BATCH_MAT4_SIZE);
    }
    // normal
    /*{
      let mNormal = object.getNormalMatrix();
      let data = this.data.normalMatrix;
      let offset = (element.offset * BATCH_MAT4_SIZE) | 0;
      this.setOffset(element.offset);
      this.writeArray(data, mNormal);
      let subdata = data.subarray(offset, offset + BATCH_MAT4_SIZE);
      this.updateBufferSubset(buffers.normal, subdata, gl.ARRAY_BUFFER, offset, BATCH_MAT4_SIZE);
    }*/
  }
};

/**
 * Fills the batch's buffer data
 */
WebGLBatch.prototype.fill = function() {
  let camera = this.renderer.camera;
  let data = this.data;
  let objects = data.objects;
  let offset = 0;
  for (let ii = 0; ii < objects.length; ++ii) {
    let object = objects[ii];
    if (!camera.isObjectInView(object)) continue;
    this.setOffset(offset);
    this.writeNumber(data.modelAlpha, object.alpha);
    this.writeNumber(data.modelGlow, object.glow);
    this.writeArray(data.modelMatrix, object.getModelMatrix());
    //this.writeArray(data.normalMatrix, object.getNormalMatrix());
    offset++;
  };
  this.size = offset;
  this.refreshBuffers(offset);
};
