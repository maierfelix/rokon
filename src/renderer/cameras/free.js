import {
  radToDeg,
  degToRad,
  MAX_INTEGER
} from "../../utils";

import Camera from "./index";

/**
 * Free camera
 * @class FreeCamera
 */
export default class FreeCamera extends Camera {
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
};

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
    let vDist = minDist * Math.sin(this.rotation[0]);
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
