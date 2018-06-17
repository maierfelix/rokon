import Plane from "./plane";

/**
 * Water class
 * @class Water
 * @extends Plane
 */
export default class Water extends Plane {
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
};

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
  this.refractionDepthTexture = renderer.createFrameBuffer({
    width: 2048, height: 2048,
    wrap: {
      s: gl.REPEAT,
      t: gl.REPEAT,
      r: gl.REPEAT
    },
    attachments: [
      { format: gl.DEPTH_COMPONENT32F, size: gl.FLOAT }
    ]
  });
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
  this.bufferRefractionDepth(cbDrawScene);
};

/**
 * Buffer the scene into refraction part
 * @param {Function} cbDrawScene - The scene draw function
 */
Water.prototype.bufferRefractionDepth = function(cbDrawScene) {
  let gl = this.gl;
  let renderer = this.renderer;
  let refractionDepthTexture = this.refractionDepthTexture;
  renderer.useFrameBuffer(refractionDepthTexture);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  renderer.setClipPlane(0, 1, 0, -this.translate.y + 1.0);
  renderer.useCamera(camera);
  gl.colorMask(false, false, false, false);
  if (window.terrain) renderer.renderObject(window.terrain);
  gl.colorMask(true, true, true, true);
  renderer.useCamera(camera);
  renderer.restoreFrameBuffer();
};
