(function () {
'use strict';

let uiid = 0;

/**
 * Returns a unique number
 * @return {Number}
 */
function uid() {
  return uiid++;
}

/**
 * Loads and resolves a text
 * @param {String} path - Path to the text
 * @return {Promise}
 */
function loadText(path) {
  return new Promise(resolve => {
    fetch(path)
    .then(resp => resp.text())
    .then(resolve);
  });
}

/**
 * Loads and resolves a binary file
 * @param {String} path - Path to the text
 * @return {Promise}
 */


/**
 * Loads and resolves an image
 * @param {String} path - Path to the image
 * @return {Promise}
 */
function loadImage(path) {
  return new Promise(resolve => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.src = path;
  });
}

/**
 * Loads an image and resolves it as a canvas
 * @param {String} path - Path to the image
 * @return {Promise}
 */


/**
 * Creates a canvas with the given dimensions
 * @param {Number} width
 * @param {Number} height
 * @return {Canvas2DRenderingContext}
 */
function createCanvasBuffer(width, height) {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");
  return ctx;
}

/**
 * Indicates if a number is power of two
 * @param {Number} v
 * @return {Boolean}
 */
function isPowerOf2(v) {
  return (v & (v - 1)) === 0;
}

/**
 * Converts radians to degrees
 * @param {Number} r
 * @return {Number}
 */


/**
 * Converts degrees to radians
 * @param {Number} d
 * @return {Number}
 */


/**
 * Clamps number between min, max
 * @param {Number} n
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

/**
 * Max safe integer
 */
const MAX_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Creates a new transformation matrix
 * @param {Float32Array} translation
 * @param {Float32Array} rotation
 * @param {Float32Array} scale
 * @return {Float32Array}
 */


/**
 * Returns the binary data representation of an image
 * @param {HTMLImageElement}
 * @return {Uint8Array}
 */
function getImageBinaryData(img) {
  let width = img.width;
  let height = img.height;
  let ctx = createCanvasBuffer(width, height);
  ctx.drawImage(
    img,
    0, 0
  );
  let data = ctx.getImageData(0, 0, width, height).data;
  return new Uint8Array(data);
}

/**
 * @param {Array} p1
 * @param {Array} p2
 * @param {Array} p3
 * @param {Array} pos
 * @return {Number}
 */
function baryCentric(p1, p2, p3, pos) {
  let det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
  let l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
  let l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
  let l3 = 1.0 - l1 - l2;
  return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
}

/**
 * Calculates the tangents and bitangents of an object
 * @param {WebGLObject} obj
 * @return {Object} tangents, bitangents
 */
function calculateTangentsBitangents(obj) {
  let data = obj.data;
  let uvs = data.uvs;
  let normals = data.normals;
  let indices = data.indices;
  let vertices = data.vertices;

  let tangents = new Float32Array(vertices.length);
  let bitangents = new Float32Array(vertices.length);
  for (let ii = 0; ii < indices.length; ii += 3) {
    let i0 = indices[ii + 0];
    let i1 = indices[ii + 1];
    let i2 = indices[ii + 2];

    let x_v0 = vertices[i0 * 3 + 0];
    let y_v0 = vertices[i0 * 3 + 1];
    let z_v0 = vertices[i0 * 3 + 2];

    let x_uv0 = uvs[i0 * 2 + 0];
    let y_uv0 = uvs[i0 * 2 + 1];

    let x_v1 = vertices[i1 * 3 + 0];
    let y_v1 = vertices[i1 * 3 + 1];
    let z_v1 = vertices[i1 * 3 + 2];

    let x_uv1 = uvs[i1 * 2 + 0];
    let y_uv1 = uvs[i1 * 2 + 1];

    let x_v2 = vertices[i2 * 3 + 0];
    let y_v2 = vertices[i2 * 3 + 1];
    let z_v2 = vertices[i2 * 3 + 2];

    let x_uv2 = uvs[i2 * 2 + 0];
    let y_uv2 = uvs[i2 * 2 + 1];

    let x_deltaPos1 = x_v1 - x_v0;
    let y_deltaPos1 = y_v1 - y_v0;
    let z_deltaPos1 = z_v1 - z_v0;

    let x_deltaPos2 = x_v2 - x_v0;
    let y_deltaPos2 = y_v2 - y_v0;
    let z_deltaPos2 = z_v2 - z_v0;

    let x_uvDeltaPos1 = x_uv1 - x_uv0;
    let y_uvDeltaPos1 = y_uv1 - y_uv0;

    let x_uvDeltaPos2 = x_uv2 - x_uv0;
    let y_uvDeltaPos2 = y_uv2 - y_uv0;

    let rInv = x_uvDeltaPos1 * y_uvDeltaPos2 - y_uvDeltaPos1 * x_uvDeltaPos2;
    let r = 1.0 / (Math.abs(rInv < 0.0001) ? 1.0 : rInv);

    // tangent
    let x_tangent = (x_deltaPos1 * y_uvDeltaPos2 - x_deltaPos2 * y_uvDeltaPos1) * r;
    let y_tangent = (y_deltaPos1 * y_uvDeltaPos2 - y_deltaPos2 * y_uvDeltaPos1) * r;
    let z_tangent = (z_deltaPos1 * y_uvDeltaPos2 - z_deltaPos2 * y_uvDeltaPos1) * r;

    // bitangent
    let x_bitangent = (x_deltaPos2 * x_uvDeltaPos1 - x_deltaPos1 * x_uvDeltaPos2) * r;
    let y_bitangent = (y_deltaPos2 * x_uvDeltaPos1 - y_deltaPos1 * x_uvDeltaPos2) * r;
    let z_bitangent = (z_deltaPos2 * x_uvDeltaPos1 - z_deltaPos1 * x_uvDeltaPos2) * r;

    // Gram-Schmidt orthogonalize
    //t = glm::normalize(t - n * glm:: dot(n, t));
    let x_n0 = normals[i0 * 3 + 0];
    let y_n0 = normals[i0 * 3 + 1];
    let z_n0 = normals[i0 * 3 + 2];

    let x_n1 = normals[i1 * 3 + 0];
    let y_n1 = normals[i1 * 3 + 1];
    let z_n1 = normals[i1 * 3 + 2];

    let x_n2 = normals[i2 * 3 + 0];
    let y_n2 = normals[i2 * 3 + 1];
    let z_n2 = normals[i2 * 3 + 2];

    // tangent
    let n0_dot_t = x_tangent * x_n0 + y_tangent * y_n0 + z_tangent * z_n0;
    let n1_dot_t = x_tangent * x_n1 + y_tangent * y_n1 + z_tangent * z_n1;
    let n2_dot_t = x_tangent * x_n2 + y_tangent * y_n2 + z_tangent * z_n2;

    let x_resTangent0 = x_tangent - x_n0 * n0_dot_t;
    let y_resTangent0 = y_tangent - y_n0 * n0_dot_t;
    let z_resTangent0 = z_tangent - z_n0 * n0_dot_t;

    let x_resTangent1 = x_tangent - x_n1 * n1_dot_t;
    let y_resTangent1 = y_tangent - y_n1 * n1_dot_t;
    let z_resTangent1 = z_tangent - z_n1 * n1_dot_t;

    let x_resTangent2 = x_tangent - x_n2 * n2_dot_t;
    let y_resTangent2 = y_tangent - y_n2 * n2_dot_t;
    let z_resTangent2 = z_tangent - z_n2 * n2_dot_t;

    let magTangent0 = Math.sqrt(
      x_resTangent0 * x_resTangent0 + y_resTangent0 * y_resTangent0 + z_resTangent0 * z_resTangent0
    );
    let magTangent1 = Math.sqrt(
      x_resTangent1 * x_resTangent1 + y_resTangent1 * y_resTangent1 + z_resTangent1 * z_resTangent1
    );
    let magTangent2 = Math.sqrt(
      x_resTangent2 * x_resTangent2 + y_resTangent2 * y_resTangent2 + z_resTangent2 * z_resTangent2
    );

    // bitangent
    let n0_dot_bt = x_bitangent * x_n0 + y_bitangent * y_n0 + z_bitangent * z_n0;
    let n1_dot_bt = x_bitangent * x_n1 + y_bitangent * y_n1 + z_bitangent * z_n1;
    let n2_dot_bt = x_bitangent * x_n2 + y_bitangent * y_n2 + z_bitangent * z_n2;

    let x_resBitangent0 = x_bitangent - x_n0 * n0_dot_bt;
    let y_resBitangent0 = y_bitangent - y_n0 * n0_dot_bt;
    let z_resBitangent0 = z_bitangent - z_n0 * n0_dot_bt;

    let x_resBitangent1 = x_bitangent - x_n1 * n1_dot_bt;
    let y_resBitangent1 = y_bitangent - y_n1 * n1_dot_bt;
    let z_resBitangent1 = z_bitangent - z_n1 * n1_dot_bt;

    let x_resBitangent2 = x_bitangent - x_n2 * n2_dot_bt;
    let y_resBitangent2 = y_bitangent - y_n2 * n2_dot_bt;
    let z_resBitangent2 = z_bitangent - z_n2 * n2_dot_bt;

    let magBitangent0 = Math.sqrt(
      x_resBitangent0 * x_resBitangent0 +
      y_resBitangent0 * y_resBitangent0 +
      z_resBitangent0 * z_resBitangent0
    );
    let magBitangent1 = Math.sqrt(
      x_resBitangent1 * x_resBitangent1 +
      y_resBitangent1 * y_resBitangent1 +
      z_resBitangent1 * z_resBitangent1
    );
    let magBitangent2 = Math.sqrt(
      x_resBitangent2 * x_resBitangent2 +
      y_resBitangent2 * y_resBitangent2 +
      z_resBitangent2 * z_resBitangent2
    );

    tangents[i0 * 3 + 0] += x_resTangent0 / magTangent0;
    tangents[i0 * 3 + 1] += y_resTangent0 / magTangent0;
    tangents[i0 * 3 + 2] += z_resTangent0 / magTangent0;

    tangents[i1 * 3 + 0] += x_resTangent1 / magTangent1;
    tangents[i1 * 3 + 1] += y_resTangent1 / magTangent1;
    tangents[i1 * 3 + 2] += z_resTangent1 / magTangent1;

    tangents[i2 * 3 + 0] += x_resTangent2 / magTangent2;
    tangents[i2 * 3 + 1] += y_resTangent2 / magTangent2;
    tangents[i2 * 3 + 2] += z_resTangent2 / magTangent2;

    bitangents[i0 * 3 + 0] += x_resBitangent0 / magBitangent0;
    bitangents[i0 * 3 + 1] += y_resBitangent0 / magBitangent0;
    bitangents[i0 * 3 + 2] += z_resBitangent0 / magBitangent0;

    bitangents[i1 * 3 + 0] += x_resBitangent1 / magBitangent1;
    bitangents[i1 * 3 + 1] += y_resBitangent1 / magBitangent1;
    bitangents[i1 * 3 + 2] += z_resBitangent1 / magBitangent1;

    bitangents[i2 * 3 + 0] += x_resBitangent2 / magBitangent2;
    bitangents[i2 * 3 + 1] += y_resBitangent2 / magBitangent2;
    bitangents[i2 * 3 + 2] += z_resBitangent2 / magBitangent2;
  }

  let dataIndex = 0;
  let debugNormals = new Float32Array(vertices.length * 2);
  for (let ii = 0; ii < vertices.length; ii += 3) {
    let v0 = vertices[ii + 0];
    let v1 = vertices[ii + 1];
    let v2 = vertices[ii + 2];
    let n0 = normals[ii + 0];
    let n1 = normals[ii + 1];
    let n2 = normals[ii + 2];
    debugNormals[dataIndex + 0] = v0;
    debugNormals[dataIndex + 1] = v1;
    debugNormals[dataIndex + 2] = v2;
    debugNormals[dataIndex + 3] = v0 + n0;
    debugNormals[dataIndex + 4] = v1 + n1;
    debugNormals[dataIndex + 5] = v2 + n2;
    dataIndex += 6;
  }

  return { tangents, bitangents, debugNormals };
}

/**
 * @param {Class} cls
 * @param {Array} prot
 */
var extend = function(cls, prot) {
  for (let key in prot) {
    if (prot[key] instanceof Function) {
      if (cls.prototype[key] instanceof Function) {
        console.log(`Warning: Overwriting ${cls.name}.prototype.${key}`);
      }
      cls.prototype[key] = prot[key];
    }
  }
};

let idx = 0;

const UNKNOWN = ++idx;
const BOOL = ++idx;
const FLOAT = ++idx;

const VEC_2 = ++idx;
const VEC_3 = ++idx;
const VEC_4 = ++idx;

const I_VEC_2 = ++idx;
const I_VEC_3 = ++idx;
const I_VEC_4 = ++idx;

const MAT_3 = ++idx;
const MAT_4 = ++idx;

const UNIFORM = ++idx;
const ATTRIBUTE = ++idx;
const SAMPLER_2D = ++idx;
const SAMPLER_CUBE = ++idx;

/**
 * A loader
 * @class ObjectLoader
 */
class ObjectLoader {
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
}

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

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var objectReflector = createCommonjsModule(function (module, exports) {
(function (global, factory) {
	module.exports = factory();
}(commonjsGlobal, (function () { 'use strict';

var PREFIX = "__$";

/**
 * Main class
 * @class ObjectReflector
 */
var ObjectReflector = function ObjectReflector(opts) {
  if ( opts === void 0 ) opts = {};

  this.object = null;
  this.children = [];
  this.properties = [];
  this.processOptions(opts);
};

/**
 * Process the passed in options
 * Options:
 * - object: The target parent object
 * - *properties: The properties to link children to
 * - *enableChildReflection: Allows linked children to change their parent's linked properties
 * @param {Object} opts
 */
ObjectReflector.prototype.processOptions = function(opts) {
  if (!opts.hasOwnProperty("object")) {
    throw new Error("Expected target object but got nothing");
  }
  if (opts.object === null) {
    throw new Error("Invalid type for object definition! Expect Object but got null");
  }
  if (typeof opts.object !== "object") {
    throw new Error(("Invalid type for object definition! Expect Object but got " + (typeof object)));
  }
  this.object = opts.object;
  this.enableChildReflection = opts.enableChildReflection;
  if (opts.hasOwnProperty("properties")) { this.linkProperties(opts.properties); }
};

/**
 * Attaches the given properties to the parent object
 * @param {Array} properties - The properties to link
 * @return {ObjectReflector}
 */
ObjectReflector.prototype.linkProperties = function(properties) {
  if (!Array.isArray(properties)) {
    throw new Error(("Invalid type for property definitions! Expected Array but got " + (typeof properties)));
  }
  this.properties = properties;
  if (this.properties.length) { this.createObjectPropertyLinks(this.object); }
  return this;
};

/**
 * Clears everything
 * @public
 */
ObjectReflector.prototype.clear = function() {
  // clear child reflections
  if (this.enableChildReflection) { this.clearChildReflections(); }
  // clear parent reflections
  this.clearParentReflection();
  this.children = [];
};

/**
 * Clears the parent reflection
 */
ObjectReflector.prototype.clearParentReflection = function() {
  var this$1 = this;

  var object = this.object;
  var properties = this.properties;
  for (var ii = 0; ii < properties.length; ++ii) {
    var property = properties[ii];
    this$1.clearReflectedObjectProperty(object, property, true);
    this$1.clearReflectedObjectProperty(object, PREFIX + property, false);
  }
};

/**
 * Clears all reflected children
 */
ObjectReflector.prototype.clearChildReflections = function() {
  var this$1 = this;

  var children = this.children;
  for (var ii = 0; ii < children.length; ++ii) {
    var child = children[ii];
    this$1.unreflectChild(child);
  }
};

/**
 * Deletes the reflection properties of an reflected object
 * @param {Object} object - The object to unreflect
 * @param {String} property - The property to unreflect 
 * @param {Boolean} backup - Backup and restore the original value afterwards
 */
ObjectReflector.prototype.clearReflectedObjectProperty = function(object, property, backup) {
  if ( backup === void 0 ) backup = false;

  var original = object[property];
  if (object.hasOwnProperty(property)) {
    Reflect.deleteProperty(object, property);
  }
  if (backup) { object[property] = original; }
};

/**
 * @param {Object} child - The target child to unreflect
 * @public
 */
ObjectReflector.prototype.unreflectChild = function(child) {
  var this$1 = this;

  var properties = this.properties;
  for (var ii = 0; ii < properties.length; ++ii) {
    var property = properties[ii];
    this$1.clearReflectedObjectProperty(child, property, true);
  }
  var index = this.getChildIndexByChild(child);
  if (index > -1) { this.children.splice(index, 1); }
};

/**
 * Let the user create a link from object A to object B
 * @param {Object} child - The child to link
 * @public
 */
ObjectReflector.prototype.createReflection = function(child) {
  if (!this.isChildRegistered(child)) {
    this.registerChild(child);
    this.synchronizeChildState(child);
    if (this.enableChildReflection) { this.createChildReflection(child); }
  }
};

/**
 * Creates reflection property links on a child
 * @param {Object} child - The child to reflect
 */
ObjectReflector.prototype.createChildReflection = function(child) {
  var parent = this.object;
  var properties = this.properties;
  var loop = function ( ii ) {
    var property = properties[ii];
    Object.defineProperty(child, property, {
      enumerable: false,
      configurable: true,
      get: function () { return parent[property]; },
      set: function (value) { return parent[PREFIX + property] = value; }
    });
  };

  for (var ii = 0; ii < properties.length; ++ii) loop( ii );
};

/**
 * Enables linking of the parent object's given properties
 * @param {Object} parent - The parent object to link
 */
ObjectReflector.prototype.createObjectPropertyLinks = function(parent) {
  var this$1 = this;

  var properties = this.properties;
  var loop = function ( ii ) {
    var property = properties[ii];
    Object.defineProperty(parent, PREFIX + property, {
      writable: true,
      enumerable: false,
      configurable: true,
      value: parent[property]
    });
    Object.defineProperty(parent, property, {
      get: function () { return parent[PREFIX + property]; },
      set: function (value) { return this$1.updateLinkedChildrenPropertyValues(property, value); }
    });
  };

  for (var ii = 0; ii < properties.length; ++ii) loop( ii );
};

/**
 * Registers a child object into the linker
 * @param {Object} child - The child to register
 */
ObjectReflector.prototype.registerChild = function(child) {
  this.children.push(child);
};

/**
 * Checks if a child is already registered into the linker
 * @param {Object} child - The child to check
 * @return {Boolean}
 */
ObjectReflector.prototype.isChildRegistered = function(child) {
  return this.getChildIndexByChild(child) > -1;
};

/**
 * Tries to fetch a child from the registered childrens
 * @param {Object} target - The target child to search for
 * @return {Number} The target child's index
 */
ObjectReflector.prototype.getChildIndexByChild = function(target) {
  var children = this.children;
  for (var ii = 0; ii < children.length; ++ii) {
    var child = children[ii];
    if (child === target) { return ii; }
  }
  return -1;
};

/**
 * Synchronizes the child's state with the parent's state
 * @param {Object} child - The target child
 */
ObjectReflector.prototype.synchronizeChildState = function(child) {
  var parent = this.object;
  var properties = this.properties;
  for (var ii = 0; ii < properties.length; ++ii) {
    var property = properties[ii];
    child[property] = parent[property];
  }
};

/**
 * Updates the linked property values of all children
 * @param {String} property - The property to update
 * @param {*} value - The value to update with
 * @return {*} The updated value
 */
ObjectReflector.prototype.updateLinkedChildrenPropertyValues = function(property, value) {
  this.object[PREFIX + property] = value;
  var children = this.children;
  for (var ii = 0; ii < children.length; ++ii) {
    var child = children[ii];
    child[property] = value;
  }
  return value;
};

return ObjectReflector;

})));
});

/**
 * Bounding info
 * @class BoundingInfo
 */
class BoundingInfo {
  /**
   * @param {Boolean} scale
   * @param {Boolean} rotate
   * @param {Boolean} translate
   * @constructor
   */
  constructor(scale, rotate, translate) {
    this.uid = uid();
    this.min = vec3.create();
    this.max = vec3.create();
    this.size = vec3.create();
    this.center = vec3.create();
    this.radius = 0;
    this.updates = 0;
    this.helpers = {
      scale: vec3.create(),
      translate: vec3.create(),
      vertex: vec4.create(),
      matrix: mat4.create()
    };
    this.settings = {
      scale: scale,
      rotate: rotate,
      translate: translate
    };
  }
}

/**
 * Box-based bounding
 * @class BoundingBox
 */
class BoundingBox {
  /**
   * @param {WebGLObject} object
   * @constructor
   */
  constructor(object) {
    this.uid = uid();
    this.object = object;
    this.local = new BoundingInfo(false, false, false);
    this.world = new BoundingInfo(true, true, true);
    // auto calculate local boundings
    this.update(this.local);
  }
}

/**
 * Updates the boundings
 * @param {BoundingInfo} space
 * @param {Object} settings
 */
BoundingBox.prototype.update = function(space) {
  let object = this.object;
  let min = space.min;
  let max = space.max;
  let size = space.size;
  let center = space.center;
  let helpers = space.helpers;
  let spaceSettings = space.settings;
  let isWorldSpace = (space === this.world);
  let vertices = object.data.vertices;
  let length = (vertices.length / 3) | 0;
  let vertex = helpers.vertex;
  let mm = MAX_INTEGER;
  // we can easily transform local->world space
  if (isWorldSpace && (this.local.updates > 0)) {
    this.updateWorldSpace();
  // fetch local center, min, max one time
  } else {
    // reset
    vec3.set(min, +mm, +mm, +mm);
    vec3.set(max, -mm, -mm, -mm);
    vec4.set(vertex, 0, 0, 0, 0);
    // loop vertices, apply transformations, get min/max
    for (let ii = 0; ii < length; ++ii) {
      let index = (ii * 3) | 0;
      vec4.set(
        vertex,
        vertices[index + 0],
        vertices[index + 1],
        vertices[index + 2],
        1.0
      );
      this.applyTransformation(vertex, space, spaceSettings);
      let x = vertex[0];
      let y = vertex[1];
      let z = vertex[2];
      // min
      if (x < min[0]) min[0] = x;
      if (y < min[1]) min[1] = y;
      if (z < min[2]) min[2] = z;
      // max
      if (x > max[0]) max[0] = x;
      if (y > max[1]) max[1] = y;
      if (z > max[2]) max[2] = z;
    }
  }
  // center
  {
    vec3.add(center, min, max);
    vec3.scale(center, center, 0.5);
    space.center = center;
  }
  // size
  {
    vec3.subtract(size, max, min);
    if (space.settings.scale) {
      vec3.scale(size, size, 0.5);
    }
    space.size = size;
  }
  // radius
  {
    let length = vec3.length(size);
    space.radius = length;
  }
  space.updates++;
};

/**
 * Apply given transformations to a vertex
 * @param {Float32Array} vertex
 * @param {BoundingInfo} space
 * @param {Object} settings
 */
BoundingBox.prototype.applyTransformation = function(vertex, space, settings) {
  let object = this.object;
  let helpers = space.helpers;
  let scale = object.scale;
  let rotate = object.rotate;
  let translate = object.translate;
  let vScale = helpers.scale;
  let vTranslate = helpers.translate;
  let mTransform = helpers.matrix;
  let deg2Rad = (Math.PI / 180);
  mat4.identity(mTransform);
  // translate
  if (settings.translate) {
    mat4.translate(
      mTransform,
      mTransform,
      vec3.set(vTranslate, translate.x, translate.y, translate.z)
    );
  }
  // rotation
  if (settings.rotate) {
    mat4.rotateX(
      mTransform,
      mTransform,
      rotate.x * deg2Rad
    );
    mat4.rotateY(
      mTransform,
      mTransform,
      rotate.y * deg2Rad
    );
    mat4.rotateZ(
      mTransform,
      mTransform,
      rotate.z * deg2Rad
    );
  }
  // scale
  if (settings.scale) {
    mat4.scale(
      mTransform,
      mTransform,
      vec3.set(vScale, scale.x, scale.y, scale.z)
    );
  }
  vec4.transformMat4(
    vertex,
    vertex,
    mTransform
  );
};

/**
 * Apply translation only
 */
BoundingBox.prototype.updateWorldSpace = function() {
  let world = this.world;
  let local = this.local;
  let helpers = world.helpers;
  // this ensures that all transformations take into account
  let settings = { scale: true, rotate: true, translate: true };
  let vec = helpers.vertex;
  // center
  {
    vec4.set(vec, local.center[0], local.center[1], local.center[2], 1.0);
    this.applyTransformation(vec, world, settings);
    world.center[0] = vec[0];
    world.center[1] = vec[1];
    world.center[2] = vec[2];
  }
  // min
  {
    vec4.set(vec, local.min[0], local.min[1], local.min[2], 1.0);
    this.applyTransformation(vec, world, settings);
    world.min[0] = vec[0];
    world.min[1] = vec[1];
    world.min[2] = vec[2];
  }
  // max
  {
    vec4.set(vec, local.max[0], local.max[1], local.max[2], 1.0);
    this.applyTransformation(vec, world, settings);
    world.max[0] = vec[0];
    world.max[1] = vec[1];
    world.max[2] = vec[2];
  }
};

/**
 * Checks if the local world bounds intersect with another object's world bounds
 * @param {WebGLObject} object
 * @return {Boolean}
 */
BoundingBox.prototype.intersectsWithObject = function(object) {
  let a = this.world;
  let b = object.boundings.world;
  return (
    (a.max[0] > b.min[0]) &&
    (a.min[0] < b.max[0]) &&
    (a.max[1] > b.min[1]) &&
    (a.min[1] < b.max[1]) &&
    (a.max[2] > b.min[2]) &&
    (a.min[2] < b.max[2])
  );
};

/**
 * Checks if the local world bounds intersect with a point in world space
 * @param {Object} pt
 * @return {Boolean}
 */
BoundingBox.prototype.intersectsWithPoint = function(pt) {
  let a = this.world;
  let b = pt;
  return (
    (a.max[0] > b.x) &&
    (a.min[0] < b.x) &&
    (a.max[1] > b.y) &&
    (a.min[1] < b.y) &&
    (a.max[2] > b.z) &&
    (a.min[2] < b.z)
  );
};

/**
 * Checks if local vertices intersect with a ray in world space
 * @param {Object} pt
 * @return {Boolean}
 */
BoundingBox.prototype.intersectsWithVertex = function(ray) {
  let object = this.object;
  let indices = object.data.indices;
  let vertices = object.data.vertices;
  let length = (indices.length / 3) | 0;
  let mModel = object.getModelMatrix();
  let pos = vec4.fromValues(ray.x, ray.y, ray.z, 1.0);
  // convert ray to local space
  vec4.transformMat4(pos, pos, mat4.invert(mat4.create(), mModel));
  let v0 = vec3.create();
  let v1 = vec3.create();
  let v2 = vec3.create();
  let centroid = vec3.create();
  for (let ii = 0; ii < length; ++ii) {
    let i0 = indices[ii + 0];
    let i1 = indices[ii + 1];
    let i2 = indices[ii + 2];
    vec3.set(v0, vertices[i0 + 0], vertices[i0 + 1], vertices[i0 + 2]);
    vec3.set(v1, vertices[i1 + 0], vertices[i1 + 1], vertices[i1 + 2]);
    vec3.set(v2, vertices[i2 + 0], vertices[i2 + 1], vertices[i2 + 2]);
    let x = (v0[0] + v1[0] + v2[0]) / 3;
    let y = (v0[1] + v1[1] + v2[1]) / 3;
    let z = (v0[2] + v1[2] + v2[2]) / 3;
    vec3.set(centroid, x, y, z);
    let dist = vec3.distance(pos, centroid);
    if (dist <= 0.0) return true;
  }
  return false;
};

/**
 * A basic query class
 * @class WebGLQuery
 */
class WebGLQuery {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.enabled = false;
    this.type = opts.type;
    this.renderer = opts.renderer;
    this.gl = opts.gl;
    this.query = this.createQuery();
  }
}

/**
 * Creates the query
 */
WebGLQuery.prototype.createQuery = function() {
  let gl = this.gl;
  let query = gl.createQuery();
  return query;
};

/**
 * Enables the query
 */
WebGLQuery.prototype.enable = function() {
  let gl = this.gl;
  let query = this.query;
  gl.beginQuery(this.type, query);
  this.enabled = true;
};

/**
 * Disables the query
 */
WebGLQuery.prototype.disable = function() {
  let gl = this.gl;
  gl.endQuery(this.type);
};

/**
 * Indictes if the query is ready
 */
WebGLQuery.prototype.isReady = function() {
  let gl = this.gl;
  let query = this.query;
  return gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
};

/**
 * Returns the query's result
 */
WebGLQuery.prototype.getResult = function() {
  let gl = this.gl;
  let query = this.query;
  this.enabled = false;
  return gl.getQueryParameter(query, gl.QUERY_RESULT);
};

/**
 * 3D vector
 * @class Vector3D
 */
class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.uid = uid();
    this.array = new Float32Array([x, y, z]);
    this._x = 0;
    this._y = 0;
    this._z = 0;
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) {
    this._x = x;
    this._y = y;
    this._z = z;
    this.array[0] = x;
    this.array[1] = y;
    this.array[2] = z;
  }
  setVector(vec) {
    let vx = vec.x;
    let vy = vec.y;
    let vz = vec.z;
    this._x = vx;
    this._y = vy;
    this._z = vz;
    this.array[0] = vx;
    this.array[1] = vy;
    this.array[2] = vz;
  }
  setArray(arr) {
    let ax = arr[0];
    let ay = arr[1];
    let az = arr[2];
    this._x = ax;
    this._y = ay;
    this._z = az;
    this.array[0] = ax;
    this.array[1] = ay;
    this.array[2] = az;
  }
  toArray() {
    return this.array;
  }
  // getters
  get x() { return this._x; }
  get y() { return this._y; }
  get z() { return this._z; }
  // setters
  set x(v) { this._x = v; this.array[0] = v; }
  set y(v) { this._y = v; this.array[1] = v; }
  set z(v) { this._z = v; this.array[2] = v; }
}

/**
 * 3D vector detecting changes
 * @class MutableVector3D
 */
class MutableVector3D extends Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    super(x, y, z);
    this.mutated = true;
  }
  set(x, y = x, z = x) {
    if (
      (this._x !== x) ||
      (this._y !== y) ||
      (this._z !== z)
    ) this.mutated = true;
    this._x = x;
    this._y = y;
    this._z = z;
    this.array[0] = x;
    this.array[1] = y;
    this.array[2] = z;
  }
  // getters
  get x() { return this._x; }
  get y() { return this._y; }
  get z() { return this._z; }
  // setters
  set x(v) { if (v !== this._x) this.mutated = true; this._x = v; this.array[0] = v; }
  set y(v) { if (v !== this._y) this.mutated = true; this._y = v; this.array[1] = v; }
  set z(v) { if (v !== this._z) this.mutated = true; this._z = v; this.array[2] = v; }
}

const BATCH_MAT4_SIZE = 4 * 4;





const BATCH_FLOAT_SIZE = 1;

const BATCH_BUFFER_UPDATE = {
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
}

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
class WebGLBatch {
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
}

/**
 * Initializes batch data and buffers
 */
WebGLBatch.prototype.init = function() {
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
  }
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
  }
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
  }
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
  }
  this.size = offset;
  this.refreshBuffers(offset);
};

/**
 * Raw model
 * @class WebGLObject
 */
class WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this._alpha = 1.0;
    this._glow = 1.0;
    this.translate = new MutableVector3D(0, 0, 0);
    this.rotate = new MutableVector3D(0, 0, 0);
    this.scale = new MutableVector3D(1, 1, 1);
    this.cameraDistance = vec3.create();
    this.buffers = null;
    this.parent = null;
    this.reflector = null;
    this.boundings = null;
    this.light = null;
    this.batchElement = null;
    this.isSprite = false;
    this.specularLighting = false;
    this.occlusionCulling = false;
    this.environmentMapping = false;
    this.glossiness = 1.0;
    this.modelMatrix = null;
    this.normalMatrix = null;
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.query = new WebGLQuery({
      gl: this.gl,
      renderer: this.renderer,
      type: this.gl.ANY_SAMPLES_PASSED_CONSERVATIVE 
    });
    this.occlusionFactor = 0;
    // linkable area
    {
      this.data = {
        vertices: null,
        normals: null,
        uvs: null,
        indices: null
      };
      this.loader = null;
      this.texture = null;
      this.normalTexture = null;
      this.shadowTexture = null;
      this.specularTexture = null;
      this.emissiveTexture = null;
      this.metalnessTexture = null;
      this.roughnessTexture = null;
      this.ambientOcclusionTexture = null;
      this.environmentTexture = null;
    }
    if (opts.inherit) this.useParent(opts.inherit);
    else {
      this.createReflector();
      if (opts.useMesh) {
        this.createMesh(opts.useMesh);
      } else {
        this.createMesh();
        this.createLoader();
      }
    }
  }
  get isInstanced() {
    return this.batchElement !== null;
  }
  get alpha() {
    return this._alpha;
  }
  set alpha(v) {
    this._alpha = v;
    // batch data needs to be updated
    if (this.batchElement !== null) {
      let batch = this.batchElement.batch;
      batch.updateObject(this, BATCH_BUFFER_UPDATE.ALPHA);
    }
  }
  get glow() {
    return this._glow;
  }
  set glow(v) {
    this._glow = v;
    // batch data needs to be updated
    if (this.batchElement !== null) {
      let batch = this.batchElement.batch;
      batch.updateObject(this, BATCH_BUFFER_UPDATE.GLOW);
    }
  }
}

/**
 * This runs after each frame got drawn
 */
WebGLObject.prototype.update = function() {
  // environment mapping
  if (this.environmentMapping && !this.environmentTexture) {
    let map = this.renderer.createCubeMap();
    this.useEnvironmentMap(map);
    map.drawFaces(window.drawScene);
    this.environmentMapping = true;
  }
  // boundings
  if (this.needsBoundingUpdate()) {
    // check this before we update the object's boundings
    let isTranslationUpdate = this.isTranslationUpdate();
    this.updateWorldBoundings();
    this.updateMatrices();
    if (this.batchElement !== null) {
      let batch = this.batchElement.batch;
      batch.updateObject(this, BATCH_BUFFER_UPDATE.MODEL);
    }
    // refresh environment texture
    if (isTranslationUpdate && this.environmentMapping) {
      this.environmentTexture.refresh();
    }
  }
  // camera distance
  {
    let mModelView = this.getModelViewMatrix();
    let vCenter = this.boundings.local.center;
    vec3.transformMat4(this.cameraDistance, vCenter, mModelView);
  }
};

/**
 * Makes the given properties reflective to childs
 */
WebGLObject.prototype.createReflector = function() {
  this.reflector = new objectReflector({
    object: this,
    properties: [
      "data", "loader", "buffers",
      "texture", "normalTexture", "specularTexture",
      "emissiveTexture", "metalnessTexture", "roughnessTexture",
      "ambientOcclusionTexture", "environmentTexture"
    ]
  });
};

/**
 * Refreshes the object's mesh data on the GPU
 */
WebGLObject.prototype.refresh = function() {
  if (this.loader) {
    this.loader.load();
    // also force an update for the object's boundings
    this.updateWorldBoundings();
  }
  else console.warn("Invalid load, no loader linked!");
};

/**
 * Create the object's mesh data
 */
WebGLObject.prototype.createMesh = function() {
  // inherit
};

/**
 * Creates a loader to send the object's
 * mesh to our GPU program
 */
WebGLObject.prototype.createLoader = function() {
  let renderer = this.renderer;
  let loader = new ObjectLoader(renderer, this);
  this.loader = loader;
  this.buffers = loader.buffers;
  this.boundings = new BoundingBox(this);
  this.updateBoundings();
};

/**
 * Uses the given texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useTexture = function(texture) {
  this.texture = texture;
};

/**
 * Uses the given color texture
 * @param {Array} color
 */
WebGLObject.prototype.useColor = function(color) {
  let renderer = this.renderer;
  this.useTexture(renderer.createTexture().fromColor(color));
};

/**
 * Uses the given normal texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useNormalMap = function(texture) {
  this.normalTexture = texture;
};

/**
 * Uses the given specular texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useSpecularMap = function(texture) {
  this.specularTexture = texture;
};

/**
 * Uses the given emissive texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useEmissiveMap = function(texture) {
  this.emissiveTexture = texture;
};

/**
 * Uses the given metalness texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useMetalnessMap = function(texture) {
  this.metalnessTexture = texture;
};

/**
 * Uses the given roughness texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useRoughnessMap = function(texture) {
  this.roughnessTexture = texture;
};

/**
 * Uses the given ambient occlusion texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useAmbientOcclusionMap = function(texture) {
  this.ambientOcclusionTexture = texture;
};

/**
 * Uses the given specular texture
 * @param {CubeMap} cubemap
 */
WebGLObject.prototype.useEnvironmentMap = function(cubemap) {
  this.environmentTexture = cubemap;
  cubemap.target = this;
};

/**
 * Creates link to a parent
 * @param {WebGLObject} parent
 */
WebGLObject.prototype.useParent = function(parent) {
  this.parent = parent;
  this.parent.reflector.createReflection(this);
  this.boundings = new BoundingBox(this);
  this.scale.setVector(parent.scale);
  this.rotate.setVector(parent.rotate);
  this.translate.setVector(parent.translate);
  this.updateBoundings();
};

/**
 * Indicates if the boundings of the object need to get recalculated
 * @return {Boolean}
 */
WebGLObject.prototype.needsBoundingUpdate = function() {
  return (
    this.scale.mutated ||
    this.rotate.mutated ||
    this.translate.mutated
  );
};

/**
 * Indicates if the environment position changed
 * @return {Boolean}
 */
