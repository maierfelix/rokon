import Cube from "./objects/cube";
import Quad from "./objects/quad";
import Vector from "./objects/vector";
import Sprite from "./objects/sprite";

import Light from "./light";
import CubeMap from "./cubemap";
import WebGLBatch from "./batch";
import WebGLFilter from "./filter";
import GBuffer from "./g-buffer";
import FrameBuffer from "./framebuffer";
import ObjectTexture from "./texture";
import RendererProgram from "./program";

import MD5FileLoader from "./loaders/md5-loader";
import ObjectFileLoader from "./loaders/obj-loader";
import ColladaFileLoader from "./loaders/collada-loader";

/**
 * Sets the default properties to an option object
 * @param {Object} opts - The options to write to
 */
export function setDefaultOptionProperties(opts) {
  // always give direct access to gl and renderer
  opts.gl = this.gl;
  opts.renderer = this;
};

/**
 * Creates an object and attaches the local renderer instance to it
 * @param {WebGLObject} cls - The class to instantiate
 * @param {Object} opts - Instantiation options
 * @return {WebGLObject}
 */
export function createObject(cls, opts = {}) {
  this.setDefaultOptionProperties(opts);
  let object = new cls(opts);
  return object;
};

/**
 * Creates a texture
 * @param {Object} opts - Texture options
 * @return {ObjectTexture}
 */
export function createTexture(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let texture = new ObjectTexture(opts);
  return texture;
};

/**
 * Creates a framebuffer
 * @param {Object} opts - Framebuffer options
 * @return {FrameBuffer}
 */
export function createFrameBuffer(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let fbo = new FrameBuffer(opts);
  return fbo;
};

/**
 * Creates a gbuffer
 * @param {Object} opts - GBuffer options
 * @return {GBuffer}
 */
export function createGeometryBuffer(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let fbo = new GBuffer(opts);
  return fbo;
};

/**
 * Loads and creates a .obj file
 * @param {Object} opts - Object options
 * @return {ObjectFileLoader}
 */
export function createObjectFile(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let loader = new ObjectFileLoader(opts);
  return loader;
};

/**
 * Loads and creates a .dae file
 * @param {Object} opts - Object options
 * @return {ColladaFileLoader}
 */
export function createColladaFile(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let loader = new ColladaFileLoader(opts);
  return loader;
};

/**
 * Loads and creates a .dae file
 * @param {Object} opts - Object options
 * @return {MD5FileLoader}
 */
export function createMD5File(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let loader = new MD5FileLoader(opts);
  return loader;
};

/**
 * Loads and creates an animated collada file
 * @param {Object} opts - Object options
 * @return {ColladaFileLoader}
 */
export function createAnimatedColladaFile(opts = {}) {
  this.setDefaultOptionProperties(opts);
  opts.animated = true;
  let object = this.createColladaFile(opts);
  return object;
};

/**
 * Creates an 2d sprite
 * @param {Object} opts - Object options
 * @return {ColladaFileLoader}
 */
export function createSprite(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let object = new Sprite(opts);
  return object;
};

/**
 * Creates a camera
 * @param {Camera} cls - The class to instantiate
 * @param {Object} opts - Instantiation options
 * @return {Camera}
 */
export function createCamera(cls, opts = {}) {
  this.setDefaultOptionProperties(opts);
  let object = new cls(opts);
  return object;
};

/**
 * Creates a batch
 * @param {Object} opts
 * @return {WebGLBatch}
 */
export function createBatch(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let batch = new WebGLBatch(opts);
  return batch;
};

/**
 * Creates a new WebGL renderer program
 * @param {String} path
 * @param {String} name
 * @return {RendererProgram}
 */
export function createProgram(path, name) {
  let opts = {};
  this.setDefaultOptionProperties(opts);
  let program = new RendererProgram(opts);
  return new Promise(resolve => {
    program.build(path, name).then(resolve);
  });
};

/**
 * Creates a new filter
 * @param {Object} opts
 * @return {WebGLFilter}
 */
export function createFilter(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let filter = new WebGLFilter(opts);
  return filter;
};

/**
 * Creates a new cubemap
 * @param {Object} opts
 * @return {CubeMap}
 */
export function createCubeMap(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let cubemap = new CubeMap(opts);
  return cubemap;
};

/**
 * Creates a new vector
 * @param {Object} opts
 * @return {Vector}
 */
export function createVector(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let obj = new Vector(opts);
  return obj;
};

/**
 * Creates a new light
 * @param {Object} opts
 * @return {Light}
 */
export function createLight(opts = {}) {
  this.setDefaultOptionProperties(opts);
  let light = new Light(opts);
  return light;
};
