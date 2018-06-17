import {
  uid,
  loadText
} from "../utils";

import * as WEBGL_TYPE from "./types";

/**
 * A WebGL renderer program wrapper
 * @class RendererProgram
 */
export default class RendererProgram {
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
    this.bindings = {};
    this.externals = null;
  }
};

/**
 * Loads and builds given shaders
 * @param {String} path
 * @param {String} name
 */
RendererProgram.prototype.build = function(path, name) {
  this.name = name;
  return new Promise(resolve => {
    loadText(`${path}${name}.vert`).then(vertexSrc => {
      loadText(`${path}${name}.frag`).then(fragmentSrc => {
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
  };
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
  if (def.qualifier === WEBGL_TYPE.UNIFORM) {
    if (def.type === WEBGL_TYPE.FLOAT) gl.uniform1f(def.location, a);
    else if (def.type === WEBGL_TYPE.BOOL) gl.uniform1i(def.location, a);
    else if (def.type === WEBGL_TYPE.VEC_2) gl.uniform2f(def.location, a, b);
    else if (def.type === WEBGL_TYPE.VEC_3) gl.uniform3f(def.location, a, b, c, d);
    else if (def.type === WEBGL_TYPE.VEC_4) gl.uniform4f(def.location, a, b, c, d);
    else if (def.type === WEBGL_TYPE.I_VEC_2) gl.uniform2i(def.location, a, b);
    else if (def.type === WEBGL_TYPE.I_VEC_3) gl.uniform3i(def.location, a, b, c, d);
    else if (def.type === WEBGL_TYPE.I_VEC_4) gl.uniform4i(def.location, a, b, c, d);
    else if (def.type === WEBGL_TYPE.MAT_3) gl.uniformMatrix3fv(def.location, false, a);
    else if (def.type === WEBGL_TYPE.MAT_4) gl.uniformMatrix4fv(def.location, false, a);
    else if (def.type === WEBGL_TYPE.SAMPLER_2D) gl.uniform1i(def.location, a);
    else if (def.type === WEBGL_TYPE.SAMPLER_CUBE) gl.uniform1i(def.location, a);
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
  };
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
    case "float": return WEBGL_TYPE.FLOAT;
    case "bool": return WEBGL_TYPE.BOOL;
    case "vec2": return WEBGL_TYPE.VEC_2;
    case "vec3": return WEBGL_TYPE.VEC_3;
    case "vec4": return WEBGL_TYPE.VEC_4;
    case "ivec2": return WEBGL_TYPE.I_VEC_2;
    case "ivec3": return WEBGL_TYPE.I_VEC_3;
    case "ivec4": return WEBGL_TYPE.I_VEC_4;
    case "mat3": return WEBGL_TYPE.MAT_3;
    case "mat4": return WEBGL_TYPE.MAT_4;
    case "uniform": return WEBGL_TYPE.UNIFORM;
    case "sampler2D": return WEBGL_TYPE.SAMPLER_2D;
    case "samplerCube": return WEBGL_TYPE.SAMPLER_CUBE;
    case "attribute": case "in": return WEBGL_TYPE.ATTRIBUTE;
  };
  return WEBGL_TYPE.UNKNOWN;
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
    if (def.qualifier === WEBGL_TYPE.UNIFORM) location = this.getUniformLocation(name);
    else if (def.qualifier === WEBGL_TYPE.ATTRIBUTE) {
      location = gl.getAttribLocation(program, name);
      //if (location >= 0) gl.bindAttribLocation(program, location, name);
    }
    def.location = location;
    this.locations[name] = location;
    if (Number.isInteger(location)) this.bindings[location] = null;
  };
};

RendererProgram.prototype.isAttributeBufferEnabled = function(location) {
  return this.bindings[location] !== null;
};

RendererProgram.prototype.enableAttributeBuffer = function(location, buffer, size) {
  let gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(location);
  if (Number.isInteger(location)) this.bindings[location] = location;
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
  let gl = this.gl;
  let program = this.native;
  return this.getUniformLocation(locationName) !== null;
};

RendererProgram.prototype.getLocationNameByLocationId = function(locationId) {
  let locations = this.locations;
  for (let name in locations) {
    let loc = this.getUniformLocation(name);
    if (loc === locationId) return name;
  };
  return null;
};