WebGLObject.prototype.isTranslationUpdate = function() {
  return this.translate.mutated;
};

/**
 * Updates the object's world boundings
 */
WebGLObject.prototype.updateLocalBoundings = function() {
  this.boundings.update(this.boundings.local);
};

/**
 * Updates the object's world boundings
 */
WebGLObject.prototype.updateWorldBoundings = function() {
  this.boundings.update(this.boundings.world);
  this.scale.mutated = false;
  this.rotate.mutated = false;
  this.translate.mutated = false;
};

/**
 * Updates the object's local and world boundings
 */
WebGLObject.prototype.updateBoundings = function() {
  this.updateLocalBoundings();
  this.updateWorldBoundings();
};

/**
 * Check if local object intersects with given object
 * @param {WebGLObject} object
 */
WebGLObject.prototype.intersectsWith = function(object) {
  return this.boundings.intersectsWithObject(object);
};

/**
 * Updates the cached version of the object's model matrix
 */
WebGLObject.prototype.updateMatrices = function() {
  let renderer = this.renderer;
  let mModel = renderer.getModelMatrix(this);
  let mNormal = renderer.getNormalMatrix(this);
  // create cached matrices
  if (!this.modelMatrix) this.modelMatrix = mat4.create();
  if (!this.normalMatrix) this.normalMatrix = mat4.create();
  mat4.copy(this.modelMatrix, mModel);
  mat4.copy(this.normalMatrix, mNormal);
};

/**
 * Calculates and returns the object's model matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getModelMatrix = function() {
  let renderer = this.renderer;
  let mModel = this.modelMatrix;
  // we can use a cached version
  if (mModel !== null && !this.isSprite) {
    // we make sure that always the same modelMatrix
    // is uploaded to the GPU - we just copy the cached
    // model matrix's content to "uniformed" modelMatrix
    // because this seems to be faster than uploading different matrices
    mat4.copy(renderer.modelMatrix, mModel);
    return renderer.modelMatrix;
  }
  // non-cached version
  return renderer.getModelMatrix(this);
};

/**
 * Calculates and returns the object's model matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getNormalMatrix = function() {
  let renderer = this.renderer;
  let mNormal = this.normalMatrix;
  // we can use a cached version
  if (mNormal !== null && !this.isSprite) {
    // we make sure that always the same modelMatrix
    // is uploaded to the GPU - we just copy the cached
    // model matrix's content to "uniformed" modelMatrix
    // because this seems to be faster than uploading different matrices
    mat4.copy(renderer.normalMatrix, mNormal);
    return renderer.normalMatrix;
  }
  // non-cached version
  return renderer.getNormalMatrix(this);
};

/**
 * Calculates and returns the object's model matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getModelViewMatrix = function() {
  return this.renderer.getModelViewMatrix(this);
};

/**
 * Calculates and returns the object's model-view-projection matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getModelViewProjectionMatrix = function() {
  return this.renderer.getModelViewProjectionMatrix(this);
};

/**
 * Indicates if the object is in view frustum
 * @return {Boolean}
 */
WebGLObject.prototype.isInView = function() {
  return this.renderer.camera.isObjectInView(this);
};

/**
 * Returns if the object is fully occluded
 * @return {Boolean}
 */
WebGLObject.prototype.isOccluded = function() {
  return this.occlusionCulling && this.occlusionFactor > 100;
};

/**
 * Returns the euclidian distance to the camera object
 * @return {Number}
 */
WebGLObject.prototype.getCameraDistance = function() {
  let cPos = this.renderer.camera.position;
  let oPos = this.boundings.world.center;
  let dist = vec3.distance(cPos, oPos);
  return dist;
};

/**
 * A simple cube
 * @class Cube
 * @extends WebGLObject
 */
class Cube extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
  }
}

/**
 * Create cube data
 */
Cube.prototype.createMesh = function() {
  let data = this.data;
  data.vertices = new Float32Array([
    // Front face
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,
    // Back face
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,
    // Top face
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,
    // Bottom face
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,
    // Right face
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,
    // Left face
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0
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
     0.0,  0.0, -1.0,
    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ]);
  data.uvs = new Float32Array([
    // Front
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Back
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Top
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Bottom
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Right
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Left
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ]);
  data.indices = new Uint16Array([
    0, 1, 2, 2, 3, 0,
    4, 5, 6, 6, 7, 4,
    8, 9, 10, 10, 11, 8,
    12, 13, 14, 14, 15, 12,
    16, 17, 18, 18, 19, 16,
    20, 21, 22, 22, 23, 20
  ]);
};

/**
 * A simple quad
 * @class Quad
 * @extends WebGLObject
 */
class Quad extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    super(opts);
  }
}

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

/**
 * A cubemap
 * @class CubeMap
 */
class CubeMap {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    this.uid = uid();
    this.renderer = opts.renderer;
    this.gl = opts.gl;
    this.target = null;
    this.size = opts.size || 512;
    this.faces = [
      this.gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      this.gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      this.gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      this.gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      this.gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ];
    this.loaded = false;
    this.textures = [];
    this.texture = this.createEmptyTexture();
    this.buffer = this.createBuffer();
  }
}

CubeMap.prototype.createBuffer = function() {
  let renderer = this.renderer;
  let size = this.size;
  let fbo = renderer.createFrameBuffer({ width: size, height: size });
  return fbo;
};

/**
 * Returns the native texture
 * @return {WebGLTexture}
 */
CubeMap.prototype.getNativeTexture = function() {
  return this.texture;
};

/**
 * Creates a new cubemap
 * @return {WebGLTexture}
 */
CubeMap.prototype.createEmptyTexture = function() {
  let gl = this.gl;
  let size = this.size;
  let data = new Uint8Array(4 * size * size);
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  for (let ii = 0; ii < 6; ++ii) {
    let face = this.faces[ii];
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    //gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(face, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  return texture;
};

/**
 * Creates a new cubemap
 * @param {Array} textures - Array of textures
 * @return {WebGLTexture}
 */
CubeMap.prototype.createTextureFromImages = function(textures) {
  let gl = this.gl;
  let size = this.size;
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  for (let ii = 0; ii < 6; ++ii) {
    let face = gl.TEXTURE_CUBE_MAP_POSITIVE_X + ii;
    let data = textures[ii].data;
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texImage2D(face, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  }
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  return texture;
};

CubeMap.prototype.fromImages = function(root, images) {
  let renderer = this.renderer;
  let itemsLeft = images.length;
  images.map(loc => {
    let path = root + loc + ".png";
    let texture = renderer.createTexture({
      binary: true,
      onload: () => {
        // all textures got loaded successfully
        // send the cubemap to the GPU
        if (--itemsLeft <= 0) {
          let tex = this.textures[0];
          let img = tex.sourceElement;
          if (img.width !== img.height) {
            console.warn(`Invalid skybox texture dimensions`);
          }
          this.size = img.width;
          this.loaded = true;
          this.texture = this.createTextureFromImages(this.textures);
        }
      }
    }).fromImagePath(path);
    this.textures.push(texture);
  });
  return this;
};

CubeMap.prototype.drawFaces = function(cbDrawScene) {
  let gl = this.gl;
  let size = this.size;
  let renderer = this.renderer;
  let camera = renderer.camera;
  let target = this.target;
  let texture = this.texture;
  let oPosition = vec3.clone(camera.position);
  let oRotation = vec3.clone(camera.rotation);
  let fbo = gl.createFramebuffer();
  target.update();
  {

    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.drawBuffers([gl.COLOR_ATTACHMENT0]);

    let depth = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    gl.viewport(0, 0, size, size);

  }
  {
    for (let ii = 0; ii < 6; ++ii) {
      let face = this.faces[ii];
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, face, texture, 0);
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.viewport(0, 0, size, size);
      camera.moveTo(target, true);
      camera.setFOV(90);
      camera.setAspect(1, 1);
      camera.lookAtCubeMapFace(ii);
      renderer.useCamera(camera);
      renderer.useFrameBuffer(this.buffer);
      renderer.clear();
      {
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        if (window.skyBox) {
          renderer.useRendererProgram("skybox");
          gl.depthMask(false);
          gl.cullFace(gl.FRONT);
          renderer.renderSkybox(skyBox);
          gl.depthMask(true);
          gl.cullFace(gl.BACK);
        }
      }
    }
  }
  camera.setFOV(45);
  camera.setAspect(renderer.width, renderer.height);
  camera.moveTo(null);
  vec3.copy(camera.position, oPosition);
  vec3.copy(camera.rotation, oRotation);
  renderer.useCamera(camera);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, renderer.width, renderer.height);
};

CubeMap.prototype.refresh = function() {
  this.drawFaces(window.drawScene);
};

/**
 * A framebuffer
 * @class FrameBuffer
 */
class FrameBuffer {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.width = (opts.width | 0) || 128;
    this.height = (opts.height | 0) || 128;
    this.resolution = new Float32Array([this.width, this.height]);
    // wrap settings
    {
      if (!opts.wrap) opts.wrap = {};
      this.wrap = {
        s: opts.wrap.s || this.gl.CLAMP_TO_EDGE,
        t: opts.wrap.t || this.gl.CLAMP_TO_EDGE,
        r: opts.wrap.r || this.gl.CLAMP_TO_EDGE
      };
    }
    this.native = null;
    this.buffer = null;
    this.texture = null;
    this.textures = [];
    this.attachmentList = [];
    this.init(this.width, this.height, opts.attachments || null);
  }
}

/**
 * Creates a new framebuffer
 * @param {Number} width
 * @param {Number} height
 * @param {Number} attachments - The amount of color attachments to use
 * @return {Object}
 */
FrameBuffer.prototype.init = function(width, height, attachments) {
  let gl = this.gl;
  this.buffer = this.createBuffer(attachments);
  if (Number.isInteger(attachments)) {
    for (let ii = 0; ii < attachments; ++ii) {
      this.createAttachement(ii, null);
    }
  } else if (Array.isArray(attachments)) {
    for (let ii = 0; ii < attachments.length; ++ii) {
      this.createAttachement(ii, attachments[ii]);
    }
  } else {
    this.texture = this.createColorAttachement(0, null);
    this.textures.push(this.texture);
    this.native = this.texture;
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};

FrameBuffer.prototype.createAttachement = function(index, opts = null) {
  let texture = null;
  // we want to create a custom attachments with opts
  if (opts !== null) {
    let format = opts.format;
    // depth component
    if (this.isDepthComponent(format)) {
      texture = this.createDepthAttachement(format, opts);
    // color component
    } else if (this.isColorComponent(format)) {
      texture = this.createColorAttachement(index, opts);
    // unknown component
    } else {
      console.warn(`Invalid or unsupported attachement format!`);
    }
  // non-custom attachments default to color attachments
  } else {
    texture = this.createColorAttachement(index, null);
  }
  this.textures.push(texture);
  if (!this.native) this.native = texture;
};

/**
 * Returns the gl id of passed in numeric color attachment id
 * @param {Number} id
 * @return {Number}
 */
FrameBuffer.prototype.getColorAttachementUnitById = function(id) {
  let gl = this.gl;
  return gl.COLOR_ATTACHMENT0 + id;
};

/**
 * Returns the native texture
 * @return {WebGLTexture}
 */
FrameBuffer.prototype.getNativeTexture = function() {
  return this.native;
};

/**
 * Indicates if it's a depth component
 * @param {Number} comp
 * @return {Boolean}
 */
FrameBuffer.prototype.isDepthComponent = function(comp) {
  let gl = this.gl;
  return (
    (comp === gl.DEPTH_COMPONENT) ||
    (comp === gl.DEPTH_COMPONENT16) ||
    (comp === gl.DEPTH_COMPONENT24) ||
    (comp === gl.DEPTH_COMPONENT32F)
  );
};

/**
 * Indicates if it's a color component
 * @param {Number} comp
 * @return {Boolean}
 */
FrameBuffer.prototype.isColorComponent = function(comp) {
  let gl = this.gl;
  // make sure it's a valid component
  if (!(comp >= 0)) return false;
  return (
    (comp === gl.RED) ||
    (comp === gl.RGB8) ||
    (comp === gl.RGBA8) ||
    (comp === gl.RGB10_A2) ||
    (comp === gl.SRGB) ||
    (comp === gl.SRGB8) ||
    (comp === gl.SRGB8_ALPHA8) ||
    (comp === gl.RGBA32F) ||
    (comp === gl.RGB32F) ||
    (comp === gl.RGBA16F) ||
    (comp === gl.RGB16F) ||
    (comp === gl.R11F_G11F_B10F) ||
    (comp === gl.RGB9_E5) ||
    (comp === gl.RGBA32UI) ||
    (comp === gl.RGB32UI) ||
    (comp === gl.RGBA16UI) ||
    (comp === gl.RGB16UI) ||
    (comp === gl.RGBA8UI) ||
    (comp === gl.RGB8UI) ||
    (comp === gl.RGBA32I) ||
    (comp === gl.RGB32I) ||
    (comp === gl.RGBA16I) ||
    (comp === gl.RGB16I) ||
    (comp === gl.RGBA8I) ||
    (comp === gl.RGB8I) ||
    (comp === gl.RED_INTEGER) ||
    (comp === gl.RGB_INTEGER) ||
    (comp === gl.RGBA_INTEGER) ||
    (comp === gl.R8) ||
    (comp === gl.RG8) ||
    (comp === gl.R16F) ||
    (comp === gl.R32F) ||
    (comp === gl.RG16F) ||
    (comp === gl.RG32F) ||
    (comp === gl.R8I) ||
    (comp === gl.R8UI) ||
    (comp === gl.R16I) ||
    (comp === gl.R16UI) ||
    (comp === gl.R32I) ||
    (comp === gl.R32UI) ||
    (comp === gl.RG8I) ||
    (comp === gl.RG8UI) ||
    (comp === gl.RG16I) ||
    (comp === gl.RG16UI) ||
    (comp === gl.RG32I) ||
    (comp === gl.RG32UI) ||
    (comp === gl.R8_SNORM) ||
    (comp === gl.RG8_SNORM) ||
    (comp === gl.RGB8_SNORM) ||
    (comp === gl.RGBA8_SNORM) ||
    (comp === gl.RGB10_A2UI)
  );
};

/**
 * Indicates if the attachment is a color attachment
 * @param {Number} attachment
 * @return {Boolean}
 */
FrameBuffer.prototype.isColorAttachment = function(attachment) {
  let gl = this.gl;
  return (
    (attachment >= gl.COLOR_ATTACHMENT0) &&
    (attachment <= gl.COLOR_ATTACHMENT15)
  );
};

/**
 * Indicates if the attachment is a depth attachment
 * @param {Number} attachment
 * @return {Boolean}
 */
FrameBuffer.prototype.isDepthAttachment = function(attachment) {
  let gl = this.gl;
  return (
    attachment === gl.DEPTH_ATTACHMENT
  );
};

/**
 * Creates a new framebuffer texture
 * @param {Number} attachments
 * @return {WebGLFramebuffer}
 */
FrameBuffer.prototype.createBuffer = function(attachments) {
  let gl = this.gl;
  let buffer = gl.createFramebuffer();
  let attachmentList = this.getAttachmentList(attachments);
  gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
  // if this fbo is depth-only then we don't need a draw buffer
  if (this.isDepthComponent(attachmentList[0])) gl.drawBuffers([gl.NONE]);
  // we have an fbo with color attachments, set them as draw buffers
  else gl.drawBuffers(attachmentList);
  this.attachmentList = attachmentList;
  return buffer;
};

/**
 * Generates attachment list
 * @param {Number} attachments - Amount of attachments
 * @return {Array}
 */
FrameBuffer.prototype.getAttachmentList = function(attachments) {
  let attachmentList = [];
  if (attachments === null) {
    let id = this.getColorAttachementUnitById(0);
    attachmentList.push(id);
  }
  else if (attachments > 0) {
    for (let ii = 0; ii < attachments; ++ii) {
      let id = this.getColorAttachementUnitById(ii);
      attachmentList.push(id);
    }
  }
  else if (Array.isArray(attachments)) {
    for (let ii = 0; ii < attachments.length; ++ii) {
      let attachment = attachments[ii];
      let format = attachment.format;
      if (this.isColorComponent(format)) {
        let id = this.getColorAttachementUnitById(ii);
        attachmentList.push(id);
      } else if (this.isDepthComponent(format)) {
        attachmentList.push(format);
      }
    }
  }
  return attachmentList;
};

/**
 * Creates a new framebuffer texture
 * @param {Object} opts
 * @return {Object}
 */
FrameBuffer.prototype.createTexture = function(opts) {
  let gl = this.gl;
  let wrap = this.wrap;
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  if (opts !== null) {
    if (this.isDepthComponent(opts.format)) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap.s);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap.t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, wrap.r);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, opts.format, this.width, this.height, 0, gl.DEPTH_COMPONENT, opts.size, null);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap.s);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap.t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, wrap.r);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texStorage2D(gl.TEXTURE_2D, 1, opts.format, this.width, this.height);
    }
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap.s);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap.t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, wrap.r);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.width, this.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
  }
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};

/**
 * @param {Number} format
 * @return {WebGLRenderbuffer}
 */
FrameBuffer.prototype.createColorBuffer = function(format) {
  let gl = this.gl;
  let buffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, buffer);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, format, gl.RENDERBUFFER, buffer);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  return buffer;
};

/**
 * Creates a new render buffer
 * @param {Number} format
 * @param {WebGLTexture} texture
 * @param {Object} opts
 * @return {Object}
 */
FrameBuffer.prototype.createRenderBuffer = function(format, texture, opts) {
  let gl = this.gl;
  let buffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, buffer);
  // color buffer
  if (this.isColorAttachment(format)) {
    if (format === gl.COLOR_ATTACHMENT0) gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, this.width, this.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, format, gl.TEXTURE_2D, texture, 0);
  }
  // depth buffer
  else if (this.isDepthComponent(format)) {
    gl.renderbufferStorage(gl.RENDERBUFFER, opts.format, this.width, this.height);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, texture, 0);
    //gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buffer);
  }
  if (format === gl.COLOR_ATTACHMENT0) {
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buffer);
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  return buffer;
};

/**
 * @param {Number} index - The color attachment index
 * @param {Object} opts
 * @return {WebGLTexture}
 */
FrameBuffer.prototype.createColorAttachement = function(index, opts = null) {
  let gl = this.gl;
  let format = this.getColorAttachementUnitById(index);
  let texture = this.createTexture(opts);
  let renderBuffer = this.createRenderBuffer(format, texture, opts || {});
  // also assign the color attachment id
  texture.id = format - gl.COLOR_ATTACHMENT0;
  texture.unitId = format;
  return texture;
};

/**
 * @param {Number} format
 * @param {Object} opts
 * @return {WebGLTexture}
 */
FrameBuffer.prototype.createDepthAttachement = function(format, opts = null) {
  let texture = this.createTexture(opts);
  let renderBuffer = this.createRenderBuffer(format, texture, opts || {});
  /*{
    let buffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, buffer);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, buffer);
    //gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT24, this.width, this.height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  }*/
  return texture;
};

/**
 * Returns the active framebuffer
 * @return {WebGLFrameBuffer}
 */
FrameBuffer.prototype.getActiveFrameBuffer = function() {
  let gl = this.gl;
  return gl.getParameter(gl.FRAMEBUFFER_BINDING);
};

/**
 * Clears a framebuffer
 * @param {Boolean} restore - Restore the original fbo
 */
FrameBuffer.prototype.clear = function(restore = false) {
  let gl = this.gl;
  let buffer = this.buffer;
  let previous = null;
  if (restore) previous = this.getActiveFrameBuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // restore previous framebuffer
  if (restore) gl.bindFramebuffer(gl.FRAMEBUFFER, previous);
};

/**
 * Writes this fbo's content to another fbo
 * @param {FrameBuffer} fbo
 * @param {Number} attachment
 */
FrameBuffer.prototype.writeToFrameBuffer = function(fbo, attachment, maskBit) {
  let gl = this.gl;
  let mask = maskBit ? maskBit : gl.COLOR_BUFFER_BIT;
  let srcWidth = this.width;
  let srcHeight = this.height;
  let dstWidth = fbo ? fbo.width : srcWidth;
  let dstHeight = fbo ? fbo.height : srcHeight;
  let readBuffer = this.buffer;
  let drawBuffer = fbo ? fbo.buffer : null;
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawBuffer);
  // set read buffer
  if (this.isColorAttachment(attachment)) gl.readBuffer(attachment);
  else gl.readBuffer(gl.NONE);
  // blit fbos
  gl.blitFramebuffer(
    0, 0, srcWidth, srcHeight,
    0, 0, dstWidth, dstHeight,
    mask, gl.NEAREST
  );
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
};

/**
 * Writes this fbo's content to the main fbo
 */
FrameBuffer.prototype.writeToScreen = function() {
  let gl = this.gl;
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.buffer);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  gl.readBuffer(gl.COLOR_ATTACHMENT0);
  gl.blitFramebuffer(
    0, 0, this.width, this.height,
    0, 0, this.renderer.width, this.renderer.height,
    gl.COLOR_BUFFER_BIT, gl.NEAREST
  );
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
  gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
};

/**
 * Enables the local framebuffer
 */
FrameBuffer.prototype.enable = function() {
  let gl = this.gl;
  let width = this.width;
  let height = this.height;
  let buffer = this.buffer;
  let renderer = this.renderer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
  gl.viewport(0, 0, width, height);
  this.clear(false);
  renderer.useCamera(renderer.camera, false);
};

/**
 * Disables the local framebuffer
 */
FrameBuffer.prototype.disable = function() {
  let gl = this.gl;
  let renderer = this.renderer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, renderer.width, renderer.height);
};

/**
 * Kills the local framebuffer
 */
FrameBuffer.prototype.kill = function() {
  let gl = this.gl;
  let buffer = this.buffer;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.deleteFramebuffer(buffer);
};

/**
 * A basic gBuffer
 * @class GBuffer
 */
class GBuffer extends FrameBuffer {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.isGBuffer = true;
  }
}

/**
 * Binds all gbuffer textures
 */
GBuffer.prototype.bind = function() {
  let renderer = this.renderer;
  let textures = this.textures;
  let program = renderer.currentProgram;
  let variables = program.locations;
  // textures
  let position = textures[0];
  let normal = textures[1];
  let albedo = textures[2];
  let emissive = textures[3];
  let rsma = textures[4];
  renderer.useTexture(position, variables.uPositionSampler, 0);
  renderer.useTexture(normal, variables.uNormalSampler, 1);
  renderer.useTexture(albedo, variables.uAlbedoSampler, 2);
  renderer.useTexture(emissive, variables.uEmissiveSampler, 3);
  renderer.useTexture(rsma, variables.uRSMASampler, 4);
};

/**
 * A basic texture
 * @class ObjectTexture
 */
class ObjectTexture {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.binary = !!opts.binary;
    this.pixelated = !!opts.pixelated;
    this.onload = opts.onload || null;
    // texture options
    {
      let gl = this.gl;
      if (!opts.wrap) opts.wrap = {};
      if (!opts.flip) opts.flip = {};
      if (!opts.scale) opts.scale = {};
      this.wrap = {
        s: opts.wrap.s || gl.MIRRORED_REPEAT,
        t: opts.wrap.t || gl.MIRRORED_REPEAT,
        r: opts.wrap.r || gl.MIRRORED_REPEAT
      };
      this.flip = {
        x: !!opts.flip.x,
        y: !!opts.flip.y
      };
      this.scale = {
        x: opts.scale.x !== void 0 ? opts.scale.x : 1.0,
        y: opts.scale.x !== void 0 ? opts.scale.y : 1.0
      };
      this.mips = opts.mips !== void 0 ? opts.mips : true;
    }
    this._loaded = false;
    this.data = null;
    this.native = null;
    this.sourcePath = null;
    this.sourceElement = null;
  }
  get loaded() {
    return this._loaded;
  }
  set loaded(value) {
    this._loaded = value;
    if (this.loaded) {
    // fire onload callback if necessary
      if (this.onload instanceof Function) this.onload(this);
    }
  }
}

/**
 * Sets the active/used texture
 * @param {WebGLTexture} texture
 */
ObjectTexture.prototype.setTexture = function(texture) {
  this.native = texture;
};

/**
 * Attaches the given binary data representation
 * @param {Uint8Array} data
 */
ObjectTexture.prototype.setBinaryData = function(data) {
  this.data = data;
};

/**
 * Returns the active texture
 * @return {WebGLFrameBuffer}
 */
ObjectTexture.prototype.getActiveTexture = function() {
  let gl = this.gl;
  return gl.getParameter(gl.TEXTURE_BINDING_2D);
};

/**
 * Returns the native texture
 * @return {WebGLTexture}
 */
ObjectTexture.prototype.getNativeTexture = function() {
  return this.native;
};

/**
 * Creates a new empty texture
 * @return {WebGLTexture}
 */
ObjectTexture.prototype.createTexture = function() {
  let gl = this.gl;
  let previous = this.getActiveTexture();
  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
  gl.bindTexture(gl.TEXTURE_2D, previous);
  return texture;
};

/**
 * Creates a new empty texture
 * @param {HTMLImageElement} img
 * @param {WebGLTexture} texture
 * @param {Boolean} anisotropic
 */
ObjectTexture.prototype.readImageIntoTexture = function(img, texture, anisotropic = false) {
  let gl = this.gl;
  let previous = this.getActiveTexture();
  let pixelated = this.pixelated;
  let pot = isPowerOf2(img.width) && isPowerOf2(img.height);
  let wrap = this.wrap;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  // use anisotropic filtering
  if (anisotropic) {
    let ext = this.renderer.getExtension("EXT_texture_filter_anisotropic");
    if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
  }
  if (!pixelated) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  if (this.flip.y) gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap.s);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap.t);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_R, wrap.r);
  if (pot && !pixelated) {
    if (this.mips) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameterf(gl.TEXTURE_2D, gl.TEXTURE_MIN_LOD, -0.4);
  }
  else {
    if (pixelated) {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    } else {
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  }
  // enable mip mapping
  if (pot && !pixelated && this.mips) gl.generateMipmap(gl.TEXTURE_2D);
  // create binary data representation
  if (this.binary) {
    let data = getImageBinaryData(img);
    this.setBinaryData(data);
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.bindTexture(gl.TEXTURE_2D, previous);
};

/**
 * Creates a texture from a canvas element
 * @param {HTMLCanvasElement} canvas
 * @return {ObjectTexture}
 */
ObjectTexture.prototype.fromCanvas = function(canvas) {
  let texture = this.createTexture();
  this.readImageIntoTexture(img, texture);
  this.loaded = true;
  this.setTexture(texture);
  this.sourceElement = canvas;
  return this;
};

/**
 * Creates a texture from a image element
 * @param {HTMLImageElement} img
 * @return {ObjectTexture}
 */
ObjectTexture.prototype.fromImage = function(img) {
  let texture = this.createTexture();
  this.readImageIntoTexture(img, texture);
  this.loaded = true;
  this.setTexture(texture);
  this.sourceElement = img;
  return this;
};

/**
 * Creates a texture from an image path
 * @param {String} path
 * @return {ObjectTexture}
 */
ObjectTexture.prototype.fromImagePath = function(path) {
  let texture = this.createTexture();
  this.loaded = false;
  loadImage(path).then(img => {
    this.readImageIntoTexture(img, texture);
    this.loaded = true;
    this.sourcePath = path;
    this.sourceElement = img;
  });
  this.setTexture(texture);
  return this;
};

/**
 * Creates a texture from the given color
 * @param {Array} color
 * @return {ObjectTexture}
 */
ObjectTexture.prototype.fromColor = function(color) {
  let gl = this.gl;
  let texture = this.createTexture();
  let previous = this.getActiveTexture();
  let r = color[0];
  let g = color[1];
  let b = color[2];
  let a = color.length <= 3 ? 255 : color[3];
  let data = new Uint8Array([r, g, b, a]);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.bindTexture(gl.TEXTURE_2D, previous);
  this.setTexture(texture);
  if (this.binary) this.setBinaryData(data);
  this.sourceElement = null;
  this.loaded = true;
  return this;
};

/**
 * A simple 2d sprite
 * @class Sprite
 * @extends WebGLObject
 */
class Sprite extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.isSprite = true;
  }
}

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

/**
 * A light
 * @class Light
 */
class Light {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.radius = opts.radius || 1.0;
    this.color = new Float32Array(opts.color);
    this.intensity = opts.intensity || 1.0;
  }
}

/**
 * A basic filter class
 * @class WebGLFilter
 */
class WebGLFilter {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.width = (opts.width | 0) || this.renderer.width;
    this.height = (opts.height | 0) || this.renderer.height;
    this.resolution = new Float32Array([this.width, this.height]);
    this.program = null;
    this.input = null;
    this.output = null;
    this.appliedFilter = false;
    this.init();
  }
}

/**
 * Initializes batch data and buffers
 */
WebGLFilter.prototype.init = function() {
  let renderer = this.renderer;
  {
    let quad = renderer.createObject(Quad);
    let fbo = renderer.createFrameBuffer({
      width: this.width,
      height: this.height
    });
    quad.useTexture(fbo);
    this.input = quad;
  }
  {
    let quad = renderer.createObject(Quad);
    let fbo = renderer.createFrameBuffer({
      width: this.width,
      height: this.height
    });
    quad.useTexture(fbo);
    this.output = quad;
  }
};

/**
 * Enables the filter's fbo
 * @param {Boolean} clear - Clear the fbo's content
 */
WebGLFilter.prototype.enable = function(clear = false) {
  let gl = this.gl;
  let renderer = this.renderer;
  renderer.useFrameBuffer(this.input.texture);
  if (clear) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }
  this.appliedFilter = false;
};

/**
 * Reuses the filter's input
 * by writing the filter's output into the own input
 */
WebGLFilter.prototype.reuse = function() {
  this.writeToFrameBuffer(this.input.texture);
};

/**
 * Uses the given filter
 * @param {String} name - program name
 * @return {RendererProgram}
 */
WebGLFilter.prototype.useProgram = function(name) {
  let gl = this.gl;
  let renderer = this.renderer;
  let program = renderer.useRendererProgram(name);
  let variables = program.locations;
  this.program = program;
  gl.uniform2fv(variables.uResolution, this.resolution);
  return this.program;
};

/**
 * Applies the given given filter
 * and write the result into the filter's input
 */
WebGLFilter.prototype.apply = function() {
  let renderer = this.renderer;
  let program = renderer.currentProgram;
  if (program) {
    let variables = program.locations;
    renderer.useTexture(this.input.texture, variables.uSampler, 0);
  }
  renderer.useFrameBuffer(this.output.texture);
  renderer.renderQuad(this.input);
  this.appliedFilter = true;
};

/**
 * Reads the content of a framebuffer into the filter's input
 * @param {FrameBuffer} fbo - The framebuffer to read from
 */
WebGLFilter.prototype.readFrameBuffer = function(fbo, attachement) {
  let renderer = this.renderer;
  let isMainFBO = renderer.isMainFrameBuffer(fbo);
  if (isMainFBO === null) {
    console.warn(`Reading from main FBO is slow/impossible!`);
  }
  if (isMainFBO) {
    renderer.screen.texture.writeToFrameBuffer(this.input.texture, attachement);
  } else {
    fbo.writeToFrameBuffer(this.input.texture, attachement);
  }
};

/**
 * Writes the filter's output into the given fbo
 * @param {FrameBuffer} fbo - The target fbo
 */
WebGLFilter.prototype.writeToFrameBuffer = function(fbo) {
  let gl = this.gl;
  let renderer = this.renderer;
  if (!this.appliedFilter) {
    renderer.useRendererProgram("quad");
    this.applyFilter();
    renderer.restoreRendererProgram();
  }
  let isMainFBO = renderer.isMainFrameBuffer(fbo);
  if (isMainFBO) {
    if (fbo === renderer.screen.texture) {
      this.output.texture.writeToFrameBuffer(renderer.screen.texture, gl.COLOR_ATTACHMENT0);
    } else {
      this.output.texture.writeToFrameBuffer(null, gl.COLOR_ATTACHMENT0);
    }
  } else {
    this.output.texture.writeToFrameBuffer(fbo, gl.COLOR_ATTACHMENT0);
  }
};

/**
 * Writes this filter's content into the target filter's input
 * @param {WebGLFilter} filter - The target filter
 */
WebGLFilter.prototype.writeToFilter = function(filter) {
  this.writeToFrameBuffer(filter.input.texture);
};

WebGLFilter.prototype.flush = function() {
  let renderer = this.renderer;
  renderer.useRendererProgram("quad");
  renderer.renderQuad(this.output);
};

/**
 * A WebGL renderer program wrapper
 * @class RendererProgram
 */
class RendererProgram {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.name = null;
    this.loaded = false;
    this.native = null;
    this.cache = {
      uniforms: {}
    };
    this.sources = { vertex: null, fragment: null };
    this.shaders = { vertex: null, fragment: null };
    this.variables = {};
    this.locations = {};
    this.externals = null;
  }
}

/**
 * Loads and builds given shaders
 * @param {String} name
 * @param {Object} opts
 */
RendererProgram.prototype.build = function(name, opts) {
  this.name = name;
  return new Promise(resolve => {
    loadText(`../shaders/${name}.vert`).then(vertexSrc => {
      loadText(`../shaders/${name}.frag`).then(fragmentSrc => {
        if (!vertexSrc.length || !fragmentSrc.length) {
          console.warn(`Cannot load shader source ${name}`);
          return;
        }
        this.buildShaderProgram(vertexSrc, fragmentSrc);
        this.loaded = true;
        resolve(this);
      });
    });
  });
};

/**
 * Compiles the passed in shader sources
 * and compiles it into a program
 * @param {String} vertexSrc
 * @param {String} fragmentSrc
 */
RendererProgram.prototype.buildShaderProgram = function(vertexSrc, fragmentSrc) {
  let gl = this.gl;
  this.native = gl.createProgram();
  let vShader = this.compileShader(vertexSrc, gl.VERTEX_SHADER);
  let fShader = this.compileShader(fragmentSrc, gl.FRAGMENT_SHADER);
  // expect both to be compiled successfully
  if (vShader && fShader) {
    gl.linkProgram(this.native);
    this.shaders.vertex = vShader;
    this.shaders.fragment = fShader;
    this.sources.vertex = vertexSrc;
    this.sources.fragment = fragmentSrc;
    this.resolveShaderVariables();
  }
};

RendererProgram.prototype.resolveDeclarations = function(source, expect) {
  let rxName = /<(.*)>/;
  let rxPragma = /(pragma) (.*) (.*);/g;
  let match = null;
  let declarations = [];
  while (match = rxPragma.exec(source)) {
    let split = match[0].split(" ");
    let kind = split[1];
    if (kind === expect) {
      let funcName = rxName.exec(split[2])[1];
      let fileName = rxName.exec(split[4])[1];
      let decl = { func: funcName, file: fileName };
      declarations.push(decl);
    }
  }
  return declarations;
};

/**
 * Compile the given shader
 * @param {String} shaderSrc
 * @param {Number} shaderType
 * @return {WebGLShader}
 */
