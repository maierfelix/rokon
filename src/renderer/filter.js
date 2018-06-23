import {
  uid
} from "../utils";

import Quad from "./objects/quad";

/**
 * A basic filter class
 * @class WebGLFilter
 */
export default class WebGLFilter {
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
};

/**
 * Initializes batch data and buffers
 */
WebGLFilter.prototype.init = function() {
  let gl = this.gl;
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
WebGLFilter.prototype.enable = function(clear = true) {
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
  if (program !== null) {
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
  let gl = this.gl;
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
