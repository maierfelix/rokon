import { uid } from "../../utils";

import Cube from "../objects/cube";
import Frustum from "./frustum";

/**
 * Camera base class
 * @class Camera
 */
export default class Camera {
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
};

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
  };
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
  let renderer = this.renderer;
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
  let orthoLeft = -scale;
  let orthoRight = scale;
  let orthoBottom = -scale;
  let orthoTop = scale;
  let height = Math.tan(this.fieldOfView/2) * (this.zFar+this.zNear)/this.orthoScale;
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
  };
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