RendererProgram.prototype.compileShader = function(shaderSrc, shaderType) {
  let gl = this.gl;
  let program = this.native;
  let shader = gl.createShader(shaderType);
  gl.shaderSource(shader, shaderSrc);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Shader compile error in ${this.name}:` + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  gl.attachShader(program, shader);
  return shader;
};

/**
 * Wrapper for changing a variable on our
 * running GPU shader program
 * @param {String} name
 * @param {*} a - Optional
 * @param {*} b - Optional
 * @param {*} c - Optional
 * @param {*} d - Optional
 */
RendererProgram.prototype.setVariable = function(name, a, b, c, d) {
  let gl = this.gl;
  let def = this.variables[name];
  if (def.qualifier === UNIFORM) {
    if (def.type === FLOAT) gl.uniform1f(def.location, a);
    else if (def.type === BOOL) gl.uniform1i(def.location, a);
    else if (def.type === VEC_2) gl.uniform2f(def.location, a, b);
    else if (def.type === VEC_3) gl.uniform3f(def.location, a, b, c, d);
    else if (def.type === VEC_4) gl.uniform4f(def.location, a, b, c, d);
    else if (def.type === I_VEC_2) gl.uniform2i(def.location, a, b);
    else if (def.type === I_VEC_3) gl.uniform3i(def.location, a, b, c, d);
    else if (def.type === I_VEC_4) gl.uniform4i(def.location, a, b, c, d);
    else if (def.type === MAT_3) gl.uniformMatrix3fv(def.location, false, a);
    else if (def.type === MAT_4) gl.uniformMatrix4fv(def.location, false, a);
    else if (def.type === SAMPLER_2D) gl.uniform1i(def.location, a);
    else if (def.type === SAMPLER_CUBE) gl.uniform1i(def.location, a);
  }
};

/**
 * Resolve and link all shader's variables
 * so we can easily access them afterwards
 */
RendererProgram.prototype.resolveShaderVariables = function() {
  let vVars = this.extractShaderVariables(this.sources.vertex);
  let fVars = this.extractShaderVariables(this.sources.fragment);
  this.linkVariables(vVars);
  this.linkVariables(fVars);
  Object.assign(this.variables, vVars);
  Object.assign(this.variables, fVars);
};

/**
 * Extracts variables of a shader
 * @param {String} source
 * @return {Object} Contains the extracted variables
 */
RendererProgram.prototype.extractShaderVariables = function(source) {
  let regexp = /(uniform|attribute|in|flat in) (.*) (.*);/g;
  let match = null;
  let variables = {};
  while (match = regexp.exec(source)) {
    let type = match[2].trim();
    let qualifier = match[1].trim();
    let name = match[3].trim();
    let isArray = name.split("[").length > 1;
    if (isArray) name = name.split("[")[0];
    variables[name] = {
      type: this.getVariableBit(type),
      qualifier: this.getVariableBit(qualifier),
      location: null,
      isArray
    };
  }
  return variables;
};

/**
 * Converts string to a bit
 * for faster access
 * @param {String} type
 * @return {Number}
 */
RendererProgram.prototype.getVariableBit = function(type) {
  switch (type) {
    case "float": return FLOAT;
    case "bool": return BOOL;
    case "vec2": return VEC_2;
    case "vec3": return VEC_3;
    case "vec4": return VEC_4;
    case "ivec2": return I_VEC_2;
    case "ivec3": return I_VEC_3;
    case "ivec4": return I_VEC_4;
    case "mat3": return MAT_3;
    case "mat4": return MAT_4;
    case "uniform": return UNIFORM;
    case "sampler2D": return SAMPLER_2D;
    case "samplerCube": return SAMPLER_CUBE;
    case "attribute": case "in": return ATTRIBUTE;
  }
  return UNKNOWN;
};

/**
 * Link variables of our program
 * @param {Object} variables - The variables to link
 */
RendererProgram.prototype.linkVariables = function(variables) {
  let gl = this.gl;
  let program = this.native;
  for (let name in variables) {
    let def = variables[name];
    let location = null;
    if (def.qualifier === UNIFORM) location = this.getUniformLocation(name);
    else if (def.qualifier === ATTRIBUTE) {
      location = gl.getAttribLocation(program, name);
      //if (location >= 0) gl.bindAttribLocation(program, location, name);
    }
    def.location = location;
    this.locations[name] = location;
  }
};

RendererProgram.prototype.getUniformLocation = function(locationName) {
  let gl = this.gl;
  let program = this.native;
  let cache = this.cache.uniforms;
  // cache the location
  if (!cache.hasOwnProperty(locationName)) {
    cache[locationName] = gl.getUniformLocation(program, locationName);
  }
  // read from cache
  return cache[locationName];
};

RendererProgram.prototype.isLocationInUse = function(locationName) {
  return this.getUniformLocation(locationName) !== null;
};

RendererProgram.prototype.getLocationNameByLocationId = function(locationId) {
  let locations = this.locations;
  for (let name in locations) {
    let loc = this.getUniformLocation(name);
    if (loc === locationId) return name;
  }
  return null;
};

// TODO: the data should follow the engine's standards!
// => normals, vertices, uvs

const BASE_PATH = "";
const VERTEX_ELEMENTS = 11; // 3 Pos, 2 UV, 3 Norm, 3 Tangent
function Md5Mesh(opts = {}) {
  this.joints = null;
  this.meshes = null;
  this.opts = {
    texture: opts.texture || null
  };
}

Md5Mesh.prototype.load = function(gl, url, callback) {
  this.joints = new Array();
  this.meshes = new Array();

  let request = new XMLHttpRequest();
  request.addEventListener("load", () => {
    this.parse(request.responseText);
    this.normals = this.calculateSmoothNormals();
    this.initializeTextures(gl);
    this.initializeBuffers(gl);
    if (callback) callback(this);
  });
  request.open("GET", BASE_PATH + url, true);
  request.overrideMimeType("text/plain");
  request.setRequestHeader("Content-Type", "text/plain");
  request.send(null);

  return this;
};

Md5Mesh.prototype.calculateSmoothNormals = function() {
  let clone = this.cloneMeshes(this.meshes);
  let out = this.concatMeshes(clone);
  let mesh = {
    verts: out.verts,
    tris: out.tris,
    weights: out.weights,
    elementCount: out.tris.length
  };
  this.compile(mesh);
  return mesh;
};

Md5Mesh.prototype.cloneMeshes = function(meshes) {
  return JSON.parse(JSON.stringify(meshes));
};

Md5Mesh.prototype.concatMeshes = function(meshes) {
  let verts = [];
  let tris = [];
  let weights = [];
  let indexOffset = 0;
  let vertexOffset = 0;
  let weightOffset = 0;
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    // vertices
    mesh.verts.map((vert, i) => {
      verts[vertexOffset + i] = vert;
    });
    // faces
    for (let jj = 0; jj < mesh.tris.length; jj += 3) {
      let offset = indexOffset;
      tris[offset + 0] = mesh.tris[jj + 0] += vertexOffset;
      tris[offset + 1] = mesh.tris[jj + 1] += vertexOffset;
      tris[offset + 2] = mesh.tris[jj + 2] += vertexOffset;
      indexOffset += 3;
    }
    // weights
    mesh.verts.map((vert, i) => {
      for (let jj = 0; jj < vert.weight.count; ++jj) {
        let weight = mesh.weights[vert.weight.index + jj];
        weights[weightOffset + vert.weight.index + jj] = weight;
      }
      vert.weight.index += weightOffset;
    });
    mesh.verts.map((vert, i) => {
      weightOffset += vert.weight.count;
    });
    vertexOffset += mesh.verts.length;
  }
  return { verts, tris, weights };
};

/*
 * Md5Mesh
 */

Md5Mesh.prototype.parse = function(src) {
  let model = this;

  src.replace(/joints \{([^}]*)\}/m, function($0, jointSrc) {
    jointSrc.replace(/\"(.+)\"\s(.+) \( (.+) (.+) (.+) \) \( (.+) (.+) (.+) \)/g, function($0, name, parent, x, y, z, ox, oy, oz) {

      let orient = quat.calculateW(quat.create(), [parseFloat(ox), parseFloat(oy), parseFloat(oz), 0]);
      orient[3] *= -1;

      model.joints.push({
        name: name,
        parent: parseInt(parent),
        pos: [parseFloat(x), parseFloat(y), parseFloat(z)],
        orient: orient
      });
    });
  });

  src.replace(/mesh \{([^}]*)\}/mg, function($0, meshSrc) {
    let mesh = {
      shader: "",
      verts: new Array(),
      tris: new Array(),
      weights: new Array(),
      vertBuffer: null,
      indexBuffer: null,
      vertArray: null,
      elementCount: 0
    };

    meshSrc.replace(/shader \"(.+)\"/, function($0, shader) {
      mesh.shader = shader.replace(".tga", "");
    });

    meshSrc.replace(/vert .+ \( (.+) (.+) \) (.+) (.+)/g, function($0, u, v, weightIndex, weightCount) {
      mesh.verts.push({
        pos: [0, 0, 0],
        normal: [0, 0, 0],
        tangent: [0, 0, 0],
        texCoord: [parseFloat(u), parseFloat(v)],
        weight: {
          index: parseInt(weightIndex),
          count: parseInt(weightCount)
        }
      });
    });

    mesh.tris = new Array();
    meshSrc.replace(/tri .+ (.+) (.+) (.+)/g, function($0, i1, i2, i3) {
      mesh.tris.push(parseInt(i1));
      mesh.tris.push(parseInt(i2));
      mesh.tris.push(parseInt(i3));
    });
    mesh.elementCount = mesh.tris.length;

    meshSrc.replace(/weight .+ (.+) (.+) \( (.+) (.+) (.+) \)/g, function($0, joint, bias, x, y, z) {
      mesh.weights.push({
        joint: parseInt(joint),
        bias: parseFloat(bias),
        pos: [parseFloat(x), parseFloat(y), parseFloat(z)],
        normal: [0, 0, 0],
        tangent: [0, 0, 0]
      });
    });

    model.compile(mesh);

    model.meshes.push(mesh);

    let weightOffset = 0;
    model.meshes.map(mesh => {
      mesh.weightOffset = weightOffset;
      mesh.verts.map((vert, i) => {
        weightOffset += vert.weight.count;
      });
    });

  });
};

function findSimilarVertices(vert, verts) {
  let pos = vert.pos;
  let index = pos[0] + pos[1] + pos[2];
  let duplicates = [];
  for (let ii = 0; ii < verts.length; ii++) {
    let nvert = verts[ii];
    let npos = nvert.pos;
    let nindex = npos[0] + npos[1] + npos[2];
    if (nindex === index) duplicates.push(ii);
  }
  return duplicates;
}

Md5Mesh.prototype.compile = function(mesh) {
  let joints = this.joints;
  let rotatedPos = [0, 0, 0];

  // Calculate transformed vertices in the bind pose
  for (let ii = 0; ii < mesh.verts.length; ++ii) {
    let vert = mesh.verts[ii];

    vert.pos = [0, 0, 0];
    for (let jj = 0; jj < vert.weight.count; ++jj) {
      let weight = mesh.weights[vert.weight.index + jj];
      let joint = joints[weight.joint];

      // Rotate position
      quat.multiplyVec3(rotatedPos, joint.orient, weight.pos);

      // Translate position
      // The sum of all weight biases should be 1.0
      vert.pos[0] += (joint.pos[0] + rotatedPos[0]) * weight.bias;
      vert.pos[1] += (joint.pos[1] + rotatedPos[1]) * weight.bias;
      vert.pos[2] += (joint.pos[2] + rotatedPos[2]) * weight.bias;
    }
  }

  // Calculate normals/tangents
  let a = [0, 0, 0];
  let b = [0, 0, 0];
  let n = [0, 0, 0];

  for (let ii = 0; ii < mesh.tris.length; ii += 3) {
    let i1 = mesh.tris[ii + 0];
    let i2 = mesh.tris[ii + 1];
    let i3 = mesh.tris[ii + 2];
    let v1 = mesh.verts[i1];
    let v2 = mesh.verts[i2];
    let v3 = mesh.verts[i3];

    // normal
    vec3.subtract(a, v2.pos, v1.pos);
    vec3.subtract(b, v3.pos, v1.pos);
    vec3.cross(n, b, a);

    // angles
    let a1 = vec3.angle(
      vec3.subtract(a, v2.pos, v1.pos),
      vec3.subtract(b, v3.pos, v1.pos)
    );
    let a2 = vec3.angle(
      vec3.subtract(a, v3.pos, v2.pos),
      vec3.subtract(b, v1.pos, v2.pos)
    );
    let a3 = vec3.angle(
      vec3.subtract(a, v1.pos, v3.pos),
      vec3.subtract(b, v2.pos, v3.pos)
    );

    vec3.add(v1.normal, v1.normal, vec3.scale(vec3.create(), n, a1));
    vec3.add(v2.normal, v2.normal, vec3.scale(vec3.create(), n, a2));
    vec3.add(v3.normal, v3.normal, vec3.scale(vec3.create(), n, a3));
  }

  let invOrient = [0, 0, 0, 0];

  // Get the "weighted" normal and tangent
  for (let ii = 0; ii < mesh.verts.length; ++ii) {
    let vert = mesh.verts[ii];

    let duplicates = findSimilarVertices(vert, mesh.verts);
    vec3.scale(vert.normal, vert.normal, duplicates.length);

    vec3.normalize(vert.normal, vert.normal);

    for (let jj = 0; jj < duplicates.length; ++jj) {
      let vertIndex = duplicates[jj];
      let nvert = mesh.verts[vertIndex];
      nvert.normal = vert.normal;
    }

    for (let jj = 0; jj < vert.weight.count; ++jj) {
      let weight = mesh.weights[vert.weight.index + jj];
      if (weight.bias != 0) {
        let joint = joints[weight.joint];

        // Rotate position
        quat.invert(invOrient, joint.orient);
        quat.multiplyVec3(weight.normal, invOrient, vert.normal);
      }
    }
  }

};

Md5Mesh.prototype.initializeTextures = function(gl) {
  let renderer = gl.renderer;
  for (let ii = 0; ii < this.meshes.length; ++ii) {
    let mesh = this.meshes[ii];

    // Set defaults
    mesh.diffuseMap = renderer.createTexture().fromColor([0, 0, 0]);
    mesh.specularMap = renderer.createTexture().fromColor([0, 0, 0]);
    mesh.normalMap = renderer.createTexture().fromColor([0, 0, 0]);

    this.loadMeshTextures(gl, mesh);
  }
};

// Finds the meshes texures
// Confession: Okay, so this function is a big giant cheat... 
// but have you SEEN how those mtr files are structured?
Md5Mesh.prototype.loadMeshTextures = function(gl, mesh) {
  let renderer = gl.renderer;
  let opts = {
    flip: {
      x: true,
      y: true
    },
    wrap: this.opts.texture || {
      s: gl.MIRRORED_REPEAT,
      t: gl.CLAMP_TO_EDGE,
      r: gl.MIRRORED_REPEAT
    },
    onload: texture => {
      mesh.diffuseMap = texture;
    }
  };
  // Attempt to load actual textures
  renderer.createTexture(opts).fromImagePath("md5/pokepark/" + mesh.shader + '.png');
  /*
  renderer.createTexture({ onload: texture => {
      mesh.specularMap = texture.native;
  }}).fromImagePath(BASE_PATH + mesh.shader + '_s.png');

  renderer.createTexture({ onload: texture => {
      mesh.normalMap = texture.native;
  }}).fromImagePath(BASE_PATH + mesh.shader + '_local.png');*/

};

// Creates the model's gl buffers and populates them with the bind-pose mesh
Md5Mesh.prototype.initializeBuffers = function(gl) {
  let meshes = this.meshes;

  let vertBufferLength = 0;
  let indexBufferLength = 0;
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    mesh.vertOffset = vertBufferLength;
    vertBufferLength += VERTEX_ELEMENTS * mesh.verts.length;

    mesh.indexOffset = indexBufferLength;
    indexBufferLength += mesh.elementCount;
  }

  // Fill the vertex buffer
  this.vertArray = new Float32Array(vertBufferLength);
  this.skin();
  this.vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertArray, gl.STATIC_DRAW);

  // Fill the index buffer
  let indexArray = new Uint16Array(indexBufferLength);
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    indexArray.set(mesh.tris, mesh.indexOffset);
  }

  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
};

// Skins the vertexArray with the given joint set
// Passing null to joints results in the bind pose
Md5Mesh.prototype.skin = function(joints, vertArray, arrayOffset) {
  if (!joints) {
    joints = this.joints;
  }
  if (!vertArray) {
    vertArray = this.vertArray;
  }
  if (!arrayOffset) {
    arrayOffset = 0;
  }

  let rotatedPos = [0, 0, 0];

  let vx, vy, vz;
  let nx, ny, nz;
  let tx, ty, tz;

  let meshes = this.meshes;

  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    let meshOffset = mesh.vertOffset + arrayOffset;

    // Calculate transformed vertices in the bind pose
    for (let jj = 0; jj < mesh.verts.length; ++jj) {
      let vertOffset = (jj * VERTEX_ELEMENTS) + meshOffset;
      let vert = mesh.verts[jj];

      vx = 0;
      vy = 0;
      vz = 0;
      nx = 0;
      ny = 0;
      nz = 0;
      tx = 0;
      ty = 0;
      tz = 0;

      vert.pos = [0, 0, 0];

      for (let kk = 0; kk < vert.weight.count; ++kk) {
        let weight = mesh.weights[vert.weight.index + kk];
        let joint = joints[weight.joint];

        let normal = this.normals.weights[mesh.weightOffset + vert.weight.index + kk].normal;

        // Rotate position
        quat.multiplyVec3(rotatedPos, joint.orient, weight.pos);

        // Translate position
        vert.pos[0] += (joint.pos[0] + rotatedPos[0]) * weight.bias;
        vert.pos[1] += (joint.pos[1] + rotatedPos[1]) * weight.bias;
        vert.pos[2] += (joint.pos[2] + rotatedPos[2]) * weight.bias;
        vx += (joint.pos[0] + rotatedPos[0]) * weight.bias;
        vy += (joint.pos[1] + rotatedPos[1]) * weight.bias;
        vz += (joint.pos[2] + rotatedPos[2]) * weight.bias;

        // Rotate Normal
        quat.multiplyVec3(rotatedPos, joint.orient, normal);
        nx += rotatedPos[0] * weight.bias;
        ny += rotatedPos[1] * weight.bias;
        nz += rotatedPos[2] * weight.bias;

        // Rotate Tangent
        quat.multiplyVec3(rotatedPos, joint.orient, weight.tangent);
        tx += rotatedPos[0] * weight.bias;
        ty += rotatedPos[1] * weight.bias;
        tz += rotatedPos[2] * weight.bias;
      }

      // Position
      vertArray[vertOffset] = vx;
      vertArray[vertOffset + 1] = vy;
      vertArray[vertOffset + 2] = vz;

      // TexCoord
      vertArray[vertOffset + 3] = vert.texCoord[0];
      vertArray[vertOffset + 4] = vert.texCoord[1];

      // Normal
      vertArray[vertOffset + 5] = nx;
      vertArray[vertOffset + 6] = ny;
      vertArray[vertOffset + 7] = nz;

      // Tangent
      vertArray[vertOffset + 8] = tx;
      vertArray[vertOffset + 9] = ty;
      vertArray[vertOffset + 10] = tz;
    }
  }
};

Md5Mesh.prototype.getAnimationFrame = function(animation, frame) {
  let currentFrame = Math.floor(frame);
  let delta = frame - currentFrame;
  let joints1 = animation.getFrameJoints(currentFrame);
  let joints2 = animation.getFrameJoints(currentFrame + 1);
  let joints = [];
  for (let ii = 0; ii < joints1.length; ++ii) {
    let jA = joints1[ii];
    let jB = joints2[ii];
    let posA = jA.pos;
    let posB = jB.pos;
    let orientA = jA.orient;
    let orientB = jB.orient;
    let joint = {
      pos: vec3.lerp(vec3.create(), posA, posB, delta),
      orient: quat.slerp(vec4.create(), orientA, orientB, delta)
    };
    joints.push(joint);
  }
  return joints;
};

Md5Mesh.prototype.setAnimationFrame = function(gl, animation) {
  let joints = this.getAnimationFrame(animation, animation.currentFrame);
  this.skin(joints);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertArray, gl.STATIC_DRAW);
};

Md5Mesh.prototype.blendAnimations = function(gl, animationA, animationB, delta) {
  let currentFrame = Math.floor(animationA.currentFrame);
  let nextFrame = Math.floor(animationB.currentFrame);
  let jointsA = animationA.getFrameJoints(currentFrame);
  let jointsB = animationB.getFrameJoints(nextFrame);
  let joints = [];
  for (let ii = 0; ii < jointsA.length; ++ii) {
    let jA = jointsA[ii];
    let jB = jointsB[ii];
    let posA = jA.pos;
    let posB = jB.pos;
    let orientA = jA.orient;
    let orientB = jB.orient;
    let joint = {
      pos: vec3.lerp(vec3.create(), posA, posB, delta),
      orient: quat.slerp(vec4.create(), orientA, orientB, delta)
    };
    joints.push(joint);
  }
  this.skin(joints);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertArray, gl.STATIC_DRAW);
};


function Md5Anim(opts) {
  this.name = "";
  this.playbackSpeed = opts.playbackSpeed || 1.0;
  this.smoothTransitions = opts.smoothTransitions || [];
  this.currentFrame = 0;
  this.frameRate = 24;
  this.frameTime = 1000.0 / this.frameRate;
  this.hierarchy = null;
  this.baseFrame = null;
  this.frames = null;
}

Md5Anim.prototype.getNameFromURL = function(url) {
  return url.substr(url.lastIndexOf("/") + 1, url.length).replace(".md5anim", "");
};

Md5Anim.prototype.load = function(url, callback) {
  this.name = this.getNameFromURL(url);
  this.hierarchy = new Array();
  this.baseFrame = new Array();
  this.frames = new Array();

  let request = new XMLHttpRequest();
  request.addEventListener("load", () => {
    this.parse(request.responseText);
    if (callback) callback(this);
  });

  request.open("GET", BASE_PATH + url, true);
  request.overrideMimeType("text/plain");
  request.setRequestHeader("Content-Type", "text/plain");
  request.send(null);

  return this;
};

Md5Anim.prototype.parse = function(src) {
  let anim = this;

  src.replace(/frameRate (.+)/, function($0, frameRate) {
    anim.frameRate = parseInt(frameRate);
    anim.frameTime = 1000 / frameRate;
  });

  src.replace(/hierarchy \{([^}]*)\}/m, function($0, hierarchySrc) {
    hierarchySrc.replace(/\"(.+)\"\s([-\d]+) (\d+) (\d+)\s/g, function($0, name, parent, flags, index) {
      anim.hierarchy.push({
        name: name,
        parent: parseInt(parent),
        flags: parseInt(flags),
        index: parseInt(index)
      });
    });
  });

  src.replace(/baseframe \{([^}]*)\}/m, function($0, baseframeSrc) {
    baseframeSrc.replace(/\( (.+) (.+) (.+) \) \( (.+) (.+) (.+) \)/g, function($0, x, y, z, ox, oy, oz) {
      anim.baseFrame.push({
        pos: [parseFloat(x), parseFloat(y), parseFloat(z)],
        orient: [parseFloat(ox), parseFloat(oy), parseFloat(oz)]
      });
    });
  });


  src.replace(/frame \d+ \{([^}]*)\}/mg, function($0, frameSrc) {
    let frame = new Array();

    frameSrc.replace(/([-\.\d]+)/g, function($0, value) {
      frame.push(parseFloat(value));
    });

    anim.frames.push(frame);
  });
};

Md5Anim.prototype.getFrameJoints = function(frame) {
  let maxFrames = this.frames.length;
  let currentFrame = Math.floor(frame);
  let frameData = this.frames[currentFrame % maxFrames];
  let joints = new Array();

  for (let ii = 0; ii < this.baseFrame.length; ++ii) {
    let baseJoint = this.baseFrame[ii];
    let offset = this.hierarchy[ii].index;
    let flags = this.hierarchy[ii].flags;

    let aPos = [baseJoint.pos[0], baseJoint.pos[1], baseJoint.pos[2]];
    let aOrient = [baseJoint.orient[0], baseJoint.orient[1], baseJoint.orient[2], 0];

    let j = 0;

    if (flags & 1) { // Translate X
      aPos[0] = frameData[offset + j];
      ++j;
    }

    if (flags & 2) { // Translate Y
      aPos[1] = frameData[offset + j];
      ++j;
    }

    if (flags & 4) { // Translate Z
      aPos[2] = frameData[offset + j];
      ++j;
    }

    if (flags & 8) { // Orient X
      aOrient[0] = frameData[offset + j];
      ++j;
    }

    if (flags & 16) { // Orient Y
      aOrient[1] = frameData[offset + j];
      ++j;
    }

    if (flags & 32) { // Orient Z
      aOrient[2] = frameData[offset + j];
      ++j;
    }

    // Recompute W value
    quat.calculateW(aOrient, aOrient);
    //aOrient[3] *= -1;

    // Multiply against parent 
    //(assumes parents always have a lower index than their children)
    let parentIndex = this.hierarchy[ii].parent;

    let pos = aPos;
    let orient = aOrient;
    aOrient[3] = -Math.abs(aOrient[3]);
    if (parentIndex >= 0) {
      let parentJoint = joints[parentIndex];

      quat.multiplyVec3(pos, parentJoint.orient, pos);
      vec3.add(pos, parentJoint.pos, pos);
      quat.multiply(orient, parentJoint.orient, orient);

    }

    joints.push({
      pos: pos,
      orient: orient
    }); // This could be so much better!
  }

  return joints;
};

var MD5 = {
  Md5Mesh: Md5Mesh,
  Md5Anim: Md5Anim
};

/**
 * A md5 object
 * @class MD5Object
 * @extends WebGLObject
 */
class MD5Object extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.animated = !!opts.animated;
    this.rotate.x = 90;
    this.rotate.z = 90;
    this.events = {
      onend: []
    };
    this.playbackSpeed = 1.0;
    this.animations = [];
    this.nextAnimation = null;
    this.currentAnimation = null;
    // blending properties
    {
      this.endDelta = 0;
      this.blendDelta = 0;
      this.endAnimation = null;
      this.blendAnimation = null;
    }
    this.endAnimationPlaybackDirection = 1.0;
  }
}

MD5Object.prototype.createMesh = function(mesh) {
  let data = this.data;
  data.vertices = new Float32Array(mesh.vertices);
  this.createLoader();
};

MD5Object.prototype.isActiveAnimation = function() {
  return this.currentAnimation !== null;
};

MD5Object.prototype.isDifferentAnimation = function(anim) {
  return this.currentAnimation !== anim;
};

MD5Object.prototype.isAnimationFinished = function(anim) {
  return (
    (anim.currentFrame <= 0) ||
    (anim.currentFrame >= anim.frames.length)
  );
};

MD5Object.prototype.addAnimation = function(path, opts = {}) {
  let anim = new MD5.Md5Anim(opts);
  anim.load(path, anim => {
    anim.loaded = true;
  });
  this.animations.push(anim);
};

MD5Object.prototype.getAnimationByName = function(name) {
  let animations = this.animations;
  for (let ii = 0; ii < animations.length; ++ii) {
    let anim = animations[ii];
    if (anim.name === name) return anim;
  }
  return null;
};

MD5Object.prototype.useAnimation = function(name, opts = {}) {
  let anim = this.getAnimationByName(name);
  let force = opts.force || false;
  if (!anim) return console.warn(`Cannot find animation ${name}!`);
  if (opts.onend) this.registerEvent("onend", opts.onend);
  // interpolate between current and new animation
  if (!force && this.isActiveAnimation() && this.isDifferentAnimation(anim)) {
    this.nextAnimation = anim;
  }
  // skip current animation and force direct replay
  else {
    if (force) anim.currentFrame = 0;
    this.currentAnimation = anim;
  }
  return anim;
};

MD5Object.prototype.isTransitionable = function(a, b) {
  return (
    (a.smoothTransitions.indexOf(b.name) > -1) ||
    (b.smoothTransitions.indexOf(a.name) > -1)
  );
};

MD5Object.prototype.isAnimationQueueEmpty = function() {
  return (
    (this.endAnimation === null) &&
    (this.nextAnimation === null) &&
    (this.blendAnimation === null)
  );
};

MD5Object.prototype.isAnimationAlreadyQueded = function(name) {
  return (
    (this.endAnimation && this.endAnimation.name === name) ||
    (this.nextAnimation && this.nextAnimation.name === name) ||
    (this.blendAnimation && this.blendAnimation.name === name) ||
    (this.currentAnimation && this.currentAnimation.name === name)
  );
};

MD5Object.prototype.animate = function(delta) {
  let endAnim = this.endAnimation;
  let nextAnim = this.nextAnimation;
  let currentAnim = this.currentAnimation;
  // we need to finish the current animation first!
  if (endAnim !== null) {
    let finished = this.finishAnimation(currentAnim, delta);
    if (finished) {
      this.endAnimation = null;
      this.currentAnimation = this.nextAnimation;
      this.nextAnimation = null;
      this.currentAnimation.currentFrame = 0;
    }
  }
  // we got another animation queued, interpolate to it!
  else if (nextAnim !== null) {
    let isSmoothTransition = this.isTransitionable(currentAnim, nextAnim);
    // we want to end the current animation
    // and then play the next animation
    if (isSmoothTransition) {
      let frame = this.playAnimation(this.currentAnimation, delta);
      let currentFrame = Math.floor(frame) % currentAnim.frames.length;
      if (currentFrame === currentAnim.frames.length - 1) {
        this.setBlendAnimation(nextAnim);
      }
    }
    // a different, non-transitionable animation
    else {
      // we need to end the current animation as quickly as possible
      this.setBlendAnimation(nextAnim);
    }
  }
  // play a blend animation
  if (this.blendAnimation !== null) {
    this.blendAnimations(this.currentAnimation, this.blendAnimation, delta);
  }
  // play the current animation looped
  else if (this.isAnimationQueueEmpty()) {
    this.playAnimation(this.currentAnimation, delta);
  }
};

MD5Object.prototype.setEndAnimation = function(anim) {
  this.endDelta = 0;
  this.endAnimation = anim;
  // we want to end the current animation as fast as possible
  {
    // find the shortest path to end the animation
    let playbackDir = this.getEndPlaybackDirection(this.currentAnimation);
    this.endAnimationPlaybackDirection = -1;
  }
};

MD5Object.prototype.getEndPlaybackDirection = function(anim) {
  // TODO: is this maybe better?
  // if frame <= 1/3 -> play anim to begin fast
  // if frame >= 3/4 -> play anim to end fast
  let totalFrames = anim.frames.length;
  let frame = Math.floor(anim.currentFrame) % totalFrames;
  let direction = (
    (frame <= (totalFrames / 2.75)) ? -1.0 : 0.0
  );
  return direction;
};

MD5Object.prototype.setBlendAnimation = function(anim) {
  this.blendDelta = 0;
  this.nextAnimation = null;
  this.blendAnimation = anim;
  anim.currentFrame = 1;
};

MD5Object.prototype.playAnimation = function(anim, delta) {
  let gl = this.gl;
  let model = this.model;
  anim.currentFrame += (delta * anim.playbackSpeed) * this.playbackSpeed;
  model.setAnimationFrame(gl, anim);
  return anim.currentFrame;
};

MD5Object.prototype.blendAnimations = function(animA, animB, delta) {
  let gl = this.gl;
  let model = this.model;
  this.blendDelta += (delta * 0.4 * animB.playbackSpeed) * this.playbackSpeed;
  model.blendAnimations(gl, animA, animB, this.blendDelta);
  // blending finished, set blended-to animation as our current animation
  if (this.blendDelta >= 1.0) {
    this.blendAnimation = null;
    this.currentAnimation = animB;
    this.blendDelta = 0;
  }
};

MD5Object.prototype.finishAnimation = function(anim, delta) {
  let dir = this.endAnimationPlaybackDirection;
  // play reversed
  if (dir === -1) {
    let frame = this.playAnimation(anim, -delta * 2.0);
    let currentFrame = Math.floor(frame) % anim.frames.length;
    if (currentFrame <= 0) return true;
  }
  return false;
};

MD5Object.prototype.registerEvent = function(name, callback) {

};

MD5Object.prototype.triggerEvent = function(name, value) {

};

/**
 * A md5 file loader
 * @class MD5FileLoader
 */
class MD5FileLoader {
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
}

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

/**
 * A blender object
 * @class BlenderObject
 * @extends WebGLObject
 */
class BlenderObject extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
  }
}

BlenderObject.prototype.createMesh = function(mesh) {
  let data = this.data;
  data.vertices = new Float32Array(mesh.vertices);
  data.normals = new Float32Array(mesh.vertexNormals);
  data.uvs = new Float32Array(mesh.textures);
  data.indices = new Uint16Array(mesh.indices);
  this.createLoader();
};

var webglObjLoader_min = createCommonjsModule(function (module, exports) {
!function(e,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(e){function t(a){if(r[a])return r[a].exports;var n=r[a]={i:a,l:!1,exports:{}};return e[a].call(n.exports,n,n.exports,t), n.l=!0, n.exports}var r={};return t.m=e, t.c=r, t.d=function(exports,e,r){t.o(exports,e)||Object.defineProperty(exports,e,{configurable:!1,enumerable:!0,get:r})}, t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r}, t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}, t.p="/", t(t.s=3)}([function(e,exports,t){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e){switch(e){case"BYTE":case"UNSIGNED_BYTE":return 1;case"SHORT":case"UNSIGNED_SHORT":return 2;case"FLOAT":return 4}}Object.defineProperty(exports,"__esModule",{value:!0});var n=exports.Layout=function e(){r(this,e);for(var t=arguments.length,a=Array(t),n=0;n<t;n++)a[n]=arguments[n];this.attributes=a;var s=0,l=0,o=!0,u=!1,c=void 0;try{for(var f,h=a[Symbol.iterator]();!(o=(f=h.next()).done);o=!0){var p=f.value;if(this[p.key])throw new i(p);s%p.sizeOfType!=0&&(s+=p.sizeOfType-s%p.sizeOfType), this[p.key]={attribute:p,size:p.size,type:p.type,normalized:p.normalized,offset:s}, s+=p.sizeInBytes, l=Math.max(l,p.sizeOfType);}}catch(e){u=!0, c=e;}finally{try{!o&&h.return&&h.return();}finally{if(u)throw c}}s%l!=0&&(s+=l-s%l), this.stride=s;var v=!0,d=!1,y=void 0;try{for(var m,M=a[Symbol.iterator]();!(v=(m=M.next()).done);v=!0){this[m.value.key].stride=this.stride;}}catch(e){d=!0, y=e;}finally{try{!v&&M.return&&M.return();}finally{if(d)throw y}}},i=function e(t){r(this,e), this.message="found duplicate attribute: "+t.key;},s=function e(t,n,i){arguments.length>3&&void 0!==arguments[3]&&arguments[3];r(this,e), this.key=t, this.size=n, this.type=i, this.normalized=!1, this.sizeOfType=a(i), this.sizeInBytes=this.sizeOfType*n;};n.POSITION=new s("position",3,"FLOAT"), n.NORMAL=new s("normal",3,"FLOAT"), n.TANGENT=new s("tangent",3,"FLOAT"), n.BITANGENT=new s("bitangent",3,"FLOAT"), n.UV=new s("uv",2,"FLOAT"), n.MATERIAL_INDEX=new s("materialIndex",1,"SHORT"), n.MATERIAL_ENABLED=new s("materialEnabled",1,"UNSIGNED_SHORT"), n.AMBIENT=new s("ambient",3,"FLOAT"), n.DIFFUSE=new s("diffuse",3,"FLOAT"), n.SPECULAR=new s("specular",3,"FLOAT"), n.SPECULAR_EXPONENT=new s("specularExponent",3,"FLOAT"), n.EMISSIVE=new s("emissive",3,"FLOAT"), n.TRANSMISSION_FILTER=new s("transmissionFilter",3,"FLOAT"), n.DISSOLVE=new s("dissolve",1,"FLOAT"), n.ILLUMINATION=new s("illumination",1,"UNSIGNED_SHORT"), n.REFRACTION_INDEX=new s("refractionIndex",1,"FLOAT"), n.SHARPNESS=new s("sharpness",1,"FLOAT"), n.MAP_DIFFUSE=new s("mapDiffuse",1,"SHORT"), n.MAP_AMBIENT=new s("mapAmbient",1,"SHORT"), n.MAP_SPECULAR=new s("mapSpecular",1,"SHORT"), n.MAP_SPECULAR_EXPONENT=new s("mapSpecularExponent",1,"SHORT"), n.MAP_DISSOLVE=new s("mapDissolve",1,"SHORT"), n.ANTI_ALIASING=new s("antiAliasing",1,"UNSIGNED_SHORT"), n.MAP_BUMP=new s("mapBump",1,"SHORT"), n.MAP_DISPLACEMENT=new s("mapDisplacement",1,"SHORT"), n.MAP_DECAL=new s("mapDecal",1,"SHORT"), n.MAP_EMISSIVE=new s("mapEmissive",1,"SHORT");},function(e,exports,t){"use strict";function r(e){if(Array.isArray(e)){for(var t=0,r=Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var n=function(){function e(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1, a.configurable=!0, "value"in a&&(a.writable=!0), Object.defineProperty(e,a.key,a);}}return function(t,r,a){return r&&e(t.prototype,r), a&&e(t,a), t}}(),i=t(0),s=function(){function e(t,n){a(this,e), n=n||{}, n.materials=n.materials||{}, n.enableWTextureCoord=!!n.enableWTextureCoord, n.indicesPerMaterial=!!n.indicesPerMaterial;var i=this;i.vertices=[], i.vertexNormals=[], i.textures=[], i.indices=[], i.textureStride=n.enableWTextureCoord?3:2, this.name="";var s=[],l=[],o=[],u={},c=[],f={},h=-1,p=0;u.verts=[], u.norms=[], u.textures=[], u.hashindices={}, u.indices=[[]], u.materialIndices=[], u.index=0;for(var v=/^v\s/,d=/^vn\s/,y=/^vt\s/,m=/^f\s/,M=/\s+/,b=/^usemtl/,x=t.split("\n"),I=0;I<x.length;I++){var A=x[I].trim();if(A&&!A.startsWith("#")){var _=A.split(M);if(_.shift(), v.test(A))s.push.apply(s,r(_));else if(d.test(A))l.push.apply(l,r(_));else if(y.test(A)){var k=_;_.length>2&&!n.enableWTextureCoord?k=_.slice(0,2):2===_.length&&n.enableWTextureCoord&&k.push(0), o.push.apply(o,r(k));}else if(b.test(A)){var T=_[0];T in f||(c.push(T),f[T]=c.length-1,n.indicesPerMaterial&&f[T]>0&&u.indices.push([])), h=f[T], n.indicesPerMaterial&&(p=h);}else if(m.test(A))for(var w=!1,F=0,S=_.length;F<S;F++){3!==F||w||(F=2, w=!0);var E=_[0]+","+h,g=_[F]+","+h;if(g in u.hashindices)u.indices[p].push(u.hashindices[g]);else{var O=_[F].split("/"),B=O.length-1;if(u.verts.push(+s[3*(O[0]-1)+0]), u.verts.push(+s[3*(O[0]-1)+1]), u.verts.push(+s[3*(O[0]-1)+2]), o.length){var L=n.enableWTextureCoord?3:2;u.textures.push(+o[(O[1]-1)*L+0]), u.textures.push(+o[(O[1]-1)*L+1]), n.enableWTextureCoord&&u.textures.push(+o[(O[1]-1)*L+2]);}u.norms.push(+l[3*(O[B]-1)+0]), u.norms.push(+l[3*(O[B]-1)+1]), u.norms.push(+l[3*(O[B]-1)+2]), u.materialIndices.push(h), u.hashindices[g]=u.index, u.indices[p].push(u.hashindices[g]), u.index+=1;}3===F&&w&&u.indices[p].push(u.hashindices[E]);}}}i.vertices=u.verts, i.vertexNormals=u.norms, i.textures=u.textures, i.vertexMaterialIndices=u.materialIndices, i.indices=n.indicesPerMaterial?u.indices:u.indices[p], i.materialNames=c, i.materialIndices=f, i.materialsByIndex={}, n.calcTangentsAndBitangents&&this.calculateTangentsAndBitangents();}return n(e,[{key:"calculateTangentsAndBitangents",value:function(){var e={};e.tangents=[].concat(r(new Array(this.vertices.length))).map(function(e){return 0}),e.bitangents=[].concat(r(new Array(this.vertices.length))).map(function(e){return 0});var t=void 0;t=Array.isArray(this.indices[0])?[].concat.apply([],this.indices):this.indices;for(var a=this.vertices,n=this.vertexNormals,i=this.textures,s=0;s<t.length;s+=3){var l=t[s+0],o=t[s+1],u=t[s+2],c=a[3*l+0],f=a[3*l+1],h=a[3*l+2],p=i[2*l+0],v=i[2*l+1],d=a[3*o+0],y=a[3*o+1],m=a[3*o+2],M=i[2*o+0],b=i[2*o+1],x=a[3*u+0],I=a[3*u+1],A=a[3*u+2],_=i[2*u+0],k=i[2*u+1],T=d-c,w=y-f,F=m-h,S=x-c,E=I-f,g=A-h,O=M-p,B=b-v,L=_-p,N=k-v,R=O*N-B*L,P=1/(Math.abs(R<1e-4)?1:R),D=(T*N-S*B)*P,C=(w*N-E*B)*P,U=(F*N-g*B)*P,j=(S*O-T*L)*P,z=(E*O-w*L)*P,H=(g*O-F*L)*P,W=n[3*l+0],G=n[3*l+1],V=n[3*l+2],K=n[3*o+0],q=n[3*o+1],X=n[3*o+2],Y=n[3*u+0],J=n[3*u+1],Q=n[3*u+2],Z=D*W+C*G+U*V,ee=D*K+C*q+U*X,te=D*Y+C*J+U*Q,re=D-W*Z,ae=C-G*Z,ne=U-V*Z,ie=D-K*ee,se=C-q*ee,le=U-X*ee,oe=D-Y*te,ue=C-J*te,ce=U-Q*te,fe=Math.sqrt(re*re+ae*ae+ne*ne),he=Math.sqrt(ie*ie+se*se+le*le),pe=Math.sqrt(oe*oe+ue*ue+ce*ce),ve=j*W+z*G+H*V,de=j*K+z*q+H*X,ye=j*Y+z*J+H*Q,me=j-W*ve,Me=z-G*ve,be=H-V*ve,xe=j-K*de,Ie=z-q*de,Ae=H-X*de,_e=j-Y*ye,ke=z-J*ye,Te=H-Q*ye,we=Math.sqrt(me*me+Me*Me+be*be),Fe=Math.sqrt(xe*xe+Ie*Ie+Ae*Ae),Se=Math.sqrt(_e*_e+ke*ke+Te*Te);e.tangents[3*l+0]+=re/fe,e.tangents[3*l+1]+=ae/fe,e.tangents[3*l+2]+=ne/fe,e.tangents[3*o+0]+=ie/he,e.tangents[3*o+1]+=se/he,e.tangents[3*o+2]+=le/he,e.tangents[3*u+0]+=oe/pe,e.tangents[3*u+1]+=ue/pe,e.tangents[3*u+2]+=ce/pe,e.bitangents[3*l+0]+=me/we,e.bitangents[3*l+1]+=Me/we,e.bitangents[3*l+2]+=be/we,e.bitangents[3*o+0]+=xe/Fe,e.bitangents[3*o+1]+=Ie/Fe,e.bitangents[3*o+2]+=Ae/Fe,e.bitangents[3*u+0]+=_e/Se,e.bitangents[3*u+1]+=ke/Se,e.bitangents[3*u+2]+=Te/Se}this.tangents=e.tangents,this.bitangents=e.bitangents}},{key:"makeBufferData",value:function(e){var t=this.vertices.length/3,r=new ArrayBuffer(e.stride*t);r.numItems=t;for(var a=new DataView(r),n=0,s=0;n<t;n++){s=n*e.stride;var l=!0,o=!1,u=void 0;try{for(var c,f=e.attributes[Symbol.iterator]();!(l=(c=f.next()).done);l=!0){var h=c.value,p=s+e[h.key].offset;switch(h.key){case i.Layout.POSITION.key:a.setFloat32(p,this.vertices[3*n],!0),a.setFloat32(p+4,this.vertices[3*n+1],!0),a.setFloat32(p+8,this.vertices[3*n+2],!0);break;case i.Layout.UV.key:a.setFloat32(p,this.textures[2*n],!0),a.setFloat32(p+4,this.vertices[2*n+1],!0);break;case i.Layout.NORMAL.key:a.setFloat32(p,this.vertexNormals[3*n],!0),a.setFloat32(p+4,this.vertexNormals[3*n+1],!0),a.setFloat32(p+8,this.vertexNormals[3*n+2],!0);break;case i.Layout.MATERIAL_INDEX.key:a.setInt16(p,this.vertexMaterialIndices[n],!0);break;case i.Layout.AMBIENT.key:var v=this.vertexMaterialIndices[n],d=this.materialsByIndex[v];if(!d)break;a.setFloat32(p,d.ambient[0],!0),a.setFloat32(p+4,d.ambient[1],!0),a.setFloat32(p+8,d.ambient[2],!0);break;case i.Layout.DIFFUSE.key:var y=this.vertexMaterialIndices[n],m=this.materialsByIndex[y];if(!m)break;a.setFloat32(p,m.diffuse[0],!0),a.setFloat32(p+4,m.diffuse[1],!0),a.setFloat32(p+8,m.diffuse[2],!0);break;case i.Layout.SPECULAR.key:var M=this.vertexMaterialIndices[n],b=this.materialsByIndex[M];if(!b)break;a.setFloat32(p,b.specular[0],!0),a.setFloat32(p+4,b.specular[1],!0),a.setFloat32(p+8,b.specular[2],!0);break;case i.Layout.SPECULAR_EXPONENT.key:var x=this.vertexMaterialIndices[n],I=this.materialsByIndex[x];if(!I)break;a.setFloat32(p,I.specularExponent,!0);break;case i.Layout.EMISSIVE.key:var A=this.vertexMaterialIndices[n],_=this.materialsByIndex[A];if(!_)break;a.setFloat32(p,_.emissive[0],!0),a.setFloat32(p+4,_.emissive[1],!0),a.setFloat32(p+8,_.emissive[2],!0);break;case i.Layout.TRANSMISSION_FILTER.key:var k=this.vertexMaterialIndices[n],T=this.materialsByIndex[k];if(!T)break;a.setFloat32(p,T.transmissionFilter[0],!0),a.setFloat32(p+4,T.transmissionFilter[1],!0),a.setFloat32(p+8,T.transmissionFilter[2],!0);break;case i.Layout.DISSOLVE.key:var w=this.vertexMaterialIndices[n],F=this.materialsByIndex[w];if(!F)break;a.setFloat32(p,F.dissolve,!0);break;case i.Layout.ILLUMINATION.key:var S=this.vertexMaterialIndices[n],E=this.materialsByIndex[S];if(!E)break;a.setInt16(p,E.illumination,!0);break;case i.Layout.REFRACTION_INDEX.key:var g=this.vertexMaterialIndices[n],O=this.materialsByIndex[g];if(!O)break;a.setFloat32(p,O.refractionIndex,!0);break;case i.Layout.SHARPNESS.key:var B=this.vertexMaterialIndices[n],L=this.materialsByIndex[B];if(!L)break;a.setFloat32(p,L.sharpness,!0);break;case i.Layout.ANTI_ALIASING.key:var N=this.vertexMaterialIndices[n],R=this.materialsByIndex[N];if(!R)break;a.setInt16(p,R.antiAliasing,!0)}}}catch(e){o=!0,u=e}finally{try{!l&&f.return&&f.return()}finally{if(o)throw u}}}return r}},{key:"makeIndexBufferData",value:function(){var e=new Uint16Array(this.indices);return e.numItems=this.indices.length,e}},{key:"addMaterialLibrary",value:function(e){for(var t in e.materials)if(t in this.materialIndices){var r=e.materials[t],a=this.materialIndices[r.name];this.materialsByIndex[a]=r}}}]), e}();exports.default=s;},function(e,exports,t){"use strict";function r(e){return Array.isArray(e)?e:Array.from(e)}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(exports,"__esModule",{value:!0});var n=function(){function e(e,t){for(var r=0;r<t.length;r++){var a=t[r];a.enumerable=a.enumerable||!1, a.configurable=!0, "value"in a&&(a.writable=!0), Object.defineProperty(e,a.key,a);}}return function(t,r,a){return r&&e(t.prototype,r), a&&e(t,a), t}}(),i=exports.Material=function e(t){a(this,e), this.name=t, this.ambient=[0,0,0], this.diffuse=[0,0,0], this.specular=[0,0,0], this.emissive=[0,0,0], this.transmissionFilter=[0,0,0], this.dissolve=0, this.specularExponent=0, this.transparency=0, this.illumination=0, this.refractionIndex=1, this.sharpness=0, this.mapDiffuse=null, this.mapAmbient=null, this.mapSpecular=null, this.mapSpecularExponent=null, this.mapDissolve=null, this.antiAliasing=!1, this.mapBump=null, this.mapDisplacement=null, this.mapDecal=null, this.mapEmissive=null, this.mapReflections=[];};exports.MaterialLibrary=function(){function e(t){a(this,e), this.data=t, this.currentMaterial=null, this.materials={}, this.parse();}return n(e,[{key:"parse_newmtl",value:function(e){var t=e[0];this.currentMaterial=new i(t),this.materials[t]=this.currentMaterial}},{key:"parseColor",value:function(e){if("spectral"!=e[0]&&"xyz"!=e[0]){if(3==e.length)return e.map(parseFloat);var t=parseFloat(e[0]);return[t,t,t]}}},{key:"parse_Ka",value:function(e){this.currentMaterial.ambient=this.parseColor(e)}},{key:"parse_Kd",value:function(e){this.currentMaterial.diffuse=this.parseColor(e)}},{key:"parse_Ks",value:function(e){this.currentMaterial.specular=this.parseColor(e)}},{key:"parse_Ke",value:function(e){this.currentMaterial.emissive=this.parseColor(e)}},{key:"parse_Tf",value:function(e){this.currentMaterial.transmissionFilter=this.parseColor(e)}},{key:"parse_d",value:function(e){this.currentMaterial.dissolve=parseFloat(e.pop())}},{key:"parse_illum",value:function(e){this.currentMaterial.illumination=parseInt(e[0])}},{key:"parse_Ni",value:function(e){this.currentMaterial.refractionIndex=parseFloat(e[0])}},{key:"parse_Ns",value:function(e){this.currentMaterial.specularExponent=parseInt(e[0])}},{key:"parse_sharpness",value:function(e){this.currentMaterial.sharpness=parseInt(e[0])}},{key:"parse_cc",value:function(e,t){t.colorCorrection="on"==e[0]}},{key:"parse_blendu",value:function(e,t){t.horizontalBlending="on"==e[0]}},{key:"parse_blendv",value:function(e,t){t.verticalBlending="on"==e[0]}},{key:"parse_boost",value:function(e,t){t.boostMipMapSharpness=parseFloat(e[0])}},{key:"parse_mm",value:function(e,t){t.modifyTextureMap.brightness=parseFloat(e[0]),t.modifyTextureMap.contrast=parseFloat(e[1])}},{key:"parse_ost",value:function(e,t,r){for(;e.length<3;)e.push(r);t.u=parseFloat(e[0]),t.v=parseFloat(e[1]),t.w=parseFloat(e[2])}},{key:"parse_o",value:function(e,t){this.parse_ost(e,t.offset,0)}},{key:"parse_s",value:function(e,t){this.parse_ost(e,t.scale,1)}},{key:"parse_t",value:function(e,t){this.parse_ost(e,t.turbulence,0)}},{key:"parse_texres",value:function(e,t){t.textureResolution=parseFloat(e[0])}},{key:"parse_clamp",value:function(e,t){t.clamp="on"==e[0]}},{key:"parse_bm",value:function(e,t){t.bumpMultiplier=parseFloat(e[0])}},{key:"parse_imfchan",value:function(e,t){t.imfChan=e[0]}},{key:"parse_type",value:function(e,t){t.reflectionType=e[0]}},{key:"parseOptions",value:function(e){var t={colorCorrection:!1,horizontalBlending:!0,verticalBlending:!0,boostMipMapSharpness:0,modifyTextureMap:{brightness:0,contrast:1},offset:{u:0,v:0,w:0},scale:{u:1,v:1,w:1},turbulence:{u:0,v:0,w:0},clamp:!1,textureResolution:null,bumpMultiplier:1,imfChan:null},r=void 0,a=void 0,n={};for(e.reverse();e.length;){var i=e.pop();i.startsWith("-")?(r=i.substr(1),n[r]=[]):n[r].push(i)}for(r in n)if(n.hasOwnProperty(r)){a=n[r];var s=this["parse_"+r];s&&s.bind(this)(a,t)}return t}},{key:"parseMap",value:function(e){var t=void 0,a=void 0;if(e[0].startsWith("-"))t=e.pop(),a=e;else{var n=r(e);t=n[0],a=n.slice(1)}return a=this.parseOptions(a),a.filename=t,a}},{key:"parse_map_Ka",value:function(e){this.currentMaterial.mapAmbient=this.parseMap(e)}},{key:"parse_map_Kd",value:function(e){this.currentMaterial.mapDiffuse=this.parseMap(e)}},{key:"parse_map_Ks",value:function(e){this.currentMaterial.mapSpecular=this.parseMap(e)}},{key:"parse_map_Ke",value:function(e){this.currentMaterial.mapEmissive=this.parseMap(e)}},{key:"parse_map_Ns",value:function(e){this.currentMaterial.mapSpecularExponent=this.parseMap(e)}},{key:"parse_map_d",value:function(e){this.currentMaterial.mapDissolve=this.parseMap(e)}},{key:"parse_map_aat",value:function(e){this.currentMaterial.antiAliasing="on"==e[0]}},{key:"parse_map_bump",value:function(e){this.currentMaterial.mapBump=this.parseMap(e)}},{key:"parse_bump",value:function(e){this.parse_map_bump(e)}},{key:"parse_disp",value:function(e){this.currentMaterial.mapDisplacement=this.parseMap(e)}},{key:"parse_decal",value:function(e){this.currentMaterial.mapDecal=this.parseMap(e)}},{key:"parse_refl",value:function(e){this.currentMaterial.mapReflections.push(this.parseMap(e))}},{key:"parse",value:function(){var e=this.data.split(/\r?\n/),t=!0,a=!1,n=void 0;try{for(var i,s=e[Symbol.iterator]();!(t=(i=s.next()).done);t=!0){var l=i.value;if((l=l.trim())&&!l.startsWith("#")){var o=l.split(/\s/),u=void 0,c=o,f=r(c);u=f[0],o=f.slice(1);var h=this["parse_"+u];h&&h.bind(this)(o)}}}catch(e){a=!0,n=e}finally{try{!t&&s.return&&s.return()}finally{if(a)throw n}}delete this.data,this.currentMaterial=null}}]), e}();},function(e,exports,t){e.exports=t(4);},function(e,exports,t){"use strict";Object.defineProperty(exports,"__esModule",{value:!0}), exports.version=exports.deleteMeshBuffers=exports.initMeshBuffers=exports.downloadMeshes=exports.downloadModels=exports.Layout=exports.MaterialLibrary=exports.Material=exports.Mesh=void 0;var r=t(1),a=function(e){return e&&e.__esModule?e:{default:e}}(r),n=t(2),i=t(0),s=t(5);exports.Mesh=a.default, exports.Material=n.Material, exports.MaterialLibrary=n.MaterialLibrary, exports.Layout=i.Layout, exports.downloadModels=s.downloadModels, exports.downloadMeshes=s.downloadMeshes, exports.initMeshBuffers=s.initMeshBuffers, exports.deleteMeshBuffers=s.deleteMeshBuffers, exports.version="1.1.3";},function(e,exports,t){"use strict";function r(e,t){var r=["mapDiffuse","mapAmbient","mapSpecular","mapDissolve","mapBump","mapDisplacement","mapDecal","mapEmissive"];t.endsWith("/")||(t+="/");var a=[];for(var n in e.materials)if(e.materials.hasOwnProperty(n)){n=e.materials[n];var i=!0,s=!1,l=void 0;try{for(var o,u=r[Symbol.iterator]();!(i=(o=u.next()).done);i=!0){var c=o.value;(function(e){var r=n[e];if(!r)return"continue";var i=t+r.filename;a.push(fetch(i).then(function(e){if(!e.ok)throw new Error;return e.blob()}).then(function(e){var t=new Image;return t.src=URL.createObjectURL(e), r.texture=t, new Promise(function(e){return t.onload=e})}).catch(function(){}));})(c);}}catch(e){s=!0, l=e;}finally{try{!i&&u.return&&u.return();}finally{if(s)throw l}}}return Promise.all(a)}function a(e){var t=[],a=!0,n=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(a=(s=o.next()).done);a=!0){var f=s.value;!function(e){var a=[];if(!e.obj)throw new Error('"obj" attribute of model object not set. The .obj file is required to be set in order to use downloadModels()');var n={};n.indicesPerMaterial=!!e.indicesPerMaterial, n.calcTangentsAndBitangents=!!e.calcTangentsAndBitangents;var i=e.name;if(!i){var s=e.obj.split("/");i=s[s.length-1].replace(".obj","");}if(a.push(Promise.resolve(i)), a.push(fetch(e.obj).then(function(e){return e.text()}).then(function(e){return new u.default(e,n)})), e.mtl){var l=e.mtl;"boolean"==typeof l&&(l=e.obj.replace(/\.obj$/,".mtl")), a.push(fetch(l).then(function(e){return e.text()}).then(function(t){var a=new c.MaterialLibrary(t);if(!1!==e.downloadMtlTextures){var n=e.mtlTextureRoot;return n||(n=l.substr(0,l.lastIndexOf("/"))),Promise.all([Promise.resolve(a),r(a,n)])}return Promise.all(Promise.resolve(a))}).then(function(e){return e[0]}));}t.push(Promise.all(a));}(f);}}catch(e){n=!0, i=e;}finally{try{!a&&o.return&&o.return();}finally{if(n)throw i}}return Promise.all(t).then(function(e){var t={},r=!0,a=!1,n=void 0;try{for(var i,s=e[Symbol.iterator]();!(r=(i=s.next()).done);r=!0){var o=i.value,u=l(o,3),c=u[0],f=u[1],h=u[2];f.name=c, h&&f.addMaterialLibrary(h), t[c]=f;}}catch(e){a=!0, n=e;}finally{try{!r&&s.return&&s.return();}finally{if(a)throw n}}return t})}function n(e,t,r){void 0===r&&(r={});var a=[];for(var n in e){(function(t){if(!e.hasOwnProperty(t))return"continue";var r=e[t];a.push(fetch(r).then(function(e){return e.text()}).then(function(e){return[t,new u.default(e)]}));})(n);}Promise.all(a).then(function(e){var a=!0,n=!1,i=void 0;try{for(var s,o=e[Symbol.iterator]();!(a=(s=o.next()).done);a=!0){var u=s.value,c=l(u,2),f=c[0],h=c[1];r[f]=h;}}catch(e){n=!0, i=e;}finally{try{!a&&o.return&&o.return();}finally{if(n)throw i}}return t(r)});}function i(e,t){t.normalBuffer=f(e,e.ARRAY_BUFFER,t.vertexNormals,3), t.textureBuffer=f(e,e.ARRAY_BUFFER,t.textures,t.textureStride), t.vertexBuffer=f(e,e.ARRAY_BUFFER,t.vertices,3), t.indexBuffer=f(e,e.ELEMENT_ARRAY_BUFFER,t.indices,1);}function s(e,t){e.deleteBuffer(t.normalBuffer), e.deleteBuffer(t.textureBuffer), e.deleteBuffer(t.vertexBuffer), e.deleteBuffer(t.indexBuffer);}Object.defineProperty(exports,"__esModule",{value:!0});var l=function(){function e(e,t){var r=[],a=!0,n=!1,i=void 0;try{for(var s,l=e[Symbol.iterator]();!(a=(s=l.next()).done)&&(r.push(s.value), !t||r.length!==t);a=!0);}catch(e){n=!0, i=e;}finally{try{!a&&l.return&&l.return();}finally{if(n)throw i}}return r}return function(t,r){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return e(t,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();exports.downloadModels=a, exports.downloadMeshes=n, exports.initMeshBuffers=i, exports.deleteMeshBuffers=s;var o=t(1),u=function(e){return e&&e.__esModule?e:{default:e}}(o),c=t(2),f=(t(0), function(e,t,r,a){var n=e.createBuffer(),i=t===e.ARRAY_BUFFER?Float32Array:Uint16Array;return e.bindBuffer(t,n),e.bufferData(t,new i(r),e.STATIC_DRAW),n.itemSize=a,n.numItems=r.length/a,n});}])});
});

var WebGLObjectLoader = unwrapExports(webglObjLoader_min);

/**
 * A .obj file loader
 * @class ObjectFileLoader
 */
class ObjectFileLoader {
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
}

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

/**
 * A collada object
 * @class ColladaObject
 * @extends WebGLObject
 */
class ColladaObject extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.animated = !!opts.animated;
    this.rotate.x = 180;
  }
}

ColladaObject.prototype.createMesh = function(mesh) {
  let data = this.data;
  data.vertices = new Float32Array(mesh.vertices);
  data.normals = new Float32Array(mesh.normals);
  data.uvs = new Float32Array(mesh.uvs);
  data.indices = new Uint16Array(mesh.indices);
  this.createLoader();
};

/**
 * Represents a single keyframe of an animation
 * @class KeyFrame
 */
class KeyFrame {
  /**
   * @param {Number} timestamp - The timestamp of this keyframe
   * @param {Array} transforms - The local transforms of this keyframe
   * @constructor
   */
  constructor(timestamp, transforms) {
    this.timestamp = timestamp;
    this.transforms = transforms;
  }
}

/**
 * Represents a single joint of an animation's skeleton
 * @class Joint
 */
class Joint {
  /**
   * @param {String} name
   * @param {Number} index
   * @param {Array} children
   * @param {Array} inverseBindings
   * @constructor
   */
  constructor(name, index, children, inverseBindings) {
    this.name = name;
    this.index = index;
    this.children = children;
    this.localTransform = mat4.create();
    this.inverseBindings = inverseBindings;
  }
}

/**
 * Represents a single transformable joint
 * @class JointTransform
 */
class JointTransform {
  /**
   * @param {Float32Array} position
   * @param {Float32Array} rotation
   * @param {Joint} joint - The relative joint
   * @constructor
   */
  constructor(position, rotation, joint) {
    this.matrix = mat4.create();
    this.translate = position;
    this.rotate = rotation;
    this.joint = joint;
  }
  /**
   * Returns the joint's local transform
   * @return {Float32Array}
   */
  getLocalTransform() {
    let out = this.matrix;
    let translate = this.translate;
    let rotate = this.rotate;
    mat4.identity(out);
    mat4.translate(
      out,
      out,
      translate
    );
    mat4.multiply(
      out,
      out,
      quat.toRotationMatrix(mat4.create(), rotate)
    );
    return out;
  }
  /**
   * Interpolate between two transforms
   * @param {JointTransform} a
   * @param {JointTransform} b
   * @param {Number} t
   * @return {JointTransform}
   */
  static interpolate(a, b, t) {
    let pos = JointTransform.interpolatePosition(a.translate, b.translate, t);
    let rot = JointTransform.interpolateRotation(a.rotate, b.rotate, t);
    if (a.joint !== b.joint) console.error(`Fatal error: Joints doesn't match!`);
    return new JointTransform(pos, rot, a.joint);
  }
  /**
   * Interpolate position of two transforms
   * @param {Float32Array} a
   * @param {Float32Array} b
   * @param {Number} t
   * @return {Float32Array}
   */
  static interpolatePosition(a, b, t) {
    let out = vec3.create();
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
  }
  /**
   * Interpolate rotation of two transforms
   * @param {Float32Array} a
   * @param {Float32Array} b
   * @param {Number} t
   * @return {Float32Array}
   */
  static interpolateRotation(a, b, t) {
    let out = quat.create();
    quat.slerp(out, a, b, t);
    return out;
  }
}

