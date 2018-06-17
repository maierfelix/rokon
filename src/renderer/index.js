import extend from "../extend";

import {
  uid,
  loadText
} from "../utils";

import Cube from "./objects/cube";
import Quad from "./objects/quad";

import CubeMap from "./cubemap";
import GBuffer from "./g-buffer";
import ObjectTexture from "./texture";
import FrameBuffer from "./framebuffer";

import { BATCH_BUFFER_UPDATE } from "./batch";

import * as _create from "./create";
import * as _divisors from "./divisors";
import * as _transforms from "./transforms";

import * as _md5 from "./render/md5";
import * as _quad from "./render/quad";
import * as _batch from "./render/batch";
import * as _object from "./render/object";
import * as _plane from "./render/plane";
import * as _shadow from "./render/shadow";
import * as _skybox from "./render/skybox";
import * as _terrain from "./render/terrain";
import * as _animation from "./render/animation";
import * as _bounding_box from "./render/bounding-box";
import * as _shadow_instanced from "./render/shadow-instanced";

/**
 * The WebGL renderer
 * @class WebGLRenderer
 */
export default class WebGLRenderer {
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
      alpha: true,
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
    this.viewProjection = mat4.create();
    this.modelViewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
    this.modelViewProjectionMatrix = mat4.create();
    // create bounding box
    this.vector = this.createVector();
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
};

/**
 * Creates a multisampled screen fbo
 * @return {Quad}
 */
WebGLRenderer.prototype.createScreen = function() {
  let gl = this.gl;
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
    "debug-normals",
    "deferred/anime-water"
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
  };
  // sort
  objects.sort(this.sortObjects.bind(this));
};

/**
 * @param {WebGLObject} a
 * @param {WebGLObject} b
 * @return {Boolean}
 */
WebGLRenderer.prototype.sortObjects = function(a, b) {
  let camera = this.camera;
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
  // vertex buffer -> debug normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.debugNormals);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  gl.uniform1f(variables.uDebugNormals, 1);
  gl.uniform4fv(variables.uColor, new Float32Array([255, 0, 0, 255]));
  gl.uniformMatrix4fv(variables.uTransformMatrix, false, mModelViewProjection);
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

/**
 * Renders a vector
 * @param {Number} x1
 * @param {Number} y1
 * @param {Number} z1
 * @param {Number} x2
 * @param {Number} y2
 * @param {Number} z2
 * @param {Float32Array} color
 */
WebGLRenderer.prototype.drawVector = function(x1, y1, z1, x2, y2, z2, color) {
  let gl = this.gl;
  let oprogram = this.getActiveProgram();
  let program = this.useRendererProgram("debug-normals");
  let vector = this.vector;
  let vertices = vector.data.vertices;
  let buffers = vector.buffers;
  let variables = program.locations;
  let mModel = this.modelMatrix;
  let mViewProjection = this.getViewProjectionMatrix();
  let isRefreshNeeded = (
    (vertices[0] !== x1) ||
    (vertices[1] !== y1) ||
    (vertices[2] !== z1) ||
    (vertices[3] !== x2) ||
    (vertices[4] !== y2) ||
    (vertices[5] !== z2)
  );
  // fill only if necessary
  if (isRefreshNeeded) {
    vertices[0] = x1;
    vertices[1] = y1;
    vertices[2] = z1;
    vertices[3] = x2;
    vertices[4] = y2;
    vertices[5] = z2;
  }
  // trigger buffer refresh
  if (isRefreshNeeded) vector.refresh();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // send uniforms
  {
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform4fv(variables.uColor, color || new Float32Array([255, 0, 0, 255]));
    gl.uniformMatrix4fv(variables.uTransformMatrix, false, mViewProjection);
  }
  // draw
  {
    this.drawArrays(gl.LINES, 0, 6 / 3);
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
