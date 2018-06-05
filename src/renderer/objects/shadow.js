import Plane from "./plane";
import Sprite from "./sprite";

/**
 * Shadow class
 * @class Shadow
 * @extends Plane
 */
export default class Shadow extends Plane {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    super(opts);
    this.dimension = 1024;
    this.init();
  }
};

/**
 * Initialise
 */
Shadow.prototype.init = function() {
  let renderer = this.renderer;
  let dimension = this.dimension;
  this.useTexture(renderer.createShadowFrameBuffer({ width: dimension, height: dimension }));
};

/**
 * Buffer the scene into a shadowmap
 * which can later then be drawn
 * @param {WebGLObject} sun - The sun to cast shadows from
 * @return {Float32Array}
 */
Shadow.prototype.buffer = function(cbDrawScene) {
  let renderer = this.renderer;
  let gl = renderer.gl;
  let texture = this.texture;
  renderer.useFrameBuffer({
    buffer: texture.buffer,
    width: 1024,
    height: 1024
  });
  camera.mode = 1;
  renderer.clear();
  renderer.useCamera(camera);
  renderer.resetClipPlane();
  gl.cullFace(gl.FRONT);
  let mProjection = camera.projection();
  let rotation = window.rotation || [0.8, 0.8, 0.8];
  let cPos = vec3.clone(terrain.translate.toArray());
  let cRot = rotation;
  let position = cPos;
  let mView = mat4.create();
  mat4.rotateX(mView, mView, rotation[0]);
  mat4.rotateY(mView, mView, rotation[1]);
  mat4.rotateZ(mView, mView, rotation[2] - Math.PI);
  mat4.translate(mView, mView, new Float32Array([0, -100, 1000]));
  let depthMVP = mat4.multiply(
    mat4.create(),
    mProjection,
    mView
  );
  let biasMatrix = mat4.fromValues(
    0.5, 0.0, 0.0, 0.0,
    0.0, 0.5, 0.0, 0.0,
    0.0, 0.0, 0.5, 0.0,
    0.5, 0.5, 0.5, 1.0
  );
  let depthBiasMVP = mat4.multiply(
    mat4.create(),
    biasMatrix,
    depthMVP
  );
  {
    let program = renderer.useRendererProgram("object-shadow");
    let variables = program.locations;
    gl.uniformMatrix4fv(variables.uShadowMapSpace, false, depthMVP);
    gl.uniformMatrix4fv(variables.uShadowMapSpace, false, depthMVP);
    renderer.objects.map(obj => {
      if (obj.isInstanced || !camera.isObjectInView(obj)) return;
      if (obj.model) return;
      renderer.renderShadow(obj);
    });
  }
  gl.cullFace(gl.BACK);
  camera.mode = 0;
  camera.perspectiveMode();
  renderer.useCamera(camera);
  renderer.restoreFrameBuffer();
  renderer.restoreRendererProgram();
  this.shadowMatrix = depthBiasMVP;
};