/**
 * An animation class
 * @class WebGLAnimation
 */
class WebGLAnimation {
  /**
   * @param {Object} opts - Options
   * @constructor
   */
  constructor(opts) {
    this.data = opts.data;
    this.object = opts.object;
    this.frames = 0;
    this.duration = 0;
    this.joints = this.processJoints(this.data);
    this.jointCount = this.joints.length;
    this.rootJoint = this.getRootJoint(this.joints);
    this.keyframes = this.processKeyframes(this.data.keyframes);
    this.duration = this.keyframes[this.keyframes.length - 1].timestamp;
  }
}

/**
 * Finds the root joint of a group of joints
 * @param {Array} joints - Array of joints
 * @return {Joint}
 */
WebGLAnimation.prototype.getRootJoint = function(joints) {
  return joints[0];
};

/**
 * Processed joints
 * @param {Object} data
 * @return {Array} - Array of instantiated joints
 */
WebGLAnimation.prototype.processJoints = function(input) {
  let joints = [];
  let data = this.normalizeRAWJoints(input);
  data.map(data => {
    let name = data.name;
    let index = data.index;
    let children = data.children;
    let inverseBindings = data.inverseBindings;
    let joint = new Joint(name, index, children, inverseBindings);
    joints.push(joint);
  });
  return joints;
};

/**
 * Converts an object of RAW joints into
 * processable list of joints in ascending order
 * Note: Object property orders are not reliable!
 * @param {Object} data - Unprocessed data
 * @return {Array} Processed and sorted joints
 */
WebGLAnimation.prototype.normalizeRAWJoints = function(data) {
  let out = [];
  let names = data.jointNamePositionIndex;
  let joints = data.jointInverseBindPoses;
  let length = Object.keys(joints).length;
  for (let ii = 0; ii < length; ++ii) {
    let index = ii;
    let inverseBindings = joints[ii];
    let name = this.getJointNameByIndex(names, ii);
    out.push({ index: index, inverseBindings, name });
  }
  out.map(joint => {
    joint.children = this.getJointChildren(out, data, joint.name, joint.index);
  });
  return out;
};

/**
 * Returns a joint's connected children
 * @param {Array} joints - Processed joint data
 * @param {Object} data - Joint data
 * @param {String} name - Joint name
 * @param {Number} index  - Joint's index
 * @return {Array} joint children
 */
WebGLAnimation.prototype.getJointChildren = function(joints, data, name, index) {
  let parents = data.jointParents;
  let children = [];
  for (let key in parents) {
    let parent = parents[key];
    if (parent === name) {
      let index = data.jointNamePositionIndex[key];
      children.push(joints[index]);
    }
  }
  return children;
};

/**
 * Returns the joint's name by the given joint's index
 * @param {Object} names - Joint name map
 * @param {Number} index  - Joint's index
 * @return {String} joint's name
 */
WebGLAnimation.prototype.getJointNameByIndex = function(names, index) {
  for (let key in names) {
    if (names[key] === index) return key;
  }
  return null;
};

/**
 * Converts an array of RAW keyframes into keyframes
 * @param {Array} rawFrames
 * @return {Array} - Array of instantiated keyframe
 */
WebGLAnimation.prototype.processKeyframes = function(rawFrames) {
  let frames = this.normalizeRAWFrames(rawFrames);
  let keyframes = [];
  for (let ii = 0; ii < frames.length; ++ii) {
    let frame = frames[ii];
    let keyframe = new KeyFrame(frame.ts, frame.data);
    keyframes.push(keyframe);
  }
  return keyframes;
};

/**
 * Converts an object of RAW keyframes into
 * processable list of keyframes in ascending order
 * Note: Object property orders are not reliable!
 * @param {Array} frames - Unprocessed frames
 * @return {Array} Processed and sorted frames
 */
WebGLAnimation.prototype.normalizeRAWFrames = function(frames) {
  let out = [];
  for (let key in frames) {
    let ts = parseFloat(key);
    let data = frames[key];
    let transform = this.createKeyframeTransforms(data);
    out.push({ ts, data: transform });
  }
  // ascending order
  out = out.sort((a, b) => a.ts > b.ts);
  return out;
};

/**
 * @param {Array} data - List of joint transform data
 * @return {Array} - List of joint transforms
 */
WebGLAnimation.prototype.createKeyframeTransforms = function(transforms) {
  let out = [];
  let joints = this.joints;
  for (let ii = 0; ii < transforms.length; ++ii) {
    let data = transforms[ii];
    let joint = joints[ii];
    let rotate = quat.fromMat3(quat.create(), data);
    let translate = quat.fromEuler(vec3.create(), data[13], data[14], data[15]);
    let transform = new JointTransform(translate, rotate, joint);
    out.push(transform);
  }
  return out;
};

/**
 * The animator class
 * @class WebGLAnimator
 */
class WebGLAnimator {
  /**
   * @param {WebGLObject} object - The object to animate
   * @param {Object} animationData - The animation data to use
   * @constructor
   */
  constructor(object, animationData) {
    this.object = object;
    this.renderer = object.renderer;
    this.gl = this.renderer.gl;
    this.animation = this.createAnimation(animationData);
    this.frames = 0;
    this.currentFrame = 0;
    this.currentPose = null;
    this.animationTime = 0;
  }
}

/**
 * Creates an animation with the given animation data
 * @param {Object} data
 * @return {WebGLAnimation}
 */
WebGLAnimator.prototype.createAnimation = function(data) {
  let anim = new WebGLAnimation({
    data: data,
    object: this.object
  });
  return anim;
};

/**
 * Updates the animation frames locally and of the attached object
 */
WebGLAnimator.prototype.update = function(delta) {
  let animation = this.animation;
  if (!animation) return;
  this.frames++;
  this.animationTime += delta;
  if (this.animationTime > animation.duration) {
    this.animationTime %= animation.duration;
  }
  this.updateObjectAnimation();
};

/**
 * Updates an object's animation state
 */
WebGLAnimator.prototype.updateObjectAnimation = function() {
  let pose = this.getCurrentAnimationPose();
  let animation = this.animation;
  this.currentPose = pose;
  this.applyPoseToJoints(pose, animation.rootJoint, mat4.create());
};

WebGLAnimator.prototype.applyPoseToJoints = function(currentPose, joint, parentTransform) {
  let currentLocalTransform = currentPose[joint.index].getLocalTransform();
  let currentTransform = mat4.multiply(mat4.create(), currentLocalTransform, parentTransform);
  joint.children.map(child => {
    this.applyPoseToJoints(currentPose, child, currentTransform);
  });
  mat4.multiply(currentTransform, currentTransform, joint.inverseBindings);
  joint.localTransform = currentTransform;
};

/**
 * Calculates and returns the current pose of the animation
 */
WebGLAnimator.prototype.getCurrentAnimationPose = function() {
  let frames = this.getPreviousAndNextKeyframe();
  let previous = frames.previous;
  let next = frames.next;
  let t = this.getFrameProgression(previous, next);
  let pose = this.interpolatePoses(previous, next, t);
  return pose;
};

WebGLAnimator.prototype.getPreviousAndNextKeyframe = function() {
  let frames = this.animation.keyframes;
  let previousFrame = frames[0];
  let nextFrame = frames[0];
  for (let ii = 1; ii < frames.length; ++ii) {
    nextFrame = frames[ii];
    if (nextFrame.timestamp > this.animationTime) break;
    previousFrame = frames[ii];
  }
  return {
    previous: previousFrame,
    next: nextFrame
  };
};

/**
 * Calculates progression between previous and next keyframes
 * @param {KeyFrame} a - Previous keyframe
 * @param {KeyFrame} b - Next keyframe
 * @return {Number} - The progression
 */
WebGLAnimator.prototype.getFrameProgression = function(a, b) {
  let total = b.timestamp - a.timestamp;
  let current = this.animationTime - a.timestamp;
  return current / total;
};

WebGLAnimator.prototype.interpolatePoses = function(a, b, t) {
  let pose = [];
  let poseA = a.transforms;
  let poseB = b.transforms;
  for (let ii = 0; ii < poseA.length; ++ii) {
    let previous = poseA[ii];
    let next = poseB[ii];
    let current = JointTransform.interpolate(previous, next, t);
    pose.push(current);
  }
  return pose;
};

/**
 * An animated object
 * @class AnimatedObject
 * @extends WebGLObject
 */
class AnimatedObject extends ColladaObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.animation = new WebGLAnimator(this, opts.animation);
  }
}

/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

var ms = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse$1(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse$1(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

var debug$1 = createCommonjsModule(function (module, exports) {
/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = ms;

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms$$1 = curr - (prevTime || curr);
    self.diff = ms$$1;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}
});

var browser = createCommonjsModule(function (module, exports) {
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = debug$1;
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit');

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}
});

/**
 * Module dependencies.
 */

var debug = browser('xml-parser');

/**
 * Expose `parse`.
 */

var xmlParser = parse;

/**
 * Parse the given string of `xml`.
 *
 * @param {String} xml
 * @return {Object}
 * @api public
 */

