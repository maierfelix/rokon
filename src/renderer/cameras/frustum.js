import { uid } from "../../utils";

/**
 * Frustum base class
 * @class Frustum
 */
export default class Frustum {
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
};

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
   };
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
  let count = 0;
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
  };
  return true;
};
