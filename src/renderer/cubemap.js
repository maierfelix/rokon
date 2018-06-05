import {
  uid
} from "../utils";

/**
 * A cubemap
 * @class CubeMap
 */
export default class CubeMap {
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
};

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
  };
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
  };
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
    };
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