function parse(xml) {
  xml = xml.trim();

  // strip comments
  xml = xml.replace(/<!--[\s\S]*?-->/g, '');

  return document();

  /**
   * XML document.
   */

  function document() {
    return {
      declaration: declaration(),
      root: tag()
    }
  }

  /**
   * Declaration.
   */

  function declaration() {
    var m = match(/^<\?xml\s*/);
    if (!m) return;

    // tag
    var node = {
      attributes: {}
    };

    // attributes
    while (!(eos() || is('?>'))) {
      var attr = attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    match(/\?>\s*/);

    return node;
  }

  /**
   * Tag.
   */

  function tag() {
    debug('tag %j', xml);
    var m = match(/^<([\w-:.]+)\s*/);
    if (!m) return;

    // name
    var node = {
      name: m[1],
      attributes: {},
      children: []
    };

    // attributes
    while (!(eos() || is('>') || is('?>') || is('/>'))) {
      var attr = attribute();
      if (!attr) return node;
      node.attributes[attr.name] = attr.value;
    }

    // self closing tag
    if (match(/^\s*\/>\s*/)) {
      return node;
    }

    match(/\??>\s*/);

    // content
    node.content = content();

    // children
    var child;
    while (child = tag()) {
      node.children.push(child);
    }

    // closing
    match(/^<\/[\w-:.]+>\s*/);

    return node;
  }

  /**
   * Text content.
   */

  function content() {
    debug('content %j', xml);
    var m = match(/^([^<]*)/);
    if (m) return m[1];
    return '';
  }

  /**
   * Attribute.
   */

  function attribute() {
    debug('attribute %j', xml);
    var m = match(/([\w:-]+)\s*=\s*("[^"]*"|'[^']*'|\w+)\s*/);
    if (!m) return;
    return { name: m[1], value: strip(m[2]) }
  }

  /**
   * Strip quotes from `val`.
   */

  function strip(val) {
    return val.replace(/^['"]|['"]$/g, '');
  }

  /**
   * Match `re` and advance the string.
   */

  function match(re) {
    var m = xml.match(re);
    if (!m) return;
    xml = xml.slice(m[0].length);
    return m;
  }

  /**
   * End-of-source.
   */

  function eos() {
    return 0 == xml.length;
  }

  /**
   * Check for `prefix`.
   */

  function is(prefix) {
    return 0 == xml.indexOf(prefix);
  }
}

var multipleMeshErrorMessage = generateMultipleMeshError;

/*
 * We currently only support collada files with one mesh (geometry)
 *  Generate an error message when the collada data contains multiple
 *  geometries
 */
// TODO: Give a different error message if there are 0 meshes
//  ... it looks like you did not export a mesh ...
//  Add a test for this
function generateMultipleMeshError (numMeshes) {
  throw new Error(
    `
    It looks like you're trying to parse a model that has ${numMeshes} geometries.

    collada-dae-parser only supports collada files with 1 geometry.

    You might try opening your model in your favorite modeling tool and joining
    your geometries into one.

    Here's some documentation on how to do it in Blender:

    https://github.com/chinedufn/collada-dae-parser/blob/master/docs/blender-export/blender-export.md#multiple-meshes
    `
  )
}

var parseLibraryGeometries = ParseLibraryGeometries;

function ParseLibraryGeometries (library_geometries) {
  // We only support models with 1 geometry. If the model zero or
  // multiple meshes we alert the user
  if (library_geometries[0].geometry.length !== 1) {
    throw new multipleMeshErrorMessage(library_geometries[0].geometry.length)
  }

  var geometryMesh = library_geometries[0].geometry[0].mesh[0];
  var source = geometryMesh.source;

  /* Vertex Positions, UVs, Normals */
  var polylistIndices = geometryMesh.polylist[0].p[0].split(' ');

  var vertexNormalIndices = [];
  var vertexPositionIndices = [];
  var vertexUVIndices = [];
  // TODO: This is currently dependent on a certain vertex data order
  // we should instead read this order from the .dae file
  polylistIndices.forEach(function (vertexIndex, positionInArray) {
    if (positionInArray % source.length === 0) {
      vertexPositionIndices.push(Number(vertexIndex));
    } else if (positionInArray % source.length === 1) {
      vertexNormalIndices.push(Number(vertexIndex));
    }
    if (positionInArray % source.length === 2) {
      vertexUVIndices.push(Number(vertexIndex));
    }
  });
  var vertexPositions = source[0].float_array[0]._.split(' ').map(Number);
  var vertexNormals = source[1].float_array[0]._.split(' ').map(Number);
  var vertexUVs = [];
  // TODO: use input, semantics, source, offset, etc
  if (source[2]) {
    vertexUVs = source[2].float_array[0]._.split(' ').map(Number);
  }
  /* End Vertex Positions, UVs, Normals */

  return {
    vertexPositions: vertexPositions,
    vertexNormals: vertexNormals,
    vertexUVs: vertexUVs,
    vertexNormalIndices: vertexNormalIndices,
    vertexPositionIndices: vertexPositionIndices,
    vertexUVIndices: vertexUVIndices
  }
}

var parseVisualScenes = ParseVisualScenes;

// TODO: Handle child joints. Maybe depth first traversal?
function ParseVisualScenes (library_visual_scenes) {
  var visualScene = library_visual_scenes[0].visual_scene[0];
  var parsedJoints = {};

  // Some .dae files will export a shrunken model. Here's how to scale it
  var armatureScale = null;
  visualScene.node.forEach(function (node) {
    // node.node is the location of all top level parent nodes
    if (node.node) {
      if (node.scale && node.scale.length > 0) {
        armatureScale = node.scale[0]._.split(' ').map(Number);
      }
      parsedJoints = parseJoints(node.node);
    }
    /*
    // Check for an instance controller. If one exists we have a skeleton
    if (node.instance_controller) {
    // TODO: Do I need to remove the leading `#` ?
    joints = node.instance_controller[0].skeleton
    }
    */
  });

  return {
    jointParents: parsedJoints,
    armatureScale: armatureScale
  }
}

// Recursively parse child joints
function parseJoints (node, parentJointName, accumulator) {
  accumulator = accumulator || {};
  node.forEach(function (joint) {
    accumulator[joint.$.sid] = accumulator[joint.$.sid] || {};
    // The bind pose of the matrix. We don't make use of this right now, but you would
    // use it to render a model in bind pose. Right now we only render the model based on
    // their animated joint positions, so we ignore this bind pose data
    accumulator[joint.$.sid].jointMatrix = joint.matrix[0]._.split(' ').map(Number);
    accumulator[joint.$.sid].parent = parentJointName;
    if (joint.node) {
      parseJoints(joint.node, joint.$.sid, accumulator);
    }
  });

  return accumulator
}

var multiply_1 = multiply;

/**
 * Multiplies two mat4's
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the first operand
 * @param {mat4} b the second operand
 * @returns {mat4} out
 */
function multiply(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
    out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    return out;
}

var parseLibraryControllers = ParseLibraryControllers;

// TODO: Read  technique_commons instead of hard coding attribute locations
function ParseLibraryControllers (library_controllers) {
  var controller = library_controllers[0].controller;
  var armatureName;
  if (controller) {
    // Get the name of the armature that this model is a child of
    armatureName = controller[0].$.name;

    // Number of vertexes that need weights
    // var numVertices = controller[0].skin[0].vertex_weights[0].$.count

    // # of (joint,weight) pairs to read for each vertex
    // TODO: had to trim this.. should I trim everywhere?
    var jointWeightCounts = controller[0].skin[0].vertex_weights[0].vcount[0].trim().split(' ').map(Number);

    // An array of all possible weights (I think?)
    var weightsArray = controller[0].skin[0].source[2].float_array[0]._.split(' ').map(Number);

    // Every (joint,weight). Use jointWeightCounts to know how many to read per vertex
    var parsedVertexJointWeights = [];
    var jointsAndWeights = controller[0].skin[0].vertex_weights[0].v[0].split(' ').map(Number);
    jointWeightCounts.forEach(function (_, index) {
      var numJointWeightsToRead = jointWeightCounts[index];
      parsedVertexJointWeights[index] = {};
      for (var i = 0; i < numJointWeightsToRead; i++) {
        // The particular joint that we are dealing with, and its weighting on this vertex
        var jointNumber = jointsAndWeights.shift();
        var jointWeighting = jointsAndWeights.shift();
        parsedVertexJointWeights[index][jointNumber] = weightsArray[jointWeighting];
      }
    });

    // All of our model's joints
    var orderedJointNames = controller[0].skin[0].source[0].Name_array[0]._.split(' ');

    // Bind shape matrix (inverse bind matrix)
    var bindShapeMatrix = controller[0].skin[0].bind_shape_matrix[0].split(' ').map(Number);

    // The matrices that transforms each of our joints from world space to model space.
    // You typically multiply this with all parent joint bind poses.
    // We do this in `parse-skeletal-animations.js`
    var jointInverseBindPoses = {};

    var bindPoses = controller[0].skin[0].source[1].float_array[0]._.split(' ').map(Number);

    // A way to look up each joint's index using it's name
    // This is useful for creating bone groups using names
    // but then easily converting them to their index within
    // the collada-dae-parser data structure.
    //  (collada-dae-parser uses index's and not names to store bone data)
    var jointNamePositionIndex = {};
    orderedJointNames.forEach(function (jointName, index) {
      // If we've already encountered this joint we skip it
      // this is meant to handle an issue where Blender was
      // exporting the same joint name twice for my right side bones that were
      // duplicates of my original left side bones. Still not sure when/wju
      // this happens. Must have done something strange. Doesn't happen to
      // every model..
      if (jointNamePositionIndex[jointName] || jointNamePositionIndex[jointName] === 0) { return }

      var bindPose = bindPoses.slice(16 * index, 16 * index + 16);
      multiply_1(bindPose, bindShapeMatrix, bindPose);
      jointInverseBindPoses[index] = bindPose;
      jointNamePositionIndex[jointName] = index;
    });
  }
  // TODO: Should we also export the greatest number of joints for a vertex?
  // This might allow the consumer to use a shader that expects fewer joints
  // when skinning. i.e. mat4 vs mat3 or mat2 for weights
  return {
    jointInverseBindPoses: jointInverseBindPoses,
    jointNamePositionIndex: jointNamePositionIndex,
    vertexJointWeights: parsedVertexJointWeights,
    armatureName: armatureName
  }
}

var scale_1 = scale;

/**
 * Scales the mat4 by the dimensions in the given vec3
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to scale
 * @param {vec3} v the vec3 to scale the matrix by
 * @returns {mat4} out
 **/
function scale(out, a, v) {
    var x = v[0], y = v[1], z = v[2];

    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

var transpose_1 = transpose;

/**
 * Transpose the values of a mat4
 *
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the source matrix
 * @returns {mat4} out
 */
function transpose(out, a) {
    // If we are transposing ourselves we can skip a few steps but have to cache some values
    if (out === a) {
        var a01 = a[1], a02 = a[2], a03 = a[3],
            a12 = a[6], a13 = a[7],
            a23 = a[11];

        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a01;
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a02;
        out[9] = a12;
        out[11] = a[14];
        out[12] = a03;
        out[13] = a13;
        out[14] = a23;
    } else {
        out[0] = a[0];
        out[1] = a[4];
        out[2] = a[8];
        out[3] = a[12];
        out[4] = a[1];
        out[5] = a[5];
        out[6] = a[9];
        out[7] = a[13];
        out[8] = a[2];
        out[9] = a[6];
        out[10] = a[10];
        out[11] = a[14];
        out[12] = a[3];
        out[13] = a[7];
        out[14] = a[11];
        out[15] = a[15];
    }
    
    return out;
}

var parseSkeletalAnimations = parseLibraryAnimations;

/**
 * Parse skinned animations from the libraryAnimations section of the collada file.
 * We only handle skinned animations here, regular location/rotation/scale animations
 * that apply to the entire mesh are handled in parse-loc-rot-scale.js
 * tl;dr if your model has animated bones/joints then that gets handled here
 *
 * TODO: parse interpolation? or just only support linear interpolation?
 * TODO: Don't hard code attribute location
 * TODO: Make use of require('local-bone-to-world-bone')
 */
function parseLibraryAnimations (libraryAnimations, jointInverseBindPoses, visualSceneData, jointNamePositionIndex) {
  var animations = libraryAnimations[0].animation;
  var allKeyframes = {};
  var keyframeJointMatrices = {};
  var jointParents = visualSceneData.jointParents;
  var armatureScale = visualSceneData.armatureScale;

  // First pass.. get all the joint matrices
  animations.forEach(function (anim, animationIndex) {
    if (anim.$.id.indexOf('pose_matrix') !== -1) {
      // TODO: Is this the best way to get an animations joint target?
      var animatedJointName = anim.channel[0].$.target.split('/')[0];

      var currentKeyframes = anim.source[0].float_array[0]._.split(' ').map(Number);

      var currentJointPoseMatrices = anim.source[1].float_array[0]._.split(' ').map(Number);

      currentKeyframes.forEach(function (_, keyframeIndex) {
        keyframeJointMatrices[currentKeyframes[keyframeIndex]] = keyframeJointMatrices[currentKeyframes[keyframeIndex]] || {};
        var currentJointMatrix = currentJointPoseMatrices.slice(16 * keyframeIndex, 16 * keyframeIndex + 16);
        if (!jointParents[animatedJointName].parent) {
          // apply library visual scene transformations to top level parent joint(s)
          if (armatureScale) {
            scale_1(currentJointMatrix, currentJointMatrix, armatureScale);
          }
        }

        keyframeJointMatrices[currentKeyframes[keyframeIndex]][animatedJointName] = currentJointMatrix;
      });
    }
  });
  // Second pass.. Calculate world matrices
  animations.forEach(function (anim, animationIndex) {
    if (anim.$.id.indexOf('pose_matrix') !== -1) {
      var animatedJointName = anim.channel[0].$.target.split('/')[0];
      var currentKeyframes = anim.source[0].float_array[0]._.split(' ').map(Number);
      currentKeyframes.forEach(function (_, keyframeIndex) {
        var currentKeyframe = currentKeyframes[keyframeIndex];
        allKeyframes[currentKeyframes[keyframeIndex]] = allKeyframes[currentKeyframe] || [];

        // Multiply by parent world matrix
        var jointWorldMatrix = getParentWorldMatrix(animatedJointName, currentKeyframe, jointParents, keyframeJointMatrices);

        // Multiply our joint's inverse bind matrix
        multiply_1(jointWorldMatrix, jointInverseBindPoses[jointNamePositionIndex[animatedJointName]], jointWorldMatrix);

        // Turn our row major matrix into a column major matrix. OpenGL uses column major
        transpose_1(jointWorldMatrix, jointWorldMatrix);

        // Trim to 6 significant figures (Maybe even 6 is more than needed?)
        jointWorldMatrix = jointWorldMatrix.map(function (val) {
          return parseFloat(val.toFixed(6))
        });

        allKeyframes[currentKeyframe][jointNamePositionIndex[animatedJointName]] = jointWorldMatrix;
      });
    }
  });

  return allKeyframes
}

// TODO: Refactor. Depth first traversal might make all of this less hacky
function getParentWorldMatrix (jointName, keyframe, jointParents, keyframeJointMatrices) {
  // child -> parent -> parent -> ...
  var jointMatrixTree = foo(jointName, keyframe, jointParents, keyframeJointMatrices);
  // TODO: Revisit this. Thrown in to pass tests. Maybe just return `jointMatrix`
  // when there aren't any parent matrices to factor in
  var worldMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  jointMatrixTree.forEach(function (jointMatrix) {
    // TODO: Still not sure why we multiply in this order
    multiply_1(worldMatrix, worldMatrix, jointMatrix);
  });
  return worldMatrix
}

// TODO: Clean up... well.. at least it works now :sweat_smile:
function foo (jointName, keyframe, jointParents, keyframeJointMatrices) {
  var jointMatrix = keyframeJointMatrices[keyframe][jointName];
  var parentJointName = jointParents[jointName].parent;
  if (parentJointName) {
    return [jointMatrix].concat(foo(parentJointName, keyframe, jointParents, keyframeJointMatrices))
  }
  return [jointMatrix]
}

var parseLocRotScaleAnim = ExtractAnimation;

// TODO: Don't hard code dimension detection
var xyzMap = { 0: 'x', 1: 'y', 2: 'z' };
function ExtractAnimation (libraryAnimations) {
  var allKeyframes = {};
  var numAnims = Object.keys(libraryAnimations).length;

  for (var i = 0; i < numAnims; i++) {
    if (libraryAnimations[i].$.id.indexOf('location') !== -1 || libraryAnimations[i].$.id.indexOf('rotation') !== -1 || libraryAnimations[i].$.id.indexOf('scale') !== -1) {
      var animationSource = libraryAnimations[i].source;

      var currentKeyframes = animationSource[0].float_array[0]._.split(' ').map(Number);
      var positions = animationSource[1].float_array[0]._.split(' ').map(Number);

      // TODO: Interpolation, intangent, outtangent? Or just expect linear?
      // Depends how much of collada spec we want to support

      var xyz = xyzMap[i % 3];

      Object.keys(currentKeyframes).forEach(function (aKeyframe, index) {
        var dimension;
        if (i < 3) {
          dimension = 'location';
        } else if (i < 6) {
          dimension = 'rotation';
        } else {
          dimension = 'scale';
        }

        allKeyframes[currentKeyframes[index]] = allKeyframes[currentKeyframes[index]] || {};
        allKeyframes[currentKeyframes[index]][dimension] = allKeyframes[currentKeyframes[index]][dimension] || {};
        allKeyframes[currentKeyframes[index]][dimension][xyz] = positions[index];
      });
    }
  }

  return allKeyframes
}

var noControlBones_1 = noControlBones;

// Validate that the rig does not
// contain any pole targets, inverse kinematic,
// or other non deformation bones
//
// The user must bake these animations before
// exporting their model.
//  [LINK TO DOCS]
function noControlBones (allJointNames, deformationJointNames) {
  // We know that there are no control bones if the number of bones
  // matches the number of deformation bones. Otherwise we throw a
  // descriptive error
  if (allJointNames.length !== deformationJointNames.length) {
    // Let's find the control joint names so that we can report
    // them to the user

    // [joint_1, joint_2] -> {joint_1: true, joint_2: true}
    // We're doing this in order to look up the missing elements
    var deformJoints = deformationJointNames.reduce(function (allJoints, jointName) {
      allJoints[jointName] = true;
      return allJoints
    }, {});

    // Create an array of control joint names
    var nonDeformJoints = allJointNames.reduce(function (nonDeformJoints, jointName) {
      if (!deformJoints[jointName]) {
        nonDeformJoints.push(jointName);
      }
      return nonDeformJoints
    }, []);

    // Throw an error with a link to the documentation and the names of their non-deformation bones
    throw new Error(
      `
      It looks like you're trying to parse a model that has ${nonDeformJoints.length} non deformation bone${nonDeformJoints.length > 1 ? 's' : ''}.

        -> ${nonDeformJoints.join(', ')}

      ---

      These could be inverse kinematics bones, control bones, pole targets, or other
      helper bones.

      collada-dae-parser does not support non-deformation bones.

      You might try opening your model in your favorite modeling tool and
      baking the effects of your control bones into your deformation bones.

      ---

      Here's some documentation on how to account for your control bones in Blender:

        -> https://github.com/chinedufn/collada-dae-parser/blob/master/docs/blender-export/blender-export.md#control-joints
      `
    )
  }
}

var parseCollada = ParseCollada;

// TODO:
// Use input, accessor, and param attributes instead of hard coding lookups
// Clean Up Code / less confusing var names
function ParseCollada (colladaXML) {
  var result = compactXML({}, xmlParser(colladaXML.toString()).root);
  result = { COLLADA: result.COLLADA[0] };

  var parsedObject = {};
  var parsedLibraryGeometries = parseLibraryGeometries(result.COLLADA.library_geometries);

  var visualSceneData = parseVisualScenes(result.COLLADA.library_visual_scenes);

  // The joint parents aren't actually joint parents so we get the joint parents..
  // This lib needs a refactor indeed
  // jointParents = {childBone: 'parentBone', anotherChild: 'anotherParent'}
  var jointParents;
  if (Object.keys(visualSceneData.jointParents).length) {
    jointParents = Object.keys(visualSceneData.jointParents)
    .reduce(function (jointParents, jointName) {
      // JSON.stringify {foo: undefined} = {}, os we replace undefined with null
      // to make sure that we don't lose any keys
      jointParents[jointName] = visualSceneData.jointParents[jointName].parent || null;
      return jointParents
    }, {});
  }

  var jointInverseBindPoses;
  var controllerData;
  if (result.COLLADA.library_controllers) {
    controllerData = parseLibraryControllers(result.COLLADA.library_controllers);
    if (controllerData.vertexJointWeights && Object.keys(controllerData.vertexJointWeights).length > 0) {
      parsedObject.vertexJointWeights = controllerData.vertexJointWeights;
      parsedObject.jointNamePositionIndex = controllerData.jointNamePositionIndex;
      parsedObject.jointInverseBindPoses = controllerData.jointInverseBindPoses;
      jointInverseBindPoses = controllerData.jointInverseBindPoses;

      // The parser only supports deformation bones. Control bones' affects must be baked in before exporting
      noControlBones_1(Object.keys(visualSceneData.jointParents), Object.keys(jointInverseBindPoses));
    }
  }

  // TODO: Also parse interpolation/intangent/outtangent
  if (result.COLLADA.library_animations) {
    parsedObject.keyframes = parseLocRotScaleAnim(result.COLLADA.library_animations[0].animation);
    if (Object.keys(parsedObject.keyframes).length === 0) {
      delete parsedObject.keyframes;
    }
    var keyframes = parseSkeletalAnimations(result.COLLADA.library_animations, jointInverseBindPoses, visualSceneData, controllerData.jointNamePositionIndex);
    if (Object.keys(keyframes).length > 0) {
      parsedObject.keyframes = keyframes;
    }
  }

  // Return our parsed collada object
  parsedObject.vertexNormalIndices = parsedLibraryGeometries.vertexNormalIndices;
  parsedObject.vertexNormals = parsedLibraryGeometries.vertexNormals;
  parsedObject.vertexPositionIndices = parsedLibraryGeometries.vertexPositionIndices;
  parsedObject.vertexPositions = parsedLibraryGeometries.vertexPositions;
  if (controllerData.armatureName) {
    parsedObject.armatureName = controllerData.armatureName;
  }
  if (jointParents) {
    parsedObject.jointParents = jointParents;
  }
  if (parsedLibraryGeometries.vertexUVs.length > 0) {
    parsedObject.vertexUVIndices = parsedLibraryGeometries.vertexUVIndices;
    parsedObject.vertexUVs = parsedLibraryGeometries.vertexUVs;
  }
  return parsedObject
}

/**
 * We used to use a different XML parsing library. This recursively transforms
 * the data that we get from our new XML parser to match the old one. This is a
 * stopgap measure until we get around to changing the keys that we look while we parse to
 * the keys that the new parser expects
 */
function compactXML (res, xml) {
  var txt = Object.keys(xml.attributes).length === 0 && xml.children.length === 0;
  var r = {};
  if (!res[xml.name]) res[xml.name] = [];
  if (txt) {
    r = xml.content || '';
  } else {
    r.$ = xml.attributes;
    r._ = xml.content || '';
    xml.children.forEach(function (ch) {
      compactXML(r, ch);
    });
  }
  res[xml.name].push(r);
  return res
}

var expandVertexData_1 = expandVertexData;

/**
 * Decompress a set of position, normal and uv indices and their
 * accompanying data.
 * This solves for situations when you are re-using the same
 * vertex positions but with a different normal or uv index.
 * You can't have multiple indices (ELEMENT_ARRAY_BUFFER) in
 * WebGL, so this module the data expands your data so that it
 * can use one ELEMENT_ARRAY_BUFFER for your vertex position indices
 *
 * TODO: Look into whether or not it's worth checking when deduping indices
 * whether or not all of the other indices would have been the same.
 * Seems like the potential savings would be negligible if any.. but look into it
 * Yeah.... a triangle saved is a triangle earned...
 */
function expandVertexData (compressedVertexData, opts) {
  opts = opts || {};
  // Handles wavefront .obj files that can have lines with
  // 3 vertices (triangle) or 4 (face).
  // Specifically designed to work with the JSON that `wavefront-obj-parser` provides.
  // If we find a `-1` as the fourth number it means was a triangle line.
  // Otherwise it is a face line that we'll expand into two triangles
  // `1 2 3 -1` would be a set of triangle indices
  // `1 2 3 4` would be a face that we'd expand into `1 2 3 1 3 4`
  if (opts.facesToTriangles) {
    var decodedVertexPositionIndices = [];
    var decodedVertexUVIndices = [];
    var decodedVertexNormalIndices = [];

    for (var i = 0; i < compressedVertexData.vertexPositionIndices.length / 4; i++) {
      decodedVertexPositionIndices.push(compressedVertexData.vertexPositionIndices[i * 4]);
      decodedVertexPositionIndices.push(compressedVertexData.vertexPositionIndices[i * 4 + 1]);
      decodedVertexPositionIndices.push(compressedVertexData.vertexPositionIndices[i * 4 + 2]);
      decodedVertexUVIndices.push(compressedVertexData.vertexUVIndices[i * 4]);
      decodedVertexUVIndices.push(compressedVertexData.vertexUVIndices[i * 4 + 1]);
      decodedVertexUVIndices.push(compressedVertexData.vertexUVIndices[i * 4 + 2]);
      decodedVertexNormalIndices.push(compressedVertexData.vertexNormalIndices[i * 4]);
      decodedVertexNormalIndices.push(compressedVertexData.vertexNormalIndices[i * 4 + 1]);
      decodedVertexNormalIndices.push(compressedVertexData.vertexNormalIndices[i * 4 + 2]);
      // If this is a face with 4 vertices we push a second triangle
      if (compressedVertexData.vertexPositionIndices[i * 4 + 3] !== -1) {
        decodedVertexPositionIndices.push(compressedVertexData.vertexPositionIndices[i * 4]);
        decodedVertexPositionIndices.push(compressedVertexData.vertexPositionIndices[i * 4 + 2]);
        decodedVertexPositionIndices.push(compressedVertexData.vertexPositionIndices[i * 4 + 3]);
        decodedVertexUVIndices.push(compressedVertexData.vertexUVIndices[i * 4]);
        decodedVertexUVIndices.push(compressedVertexData.vertexUVIndices[i * 4 + 2]);
        decodedVertexUVIndices.push(compressedVertexData.vertexUVIndices[i * 4 + 3]);
        decodedVertexNormalIndices.push(compressedVertexData.vertexNormalIndices[i * 4]);
        decodedVertexNormalIndices.push(compressedVertexData.vertexNormalIndices[i * 4 + 2]);
        decodedVertexNormalIndices.push(compressedVertexData.vertexNormalIndices[i * 4 + 3]);
      }
    }

    compressedVertexData.vertexPositionIndices = decodedVertexPositionIndices;
    compressedVertexData.vertexNormalIndices = decodedVertexNormalIndices;
    compressedVertexData.vertexUVIndices = decodedVertexUVIndices;
  }

  // Create the arrays that will hold our expanded vertex data
  var expandedPositionIndices = [];
  var expandedPositions = [];
  var expandedNormals = [];
  var expandedUVs = [];
  var expandedJointInfluences = [];
  var expandedJointWeights = [];

  // Track indices that we've already encountered so that we don't use them twice
  var encounteredPositionIndices = {};
  // Track the largest vertex position index that we encounter. When expanding
  // the data we will increment all vertex position indices that were used
  // more than once.
  // We will insert the proper data into the corresponding array indices
  // for our normal and uv arrays
  var largestPositionIndex = 0;
  // Track which counters we've already encountered so that we can loop through them later
  var unprocessedVertexNums = {};

  compressedVertexData.vertexPositionIndices.forEach(function (positionIndex, vertexNum) {
    // Keep track of the largest vertex index that we encounter
    largestPositionIndex = Math.max(largestPositionIndex, positionIndex);
    // If this is our first time seeing this index we build all of our
    // data arrays as usual.
    if (!encounteredPositionIndices[positionIndex]) {
      // Mark this vertex index as encountered. We'll deal with encountered indices later
      encounteredPositionIndices[positionIndex] = true;
      setVertexData(positionIndex, vertexNum);
    } else {
      unprocessedVertexNums[vertexNum] = true;
    }
  });

  // Go over all duplicate vertex indices and change them to a new index number.
  // Then duplicate their relevant data to that same index number
  Object.keys(unprocessedVertexNums).forEach(function (vertexNum) {
    var positionIndex = ++largestPositionIndex;

    setVertexData(positionIndex, vertexNum);
  });

  /**
   * Helper function to set the vertex data at a specified index.
   * This is what builds the arrays that we return to the module user for consumption
   */
  function setVertexData (positionIndex, vertexNum) {
    // The position index before we incremented it to dedupe it
    var originalPositionIndex = compressedVertexData.vertexPositionIndices[vertexNum];

    expandedPositionIndices[vertexNum] = positionIndex;
    var jointsAndWeights;
    if (compressedVertexData.vertexJointWeights) {
      jointsAndWeights = compressedVertexData.vertexJointWeights[originalPositionIndex];
    }

    for (var i = 0; i < 4; i++) {
      if (jointsAndWeights) {
        // 4 bone (joint) influences and weights per vertex
        var jointIndex = Object.keys(jointsAndWeights)[i];
        // TODO: Should zero be -1? It will have a zero weight regardless, but that lets us distinguish between empty bone slots and zero index bone slots
        // TODO: If there are more than 4 bones take the four that have the strongest weight
        expandedJointInfluences[positionIndex * 4 + i] = Number(jointIndex) || 0;
        expandedJointWeights[positionIndex * 4 + i] = jointsAndWeights[jointIndex] || 0;
      }

      // 3 normals and position coordinates per vertex
      if (i < 3) {
        expandedPositions[positionIndex * 3 + i] = compressedVertexData.vertexPositions[originalPositionIndex * 3 + i];
        if (compressedVertexData.vertexNormals) {
          expandedNormals[positionIndex * 3 + i] = compressedVertexData.vertexNormals[compressedVertexData.vertexNormalIndices[vertexNum] * 3 + i];
        }
      }
      // 2 UV coordinates per vertex
      if (i < 2) {
        if (compressedVertexData.vertexUVs) {
          expandedUVs[positionIndex * 2 + i] = compressedVertexData.vertexUVs[compressedVertexData.vertexUVIndices[vertexNum] * 2 + i];
        }
      }
    }
  }

  return {
    jointInfluences: expandedJointInfluences,
    jointWeights: expandedJointWeights,
    normals: expandedNormals,
    positionIndices: expandedPositionIndices,
    positions: expandedPositions,
    uvs: expandedUVs
  }
}

/**
 * A .dae file loader
 * @class ColladaFileLoader
 */
class ColladaFileLoader {
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
}

ColladaFileLoader.prototype.fromPath = function(path) {
  this.path = path;
  this.loaded = false;
  return new Promise(resolve => {
    loadText(path).then(txt => {
      {
        let base = parseCollada(txt);
        let expanded = expandVertexData_1(base);
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

/**
 * Sets the default properties to an option object
 * @param {Object} opts - The options to write to
 */
function setDefaultOptionProperties(opts) {
  // always give direct access to gl and renderer
  opts.gl = this.gl;
  opts.renderer = this;
}

/**
 * Creates an object and attaches the local renderer instance to it
 * @param {WebGLObject} cls - The class to instantiate
 * @param {Object} opts - Instantiation options
 * @return {WebGLObject}
 */
function createObject(cls, opts = {}) {
  this.setDefaultOptionProperties(opts);
  let object = new cls(opts);
  return object;
}

/**
 * Creates a texture
 * @param {Object} opts - Texture options
 * @return {ObjectTexture}
 */
function createTexture(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let texture = new ObjectTexture(opts);
  return texture;
}

/**
 * Creates a framebuffer
 * @param {Object} opts - Framebuffer options
 * @return {FrameBuffer}
 */
function createFrameBuffer(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let fbo = new FrameBuffer(opts);
  return fbo;
}

/**
 * Creates a gbuffer
 * @param {Object} opts - GBuffer options
 * @return {GBuffer}
 */
function createGeometryBuffer(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let fbo = new GBuffer(opts);
  return fbo;
}

/**
 * Loads and creates a .obj file
 * @param {Object} opts - Object options
 * @return {ObjectFileLoader}
 */
function createObjectFile(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let loader = new ObjectFileLoader(opts);
  return loader;
}

/**
 * Loads and creates a .dae file
 * @param {Object} opts - Object options
 * @return {ColladaFileLoader}
 */
function createColladaFile(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let loader = new ColladaFileLoader(opts);
  return loader;
}

/**
 * Loads and creates a .dae file
 * @param {Object} opts - Object options
 * @return {MD5FileLoader}
 */
function createMD5File(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let loader = new MD5FileLoader(opts);
  return loader;
}

/**
 * Loads and creates an animated collada file
 * @param {Object} opts - Object options
 * @return {ColladaFileLoader}
 */
function createAnimatedColladaFile(opts = {}) {
  this.setDefaultOptionProperties(opts);
  opts.animated = true;
  let object = this.createColladaFile(opts);
  return object;
}

/**
 * Creates an 2d sprite
 * @param {Object} opts - Object options
 * @return {ColladaFileLoader}
 */
function createSprite(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let object = new Sprite(opts);
  return object;
}

/**
 * Creates a camera
 * @param {Camera} cls - The class to instantiate
 * @param {Object} opts - Instantiation options
 * @return {Camera}
 */
function createCamera(cls, opts = {}) {
  this.setDefaultOptionProperties(opts);
  let object = new cls(opts);
  return object;
}

/**
 * Creates a batch
 * @param {Object} opts
 * @return {WebGLBatch}
 */
function createBatch(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let batch = new WebGLBatch(opts);
  return batch;
}

/**
 * Creates a new WebGL renderer program
 * @param {String} name
 * @return {RendererProgram}
 */
function createProgram(name) {
  let opts = { name };
  this.setDefaultOptionProperties(opts);
  let program = new RendererProgram(opts);
  return new Promise(resolve => {
    program.build(name).then(resolve);
  });
}

/**
 * Creates a new filter
 * @param {Object} opts
 * @return {WebGLFilter}
 */
function createFilter(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let filter = new WebGLFilter(opts);
  return filter;
}

/**
 * Creates a new cubemap
 * @param {Object} opts
 * @return {CubeMap}
 */
function createCubeMap(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let cubemap = new CubeMap(opts);
  return cubemap;
}

/**
 * Creates a new light
 * @param {Object} opts
 * @return {Light}
 */
function createLight(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let light = new Light(opts);
  return light;
}


var _create = Object.freeze({
	setDefaultOptionProperties: setDefaultOptionProperties,
	createObject: createObject,
	createTexture: createTexture,
	createFrameBuffer: createFrameBuffer,
	createGeometryBuffer: createGeometryBuffer,
	createObjectFile: createObjectFile,
	createColladaFile: createColladaFile,
	createMD5File: createMD5File,
	createAnimatedColladaFile: createAnimatedColladaFile,
	createSprite: createSprite,
	createCamera: createCamera,
	createBatch: createBatch,
	createProgram: createProgram,
	createFilter: createFilter,
	createCubeMap: createCubeMap,
	createLight: createLight
});

/**
 * Enables the given matrix attribute
 * @param {Number} location - The shader attribute location
 * @param {WebGLBuffer} buffer - The buffer containing our data
 * @param {Number} divisor
 */
function enableMatrix4AttributeDivisor(location, buffer, divisor = -1) {
  let gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  {
    gl.enableVertexAttribArray(location + 0);
    gl.enableVertexAttribArray(location + 1);
    gl.enableVertexAttribArray(location + 2);
    gl.enableVertexAttribArray(location + 3);
  }
  {
    let sFloat = Float32Array.BYTES_PER_ELEMENT;
    let stride = sFloat * BATCH_MAT4_SIZE;
    gl.vertexAttribPointer(location + 0, 4, gl.FLOAT, false, stride, sFloat * 0);
    gl.vertexAttribPointer(location + 1, 4, gl.FLOAT, false, stride, sFloat * 4);
    gl.vertexAttribPointer(location + 2, 4, gl.FLOAT, false, stride, sFloat * 8);
    gl.vertexAttribPointer(location + 3, 4, gl.FLOAT, false, stride, sFloat * 12);
  }
  if (divisor !== -1) {
    gl.vertexAttribDivisor(location + 0, divisor);
    gl.vertexAttribDivisor(location + 1, divisor);
    gl.vertexAttribDivisor(location + 2, divisor);
    gl.vertexAttribDivisor(location + 3, divisor);
  }
}

/**
 * Enables the given vector attribute
 * @param {Number} location - The shader attribute location
 * @param {WebGLBuffer} buffer - The buffer containing our data
 * @param {Number} size - The vector size
 * @param {Number} divisor
 */
function enableVectorAttributeDivisor(location, buffer, size, divisor = -1) {
  let gl = this.gl;
  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  if (divisor !== -1) gl.vertexAttribDivisor(location, divisor);
}

/**
 * Enables the given float attribute
 * @param {Number} location - The shader attribute location
 * @param {WebGLBuffer} buffer - The buffer containing our data
 * @param {Number} divisor
 */
function enableFloatAttributeDivisor(location, buffer, divisor = -1) {
  let gl = this.gl;
  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 0, 0);
  if (divisor !== -1) gl.vertexAttribDivisor(location, divisor);
}

/**
 * Disables the given matrix attribute
 * @param {Number} location - The shader attribute location
 */
function disableMatrix4AttributeDivisor(location) {
  let gl = this.gl;
  gl.vertexAttribDivisor(location + 0, 0);
  gl.vertexAttribDivisor(location + 1, 0);
  gl.vertexAttribDivisor(location + 2, 0);
  gl.vertexAttribDivisor(location + 3, 0);
}

/**
 * Disables the given vector attribute
 * @param {Number} location - The shader attribute location
 */
function disableVectorAttributeDivisor(location) {
  let gl = this.gl;
  gl.vertexAttribDivisor(location + 0, 0);
}

/**
 * Disables the given vector attribute
 * @param {Number} location - The shader attribute location
 */
function disableFloatAttributeDivisor(location) {
  let gl = this.gl;
  gl.vertexAttribDivisor(location + 0, 0);
}


var _divisors = Object.freeze({
	enableMatrix4AttributeDivisor: enableMatrix4AttributeDivisor,
	enableVectorAttributeDivisor: enableVectorAttributeDivisor,
	enableFloatAttributeDivisor: enableFloatAttributeDivisor,
	disableMatrix4AttributeDivisor: disableMatrix4AttributeDivisor,
	disableVectorAttributeDivisor: disableVectorAttributeDivisor,
	disableFloatAttributeDivisor: disableFloatAttributeDivisor
});

/**
 * Returns the camera view matrix
 * @return {Float32Array} - The view matrix
 */
function getViewMatrix() {
  return this.viewMatrix;
}

/**
 * Returns the projection matrix
 * @return {Float32Array} - The projection matrix
 */
function getProjectionMatrix() {
  return this.projectionMatrix;
}

/**
 * Calculates the model-matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The model matrix
 */
function getModelMatrix(object) {
  let translate = object.translate;
  let rotate = object.rotate;
  let scale = object.scale;
  let mView = this.getViewMatrix();
  let mModel = this.modelMatrix;
  let vScale = this.helpers.scale;
  let vTranslate = this.helpers.translate;
  mat4.identity(mModel);
  // translation
  mat4.translate(
    mModel,
    mModel,
    vec3.set(vTranslate, translate.x, translate.y, translate.z)
  );
  // 2d sprite, always face camera
  if (object.isSprite) this.setModelMatrixFaceCamera(mModel, mView);
  this.setModelMatrixRotation(mModel, rotate);
  // scale
  mat4.scale(
    mModel,
    mModel,
    vec3.set(vScale, scale.x, scale.y, scale.z)
  );
  return mModel;
}

/**
 * Calculates the model-view-matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The model view matrix
 */
function getModelViewMatrix(object) {
  let mView = this.getViewMatrix();
  let mModel = object.getModelMatrix();
  let mModelView = this.modelViewMatrix;
  mat4.identity(mModelView);
  mat4.multiply(
    mModelView,
    mView,
    mModel
  );
  return mModelView;
}

/**
 * Calculates the normal matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The normal matrix
 */
function getNormalMatrix(object) {
  let mNormal = this.normalMatrix;
  let mModel = this.getModelMatrix(object);
  mat4.identity(mNormal);
  mat4.invert(mNormal, mModel);
  mat4.transpose(mNormal, mNormal);
  return mNormal;
}

/**
 * Calculates the model-view-projection matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The mvp matrix
 */
function getModelViewProjectionMatrix(object) {
  let mModelViewProjection = this.modelViewProjectionMatrix;
  let mModelView = this.getModelViewMatrix(object);
  let mProjection = this.getProjectionMatrix();
  mat4.identity(mModelViewProjection);
  mat4.multiply(
    mModelViewProjection,
    mProjection,
    mModelView
  );
  return mModelViewProjection;
}

/**
 * Rotates a model matrix with the given vector
 * @param {Float32Array} mModel - The model matrix to rotate
 * @param {Float32Array} mView - The rotation vector
 * @return {Float32Array}
 */
function setModelMatrixRotation(mModel, rotate) {
  // rotation
  mat4.rotateX(
    mModel,
    mModel,
    rotate.x * (Math.PI / 180)
  );
  mat4.rotateY(
    mModel,
    mModel,
    rotate.y * (Math.PI / 180)
  );
  mat4.rotateZ(
    mModel,
    mModel,
    rotate.z * (Math.PI / 180)
  );
  return mModel;
}

/**
 * Makes a model matrix always face the camera
 * @param {Float32Array} mModel - The model matrix to face
 * @param {Float32Array} mView - The camera's view matrix to use
 * @return {Float32Array}
 */
function setModelMatrixFaceCamera(mModel, mView) {
  mModel[0] =  -mView[0];
  mModel[1] =  -mView[4];
  mModel[2] =  -mView[8];
  mModel[4] =  -mView[1];
  mModel[5] =  -mView[5];
  mModel[6] =  -mView[9];
  mModel[8] =  -mView[2];
  mModel[9] =  -mView[6];
  mModel[10] = -mView[10];
  return mModel;
}


var _transforms = Object.freeze({
	getViewMatrix: getViewMatrix,
	getProjectionMatrix: getProjectionMatrix,
	getModelMatrix: getModelMatrix,
	getModelViewMatrix: getModelViewMatrix,
	getNormalMatrix: getNormalMatrix,
	getModelViewProjectionMatrix: getModelViewProjectionMatrix,
	setModelMatrixRotation: setModelMatrixRotation,
	setModelMatrixFaceCamera: setModelMatrixFaceCamera
});

/**
 * Renders water
 * @param {Plane} object
 */
function renderMD5(object) {
  let gl = this.gl;
  let camera = this.camera;
  let program = this.getActiveProgram();
  let variables = program.locations;
  let model = object.model;
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  let vCameraPosition = camera.position;

  let VERTEX_STRIDE = 44;

  if (!model.vertBuffer || !model.indexBuffer) return;

  gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
  gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
  gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
  gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

  gl.disable(gl.CULL_FACE);

  let meshes = model.meshes;
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    let meshOffset = mesh.vertOffset * 4;

    let variables = program.locations;

    this.useTexture(mesh.diffuseMap, variables.uSampler, 0);

    gl.enableVertexAttribArray(variables.aVertexPosition);
    gl.enableVertexAttribArray(variables.aTextureCoord);
    gl.enableVertexAttribArray(variables.aVertexNormal);
    gl.enableVertexAttribArray(variables.aVertexTangent);

    // how to pull tangents
    gl.disableVertexAttribArray(variables.aVertexTangent);
    // how to pull bitangents
    gl.disableVertexAttribArray(variables.aVertexBitangent);

    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 0);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 12);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 20);
    gl.vertexAttribPointer(variables.aVertexTangent, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 32);

    gl.uniform4fv(variables.uClipPlane, this.clipPlane);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    gl.uniform3fv(variables.uCameraPosition, vCameraPosition);
    gl.uniform1f(variables.uAlpha, object.alpha);
    gl.uniform1f(variables.uGlowing, object.glow);
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform1f(variables.uIsLightSource, false);
    gl.uniform1f(variables.uHasNormalMap, false);
    gl.uniform1f(variables.uHasSpecularMap, false);
    gl.uniform1f(variables.uHasEmissiveMap, false);
    gl.uniform1f(variables.uHasSpecularLighting, false);
    gl.uniform1f(variables.uHasEnvironmentMap, false);
    gl.uniform1f(variables.uHasMetalnessMap, false);
    gl.uniform1f(variables.uHasRoughnessMap, false);
    gl.uniform1f(variables.uHasAmbientOcclusionMap, false);

    //if (this.debug.normals) this.drawDebugNormals(object);
    this.drawElements(gl.TRIANGLES, mesh.elementCount, gl.UNSIGNED_SHORT, mesh.indexOffset * 2);
  }

  gl.enable(gl.CULL_FACE);

  if (this.debug.boundings) this.renderBoundingBox(object);

}


var _md5 = Object.freeze({
	renderMD5: renderMD5
});

/**
 * Renders a quad
 * @param {Quad} quad
 */
function renderQuad(quad) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = quad.buffers;
  let variables = program.locations;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aPosition);
  }
  // send uniforms
  {
    gl.uniform1f(variables.uTime, this.frames);
    // resolution
    {
      let resolution = this.helpers.quadResolution;
      resolution[0] = quad.texture.width;
      resolution[1] = quad.texture.height;
      gl.uniform2fv(variables.uResolution, resolution);
    }
  }
  // texture
  {
    this.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}


var _quad = Object.freeze({
	renderQuad: renderQuad
});

/**
 * Renders a batched object
 * @param {WebGLBatch} batch
 */
function renderBatch(batch, shadow) {
  this.prepareBatch(batch, shadow);
  this.flushBatch(batch, shadow);
}

/**
 * Flushes the batch
 * @param {WebGLBatch} batch
 */
function flushBatch(batch) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let template = batch.template;
  let variables = program.locations;
  //batch.fill();
  // enable divisors
  {
    this.enableFloatAttributeDivisor(variables.aAlpha, batch.data.buffers.alpha, 1);
    this.enableFloatAttributeDivisor(variables.aGlowing, batch.data.buffers.glow, 1);
    this.enableMatrix4AttributeDivisor(variables.aModelMatrix, batch.data.buffers.model, 1);
    //this.enableMatrix4AttributeDivisor(variables.aNormalMatrix, batch.data.buffers.normal, 1);
  }
  // flush
  {
    this.drawElementsInstanced(gl.TRIANGLES, template.data.indices.length, gl.UNSIGNED_SHORT, 0, batch.size);
  }
  // disable divisors
  {
    this.disableFloatAttributeDivisor(variables.aAlpha);
    this.disableFloatAttributeDivisor(variables.aGlowing);
    this.disableMatrix4AttributeDivisor(variables.aModelMatrix);
    //this.disableMatrix4AttributeDivisor(variables.aNormalMatrix);
  }
}

/**
 * Prepares the batch
 * @param {WebGLBatch} batch
 */
function prepareBatch(batch) {
  let gl = this.gl;
  let camera = this.camera;
  let object = batch.template;
  let buffers = object.buffers;
  let program = this.getActiveProgram();
  let vClipPlane = this.clipPlane;
  let variables = program.locations;
  let hasNormalMap = object.normalTexture !== null;
  let hasSpecularMap = object.specularTexture !== null;
  let useSpecularLighting = object.specularLighting;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexNormal);
  }
  // how to pull uvs
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
  }
  // how to pull tangents
  if (object.data.tangents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tangents);
    gl.vertexAttribPointer(variables.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexTangent);
  } else {
    gl.disableVertexAttribArray(variables.aVertexTangent);
  }
  // how to pull bitangents
  if (object.data.bitangents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bitangents);
    gl.vertexAttribPointer(variables.aVertexBitangent, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexBitangent);
  } else {
    gl.disableVertexAttribArray(variables.aVertexBitangent);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // pass uniforms
  {
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    
    gl.uniform3fv(variables.uLightPosition, this.getViewPosition(sun.translate.toArray()));
    gl.uniform3fv(variables.uCameraPosition, this.getViewPosition(camera.position));
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    gl.uniform1f(variables.uGlossFactor, object.glossiness);
    gl.uniform1f(variables.uHasNormalMap, hasNormalMap | 0);
    gl.uniform1f(variables.uHasSpecularMap, hasSpecularMap | 0);
    gl.uniform1f(variables.uHasSpecularLighting, useSpecularLighting | 0);
    if (object.useSpecularLighting) {
      gl.uniform1f(variables.uGlossFactor, object.glossiness);
    }
  }
  // texture
  {
    this.useTexture(object.texture, variables.uSampler, 0);
    if (hasNormalMap) {
      this.useTexture(object.normalTexture, variables.uNormalMap, 1);
    }
    if (hasSpecularMap) {
      this.useTexture(object.specularTexture, variables.uSpecularMap, 2);
    }
  }
}


var _batch = Object.freeze({
	renderBatch: renderBatch,
	flushBatch: flushBatch,
	prepareBatch: prepareBatch
});

/**
 * Renders a object
 * @param {WebGLObject} object
 */
function renderObject(object) {
  let gl = this.gl;
  let camera = this.camera;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let vClipPlane = this.clipPlane;
  let hasNormalMap = object.normalTexture !== null;
  let hasShadowMap = object.shadowTexture !== null;
  let hasSpecularMap = object.specularTexture !== null;
  let useSpecularLighting = object.specularLighting;
  let useEnvironmentMapping = (
    object.environmentMapping && object.environmentTexture !== null
  );
  let useEmissiveMapping = object.emissiveTexture !== null;
  let useMetalnessMapping = object.metalnessTexture !== null;
  let useRoughnessMapping = object.roughnessTexture !== null;
  let useAmbientOcclusionMapping = object.ambientOcclusionTexture !== null;
  let variables = program.locations;
  let vCameraPosition = camera.position;
  let vCameraViewPosition = this.getViewPosition(vCameraPosition);
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  // occlusion culling
  if (object.occlusionCulling && false) {
    let query = object.query;
    if (query.enabled && query.isReady()) {
      let passedSamples = query.getResult();
      if (passedSamples > 0) object.occlusionFactor = 0;
      else object.occlusionFactor++;
    }
    if (!query.enabled) {
      gl.colorMask(false, false, false, false);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      query.enable();
      this.renderBoundingBox(object);
      query.disable();
      gl.colorMask(true, true, true, true);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }
    this.renderObject(object);
    return;
  }
  if (object.isOccluded()) return;
  if (object.environmentTexture && !object.environmentMapping) return;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull uvs
  if (object.data.uvs.length) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
  }
  // how to pull normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexNormal);
  }
  // how to pull tangents
  if (object.data.tangents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tangents);
    gl.vertexAttribPointer(variables.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexTangent);
  } else {
    gl.disableVertexAttribArray(variables.aVertexTangent);
  }
  // how to pull bitangents
  if (object.data.bitangents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bitangents);
    gl.vertexAttribPointer(variables.aVertexBitangent, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexBitangent);
  } else {
    gl.disableVertexAttribArray(variables.aVertexBitangent);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
    if (hasShadowMap) {
      gl.uniformMatrix4fv(variables.uLightSpaceMatrix, false, object.lightSpaceMatrix);
    }
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    gl.uniform3fv(variables.uCameraPosition, vCameraPosition);
    gl.uniform3fv(variables.uCameraViewPosition, vCameraViewPosition);
    gl.uniform1f(variables.uAlpha, object.alpha);
    gl.uniform1f(variables.uGlowing, object.glow);
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform1f(variables.uGlossFactor, object.glossiness);
  }
  // send bools
  {
    gl.uniform1f(variables.uIsLightSource, (object.light !== null) | 0);
    gl.uniform1f(variables.uHasNormalMap, hasNormalMap | 0);
    gl.uniform1f(variables.uHasShadowMap, hasShadowMap | 0);
    gl.uniform1f(variables.uHasSpecularMap, hasSpecularMap | 0);
    gl.uniform1f(variables.uHasEmissiveMap, useEmissiveMapping | 0);
    gl.uniform1f(variables.uHasSpecularLighting, useSpecularLighting | 0);
    gl.uniform1f(variables.uHasEnvironmentMap, useEnvironmentMapping | 0);
    gl.uniform1f(variables.uHasMetalnessMap, useMetalnessMapping | 0);
    gl.uniform1f(variables.uHasRoughnessMap, useRoughnessMapping | 0);
    gl.uniform1f(variables.uHasAmbientOcclusionMap, useAmbientOcclusionMapping | 0);
  }
  // texture
  {
    this.useTexture(object.texture, variables.uSampler, 0);
    if (hasNormalMap) {
      this.useTexture(object.normalTexture, variables.uNormalMap, 1);
    }
    if (hasShadowMap) {
      this.useTexture(object.shadowTexture, variables.uShadowMap, 2);
    }
    if (hasSpecularMap) {
      this.useTexture(object.specularTexture, variables.uSpecularMap, 3);
    }
    if (useEmissiveMapping) {
      this.useTexture(object.emissiveTexture, variables.uEmissiveMap, 4);
    }
    if (useMetalnessMapping) {
      this.useTexture(object.metalnessTexture, variables.uMetalnessMap, 5);
    }
    if (useRoughnessMapping) {
      this.useTexture(object.roughnessTexture, variables.uRoughnessMap, 6);
    }
    if (useAmbientOcclusionMapping) {
      this.useTexture(object.ambientOcclusionTexture, variables.uAmbientOcclusionMap, 7);
    }
    if (useEnvironmentMapping) {
      this.useTexture(object.environmentTexture, variables.uEnvironmentMap, 10);
    } else {
      this.useTexture(this.emptyCubeTexture, variables.uEnvironmentMap, 10);
    }
  }
  // draw
  if (this.debug.normals) this.drawDebugNormals(object);
  if (object.culling === false) gl.disable(gl.CULL_FACE);
  this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  if (object.culling === false) gl.enable(gl.CULL_FACE);
  if (this.debug.boundings) this.renderBoundingBox(object);
}


var _object = Object.freeze({
	renderObject: renderObject
});

/**
 * A simple Plane
 * @class Plane
 * @extends WebGLObject
 */
class Plane extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
  }
}

/**
 * Create data
 */
Plane.prototype.createMesh = function() {
  let data = this.data;
  data.vertices = new Float32Array([
    -1, +1,
    -1, -1,
    +1, +1,
    +1, -1
  ]);
};

/**
 * Water class
 * @class Water
 * @extends Plane
 */
class Water extends Plane {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    super(opts);
    this.dudvTexture = null;
    this.reflectionTexture = null;
    this.refractionTexture = null;
    this.init();
  }
}

/**
 * Initialise
 */
Water.prototype.init = function() {
  let gl = this.gl;
  let renderer = this.renderer;
  let opts = {
    width: 512, height: 512,
    wrap: {
      s: gl.REPEAT,
      t: gl.REPEAT,
      r: gl.REPEAT
    },
    attachments: [
      { format: gl.RGBA16F }
    ]
  };
  this.reflectionTexture = renderer.createFrameBuffer(opts);
  this.refractionTexture = renderer.createFrameBuffer(opts);
};

/**
 * Uses the given dudv texture
 * @param {ObjectTexture} texture
 */
Water.prototype.useDUDVTexture = function(texture) {
  this.dudvTexture = texture;  
};

/**
 * Buffer the scene into reflection part
 * @param {Function} cbDrawScene - The scene draw function
 */
Water.prototype.bufferReflection = function(cbDrawScene) {
  let gl = this.gl;
  let renderer = this.renderer;
  let reflectionTexture = this.reflectionTexture;
  renderer.useFrameBuffer(reflectionTexture);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderer.setClipPlane(0, -1, 0, this.translate.y + 1.0);
  let distance = (camera.position[1] - this.translate.y) * 2;
  camera.position[1] -= distance;
  camera.rotation[0] *= -1;
  renderer.useCamera(camera);
  cbDrawScene(false, null, false, true);
  camera.position[1] += distance;
  camera.rotation[0] *= -1;
  renderer.useCamera(camera);
  renderer.restoreFrameBuffer();
};

/**
 * Buffer the scene into refraction part
 * @param {Function} cbDrawScene - The scene draw function
 */
Water.prototype.bufferRefraction = function(cbDrawScene) {
  let gl = this.gl;
  let renderer = this.renderer;
  let refractionTexture = this.refractionTexture;
  renderer.useFrameBuffer(refractionTexture);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  renderer.setClipPlane(0, 1, 0, -this.translate.y + 1.0);
  renderer.useCamera(camera);
  cbDrawScene(false, null, true, true);
  renderer.useCamera(camera);
  renderer.restoreFrameBuffer();
};

/**
 * Renders water
 * @param {Plane} object
 */
function renderPlane(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  let mModelView = object.getModelViewMatrix();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniform1f(variables.uTime, this.frames);
    //gl.uniform3fv(variables.uLightPosition, sun.translate.toArray());
    gl.uniform3fv(variables.uCameraPosition, camera.position);
  }
  // water related
  if (object instanceof Water) {
    let dudvTexture = object.dudvTexture;
    let normalTexture = object.normalTexture;
    let reflectionTexture = object.reflectionTexture;
    let refractionTexture = object.refractionTexture;
    this.useTexture(reflectionTexture, variables.uReflectionTexture, 0);
    this.useTexture(refractionTexture, variables.uRefractionTexture, 1);
    this.useTexture(dudvTexture, variables.uDudvTexture, 2);
    this.useTexture(normalTexture, variables.uNormalTexture, 3);
  } else {
    this.useTexture(object.texture, variables.uSampler, 0);
  }
  // draw
  {
    this.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
}


var _plane = Object.freeze({
	renderPlane: renderPlane
});

/**
 * Renders shadow map
 * @param {Plane} object
 */
function renderShadow(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  if (object instanceof MD5Object) {

    let model = object.model;
    let VERTEX_STRIDE = 44;

    if (!model.vertBuffer || !model.indexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);

    let meshes = model.meshes;
    for (let ii = 0; ii < meshes.length; ++ii) {
      let mesh = meshes[ii];
      let meshOffset = mesh.vertOffset * 4;
      let variables = program.locations;
      gl.enableVertexAttribArray(variables.aVertexPosition);
      gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 0);
      this.drawElements(gl.TRIANGLES, mesh.elementCount, gl.UNSIGNED_SHORT, mesh.indexOffset * 2);
    }

    return; 
  }
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
  }
  // draw
  {
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}


var _shadow = Object.freeze({
	renderShadow: renderShadow
});

/**
 * Renders a object
 * @param {WebGLObject} object
 */
function renderSkybox(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let cubemap = object.environmentTexture;
  let variables = program.locations;
  let mView = this.getViewMatrix();
  let mModelView = object.getModelViewMatrix();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniformMatrix4fv(variables.uViewMatrix, false, mView);
    gl.uniform1f(variables.uSkyboxDimension, cubemap.size);
  }
  // texture
  {
    this.useTexture(cubemap, variables.uSkyCube, 10);
  }
  // draw
  {
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}


var _skybox = Object.freeze({
	renderSkybox: renderSkybox
});

/**
 * Renders a terrain
 * @param {Terrain} terrain
 */
function renderTerrain(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let vClipPlane = this.clipPlane;
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull uvs
  if (object.data.uvs.length) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
  }
  // how to pull normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexNormal);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    gl.uniform1f(variables.uAlpha, object.alpha);
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    //gl.uniform3fv(variables.uLightPosition, this.getViewPosition(sun.translate.toArray()));
    gl.uniform3fv(variables.uCameraPosition, this.getViewPosition(camera.position));
    gl.uniform1i(variables.uShadowMapDimension, object.shadowmap.dimension);
  }
  {
    this.useTexture(object.texture, variables.uSampler, 0);
    if (object.shadowmap) this.useTexture(object.shadowmap.texture, variables.uShadowMap, 1);
  }
  // draw
  {
    /*{
      gl.uniform1i(variables.uWireframe, 1);
      gl.drawElements(gl.LINE_STRIP, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(variables.uWireframe, 0);
    }*/
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  }
}


var _terrain = Object.freeze({
	renderTerrain: renderTerrain
});

/**
 * Renders an object's animation
 * @param {WebGLObject} object
 */
function renderAnimation(object) {
  let program = this.getActiveProgram();
  this.useRendererProgram("animated-object");
  this.restoreRendererProgram();
}


var _animation = Object.freeze({
	renderAnimation: renderAnimation
});

/**
 * Renders an object's bounding box
 * @param {WebGLObject} object
 */
function renderBoundingBox(source) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let variables = program.locations;
  let object = this.boundingBox;
  let buffers = object.buffers;
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  // world bounding box
  {
    let boundings = source.boundings;
    let size = boundings.world.size;
    let center = boundings.world.center;
    object.translate.setArray(center);
    object.scale.setArray(size);
    object.rotate.set(0);
  }
  // data
  {
    // how to pull vertices
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
      gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(variables.aVertexPosition);
    }
    // how to pull uvs
    if (object.data.uvs.length) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
      gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(variables.aTextureCoord);
    }
    // how to pull normals
    {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
      gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(variables.aVertexNormal);
    }
    // how to pull tangents
    gl.disableVertexAttribArray(variables.aVertexTangent);
    // how to pull bitangents
    gl.disableVertexAttribArray(variables.aVertexBitangent);
    // which indices to use
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    // matrices
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
  }
  // wireframe mode
  let ostate = this.debug.wireframe;
  this.debug.wireframe = true;
  // draw
  {
    gl.disable(gl.CULL_FACE);
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.enable(gl.CULL_FACE);
  }
  this.debug.wireframe = ostate;
}


var _bounding_box = Object.freeze({
	renderBoundingBox: renderBoundingBox
});

/**
 * Renders shadow map
 * @param {Plane} object
 */
function renderShadowInstanced(batch) {
  let gl = this.gl;
  let template = batch.template;
  let buffers = template.buffers;
  let program = this.getActiveProgram();
  let mView = this.getViewMatrix();
  let variables = program.locations;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull uvs
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // pass uniforms
  {
    gl.uniformMatrix4fv(variables.uViewMatrix, false, mView);
  }
  // texture
  {
    this.useTexture(template.texture, variables.uSampler, 0);
  }
  // enable divisors
  {
    this.enableMatrix4AttributeDivisor(variables.aModelMatrix, batch.data.buffers.model, 1);
  }
  // flush
  {
    this.drawElementsInstanced(gl.TRIANGLES, template.data.indices.length, gl.UNSIGNED_SHORT, 0, batch.size);
  }
  // disable divisors
  {
    this.disableMatrix4AttributeDivisor(variables.aModelMatrix);
  }
}


var _shadow_instanced = Object.freeze({
	renderShadowInstanced: renderShadowInstanced
});

/**
 * The WebGL renderer
 * @class WebGLRenderer
 */
class WebGLRenderer {
  /**
   * @param {Stage} stage
   * @constructor
   */
  constructor(stage) {
    this.uid = uid();
    this.stage = stage;
    this.canvas = stage.canvas;
    this.width = 0;
    this.height = 0;
    this.frames = 0;
    this.frameCount = 0;
    this.drawCalls = 0;
    this.totalVertices = 0;
    this.fboSwitches = 0;
    this.textureSwitches = 0;
    this.programSwitches = 0;
    this.ready = false;
    this.currentProgram = null;
    this.previousProgram = null;
    this.currentFrameBuffer = null;
    this.previousFrameBuffer = null;
    this.camera = null;
    this.programs = {};
    this.extensions = {};
    this.debug = {
      FXAA: false,
      normals: false,
      boundings: false,
      wireframe: false
    };
    this.gl = this.canvas.getContext("webgl2", {
      alpha: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false
    });
    this.gl.renderer = this;
    // allocation helpers
    this.helpers = {
      scale: vec3.create(),
      translate: vec3.create(),
      screenAdd: vec4.fromValues(1.0, 1.0, 0.0, 0.0),
      eyePosition: vec3.create(),
      screenPosition: vec4.create(),
      quadResolution: new Float32Array(2)
    };
    this.currentTexture = null;
    this.textureScale = new Float32Array(2);
    this.clipPlane = vec4.create();
    this.viewMatrix = mat4.create();
    this.modelMatrix = mat4.create();
    this.normalMatrix = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.modelViewProjectionMatrix = mat4.create();
    // create bounding box
    this.boundingBox = this.createObject(Cube);
    this.boundingBox.useColor([0, 0, 0, 255]);
    this.emptyTexture = this.createTexture().fromColor([0, 0, 0, 0]);
    this.emptyCubeTexture = this.createCubeMap();
    this.fogColor = new Float32Array([64, 64, 64, 255]);
    this.screen = null;
    this.gBuffer = null;
    this.objects = [];
    // initialize default shaders
    this.initPrograms().then(() => {
      this.screen = this.createScreen();
      this.gBuffer = this.createGBuffer();
      this.loadExtensions();
      this.ready = true;
    });
  }
}

/**
 * Creates a multisampled screen fbo
 * @return {Quad}
 */
WebGLRenderer.prototype.createScreen = function() {
  let screen = this.createObject(Quad);
  let fbo = this.createFrameBuffer({
    width: this.width,
    height: this.height,
    attachments: [
      { format: gl.RGBA16F },
      { format: gl.RGBA16F }
    ]
  });
  screen.useTexture(fbo);
  return screen;
};

/**
 * Creates a gbuffer
 * @return {Quad}
 */
WebGLRenderer.prototype.createGBuffer = function() {
  let gl = this.gl;
  let buffer = this.createGeometryBuffer({
    width: this.width,
    height: this.height,
    attachments: [
      { format: gl.RGBA16F },
      { format: gl.RGBA16F },
      { format: gl.RGBA16F },
      { format: gl.RGBA16F },
      { format: gl.RGBA16F }
    ]
  });
  return buffer;
};

WebGLRenderer.prototype.loadExtensions = function() {
  this.getExtension("EXT_color_buffer_float");
  //this.getExtension("EXT_color_buffer_half_float");
};

/**
 * Flushes the screen fbo
 */
WebGLRenderer.prototype.flush = function() {
  //this.screen.texture.writeToScreen();
  this.drawCalls = 0;
  this.totalVertices = 0;
  this.fboSwitches = 0;
  this.textureSwitches = 0;
  this.programSwitches = 0;
};

/**
 * Initializes all shader programs
 * Afterwards the screen fbo is created
 */
WebGLRenderer.prototype.initPrograms = function() {
  let names = [
    "skybox",
    "water",
    "terrain",
    "object",
    "object-shadow",
    "instanced-object",
    "instanced-object-shadow",
    "animated-object",
    "blur-filter",
    "bright-filter",
    "combine-filter",
    "contrast",
    "god-ray",
    "quad",
    "occlusion-filter",
    "deferred/object",
    "deferred/g-buffer",
    "deferred/object-point-light",
    "deferred/directional-light",
    "deferred/water",
    "deferred/terrain",
    "FXAA",
    "debug-normals"
  ];
  let programs = names.map(name => this.createProgram(name));
  return new Promise(resolve => {
    Promise.all(programs).then(results => {
      results.map(program => this.programs[program.name] = program);
      resolve();
    });
  });
};

/**
 * Indicates if an FBO is the main FBO
 * @param {FrameBuffer} fbo
 * @return {Boolean}
 */
WebGLRenderer.prototype.isMainFrameBuffer = function(fbo) {
  return (
    (fbo === null) ||
    (fbo === this.screen.texture)
  );
};

/**
 * Indicates if the given program is loaded
 * @param {String} name
 * @return {Boolean}
 */
WebGLRenderer.prototype.isProgramLoaded = function(name) {
  return !!this.programs[name];
};

/**
 * Increases the drawn frame count
 * @param {Number} delta
 */
WebGLRenderer.prototype.nextFrame = function(delta) {
  this.frames += delta;
  this.frameCount++;
  if (this.camera) this.camera.setDelta(delta);
  this.updateObjects();
};

/**
 * Updates all objects after each frame
 */
WebGLRenderer.prototype.updateObjects = function() {
  let objects = this.objects;
  // update
  for (let ii = 0; ii < objects.length; ++ii) {
    let object = objects[ii];
    object.update();
  }
  // sort
  objects.sort(this.sortObjects.bind(this));
};

/**
 * @param {WebGLObject} a
 * @param {WebGLObject} b
 * @return {Boolean}
 */
WebGLRenderer.prototype.sortObjects = function(a, b) {
  let distA = -a.cameraDistance[2];
  let distB = -b.cameraDistance[2];
  return distA > distB;
};

/**
 * Enables the given framebuffer
 * @param {FrameBuffer} fbo
 * @param {Boolean} clear - Clear the fbo
 * @return {FrameBuffer}
 */
WebGLRenderer.prototype.useFrameBuffer = function(fbo, clear = false) {
  let gl = this.gl;
  let camera = this.camera;
  let screen = this.screen.texture;
  let isMainBuffer = this.isMainFrameBuffer(fbo);
  this.useCamera(camera);
  // make this fbo restoreable
  if (this.currentFrameBuffer !== fbo) {
    this.previousFrameBuffer = this.currentFrameBuffer;
  }
  // bind fbo
  if (fbo === screen) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, screen.buffer);
    gl.viewport(0, 0, this.width, this.height);
    this.currentFrameBuffer = screen;
  } else if (fbo === null) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    this.currentFrameBuffer = null;
  } else {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.buffer);
    gl.viewport(0, 0, fbo.width, fbo.height);
    this.currentFrameBuffer = fbo;
  }
  this.fboSwitches++;
  if (clear) this.clear();
  this.resetClipPlane();
  return fbo;
};

/**
 * Restores the previously used framebuffer
 */
WebGLRenderer.prototype.restoreFrameBuffer = function() {
  let fbo = this.previousFrameBuffer;
  this.useFrameBuffer(fbo);
};

/**
 * Binds a given texture to the given texture unit
 * @param {*} object
 * @param {Number} location
 * @param {Number} id
 */
WebGLRenderer.prototype.useTexture = function(object, location, id) {
  let gl = this.gl;
  let kind = gl.TEXTURE_2D;
  let texture = null;
  let program = this.currentProgram;
  let textureId = this.getTextureUnitById(id);
  gl.activeTexture(textureId);
  // bind texture
  {
    // webgl texture
    if (object instanceof WebGLTexture) {
      texture = object;
    }
    // cubemap texture
    else if (object instanceof CubeMap) {
      texture = object.texture;
      kind = gl.TEXTURE_CUBE_MAP;
    }
    // object texture
    else if (object instanceof ObjectTexture) {
      texture = object.native;
    }
    else if (object instanceof FrameBuffer) {
      texture = object.getNativeTexture();
    }
    // invalid texture
    else {
      console.warn(`Invalid texture bound of type ${object.constructor.name}`);
    }
    gl.bindTexture(kind, texture);
  }
  // custom texture scale
  if (object instanceof ObjectTexture) {
    let data = this.textureScale;
    let name = program.getLocationNameByLocationId(location);
    let loc = program.getUniformLocation(name + "Scale");
    data[0] = object.scale.x;
    data[1] = object.scale.y;
    gl.uniform2fv(loc, data);
  }
  // send texture uniform
  gl.uniform1i(location, id);
  this.currentTexture = texture;
  this.textureSwitches++;
};

/**
 * Returns the gl unit value of passed in numeric texture id
 * @param {Number} id
 * @return {Number}
 */
WebGLRenderer.prototype.getTextureUnitById = function(id) {
  let gl = this.gl;
  return gl.TEXTURE0 + id;
};

/**
 * Returns the active renderer program
 * @return {RendererProgram}
 */
WebGLRenderer.prototype.getActiveProgram = function() {
  return this.currentProgram;
};

/**
 * Enable a specific renderer program
 * @param {String} name - The program's name
 * @return {RendererProgram}
 */
WebGLRenderer.prototype.useRendererProgram = function(name) {
  let gl = this.gl;
  let program = this.programs[name] || null;
  if (!this.isProgramLoaded(name)) {
    console.warn(`Renderer program isn't compiled!`);
  }
  if (this.currentProgram !== program) {
    let mView = this.getViewMatrix();
    let mProjection = this.getProjectionMatrix();
    let vClipPlane = this.clipPlane;
    let variables = program.locations;
    this.previousProgram = this.program;
    this.currentProgram = program;
    gl.useProgram(program.native);
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    gl.uniformMatrix4fv(variables.uViewMatrix, false, mView);
    gl.uniformMatrix4fv(variables.uProjectionMatrix, false, mProjection);
    this.programSwitches++;
  }
  return program;
};

/**
 * Restores the previously used renderer program
 */
WebGLRenderer.prototype.restoreRendererProgram = function() {
  let program = this.previousProgram;
  if (program) this.useRendererProgram(program.name);
};

/**
 * Uses the given camera and it's view matrix
 * @param {Camera} camera
 */
WebGLRenderer.prototype.useCamera = function(camera) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  if (program === null) return;
  let variables = program.locations;
  let mView = this.getViewMatrix();
  let mProjection = this.getProjectionMatrix();
  let vClipPlane = this.clipPlane;
  this.camera = camera;
  mat4.copy(mView, camera.view());
  mat4.copy(mProjection, camera.projection());
  gl.uniform4fv(variables.uClipPlane, vClipPlane);
  gl.uniformMatrix4fv(variables.uViewMatrix, false, mView);
  gl.uniformMatrix4fv(variables.uProjectionMatrix, false, mProjection);
  camera.update();
};

/**
 * Fetches a gl extension
 * @param {String} name
 * @return {*}
 */
WebGLRenderer.prototype.getExtension = function(name) {
  let gl = this.gl;
  let extensions = this.extensions;
  if (extensions[name]) return extensions[name];
  let ext = gl.getExtension(name);
  // check vendors
  if (!ext) {
    ext = (
      gl.getExtension("MOZ_" + name) ||
      gl.getExtension("WEBKIT_" + name)
    );
    if (!ext) {
      console.warn(`${name} unsupported!`);
      return null;
    }
  }
  extensions[name] = ext || null;
  return extensions[name];
};

/**
 * Resize renderer dimensions by given sizes
 * @param {Number} width
 * @param {Number} height
 */
WebGLRenderer.prototype.resize = function(width = window.innerWidth, height = window.innerHeight) {
  let gl = this.gl;
  let canvas = this.canvas;
  this.width = width;
  this.height = height;
  canvas.width = width;
  canvas.height = height;
  gl.clearDepth(1.0);
  this.setDefaultBlending();
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  //gl.colorMask(false, false, false, false);
  //gl.depthMask(false);
  gl.cullFace(gl.BACK);
  gl.viewport(0, 0, width, height);
};

/**
 * Sets the default blending
 */
WebGLRenderer.prototype.setDefaultBlending = function() {
  let gl = this.gl;
  gl.disable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
};

/**
 * Clears our scene
 */
WebGLRenderer.prototype.clear = function() {
  let gl = this.gl;
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

/**
 * Clears our scene with the given color
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @param {Number} a
 */
WebGLRenderer.prototype.clearColor = function(r, g, b, a) {
  let gl = this.gl;
  gl.clearColor(r / 255, g / 255, b / 255, a / 255);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
};

/**
 * Sets the current clipplane
 * @param {Number} x
 * @param {Number} y
 * @param {Number} z
 * @param {Number} w
 */
WebGLRenderer.prototype.setClipPlane = function(x, y, z, w) {
  vec4.set(this.clipPlane, x, y, z, w);
};

/**
 * Resets the clipplane, so everything gets rendered normally
 */
WebGLRenderer.prototype.resetClipPlane = function() {
  vec4.set(this.clipPlane, 0, 0, 0, 0);
};

/**
 * Returns the screen position of an object
 * @param {Float32Array} vec
 * @return {Float32Array}
 */
WebGLRenderer.prototype.getScreenPosition = function(vec) {
  let mView = this.getViewMatrix();
  let mProjection = this.getProjectionMatrix();
  let out = this.helpers.screenPosition;
  vec4.set(out, vec[0], vec[1], vec[2], 1.0);
  vec4.transformMat4(out, out, mView);
  vec4.transformMat4(out, out, mProjection);
  vec4.scale(out, out, 1.0 / out[3]);
  vec4.add(out, out, this.helpers.screenAdd);
  vec4.scale(out, out, 0.5);
  return out;
};

/**
 * Returns the view position of an object
 * @param {Float32Array} vec
 * @return {Float32Array}
 */
WebGLRenderer.prototype.getViewPosition = function(vec) {
  let mView = this.getViewMatrix();
  let out = this.helpers.eyePosition;
  vec3.set(out, vec[0], vec[1], vec[2]);
  vec3.transformMat4(out, out, mView);
  return out;
};

/**
 * @param {Number} mode
 * @param {Number} first
 * @param {Number} count
 */
WebGLRenderer.prototype.drawArrays = function(mode, first, count) {
  let gl = this.gl;
  if (this.debug.wireframe) {
    gl.disable(gl.CULL_FACE);
    gl.drawArrays(gl.LINES, first, count);
    gl.enable(gl.CULL_FACE);
  }
  gl.drawArrays(mode, first, count);
  this.drawCalls++;
  this.totalVertices += count;
};

/**
 * @param {Number} mode
 * @param {Number} count
 * @param {Number} type
 * @param {Number} offset
 */
WebGLRenderer.prototype.drawElements = function(mode, count, type, offset) {
  let gl = this.gl;
  if (this.debug.wireframe) {
    gl.disable(gl.CULL_FACE);
    gl.drawElements(gl.LINES, count, type, offset);
    gl.enable(gl.CULL_FACE);
  } else {
    gl.drawElements(mode, count, type, offset);
  }
  this.drawCalls++;
  this.totalVertices += count;
};

/**
 * @param {Number} mode
 * @param {Number} count
 * @param {Number} type
 * @param {Number} offset
 * @param {Number} instanceCount
 */
WebGLRenderer.prototype.drawElementsInstanced = function(mode, count, type, offset, instanceCount) {
  let gl = this.gl;
  if (this.debug.wireframe) {
    gl.disable(gl.CULL_FACE);
    gl.drawElementsInstanced(gl.LINES, count, type, offset, instanceCount);
    gl.enable(gl.CULL_FACE);
  } else {
    gl.drawElementsInstanced(mode, count, type, offset, instanceCount);
  }
  this.drawCalls++;
  this.totalVertices += count * instanceCount;
};

/**
 * Displays the normal vectors of an object
 * @param {WebGLObject} object
 */
WebGLRenderer.prototype.drawDebugNormals = function(object) {
  let buffers = object.buffers;
  let oprogram = this.getActiveProgram();
  let program = this.useRendererProgram("debug-normals");
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
  gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
  // vertex buffer -> debug normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.debugNormals);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  gl.uniform1f(variables.uDebugNormals, 1);
  this.drawArrays(gl.LINES, 0, object.data.debugNormals.length / 3);
  gl.uniform1f(variables.uDebugNormals, 0);
  // reset, debug normals -> vertex buffer
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  this.useRendererProgram(oprogram.name);
};

// renderer pass enums
{
  WebGLRenderer.prototype.RENDER_PASS = {
    DEFAULT: 0,
    MAIN: 1,
    LIGHT: 2,
    SHADOW: 3
  };
}

extend(WebGLRenderer, _create);
extend(WebGLRenderer, _divisors);
extend(WebGLRenderer, _transforms);

extend(WebGLRenderer, _md5);
extend(WebGLRenderer, _quad);
extend(WebGLRenderer, _batch);
extend(WebGLRenderer, _object);
extend(WebGLRenderer, _skybox);
extend(WebGLRenderer, _plane);
extend(WebGLRenderer, _shadow);
extend(WebGLRenderer, _terrain);
extend(WebGLRenderer, _animation);
extend(WebGLRenderer, _bounding_box);
extend(WebGLRenderer, _shadow_instanced);

/*
 * A fast javascript implementation of simplex noise by Jonas Wagner
 *
 * Based on a speed-improved simplex noise algorithm for 2D, 3D and 4D in Java.
 * Which is based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * With Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 *
 *
 * Copyright (C) 2012 Jonas Wagner
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */
var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
var F3 = 1.0 / 3.0;
var G3 = 1.0 / 6.0;
var F4 = (Math.sqrt(5.0) - 1.0) / 4.0;
var G4 = (5.0 - Math.sqrt(5.0)) / 20.0;


function SimplexNoise(random) {
  if (!random) random = Math.random;
  this.p = new Uint8Array(256);
  this.perm = new Uint8Array(512);
  this.permMod12 = new Uint8Array(512);
  for (var i = 0; i < 256; i++) {
    this.p[i] = random() * 256;
  }
  for (i = 0; i < 512; i++) {
    this.perm[i] = this.p[i & 255];
    this.permMod12[i] = this.perm[i] % 12;
  }

}
SimplexNoise.prototype = {
  grad3: new Float32Array([1, 1, 0, -1, 1, 0,
    1, -1, 0,

    -1, -1, 0,
    1, 0, 1, -1, 0, 1,

    1, 0, -1, -1, 0, -1,
    0, 1, 1,

    0, -1, 1,
    0, 1, -1,
    0, -1, -1
  ]),
  grad4: new Float32Array([0, 1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1,
    0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1,
    1, 0, 1, 1, 1, 0, 1, -1, 1, 0, -1, 1, 1, 0, -1, -1, -1, 0, 1, 1, -1, 0, 1, -1, -1, 0, -1, 1, -1, 0, -1, -1,
    1, 1, 0, 1, 1, 1, 0, -1, 1, -1, 0, 1, 1, -1, 0, -1, -1, 1, 0, 1, -1, 1, 0, -1, -1, -1, 0, 1, -1, -1, 0, -1,
    1, 1, 1, 0, 1, 1, -1, 0, 1, -1, 1, 0, 1, -1, -1, 0, -1, 1, 1, 0, -1, 1, -1, 0, -1, -1, 1, 0, -1, -1, -1, 0
  ]),
  noise2D: function(xin, yin) {
    var permMod12 = this.permMod12,
      perm = this.perm,
      grad3 = this.grad3;
    var n0 = 0,
      n1 = 0,
      n2 = 0; // Noise contributions from the three corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin + yin) * F2; // Hairy factor for 2D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var X0 = i - t; // Unskew the cell origin back to (x,y) space
    var Y0 = j - t;
    var x0 = xin - X0; // The x,y distances from the cell origin
    var y0 = yin - Y0;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
    if (x0 > y0) {
      i1 = 1;
      j1 = 0;
    } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
    else {
      i1 = 0;
      j1 = 1;
    } // upper triangle, YX order: (0,0)->(0,1)->(1,1)
    // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
    // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
    // c = (3-sqrt(3))/6
    var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
    var y2 = y0 - 1.0 + 2.0 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    var ii = i & 255;
    var jj = j & 255;
    // Calculate the contribution from the three corners
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
      var gi0 = permMod12[ii + perm[jj]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0); // (x,y) of grad3 used for 2D gradient
    }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
      var gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1);
    }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
      var gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1,1].
    return 70.0 * (n0 + n1 + n2);
  },
  // 3D simplex noise
  noise3D: function(xin, yin, zin) {
    var permMod12 = this.permMod12,
      perm = this.perm,
      grad3 = this.grad3;
    var n0, n1, n2, n3; // Noise contributions from the four corners
    // Skew the input space to determine which simplex cell we're in
    var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
    var Y0 = j - t;
    var Z0 = k - t;
    var x0 = xin - X0; // The x,y,z distances from the cell origin
    var y0 = yin - Y0;
    var z0 = zin - Z0;
    // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
    // Determine which simplex we are in.
    var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
    var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
    if (x0 >= y0) {
      if (y0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // X Y Z order
      else if (x0 >= z0) {
        i1 = 1;
        j1 = 0;
        k1 = 0;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // X Z Y order
      else {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 1;
        j2 = 0;
        k2 = 1;
      } // Z X Y order
    } else { // x0<y0
      if (y0 < z0) {
        i1 = 0;
        j1 = 0;
        k1 = 1;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Z Y X order
      else if (x0 < z0) {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 0;
        j2 = 1;
        k2 = 1;
      } // Y Z X order
      else {
        i1 = 0;
        j1 = 1;
        k1 = 0;
        i2 = 1;
        j2 = 1;
        k2 = 0;
      } // Y X Z order
    }
    // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
    // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
    // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
    // c = 1/6.
    var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
    var y2 = y0 - j2 + 2.0 * G3;
    var z2 = z0 - k2 + 2.0 * G3;
    var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
    var y3 = y0 - 1.0 + 3.0 * G3;
    var z3 = z0 - 1.0 + 3.0 * G3;
    // Work out the hashed gradient indices of the four simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var kk = k & 255;
    // Calculate the contribution from the four corners
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      var gi0 = permMod12[ii + perm[jj + perm[kk]]] * 3;
      t0 *= t0;
      n0 = t0 * t0 * (grad3[gi0] * x0 + grad3[gi0 + 1] * y0 + grad3[gi0 + 2] * z0);
    }
    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      var gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
      t1 *= t1;
      n1 = t1 * t1 * (grad3[gi1] * x1 + grad3[gi1 + 1] * y1 + grad3[gi1 + 2] * z1);
    }
    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      var gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
      t2 *= t2;
      n2 = t2 * t2 * (grad3[gi2] * x2 + grad3[gi2 + 1] * y2 + grad3[gi2 + 2] * z2);
    }
    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      var gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
      t3 *= t3;
      n3 = t3 * t3 * (grad3[gi3] * x3 + grad3[gi3 + 1] * y3 + grad3[gi3 + 2] * z3);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to stay just inside [-1,1]
    return 32.0 * (n0 + n1 + n2 + n3);
  },
  // 4D simplex noise, better simplex rank ordering method 2012-03-09
  noise4D: function(x, y, z, w) {
    var permMod12 = this.permMod12,
      perm = this.perm,
      grad4 = this.grad4;

    var n0, n1, n2, n3, n4; // Noise contributions from the five corners
    // Skew the (x,y,z,w) space to determine which cell of 24 simplices we're in
    var s = (x + y + z + w) * F4; // Factor for 4D skewing
    var i = Math.floor(x + s);
    var j = Math.floor(y + s);
    var k = Math.floor(z + s);
    var l = Math.floor(w + s);
    var t = (i + j + k + l) * G4; // Factor for 4D unskewing
    var X0 = i - t; // Unskew the cell origin back to (x,y,z,w) space
    var Y0 = j - t;
    var Z0 = k - t;
    var W0 = l - t;
    var x0 = x - X0; // The x,y,z,w distances from the cell origin
    var y0 = y - Y0;
    var z0 = z - Z0;
    var w0 = w - W0;
    // For the 4D case, the simplex is a 4D shape I won't even try to describe.
    // To find out which of the 24 possible simplices we're in, we need to
    // determine the magnitude ordering of x0, y0, z0 and w0.
    // Six pair-wise comparisons are performed between each possible pair
    // of the four coordinates, and the results are used to rank the numbers.
    var rankx = 0;
    var ranky = 0;
    var rankz = 0;
    var rankw = 0;
    if (x0 > y0) rankx++;
    else ranky++;
    if (x0 > z0) rankx++;
    else rankz++;
    if (x0 > w0) rankx++;
    else rankw++;
    if (y0 > z0) ranky++;
    else rankz++;
    if (y0 > w0) ranky++;
    else rankw++;
    if (z0 > w0) rankz++;
    else rankw++;
    var i1, j1, k1, l1; // The integer offsets for the second simplex corner
    var i2, j2, k2, l2; // The integer offsets for the third simplex corner
    var i3, j3, k3, l3; // The integer offsets for the fourth simplex corner
    // simplex[c] is a 4-vector with the numbers 0, 1, 2 and 3 in some order.
    // Many values of c will never occur, since e.g. x>y>z>w makes x<z, y<w and x<w
    // impossible. Only the 24 indices which have non-zero entries make any sense.
    // We use a thresholding to set the coordinates in turn from the largest magnitude.
    // Rank 3 denotes the largest coordinate.
    i1 = rankx >= 3 ? 1 : 0;
    j1 = ranky >= 3 ? 1 : 0;
    k1 = rankz >= 3 ? 1 : 0;
    l1 = rankw >= 3 ? 1 : 0;
    // Rank 2 denotes the second largest coordinate.
    i2 = rankx >= 2 ? 1 : 0;
    j2 = ranky >= 2 ? 1 : 0;
    k2 = rankz >= 2 ? 1 : 0;
    l2 = rankw >= 2 ? 1 : 0;
    // Rank 1 denotes the second smallest coordinate.
    i3 = rankx >= 1 ? 1 : 0;
    j3 = ranky >= 1 ? 1 : 0;
    k3 = rankz >= 1 ? 1 : 0;
    l3 = rankw >= 1 ? 1 : 0;
    // The fifth corner has all coordinate offsets = 1, so no need to compute that.
    var x1 = x0 - i1 + G4; // Offsets for second corner in (x,y,z,w) coords
    var y1 = y0 - j1 + G4;
    var z1 = z0 - k1 + G4;
    var w1 = w0 - l1 + G4;
    var x2 = x0 - i2 + 2.0 * G4; // Offsets for third corner in (x,y,z,w) coords
    var y2 = y0 - j2 + 2.0 * G4;
    var z2 = z0 - k2 + 2.0 * G4;
    var w2 = w0 - l2 + 2.0 * G4;
    var x3 = x0 - i3 + 3.0 * G4; // Offsets for fourth corner in (x,y,z,w) coords
    var y3 = y0 - j3 + 3.0 * G4;
    var z3 = z0 - k3 + 3.0 * G4;
    var w3 = w0 - l3 + 3.0 * G4;
    var x4 = x0 - 1.0 + 4.0 * G4; // Offsets for last corner in (x,y,z,w) coords
    var y4 = y0 - 1.0 + 4.0 * G4;
    var z4 = z0 - 1.0 + 4.0 * G4;
    var w4 = w0 - 1.0 + 4.0 * G4;
    // Work out the hashed gradient indices of the five simplex corners
    var ii = i & 255;
    var jj = j & 255;
    var kk = k & 255;
    var ll = l & 255;
    // Calculate the contribution from the five corners
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0 - w0 * w0;
    if (t0 < 0) n0 = 0.0;
    else {
      var gi0 = (perm[ii + perm[jj + perm[kk + perm[ll]]]] % 32) * 4;
      t0 *= t0;
      n0 = t0 * t0 * (grad4[gi0] * x0 + grad4[gi0 + 1] * y0 + grad4[gi0 + 2] * z0 + grad4[gi0 + 3] * w0);
    }
    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1 - w1 * w1;
    if (t1 < 0) n1 = 0.0;
    else {
      var gi1 = (perm[ii + i1 + perm[jj + j1 + perm[kk + k1 + perm[ll + l1]]]] % 32) * 4;
      t1 *= t1;
      n1 = t1 * t1 * (grad4[gi1] * x1 + grad4[gi1 + 1] * y1 + grad4[gi1 + 2] * z1 + grad4[gi1 + 3] * w1);
    }
    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2 - w2 * w2;
    if (t2 < 0) n2 = 0.0;
    else {
      var gi2 = (perm[ii + i2 + perm[jj + j2 + perm[kk + k2 + perm[ll + l2]]]] % 32) * 4;
      t2 *= t2;
      n2 = t2 * t2 * (grad4[gi2] * x2 + grad4[gi2 + 1] * y2 + grad4[gi2 + 2] * z2 + grad4[gi2 + 3] * w2);
    }
    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3 - w3 * w3;
    if (t3 < 0) n3 = 0.0;
    else {
      var gi3 = (perm[ii + i3 + perm[jj + j3 + perm[kk + k3 + perm[ll + l3]]]] % 32) * 4;
      t3 *= t3;
      n3 = t3 * t3 * (grad4[gi3] * x3 + grad4[gi3 + 1] * y3 + grad4[gi3 + 2] * z3 + grad4[gi3 + 3] * w3);
    }
    var t4 = 0.6 - x4 * x4 - y4 * y4 - z4 * z4 - w4 * w4;
    if (t4 < 0) n4 = 0.0;
    else {
      var gi4 = (perm[ii + 1 + perm[jj + 1 + perm[kk + 1 + perm[ll + 1]]]] % 32) * 4;
      t4 *= t4;
      n4 = t4 * t4 * (grad4[gi4] * x4 + grad4[gi4 + 1] * y4 + grad4[gi4 + 2] * z4 + grad4[gi4 + 3] * w4);
    }
    // Sum up and scale the result to cover the range [-1,1]
    return 27.0 * (n0 + n1 + n2 + n3 + n4);
  }


};

let SCALE = 6;
let SIZE = 512 * SCALE;
let VERTEX_COUNT = 256;

/**
 * A simple terrain
 * @class Terrain
 * @extends WebGLObject
 */
class Terrain extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.shadowTexture = null;
    this.lightSpaceMatrix = mat4.create();
    this.init();
  }
}

Terrain.prototype.init = function() {
  let gl = this.gl;
  let renderer = this.renderer;
  let opts = {
    width: 2048, height: 2048,
    wrap: {
      s: gl.CLAMP_TO_EDGE,
      t: gl.CLAMP_TO_EDGE,
      r: gl.CLAMP_TO_EDGE
    },
    attachments: [
      { format: gl.DEPTH_COMPONENT32F, size: gl.FLOAT }
    ]
  };
  this.shadowTexture = renderer.createFrameBuffer(opts);
};

Terrain.prototype.bufferShadows = function(cbDrawScene) {
  let gl = this.gl;
  let renderer = this.renderer;
  let shadowTexture = this.shadowTexture;
  let program = renderer.useRendererProgram("object-shadow");
  let variables = program.locations;
  // setup fbo
  {
    renderer.useFrameBuffer(shadowTexture);
    gl.clear(gl.DEPTH_BUFFER_BIT);
  }
  // setup camera
  {
    camera.mode = 1;
    // enable orthographic projection
    renderer.useCamera(camera);
    // disable clipping
    //renderer.resetClipPlane();
    // we only care about back faces
    gl.cullFace(gl.FRONT);
  }
  // move camera to light source
  {
    let mProjection = renderer.getProjectionMatrix();
    let rotation = new Float32Array([0.9, -0.0, 0.0]);
    let position = new Float32Array([350.0, -750.0, 1000]);
    let mView = mat4.create();
    mat4.rotateX(mView, mView, rotation[0]);
    mat4.rotateY(mView, mView, rotation[1]);
    mat4.rotateZ(mView, mView, rotation[2] - Math.PI);
    mat4.translate(mView, mView, [-position[0], -position[1], -position[2]]);
    this.lightSpaceMatrix = mat4.multiply(
      mat4.create(),
      mProjection,
      mView
    );
  }
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uLightSpaceMatrix, false, this.lightSpaceMatrix);
  }
  // draw objects
  {
    objects.map(obj => {
      if (
        obj.isInstanced ||
        obj.light ||
        !camera.isObjectInView(obj)
      ) return;
      renderer.renderShadow(obj);
    });
  }
  // restore
  {
    camera.mode = 0;
    gl.cullFace(gl.BACK);
    renderer.useCamera(camera);
    renderer.restoreFrameBuffer();
  }
};

Terrain.prototype.calculateNormal = function(x, y, heights) {
  let length = heights.length;
  let l = heights[clamp((y * VERTEX_COUNT) + (x - 1), 0, length)];
  let r = heights[clamp((y * VERTEX_COUNT) + (x + 1), 0, length)];
  let d = heights[clamp(((y - 1) * VERTEX_COUNT) + x, 0, length)];
  let u = heights[clamp(((y + 1) * VERTEX_COUNT) + x, 0, length)];
  let norm = vec3.create();
  vec3.set(norm, (l - r), 1.0, (d - u));
  vec3.normalize(norm, norm);
  norm[1] *= -1;
  return norm;
};

Terrain.prototype.getHeightAt = function(x, y, z) {
  // bring input to world space
  {
    let vec = vec4.fromValues(x, y, z, 0.0);
    let mModel = this.getModelMatrix();
    let mModelInverse = mat4.invert(mat4.create(), mModel);
    vec4.transformMat4(vec, vec, mModelInverse);
    x = vec[0];
    z = vec[2];
  }
  let heights = this.heights;
  let tx = z - this.translate.x;
  let tz = x - this.translate.z;
  let sqSize = SIZE / (VERTEX_COUNT - 1);
  let gx = Math.floor(tx / sqSize);
  let gz = Math.floor(tz / sqSize);
  if (
    (gx >= (VERTEX_COUNT - 1) || gx < 0) ||
    (gz >= (VERTEX_COUNT - 1) || gz < 0)
  ) return 0;
  let xCoord = (tx % sqSize) / sqSize;
  let zCoord = (tz % sqSize) / sqSize;
  let result = null;
  if (xCoord <= (1 - zCoord)) {
    result = baryCentric(
      [0, heights[((gz + 0) * (VERTEX_COUNT)) + (gx + 0)], 0],
      [1, heights[((gz + 0) * (VERTEX_COUNT)) + (gx + 1)], 0],
      [0, heights[((gz + 1) * (VERTEX_COUNT)) + (gx + 0)], 1],
      [xCoord, zCoord]
    );
  } else {
    result = baryCentric(
      [1, heights[((gz + 0) * (VERTEX_COUNT)) + (gx + 1)], 0],
      [1, heights[((gz + 1) * (VERTEX_COUNT)) + (gx + 1)], 1],
      [0, heights[((gz + 1) * (VERTEX_COUNT)) + (gx + 0)], 1],
      [xCoord, zCoord]
    );
  }
  return result;
};

/**
 * Create cube data
 */
Terrain.prototype.createMesh = function() {
  let data = this.data;

  let count = VERTEX_COUNT * VERTEX_COUNT;

  let noise = new SimplexNoise(Math.random.bind(this));

  let vertices = new Float32Array(count * 3);
  let normals = new Float32Array(count * 3);
  let indices = new Uint16Array(6 * (VERTEX_COUNT - 1) * (VERTEX_COUNT - 1));
  let uvs = new Float32Array(count * 2);

  let freq = 0.0125;
  let ampl = SCALE ** 2.125;
  let heights = new Float32Array(VERTEX_COUNT * VERTEX_COUNT);

  // build height data
  {
    for (let z = 0; z < VERTEX_COUNT; ++z) {
      for (let x = 0; x < VERTEX_COUNT; ++x) {
        let n = (
          1 * noise.noise2D((1 * x) * freq, (1 * z) * freq) * ampl +
          0.25 * noise.noise2D((2 * x) * freq, (2 * z) * freq) * ampl +
          0.125 * noise.noise2D((4 * x) * freq, (4 * z) * freq) * ampl
        );
        heights[(z * VERTEX_COUNT) + x] = n;
      }
    }
  }

  {
    for (let z = 0; z < VERTEX_COUNT; ++z) {
      for (let x = 0; x < VERTEX_COUNT; ++x) {
        let index = (z * VERTEX_COUNT) + x;
        let height = heights[index];
        // vert
        vertices[index * 3 + 0] = (z / (VERTEX_COUNT - 1) * SIZE);
        vertices[index * 3 + 1] = height;
        vertices[index * 3 + 2] = x / (VERTEX_COUNT - 1) * SIZE;
        // normal
        let normal = this.calculateNormal(x, z, heights);
        normals[index * 3 + 0] = normal[0];
        normals[index * 3 + 1] = normal[1];
        normals[index * 3 + 2] = normal[2];
        // uv
        uvs[index * 2 + 0] = (z / (VERTEX_COUNT - 1)) * 16.0;
        uvs[index * 2 + 1] = (x / (VERTEX_COUNT - 1)) * 16.0;
      }
    }
  }

  let pointer = 0;
  for (let gz = 0; gz < VERTEX_COUNT - 1; gz++) {
    for (let gx = 0; gx < VERTEX_COUNT - 1; gx++) {
      let topLeft = (gz * VERTEX_COUNT) + gx;
      let topRight = topLeft + 1;
      let bottomLeft = ((gz + 1) * VERTEX_COUNT) + gx;
      let bottomRight = bottomLeft + 1;
      indices[pointer++] = topLeft;
      indices[pointer++] = bottomLeft;
      indices[pointer++] = topRight;
      indices[pointer++] = topRight;
      indices[pointer++] = bottomLeft;
      indices[pointer++] = bottomRight;
    }
  }

  this.heights = heights;

  data.vertices = vertices;
  data.normals = normals;
  data.indices = indices;
  data.uvs = uvs;

  let tabi = calculateTangentsBitangents(this);
  data.tangents = tabi.tangents;
  data.bitangents = tabi.bitangents;

};

/**
 * Frustum base class
 * @class Frustum
 */
class Frustum {
  /**
   * @constructor
   * @param {Camera} camera
   */
  constructor(camera) {
    this.uid = uid();
    this.camera = camera;
    this.viewFrustum = [
      vec4.create(),
      vec4.create(),
      vec4.create(),
      vec4.create(),
      vec4.create(),
      vec4.create()
    ];
    this.helpers = {
      center: vec3.create()
    };
    this.centroid = vec4.create();
    this.clipMatrix = mat4.create();
  }
}

/**
 * Resets the frustum for a recalculation
 */
Frustum.prototype.reset = function() {
  let clipMatrix = this.clipMatrix;
  let viewFrustum = this.viewFrustum;
  mat4.identity(clipMatrix);
  vec4.set(viewFrustum[0], 0.0, 0.0, 0.0, 0.0);
  vec4.set(viewFrustum[1], 0.0, 0.0, 0.0, 0.0);
  vec4.set(viewFrustum[2], 0.0, 0.0, 0.0, 0.0);
  vec4.set(viewFrustum[3], 0.0, 0.0, 0.0, 0.0);
};

/**
 * Calculates the view frustum
 */
Frustum.prototype.update = function() {
  let t = 0.0;
  let camera = this.camera;
  let mMat = camera.viewMatrix;
  let pMat = camera.projectionMatrix;
  let viewFrustum = this.viewFrustum;
  let clip = this.clipMatrix;

  this.reset();

  mat4.multiply(clip, pMat, mMat);

  // http://www.crownandcutlass.com/features/technicaldetails/frustum.html

  // right
  viewFrustum[0][0] = clip[ 3] - clip[ 0];
  viewFrustum[0][1] = clip[ 7] - clip[ 4];
  viewFrustum[0][2] = clip[11] - clip[ 8];
  viewFrustum[0][3] = clip[15] - clip[12];
  t = Math.sqrt( viewFrustum[0][0] * viewFrustum[0][0] + viewFrustum[0][1] * viewFrustum[0][1] + viewFrustum[0][2] * viewFrustum[0][2] );
  viewFrustum[0][0] /= t;
  viewFrustum[0][1] /= t;
  viewFrustum[0][2] /= t;
  viewFrustum[0][3] /= t;

  // left
  viewFrustum[1][0] = clip[ 3] + clip[ 0];
  viewFrustum[1][1] = clip[ 7] + clip[ 4];
  viewFrustum[1][2] = clip[11] + clip[ 8];
  viewFrustum[1][3] = clip[15] + clip[12];
  t = Math.sqrt( viewFrustum[1][0] * viewFrustum[1][0] + viewFrustum[1][1] * viewFrustum[1][1] + viewFrustum[1][2] * viewFrustum[1][2] );
  viewFrustum[1][0] /= t;
  viewFrustum[1][1] /= t;
  viewFrustum[1][2] /= t;
  viewFrustum[1][3] /= t;

  // bottom
  viewFrustum[2][0] = clip[ 3] + clip[ 1];
  viewFrustum[2][1] = clip[ 7] + clip[ 5];
  viewFrustum[2][2] = clip[11] + clip[ 9];
  viewFrustum[2][3] = clip[15] + clip[13];
  t = Math.sqrt( viewFrustum[2][0] * viewFrustum[2][0] + viewFrustum[2][1] * viewFrustum[2][1] + viewFrustum[2][2] * viewFrustum[2][2] );
  viewFrustum[2][0] /= t;
  viewFrustum[2][1] /= t;
  viewFrustum[2][2] /= t;
  viewFrustum[2][3] /= t;

  // top
  viewFrustum[3][0] = clip[ 3] - clip[ 1];
  viewFrustum[3][1] = clip[ 7] - clip[ 5];
  viewFrustum[3][2] = clip[11] - clip[ 9];
  viewFrustum[3][3] = clip[15] - clip[13];
  t = Math.sqrt( viewFrustum[3][0] * viewFrustum[3][0] + viewFrustum[3][1] * viewFrustum[3][1] + viewFrustum[3][2] * viewFrustum[3][2] );
  viewFrustum[3][0] /= t;
  viewFrustum[3][1] /= t;
  viewFrustum[3][2] /= t;
  viewFrustum[3][3] /= t;

  // far
  viewFrustum[4][0] = clip[ 3] - clip[ 2];
  viewFrustum[4][1] = clip[ 7] - clip[ 6];
  viewFrustum[4][2] = clip[11] - clip[10];
  viewFrustum[4][3] = clip[15] - clip[14];
  t = Math.sqrt( viewFrustum[4][0] * viewFrustum[4][0] + viewFrustum[4][1] * viewFrustum[4][1] + viewFrustum[4][2] * viewFrustum[4][2] );
  viewFrustum[4][0] /= t;
  viewFrustum[4][1] /= t;
  viewFrustum[4][2] /= t;
  viewFrustum[4][3] /= t;

  // near
  viewFrustum[5][0] = clip[ 3] + clip[ 2];
  viewFrustum[5][1] = clip[ 7] + clip[ 6];
  viewFrustum[5][2] = clip[11] + clip[10];
  viewFrustum[5][3] = clip[15] + clip[14];
  t = Math.sqrt( viewFrustum[5][0] * viewFrustum[5][0] + viewFrustum[5][1] * viewFrustum[5][1] + viewFrustum[5][2] * viewFrustum[5][2] );
  viewFrustum[5][0] /= t;
  viewFrustum[5][1] /= t;
  viewFrustum[5][2] /= t;
  viewFrustum[5][3] /= t;

  //this.updateCentroid();

};

Frustum.prototype.updateCentroid = function() {
  let camera = this.camera;
  let centroid = this.centroid;
  let planes = this.viewFrustum;
  let mViewProjection = mat4.multiply(mat4.create(), camera.projectionMatrix, camera.viewMatrix);
  let mInvVP = mat4.invert(mat4.create(), mViewProjection);
  vec4.set(centroid, 0.0, 0.0, 0.0, 0.0);
  vec4.add(centroid, centroid, planes[0]);
  vec4.add(centroid, centroid, planes[1]);
  vec4.add(centroid, centroid, planes[2]);
  vec4.add(centroid, centroid, planes[3]);
  vec4.add(centroid, centroid, planes[4]);
  vec4.add(centroid, centroid, planes[5]);
  vec4.scale(centroid, centroid, 1 / 6);
  vec4.transformMat4(centroid, centroid, mViewProjection);
};

/**
 * Indicates if an object is inside the view frustum
 * @param {WebGLObject} object
 * @return {Boolean}
 */
Frustum.prototype.isObjectInFrustum = function(object) {
  let local = object.boundings.local;
  let world = object.boundings.world;
  let radius = world.radius;
  let center = this.helpers.center;
  let viewFrustum = this.viewFrustum;
  let mModel = object.getModelMatrix();
  vec3.set(center, local.center[0], local.center[1], local.center[2]);
  vec3.transformMat4(center, center, mModel);
  return this.intersectBox(center, radius, viewFrustum);
};

/**
 * Sphere intersection
 * @param {Float32Array} min - min point
 * @param {Float32Array} max - max point
 * @param {Array} - frustum planes
 * @return {Boolean}
 */
Frustum.prototype.intersectSphere = function(center, radius, frustum) {
  let c = 0;
  let x = center[0];
  let y = center[1];
  let z = center[2];
  for (let ii = 0; ii < 6; ++ii) {
    let plane = frustum[ii];
    let p0 = plane[0], p1 = plane[1], p2 = plane[2], p3 = plane[3];
    let d = p0 * x + p1 * y + p2 * z + p3;
    if (d <= -radius) return 0;
    if (d > radius) c++;
   }
   return (c > 0);
};

/**
 * Box intersection
 * @param {Float32Array} center - object's center point
 * @param {Number} radius - object's radius
 * @param {Array} - frustum planes
 * @return {Boolean}
 */
Frustum.prototype.intersectBox = function(center, radius, frustum) {
  let x = center[0], y = center[1], z = center[2];
  for (let ii = 0; ii < 6; ++ii) {
    let plane = frustum[ii];
    let p0 = plane[0], p1 = plane[1], p2 = plane[2], p3 = plane[3];
    if (p0 * (x - radius) + p1 * (y - radius) + p2 * (z - radius) + p3 > 0) continue;
    if (p0 * (x + radius) + p1 * (y - radius) + p2 * (z - radius) + p3 > 0) continue;
    if (p0 * (x - radius) + p1 * (y + radius) + p2 * (z - radius) + p3 > 0) continue;
    if (p0 * (x + radius) + p1 * (y + radius) + p2 * (z - radius) + p3 > 0) continue;
    if (p0 * (x - radius) + p1 * (y - radius) + p2 * (z + radius) + p3 > 0) continue;
    if (p0 * (x + radius) + p1 * (y - radius) + p2 * (z + radius) + p3 > 0) continue;
    if (p0 * (x - radius) + p1 * (y + radius) + p2 * (z + radius) + p3 > 0) continue;
    if (p0 * (x + radius) + p1 * (y + radius) + p2 * (z + radius) + p3 > 0) continue;
    return false;
  }
  return true;
};

/**
 * Camera base class
 * @class Camera
 */
class Camera {
  /**
   * @constructor
   * @param {Object} opts
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.delta = 0;
    this.renderer = opts.renderer;
    this.frustum = new Frustum(this);
    this.position = vec3.create();
    this.rotation = vec3.create();
    this.viewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.zNear = 1.0;
    this.zFar = 4096.0;
    this.fieldOfView = 0.0;
    this.mode = 0;
    this.orthoScale = 512.0;
    this.setFOV(45.0);
    this.setAspect(this.renderer.width, this.renderer.height);
  }
}

/**
 * Sets the camera's field of view
 * @param {Number} value - fov value
 */
Camera.prototype.setFOV = function(value = 45.0) {
  this.fieldOfView = value * Math.PI / 180;
};

/**
 * Sets the camera's aspect ratio
 * @param {Number} width
 * @param {Number} height
 */
Camera.prototype.setAspect = function(width, height) {
  this.aspect = width / height;
};

/**
 * @param {Number} delta - aka delta frame time
 */
Camera.prototype.setDelta = function(delta) {
  this.delta = delta;
};

/**
 * Switches the camera to the given cubemap face
 * @param {Number} face - the cubemap's face
 * @return {Object} the original camera yaw, pitch
 */
Camera.prototype.lookAtCubeMapFace = function(face) {
  let yaw = 0;
  let pitch = 0;
  switch (face) {
    case 0:
      yaw = 90;
      pitch = 0;
    break;
    case 1:
      yaw = -90;
      pitch = 0;
    break;
    case 2:
      yaw = 180;
      pitch = -90;
    break;
    case 3:
      yaw = 180;
      pitch = 90;
    break;
    case 4:
      yaw = 180;
      pitch = 0;
    break;
    case 5:
      yaw = 0;
      pitch = 0;
    break;
  }
  let original = {
    yaw: this.rotation[1],
    pitch: this.rotation[0]
  };
  this.rotation[0] = pitch * (Math.PI / 180);
  this.rotation[1] = yaw * (Math.PI / 180);
  return original;
};

Camera.prototype.getWorldRelativePosition = function(mx, my) {
  let vDeviceCoords = this.getDeviceCoords(window.innerWidth / 2, window.innerHeight / 2);
  let vClipCoords = this.getClipCoords(vDeviceCoords);
  let vCameraCoords = this.getCameraCoords(this.projectionMatrix, vClipCoords);
  let vRayCoords = this.getRayCoords(this.viewMatrix, vCameraCoords);
  return vRayCoords;
};

Camera.prototype.getDeviceCoords = function(mx, my) {
  let renderer = this.renderer;
  let out = vec2.create();
  let x = (2.0 * mx) / renderer.width - 1;
  let y = (2.0 * my) / renderer.height - 1;
  vec2.set(out, x, y);
  return out;
};

Camera.prototype.getClipCoords = function(vDeviceCoords) {
  let out = vec4.create();
  vec4.set(out, vDeviceCoords[0], vDeviceCoords[1], -1, 1);
  return out;
};

Camera.prototype.getCameraCoords = function(mProjection, vClipCoords) {
  let out = vec4.create();
  let mInvertedProjection = mat4.clone(mProjection);
  let vEyeCoords = vec4.create();
  mat4.invert(mInvertedProjection, mInvertedProjection);
  vec4.transformMat4(vEyeCoords, vClipCoords, mInvertedProjection);
  vec4.set(out, vEyeCoords[0], vEyeCoords[1], -1, 1);
  return out;
};

Camera.prototype.getRayCoords = function(mView, vCameraCoords) {
  let vWorldCoords = vec3.create();
  let vRayCoords = vec3.create();
  let mInvertedView = mat4.clone(mView);
  // reset camera origin
  mInvertedView[11] = -0;
  mInvertedView[12] = 0;
  mInvertedView[13] = 0;
  mInvertedView[14] = 0;
  mInvertedView[15] = 1;
  mat4.invert(mInvertedView, mInvertedView);
  vec4.transformMat4(vWorldCoords, vCameraCoords, mInvertedView);
  vec3.set(vRayCoords, vWorldCoords[0], vWorldCoords[1], vWorldCoords[2]);
  vec3.normalize(vRayCoords, vRayCoords);
  return vRayCoords;
};

/**
 * Returns view matrix
 * @return {Float32Array}
 */
Camera.prototype.view = function() {
  let mView = this.viewMatrix;
  mat4.identity(mView);
  mat4.rotateX(mView, mView, this.rotation[0]);
  mat4.rotateY(mView, mView, this.rotation[1]);
  mat4.rotateZ(mView, mView, this.rotation[2] - Math.PI);
  mat4.translate(mView, mView, [-this.position[0], -this.position[1], -this.position[2]]);
  return mView;
};

/**
 * Update the camera each frame
 * @param {Number} delta
 */
Camera.prototype.update = function(delta) {
  this.frustum.update();
};

/**
 * Returns projection matrix
 * @return {Float32Array}
 */
Camera.prototype.projection = function() {
  let mode = this.mode;
  let mProjection = this.projectionMatrix;
  if (mode === 0) this.perspectiveMode();
  else if (mode === 1) this.orthographicMode();
  return mProjection;
};

Camera.prototype.perspectiveMode = function() {
  let mProjection = this.projectionMatrix;
  mat4.identity(mProjection);
  mat4.perspective(
    mProjection,
    this.fieldOfView,
    this.aspect,
    this.zNear,
    this.zFar
  );
};

Camera.prototype.orthographicMode = function() {
  let mProjection = this.projectionMatrix;
  let scale = this.orthoScale;
  mat4.identity(mProjection);
  mat4.ortho(
    mProjection,
    -scale,
    scale,
    -scale,
    scale,
    this.zNear,
    this.zFar
  );
  return mProjection;
};

Camera.prototype.getRayHit = function(ray, count = 0, length = 100) {
  let renderer = this.renderer;
  let position = {
    x: this.position[0] + (ray[0] * count),
    y: this.position[1] + (ray[1] * count),
    z: this.position[2] + (ray[2] * count)
  };
  let hit = null;
  let objects = renderer.objects;
  for (let ii = 0; ii < objects.length; ++ii) {
    let obj = objects[ii];
    // fast obb intersection
    if (obj.boundings.intersectsWithPoint(position)) {
      // slow, precise vertex intersection
      //if (obj.boundings.intersectsWithVertex(position)) {
        hit = obj;
        break;
      //}
      break;
    }
  }
  if (!hit && count < length) return this.getRayHit(ray, ++count, length);
  return hit;
};

/**
 * Checks if a object is viewable
 * @param {WebGLObject} object
 * @return {Boolean}
 */
Camera.prototype.isObjectInView = function(object) {
  let inView = this.frustum.isObjectInFrustum(object);
  return inView;
};

/**
 * Free camera
 * @class FreeCamera
 */
class FreeCamera extends Camera {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    super(opts);
    this.lerp = {
      rotate: 0.0,
      translate: 0.0
    };
    this.target = {
      rotate: null,
      translate: null
    };
    this.positionSpeed = 128;
    this.rotationSpeed = 0.01;
  }
}

/**
 * Controls the camera
 * @param {Number} dt - Delta frame time
 * @param {Array} move - Array of controls
 * @param {Number} mx - Mouse x
 * @param {Number} my - Mouse y
 */
FreeCamera.prototype.control = function(dt, move, mx, my) {
  let speed = (this.positionSpeed / 1000) * dt;
  let dir = vec3.create();
  if (move[0]) dir[2] -= speed;
  else if (move[1]) dir[2] += speed;
  if (move[2]) dir[0] += speed;
  else if (move[3]) dir[0] -= speed;
  // y only
  if (move[4]) dir[1] -= speed;
  else if (move[5]) dir[1] += speed;
  // z only
  if (move[6] || move[7]) {
    let speed = move[6] ? 1 : -1;
    let dir = this.getWorldRelativePosition(this.renderer.width / 2, this.renderer.height / 2);
    dir[1] = 0;
    vec3.add(this.position, this.position, vec3.scale(dir, dir, 1.05 * speed));
  }
  let oposition = vec3.clone(this.position);
  this.move(dir);
  // if we follow an entity then we don't allow moving below the terrain
  if (this.target.translate) {
    let terrainY = terrain.getHeightAt(this.position[0], this.position[2]);
    if (this.position[1] > terrainY - 2.0) {
      this.position[1] = terrainY - 2.0;
    }
  }
  if (!this.target.rotate) this.point(mx, my);
};

/**
 * Moves camera into given direction
 * @param {Array} dir
 */
FreeCamera.prototype.move = function(dir) {
  if (dir[0] !== 0 || dir[1] !== 0 || dir[2] !== 0) {
    let cam = mat4.create();
    mat4.rotateY(cam, cam, this.rotation[1]);
    // walk into pointed direction
    if (dir[2] !== 0) mat4.rotateX(cam, cam, this.rotation[0]);
    vec3.transformMat4(dir, dir, cam);
    vec3.add(this.position, this.position, dir);
    //this.target.translate = null;
  }
};

/**
 * Point into a given point
 * @param {Number} mx
 * @param {Number} my
 */
FreeCamera.prototype.point = function(mx, my) {
  let rot = this.rotation;
  rot[1] += mx * this.rotationSpeed;
  rot[0] += my * this.rotationSpeed;
  // limits
  if (rot[0] < -Math.PI * 0.5) rot[0] = -Math.PI * 0.5; // top
  if (rot[0] > Math.PI * 0.5) rot[0] = Math.PI * 0.5; // bottom
};

/**
 * Moves the camera to the target
 * @param {WebGLObject} target
 * @param {Boolean} instant - Move to the target without lerping
 */
FreeCamera.prototype.moveTo = function(target = null, instant = false) {
  this.target.translate = target;
  if (!target) return;
  this.lerp.translate = 0;
  if (instant) {
    this.target.translate = null;
    vec3.copy(this.position, target.boundings.world.center);
  }
};

/**
 * Rotates the camera to the target
 * @param {WebGLObject} target
 * @param {Boolean} instant - Rotate to the target without lerping
 */
FreeCamera.prototype.lookAt = function(target = null, instant = false) {
  this.target.rotate = target;
  if (!target) return;
  this.lerp.rotate = 0;
  let rot = this.rotation;
  let a = this.position;
  let b = target.boundings.world.center;
  let xd = (a[0] - b[0]);
  let yd = (a[1] - b[1]);
  let zd = (a[2] - b[2]);
  let x = -Math.atan2(yd, Math.sqrt(xd * xd + zd * zd));
  let y = Math.atan2(xd, zd);
  let nx = (y - rot[1]);
  let ny = (x - rot[0]);
  rot[1] += nx;
  rot[0] += ny;
};

/**
 * Update the camera each frame
 * @param {Number} delta
 */
FreeCamera.prototype.update = function(delta) {
  let tTarget = this.target.translate;
  /*
  this.rotation[0] = pitch * (Math.PI / 180);
  this.rotation[1] = yaw * (Math.PI / 180);
  */
  // translation target
  if (tTarget && window.terrain) {
    let position = vec3.clone(tTarget.translate.toArray());
    let minDist = 100.0;
    let theta = tTarget.rotate.z;
    let hDist = minDist * Math.cos(this.rotation[0]);
    let posX = hDist * Math.sin(theta * Math.PI / 180);
    let posZ = hDist * Math.cos(theta * Math.PI / 180);
    this.position[2] = position[2] - posX;
    this.position[0] = position[0] - posZ;
    //this.position[1] = position[1] + vDist;
  }
  this.lerp.rotate += 1 / 1e4;
  this.lerp.translate += 1 / 1e4;
  this.lerp.rotate = Math.min(this.lerp.rotate, 1.0);
  this.lerp.translate = Math.min(this.lerp.translate, 1.0);
  this.frustum.update();
  this.lookAt(this.target.rotate);
};

/**
 * A main stage
 * @class Stage
 */
class Stage {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new WebGLRenderer(this);
    this.renderer.resize();
    window.renderer = this.renderer;
    window.gl = renderer.gl;
    window.camera = renderer.createCamera(FreeCamera);
    renderer.camera = camera;
    camera.position = new Float32Array([15.0, -20.0, 40.0]);
    camera.rotation = new Float32Array([0.5, 0.3, 0.0]);
    window.objects = renderer.objects;
    /*{
      renderer.createColladaFile().fromPath("fennekin2.dae").then(object => {
        let texture1 = renderer.createTexture().fromImagePath("fennekin_body.png");
        object.useTexture(texture1);
        object.translate.x = -10;
        object.translate.y = -20;
        object.scale.set(14, 14, 14);
        objects.push(object);
      });
    }*/
    {
      renderer.createObjectFile().fromPath("abra.obj").then(base => {
        let texture1 = renderer.createTexture().fromImagePath("abra.png");
        base.useTexture(texture1);
        for (let ii = 0; ii < 1; ++ii) {
          let obj = renderer.createObject(Cube, { inherit: base });
          obj.translate.set(100, 0, 150);
          obj.rotate.x = 180;
          obj.scale.set(4);
          obj.specularLighting = true;
          window.abra = obj;
          objects.push(obj);
          setTimeout(() => {
            obj.translate.y = terrain.getHeightAt(
              obj.translate.x, obj.translate.y, obj.translate.z
            );
          });
        }
      });
    }
    // collada file test
    /*{
      renderer.createColladaFile().fromPath("model_blender278.dae").then(object => {
        let texture = renderer.createTexture().fromImagePath("diffuse.png");
        object.useTexture(texture);
        object.translate.y = -10;
        cubes.push(object);
        window.men = object;
      });
    }*/
    /*{
      renderer.createAnimatedColladaFile().fromPath("model_blender278.dae").then(object => {
        let texture = renderer.createTexture().fromImagePath("diffuse.png");
        object.useTexture(texture);
        object.translate.y = -15;
        object.translate.z = 35;
        cubes.push(object);
        window.men = object;
        console.log(object);
      });
    }*/
    /*let sprites = ["fox-1", "fox-2"];
    sprites.map((path, index) => {
      sprites[index] = renderer.createTexture({ pixelated: true }).fromImagePath(path + ".png");
    });
    {
      let sprite = renderer.createSprite();
      sprite.scale.set(6, 6, 6);
      sprite.translate.y = -5.5;
      sprite.useTexture(sprites[0]);
      objects.push(sprite);
      window.sprite = sprite;
    }
    let idx = 0;
    setInterval(() => {
      let index = (idx++) % (sprites.length);
      sprite.useTexture(sprites[index]);
    }, 250);
    {
      let sprite = renderer.createSprite();
      let texture = renderer.createTexture({ pixelated: true }).fromImagePath("Redish Tree.png");
      sprite.useTexture(texture);
      sprite.scale.set(10, 10, 10);
      sprite.translate.x = 10;
      sprite.translate.y = -11;
      objects.push(sprite);
    }*/
    // water
    {
      let water = renderer.createObject(Water);
      let size = water.boundings.local.center;
      water.scale.set(1024);
      water.translate.set(-size[0], size[1], -size[2]);
      water.useColor([0, 0, 255]);
      water.translate.y = 10;
      water.rotate.x = 90;
      water.useDUDVTexture(renderer.createTexture().fromImagePath("dudv.png"));
      water.useNormalMap(renderer.createTexture().fromImagePath("water-normal.png"));
      window.water = water;
    }
    // terrain
    {
      let obj = renderer.createObject(Terrain);
      obj.useColor([255, 191, 111]);
      obj.scale.set(1);
      obj.translate.set(-1000, 0, -1000);
      obj.useTexture(renderer.createTexture().fromImagePath("md5/pokepark/map1/Fd_nh_tuchi01.png"));
      /*obj.useNormalMap(renderer.createTexture().fromImagePath("mossy-ground1-normal.png"));
      obj.useMetalnessMap(renderer.createTexture().fromImagePath("mossy-ground1-metal.png"));
      obj.useRoughnessMap(renderer.createTexture().fromImagePath("mossy-ground1-roughness.png"));
      obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("mossy-ground1-ao.png"));
      obj.useSpecularMap(renderer.createTexture().fromImagePath("mossy-ground1-specular.png"));*/
      //obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("terrain-1-ao.png"));
      window.terrain = obj;
    }
    // test blender object
    /*{
      renderer.createObjectFile().fromPath("palm.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromColor([255, 247, 191]));
        obj.translate.set(0, -10, 0);
        obj.scale.set(1, 1, 1);
        cubes.push(obj);
      });
    }*/
    /*{
      let cube = renderer.createObject(Cube);
      window.specialCube = cube;
      specialCube.translate.y = -15;
      let texture = renderer.createFrameBuffer({ width: 512, height: 512 });
      specialCube.useTexture(texture);
      specialCube.scale.set(3,3,3);
    }*/
    // intersection test
    /*{
      renderer.createObjectFile().fromPath("sphere.obj").then(sphere => {
        let texture = renderer.createTexture().fromColor([251, 195, 172]);
        let a = renderer.createObject(Cube);
        a.useTexture(texture);
        a.scale.set(7.25, 1.5, 1.5);
        a.translate.set(12, -8, 0);
        cubes.push(a);
        let b = renderer.createObject(Cube);
        b.useTexture(texture);
        b.translate.set(4,-6,0);
        b.scale.set(2, 2, 2);
        cubes.push(b);
        sphere.useTexture(renderer.createTexture().fromColor([251, 195, 172]));
        sphere.translate.y = -28;
        sphere.scale.set(4, 4, 4);
        cubes.push(sphere);
      });
      renderer.createObjectFile().fromPath("box4.obj").then(box => {
        box.useTexture(renderer.createTexture().fromColor([255, 0, 0]));
        box.scale.set(1, 1, 1);
        box.translate.set(-4, -6, 0);
        cubes.push(box);
      });
    }*/
    // cube with shadow
    /*{
      renderer.createObjectFile().fromPath("sphere1.obj").then(obj => {
        obj.useColor([255, 255, 255]);
        obj.translate.set(-30, -80, 10);
        obj.scale.set(18);
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.meow = obj;
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("sci-fi-helmet.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("sci-fi-helmet-diffuse.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("sci-fi-helmet-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("sci-fi-helmet-metalness.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("sci-fi-helmet-roughness.jpg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("sci-fi-helmet-ao.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("sci-fi-helmet-emissive.jpg"));
        obj.translate.set(60, -80, 0);
        obj.scale.set(8);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.helmet = obj;
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("helmet.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("helmet-diffuse.png"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("helmet-normal.png"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("helmet-metalness.png"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("helmet-roughness.png"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("helmet-ao.png"));
        obj.translate.set(100, -80, 0);
        obj.scale.set(8);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
      });
    }*/
    /*setTimeout(() => {
      renderer.createObjectFile().fromPath("tree_stem.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("tree_stem.jpg"));
        let baseStem = obj;
        renderer.createObjectFile().fromPath("tree_leaves.obj").then(obj => {
          obj.useTexture(renderer.createTexture().fromImagePath("tree_leaves.png"));
          let baseLeaves = obj;
          for (let ii = 0; ii < 0; ++ii) {
            let x = Math.random() * 1e3;
            let z = Math.random() * 1e3;
            let y = terrain.getHeightAt(x, z) + 25.0;
            {
              let stem = renderer.createObject(Cube, { inherit: baseStem });
              stem.translate.set(x, y, z);
              stem.rotate.x = 180;
              stem.scale.set(16);
              objects.push(stem);
            }
            {
              let leaves = renderer.createObject(Cube, { inherit: baseLeaves });
              leaves.translate.set(x + 10, y - 24, z);
              leaves.rotate.set(180, 420, 0);
              leaves.scale.set(16);
              leaves.specularLighting = true;
              leaves.culling = false;
              objects.push(leaves);
            }
          };
        });
      });
    }, 1e3);*/
    /*{
      renderer.createMD5File().fromPath("md5/ROKON_fourleg.md5mesh").then(obj => {
        obj.useColor([255, 0, 0]);
        obj.translate.set(200, -30, 100);
        obj.scale.set(32);
        obj.rotate.x = 90;
        obj.rotate.z = 90;
        obj.specularLighting = true;
        obj.useAnimation("md5/anim/fourleg_anim_run.md5anim");
        objects.push(obj);
        window.pkmn = obj;
      });
    }*/
    {
      for (let ii = 0; ii < 0; ++ii) {
        let x = Math.random() * 1e3;
        let z = Math.random() * 1e3;
        let y = terrain.getHeightAt(x, terrain.y, z) + 20.0;
        renderer.createMD5File().fromPath("md5/pokepark/Ar99Zn01Bigtree01.md5mesh").then(obj => {
          obj.useColor([255, 0, 0]);
          obj.translate.set(x, y, z);
          obj.scale.set(1.5);
          obj.rotate.x = 90;
          obj.rotate.z = 180;
          objects.push(obj);
        });
      }
    }
    {
      renderer.createMD5File().fromPath("md5/pokepark/Riolu.md5mesh").then(obj => {
        obj.useColor([255, 0, 0]);
        obj.translate.set(20, -50, 150);
        obj.scale.set(6);
        obj.rotate.x = 90;
        obj.rotate.z = 180;
        obj.specularLighting = true;
        obj.addAnimation("md5/pokepark/RandomAct4.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Win2.md5anim", {
          playbackSpeed: 0.5
        });
        obj.useAnimation("RandomAct4");
        setTimeout(() => {
          let bounds = obj.boundings.world;
          obj.translate.y = terrain.getHeightAt(bounds.center[0], bounds.center[1], bounds.center[2]) - 2.5;
        }, 1e3);
        objects.push(obj);
        window.riolu = obj;
      });
    }
    {
      renderer.createMD5File().fromPath("md5/pokepark/Rokon.md5mesh").then(obj => {
        obj.useColor([255, 0, 0]);
        obj.translate.set(100, -50, 100);
        obj.scale.set(6);
        obj.rotate.x = 90;
        obj.rotate.z = 180;
        obj.specularLighting = true;
        obj.addAnimation("md5/pokepark/RandomAct1.md5anim", {
          playbackSpeed: 0.25
        });
        obj.addAnimation("md5/pokepark/RandomAct2.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/RandomAct3.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/At001Dmg.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/StandUp.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Wait.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Walk.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/Walk2.md5anim", {
          playbackSpeed: 0.5
        });
        obj.addAnimation("md5/pokepark/At001Run.md5anim", {
          playbackSpeed: 0.5,
          smoothTransitions: ["AtJump01"]
        });
        obj.addAnimation("md5/pokepark/AtJump01.md5anim", {
          playbackSpeed: 0.5,
          smoothTransitions: ["At001Run"]
        });
        obj.useAnimation("At001Run", {
          onend: () =>{
            console.log("ended!");
          }
        });
        objects.push(obj);
        window.pkmn = obj;
      });
    }
    /*{
      renderer.createObjectFile().fromPath("sci-fi-rifle.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("sci-fi-rifle-albedo.jpeg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("sci-fi-rifle-normal.jpeg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("sci-fi-rifle-metallic.jpeg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("sci-fi-rifle-roughness.jpeg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("sci-fi-rifle-ao.jpeg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("sci-fi-rifle-emissive.jpeg"));
        obj.translate.set(35, -80, 0);
        obj.scale.set(16);
        obj.rotate.x = 180;
        obj.rotate.y = 75;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.rifle = obj;
      });
    }
    {
      renderer.createObjectFile().fromPath("sci-fi-barrel.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("sci-fi-barrel-albedo.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("sci-fi-barrel-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("sci-fi-barrel-metallic.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("sci-fi-barrel-roughness.jpg"));
        obj.useAmbientOcclusionMap(renderer.createTexture().fromImagePath("sci-fi-barrel-ao.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("sci-fi-barrel-emissive.jpg"));
        obj.translate.set(-50, -80, 0);
        obj.scale.set(12);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.barrel = obj;
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("rose-stone.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("rose-stone-albedo.jpg"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("rose-stone-normal.jpg"));
        obj.useMetalnessMap(renderer.createTexture().fromImagePath("rose-stone-metallic.jpg"));
        obj.useRoughnessMap(renderer.createTexture().fromImagePath("rose-stone-roughness.jpg"));
        obj.useEmissiveMap(renderer.createTexture().fromImagePath("rose-stone-emissive.jpg"));
        obj.translate.set(100, -80, 0);
        obj.scale.set(10);
        obj.rotate.x = 180;
        obj.specularLighting = true;
        objects.push(obj);
        setTimeout(() => {
          obj.environmentMapping = true;
        }, 1e3);
        window.stone = obj;
      });
    }*/
    // sun
    {
      renderer.createObjectFile().fromPath("sphere.obj").then(obj => {
        let radius = 350.0;
        obj.useColor([0, 0, 0, 0]);
        obj.translate.set(0, -75, 100);
        obj.scale.set(1);
        obj.light = renderer.createLight({
          radius: radius,
          color: [255, 255, 255],
          intensity: 8
        });
        objects.push(obj);
        window.light = obj;
      });
    }
    {
      renderer.createObjectFile().fromPath("sphere.obj").then(base => {
        let radius = 250.0;
        for (let ii = 0; ii < 0; ++ii) {
          let obj = renderer.createObject(Cube, { inherit: base });
          obj.useColor([0, 0, 0, 0]);
          obj.translate.set(
            Math.random() * 250 - 100,
            Math.random() * 10 - 75,
            Math.random() * 250 - 100
          );
          obj.light = renderer.createLight({
            radius: radius,
            color: [255, 255, 255],
            intensity: 8
          });
          objects.push(obj);
        }
      });
    }
    /*{
      renderer.createObjectFile().fromPath("barrel.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("barrel.png"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("barrel-normal.png"));
        //obj.occlusionCulling = true;
        obj.translate.set(35, -30, 10);
        obj.scale.set(1, 1, 1);
        window.barrel = obj;
        objects.push(obj);
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("book.obj").then(obj => {
        obj.useTexture(renderer.createTexture().fromImagePath("book_tex.png"));
        obj.useNormalMap(renderer.createTexture().fromImagePath("book_normal.png"));
        //obj.useSpecularMap(renderer.createTexture().fromImagePath("book_spec.png"));
        obj.translate.set(0, -20, 60);
        obj.scale.set(128.0);
        obj.rotate.x = 90;
        obj.rotate.y = 180;
        obj.rotate.z = 180;
        window.nanosuit = obj;
        objects.push(obj);
      });
    }*/
    /*{
      renderer.createObjectFile().fromPath("vaporeon.obj").then(box => {
        box.useTexture(renderer.createTexture().fromColor([0, 0, 255]));
        box.scale.set(1, 1, 1);
        box.translate.set(25, -9, 32);
        cubes.push(box);
      });
    }*/
    // test batch
    /*{
      let batch = renderer.createBatch({ size: 150 });
      {
        let baseTexture = renderer.createTexture().fromImagePath("tree-nofabe.png");
        renderer.createColladaFile().fromPath("tree-nofabe.dae").then(pkmn => {
          for (let ii = 0; ii < batch.size; ++ii) {
            let cube = renderer.createObject(Cube, { inherit: pkmn });
            cube.useTexture(baseTexture);
            cube.translate.set(
              (Math.random() * 350) - 100,
              -10,
              (Math.random() * 350) - 100
            );
            cube.scale.set(1.0 + (Math.random() * 0.5));
            cube.rotate.x = 90;
            cube.rotate.z = Math.random() * 360;
            objects.push(cube);
            batch.add(cube);
          };
          window.batch = batch;
        });
      }
    }*/
    // skybox
    {
      let obj = renderer.createObject(Cube);
      let cubemap = renderer.createCubeMap().fromImages(
        "skybox-anime2/",
        ["left", "right", "bottom", "top", "back", "front"]
      );
      obj.useEnvironmentMap(cubemap);
      obj.environmentMapping = true;
      window.skyBox = obj;
    }
    /*{
      let batch = renderer.createBatch({ size: 20 });
      {
        renderer.createObjectFile().fromPath("barrel.obj").then(base1 => {
        batch.useTemplate(base1);
        base1.useTexture(renderer.createTexture().fromImagePath("barrel.png"));
        base1.useNormalMap(renderer.createTexture().fromImagePath("barrel-normal.png"));
          for (let ii = 0; ii < batch.size; ++ii) {
            let x = (Math.random() * 450) - 100;
            let y = -20;
            let z = (Math.random() * 450) - 100;
            {
              let cube = renderer.createObject(Cube, { inherit: base1 });
              cube.translate.set(x, y, z);
              cube.scale.set((Math.random() * 0.25) + 1.0);
              objects.push(cube);
              batch.add(cube);
            }
          };
          window.batch = batch;
        });
      }
    }*/
    {
      let filter = renderer.createFilter({
        width: renderer.width,
        height: renderer.height
      });
      window.filter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width,
        height: renderer.height
      });
      window.sceneFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width,
        height: renderer.height
      });
      window.occlusionFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: 384,
        height: 384
      });
      window.godRayFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width / 2,
        height: renderer.height / 2
      });
      window.blurFilter = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width / 4,
        height: renderer.height / 4
      });
      window.blurFilter2 = filter;
    }
    {
      let filter = renderer.createFilter({
        width: renderer.width / 8,
        height: renderer.height / 8
      });
      window.blurFilter3 = filter;
    }
    /*{
      renderer.createColladaFile().fromPath("StanfordDragon.dae").then(object => {
        object.useTexture(renderer.createTexture().fromColor([128, 128, 128]));
        object.translate.x = -20;
        object.translate.y = -20;
        object.scale.set(2);
        objects.push(object);
      });
    }*/
    /*{
      renderer.createColladaFile().fromPath("3d-tree-stem.dae").then(stem => {
        stem.useTexture(renderer.createTexture().fromImagePath("3d-tree-stem.jpg"));
        stem.translate.x = -20;
        stem.translate.y = -30;
        stem.scale.set(12);
        objects.push(stem);
      });
    }
    {
      renderer.createColladaFile().fromPath("3d-tree-leafs.dae").then(object => {
        let texture1 = renderer.createTexture().fromImagePath("3d-tree-leafs.png");
        object.useTexture(texture1);
        object.translate.x = -20;
        object.translate.y = -30;
        object.scale.set(12);
        objects.push(object);
      });
    }*/
    requestAnimationFrame(drawLoop);
  }
}

function applyBlur(input, attachement) {
  blurFilter.enable();
  blurFilter.readFrameBuffer(input.texture, attachement);
  // apply blur
  {
    // apply h-blur
    {
      let program = blurFilter.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [1, 0]);
      blurFilter.applyFilter();
    }
    blurFilter.reuse();
    // apply v-blur
    {
      let program = blurFilter.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [0, 1]);
      blurFilter.applyFilter();
    }
  }
  blurFilter2.enable();
  blurFilter.writeToFilter(blurFilter2);
  // apply blur
  {
    // apply h-blur
    {
      let program = blurFilter2.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [1, 0]);
      blurFilter2.applyFilter();
    }
    blurFilter2.reuse();
    // apply v-blur
    {
      let program = blurFilter2.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [0, 1]);
      blurFilter2.applyFilter();
    }
  }
  blurFilter3.enable();
  blurFilter2.writeToFilter(blurFilter3);
  // apply blur
  {
    // apply h-blur
    {
      let program = blurFilter3.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [1, 0]);
      blurFilter3.applyFilter();
    }
    blurFilter3.reuse();
    // apply v-blur
    {
      let program = blurFilter3.useFilter("blur-filter");
      gl.uniform2fv(program.locations.uDirection, [0, 1]);
      blurFilter3.applyFilter();
    }
  }
  return blurFilter3;
}

let last = 0;
let delta = 0;
function draw() {
  let now = performance.now();
  let gBuffer = renderer.gBuffer;
  renderer.useCamera(camera);
  renderer.useFrameBuffer(renderer.screen.texture);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  // draw scene
  drawScene();
  drawDirectionalLight();
  drawPointLights();
  drawSkyBox();
  {
    debug_draw_calls.innerHTML = `Draw calls: ${renderer.drawCalls}`;
    debug_fbo_switches.innerHTML = `FBO switches: ${renderer.fboSwitches}`;
    debug_texture_switches.innerHTML = `Texture switches: ${renderer.textureSwitches}`;
    debug_program_switches.innerHTML = `Program switches: ${renderer.programSwitches}`;
    debug_total_vertices.innerHTML = `Total vertices: ${renderer.totalVertices}`;
    // debug modes
    {
      let dbg = renderer.debug;
      let yes = `Enabled`;
      let no = `Disabled`;
      debug_wireframe.innerHTML = `[F1] Wireframe: ${dbg.wireframe ? yes : no}`;
      debug_boundings.innerHTML = `[F2] Boundings: ${dbg.boundings ? yes : no}`;
      debug_FXAA.innerHTML = `[F3] FXAA: ${dbg.FXAA ? yes : no}`;
      debug_normals.innerHTML = `[F4] Normals: ${dbg.normals ? yes : no}`;
    }
    {
      let total = 0;
      objects.map(obj => {
        if (obj.isOccluded()) total++;
      });
      debug_occlusion_culled.innerHTML = `Occlusion culled objects: ${total}`;
    }
  }
  delta = now - last;
  // bloom
  if (window.rofl) {
    filter.enable(true);
    filter.readFrameBuffer(gBuffer, gl.COLOR_ATTACHMENT4);
    let blur = applyBlur(filter.input, gl.COLOR_ATTACHMENT0);
    renderer.useFrameBuffer(renderer.screen.texture);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    blur.flush();
    gl.disable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
  }
  // fxaa
  if (renderer.debug.FXAA) {
    filter.enable(true);
    filter.readFrameBuffer(renderer.screen.texture, gl.COLOR_ATTACHMENT0);
    filter.useProgram("FXAA");
    renderer.useFrameBuffer(renderer.screen.texture);
    filter.apply();
    filter.writeToFrameBuffer(null, gl.COLOR_ATTACHMENT0);
  } else {
    renderer.screen.texture.writeToScreen();
  }
  renderer.flush();
  renderer.nextFrame(delta);
  last = performance.now();
}

function drawSkyBox() {
  if (window.skyBox) {
    renderer.useRendererProgram("skybox");
    gl.cullFace(gl.FRONT);
    gl.depthMask(false);
    renderer.renderSkybox(skyBox);
    gl.cullFace(gl.BACK);
    gl.depthMask(true);
  }
}

function drawPointLights() {
  let gBuffer = renderer.gBuffer;
  // write depth into screen fbo
  gBuffer.writeToFrameBuffer(renderer.screen.texture, null, gl.DEPTH_BUFFER_BIT);
  renderer.useFrameBuffer(renderer.screen.texture);
  // lighting
  {
    let program = renderer.useRendererProgram("deferred/object-point-light");
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.cullFace(gl.FRONT);
    gl.depthFunc(gl.GEQUAL);
    gl.depthMask(false);

    gl.enable(gl.STENCIL_TEST);
    gl.stencilFunc(gl.NOTEQUAL, 255, ~0);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

    gBuffer.bind();
    objects.map(object => {
      if (!object.light) return;
      let light = object.light;
      let mModel = object.getModelMatrix();
      object.scale.set(light.radius);
      object.update();
      {
        let buffers = object.buffers;
        let variables = program.locations;
        let vLightPosition = object.translate.toArray();
        let vCameraPosition = camera.position;
        let mModelViewProjection = object.getModelViewProjectionMatrix();
        // how to pull vertices
        {
          gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
          gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
          gl.enableVertexAttribArray(variables.aVertexPosition);
        }
        gl.uniform3fv(variables.uLightColor, light.color);
        gl.uniform1f(variables.uLightRadius, light.radius);
        gl.uniform1f(variables.uLightIntensity, light.intensity);
        gl.uniform3fv(variables.uLightPosition, vLightPosition);
        gl.uniform3fv(variables.uCameraPosition, vCameraPosition);
        gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
        renderer.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
      }
      object.scale.set(light.radius * 0.075);
      object.update();
    });
  }
  // reset
  {
    gl.cullFace(gl.BACK);
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
    gl.depthFunc(gl.LEQUAL);
  }
}

function drawDirectionalLight() {
  let gBuffer = renderer.gBuffer;
  renderer.useFrameBuffer(renderer.screen.texture);
  {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.depthMask(false);
  }
  // lighting
  {
    let program = renderer.useRendererProgram("deferred/directional-light");
    {
      let variables = program.locations;
      gl.uniform1f(variables.uLightIntensity, 0.25);
      gl.uniform3fv(variables.uLightPosition, new Float32Array([0, -100, 1000]));
      gl.uniform3fv(variables.uLightColor, new Float32Array([255, 255, 255]));
      gl.uniform3fv(variables.uCameraPosition, (camera.position));
    }
    gBuffer.bind();
    renderer.renderQuad(renderer.screen);
  }
  // reset
  {
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.disable(gl.STENCIL_TEST);
  }
}

window.drawScene = function() {
  let gl = renderer.gl;
  let gBuffer = renderer.gBuffer;
  renderer.useFrameBuffer(gBuffer);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  {
    water.bufferReflection(drawWorld);
    water.bufferRefraction(drawWorld);
    terrain.bufferShadows(drawWorld);
  }
  drawWorld(true, null, false);
  gBuffer.writeToFrameBuffer(renderer.screen.texture, null, gl.DEPTH_BUFFER_BIT);
};

function drawWorld(renderWater, shadowMatrix, renderRefraction, forward = false) {
  if (forward && !renderRefraction) drawSkyBox();
  // terrain
  if (terrain) {
    let program = (
      forward ? renderer.useRendererProgram("object") :
      renderer.useRendererProgram("deferred/object")
    );
    terrain.update();
    renderer.renderObject(terrain);
  }
  // water
  if (renderWater) {
    renderer.useRendererProgram("deferred/water");
    renderer.renderPlane(water);
  }
  // objects
  renderObjects(renderRefraction, forward);
}



function renderObjects(renderRefraction, forward) {
  let program = (
    forward ? renderer.useRendererProgram("object") :
    renderer.useRendererProgram("deferred/object")
  );
  objects.map(obj => {
    if (obj.isInstanced || !camera.isObjectInView(obj)) return;
    if (obj.model) renderer.renderMD5(obj);
    else renderer.renderObject(obj);
  });
}

function controlCamera() {
  camera.control(
    camera.delta,
    [
      isKeyPressed("W") | 0,
      isKeyPressed("S") | 0,
      isKeyPressed("A") | 0,
      isKeyPressed("D") | 0,
      isKeyPressed("2") | 0,
      isKeyPressed("1") | 0,
      isKeyPressed("Q") | 0,
      isKeyPressed("E") | 0
    ],
    deltaX, deltaY
  );
}

function drawLoop() {
  let now = performance.now();
  if (renderer.ready) {
    // camera view matrix
    {
      if (locked) {
        controlCamera();
        deltaX *= 0.375;
        deltaY *= 0.375;
      }
      //selectObject(mx, my);
    }
    draw();
  }
  /*if (locked) {
    // test sprite key movement
    let target = pkmn;
    let dir = camera.getWorldRelativePosition(renderer.width / 2, renderer.height / 2);
    let speed = 1.5;
    let translate = target.translate.toArray();
    if (isKeyPressed("ArrowUp")) {
      let n = vec3.add(vec3.create(), translate, vec3.scale(dir, dir, speed));
      target.translate.setArray(n);
    }
    if (isKeyPressed("ArrowDown")) {
      let n = vec3.add(vec3.create(), translate, vec3.scale(dir, dir, -speed));
      target.translate.setArray(n);
    }
    if (isKeyPressed("ArrowLeft")) {
      target.translate.x -= Math.sign(camera.rotation[1]);
    }
    if (isKeyPressed("ArrowRight")) {
      target.translate.x += Math.sign(camera.rotation[1]);
    }
    let bounds = target.boundings.world;
    target.translate.y = terrain.getHeightAt(bounds.center[0], bounds.center[2]) - 1.5;
  }*/
  let then = performance.now();
  let delta = then - now;
  if (renderer.ready) animate(delta);
  {
    debug_delta.innerHTML = `Delta: ${delta}`;
  }
  if (locked) {
    let target = pkmn;
    if (!target.speed) target.speed = { x: 0.0, y: 0.0 };
    let bounds = target.boundings.world;
    let speed = target.speed;
    let isAnyKeyPressed = (
      isKeyPressed("ArrowUp") ||
      isKeyPressed("ArrowDown") ||
      isKeyPressed("ArrowLeft") ||
      isKeyPressed("ArrowRight")
    );
    if (isKeyPressed("ArrowUp")) {
      speed.y = 0.375;
    }
    else if (isKeyPressed("ArrowDown")) {
      speed.y = -0.225;
    }
    else {
      speed.y *= 0.5;
      if (Math.abs(speed.y) <= 0.01) speed.y = 0.0;
    }
    if (isKeyPressed("ArrowLeft")) {
      speed.x = 2.0;
      speed.y = 0.35 * Math.max(1.0, Math.sign(speed.y));
    }
    else if (isKeyPressed("ArrowRight")) {
      speed.x = -2.0;
      speed.y = 0.35 * Math.max(1.0, Math.sign(speed.y));
    }
    else {
      speed.x *= 0.5;
      if (Math.abs(speed.x) <= 0.01) speed.x = 0.0;
    }
    let distanceX = speed.x * delta;
    let distanceY = speed.y * delta;
    target.rotate.z += distanceX * 0.65;
    let dx = distanceY * Math.sin(target.rotate.z * Math.PI / 180);
    let dz = distanceY * Math.cos(target.rotate.z * Math.PI / 180);
    if (isAnyKeyPressed) {
      if (!target.isAnimationAlreadyQueded("Walk2")) {
        let anim = target.useAnimation("Walk2");
        if (
          isKeyPressed("ArrowLeft") ||
          isKeyPressed("ArrowRight")
        ) anim.playbackSpeed = 1.75;
        else if (
          isKeyPressed("ArrowDown")
        ) anim.playbackSpeed = 0.55;
        else anim.playbackSpeed = 1.575;
      }
    } else {
      if (!target.isAnimationAlreadyQueded("Wait")) {
        target.useAnimation("Wait");
      }
    }
    target.translate.x += dz;
    target.translate.y = terrain.getHeightAt(bounds.center[0], bounds.center[1], bounds.center[2]) - 2.5;
    target.translate.z += dx;
  }
  requestAnimationFrame(drawLoop);
  //camera.lookAt(cubes[1]);
}

function animate(delta) {
  objects.map(obj => {
    let anim = obj.currentAnimation;
    if (anim && anim.loaded) obj.animate(1e1 / 10);
  });
}

setInterval(() => {
  if (window.batch) {
    debug_objects.innerHTML = `Objects: ${objects.length - batch.data.objects.length}`;
    debug_instanced_objects.innerHTML = `Instanced Objects: ${batch.size}/${batch.data.objects.length}`;
    debug_batch_updates.innerHTML = `Batch buffer refills: ${batch.updates}`;
  }
}, 250);

setInterval(() => {
  objects.map(object => {
    if (!object.light) return;
    //object.translate.y += Math.sin(renderer.frames * 0.00125) * 0.125;
    object.translate.x += Math.cos(renderer.frames * 0.00120) * 0.5;
    object.translate.z += Math.sin(renderer.frames * 0.00120) * 0.5;
  });
});

window.keys = {};
let isKeyPressed = (key) => keys[key] || keys[key.toLowerCase()] || keys[key.toUpperCase()];
window.onkeydown = (e) => onKeyDown(e);
window.onkeyup = (e) => onKeyUp(e);

let up = 0;
function onKeyDown(e) {
  keys[e.key] = 1;
  if (e.key === "F1") {
    e.preventDefault();
    renderer.debug.wireframe = !renderer.debug.wireframe;
  }
  if (e.key === "F2") {
    e.preventDefault();
    renderer.debug.boundings = !renderer.debug.boundings;
  }
  if (e.key === "F3") {
    e.preventDefault();
    renderer.debug.FXAA = !renderer.debug.FXAA;
  }
  if (e.key === "F4") {
    e.preventDefault();
    renderer.debug.normals = !renderer.debug.normals;
  }
  if (e.key === "Tab") {
    e.preventDefault();
    camera.moveTo(objects[(up++) % (objects.length - 1)]);
  }
}

function onKeyUp(e) {
  keys[e.key] = 0;
}

let deltaX = 0;
let deltaY = 0;
window.onmousemove = (e) => {
  if (locked) {
    deltaX = e.movementX * 0.75;
    deltaY = e.movementY * 0.75;
    /*if (pressed && selection) {
      let ray = camera.handleMouseDown(
        renderer.width / 2,
        renderer.height / 2
      );
      let x = ray[0];
      let y = ray[1];
      let z = ray[2];
      if (isKeyPressed("Control")) {
        selection.translate.z += deltaY * ray[1];
      }
      else {
        selection.translate.x += deltaX * ray[2];
        selection.translate.y += deltaY;
      }
      //selection.translate.y += y;
      //selection.translate.z += z;
    }*/
  } else {
    
  }
};



let locked = false;
let pressed = false;
canvas.onclick = (e) => {
/*
  let mouseRay = renderer.camera.getWorldRelativePosition(e.clientX, e.clientY);
  let start = 0;
  let end = 100;
  findObject(start, end, mouseRay, 0);
*/
  //camera.handleMouseDown(e);
  //let ray = renderer.camera.getWorldRelativePosition(e.clientX, e.clientY);
  canvas.requestPointerLock();
};
window.onmousedown = (e) => pressed = true;
window.onmouseup = (e) => pressed = false;
/*
function getPointOnRay(ray, distance) {
  let start = vec3.clone(camera.position);
  let scaledRay = vec3.fromValues(ray[0] * distance, ray[1] * distance, ray[2] * distance);
  return vec3.add(vec3.create(), scaledRay, start);
};

function findObject(start, end, ray, count) {
  let half = start + ((end - start) / 2.0);
  console.log(getPointOnRay(ray, half));
  if (count >= 100) {
    let endPoint = getPointOnRay(ray, half);
    console.log(endPoint);
    return null;
  }
  return findObject(start, half, ray, count + 1);
};
*/
setInterval(() => {
  locked = document.pointerLockElement === canvas;
}, 1e3 / 10);

window.stage = new Stage(canvas);
window.onresize = () => {
  let width = window.innerWidth;
  let height = window.innerHeight;
  stage.renderer.resize(width, height);
};

}());
