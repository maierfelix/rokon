import {
  uid,
  MAX_INTEGER
} from "../../utils";

/**
 * Bounding info
 * @class BoundingInfo
 */
class BoundingInfo {
  /**
   * @param {Boolean} scale
   * @param {Boolean} rotate
   * @param {Boolean} translate
   * @constructor
   */
  constructor(scale, rotate, translate) {
    this.uid = uid();
    this.min = vec3.create();
    this.max = vec3.create();
    this.size = vec3.create();
    this.center = vec3.create();
    this.radius = 0;
    this.updates = 0;
    this.helpers = {
      scale: vec3.create(),
      translate: vec3.create(),
      vertex: vec4.create(),
      matrix: mat4.create()
    };
    this.settings = {
      scale: scale,
      rotate: rotate,
      translate: translate
    };
  }
};

/**
 * Box-based bounding
 * @class BoundingBox
 */
export default class BoundingBox {
  /**
   * @param {WebGLObject} object
   * @constructor
   */
  constructor(object) {
    this.uid = uid();
    this.object = object;
    this.local = new BoundingInfo(false, false, false);
    this.world = new BoundingInfo(true, true, true);
    // auto calculate local boundings
    this.update(this.local);
  }
};

/**
 * Updates the boundings
 * @param {BoundingInfo} space
 * @param {Object} settings
 */
BoundingBox.prototype.update = function(space) {
  let object = this.object;
  let min = space.min;
  let max = space.max;
  let size = space.size;
  let center = space.center;
  let helpers = space.helpers;
  let spaceSettings = space.settings;
  let isWorldSpace = (space === this.world);
  let isTranslationOnly = (space.settings && !space.scale && !space.rotate);
  let vertices = object.data.vertices;
  let length = (vertices.length / 3) | 0;
  let vertex = helpers.vertex;
  let mm = MAX_INTEGER;
  // we can easily transform local->world space
  if (isWorldSpace && (this.local.updates > 0)) {
    this.updateWorldSpace();
  // fetch local center, min, max one time
  } else {
    // reset
    vec3.set(min, +mm, +mm, +mm);
    vec3.set(max, -mm, -mm, -mm);
    vec4.set(vertex, 0, 0, 0, 0);
    // loop vertices, apply transformations, get min/max
    for (let ii = 0; ii < length; ++ii) {
      let index = (ii * 3) | 0;
      vec4.set(
        vertex,
        vertices[index + 0],
        vertices[index + 1],
        vertices[index + 2],
        1.0
      );
      this.applyTransformation(vertex, space, spaceSettings);
      let x = vertex[0];
      let y = vertex[1];
      let z = vertex[2];
      // min
      if (x < min[0]) min[0] = x;
      if (y < min[1]) min[1] = y;
      if (z < min[2]) min[2] = z;
      // max
      if (x > max[0]) max[0] = x;
      if (y > max[1]) max[1] = y;
      if (z > max[2]) max[2] = z;
    };
  }
  // center
  {
    vec3.add(center, min, max);
    vec3.scale(center, center, 0.5);
    space.center = center;
  }
  // size
  {
    vec3.subtract(size, max, min);
    if (space.settings.scale) {
      vec3.scale(size, size, 0.5);
    }
    space.size = size;
  }
  // radius
  {
    let length = vec3.length(size);
    space.radius = length;
  }
  space.updates++;
};

/**
 * Apply given transformations to a vertex
 * @param {Float32Array} vertex
 * @param {BoundingInfo} space
 * @param {Object} settings
 */
BoundingBox.prototype.applyTransformation = function(vertex, space, settings) {
  let object = this.object;
  let helpers = space.helpers;
  let scale = object.scale;
  let rotate = object.rotate;
  let translate = object.translate;
  let vScale = helpers.scale;
  let vTranslate = helpers.translate;
  let mTransform = helpers.matrix;
  let deg2Rad = (Math.PI / 180);
  mat4.identity(mTransform);
  // translate
  if (settings.translate) {
    mat4.translate(
      mTransform,
      mTransform,
      vec3.set(vTranslate, translate.x, translate.y, translate.z)
    );
  }
  // rotation
  if (settings.rotate) {
    mat4.rotateX(
      mTransform,
      mTransform,
      rotate.x * deg2Rad
    );
    mat4.rotateY(
      mTransform,
      mTransform,
      rotate.y * deg2Rad
    );
    mat4.rotateZ(
      mTransform,
      mTransform,
      rotate.z * deg2Rad
    );
  }
  // scale
  if (settings.scale) {
    mat4.scale(
      mTransform,
      mTransform,
      vec3.set(vScale, scale.x, scale.y, scale.z)
    );
  }
  vec4.transformMat4(
    vertex,
    vertex,
    mTransform
  );
};

/**
 * Apply translation only
 */
BoundingBox.prototype.updateWorldSpace = function() {
  let object = this.object;
  let world = this.world;
  let local = this.local;
  let helpers = world.helpers;
  // this ensures that all transformations take into account
  let settings = { scale: true, rotate: true, translate: true };
  let vec = helpers.vertex;
  // center
  {
    vec4.set(vec, local.center[0], local.center[1], local.center[2], 1.0);
    this.applyTransformation(vec, world, settings);
    world.center[0] = vec[0];
    world.center[1] = vec[1];
    world.center[2] = vec[2];
  }
  // min
  {
    vec4.set(vec, local.min[0], local.min[1], local.min[2], 1.0);
    this.applyTransformation(vec, world, settings);
    world.min[0] = vec[0];
    world.min[1] = vec[1];
    world.min[2] = vec[2];
  }
  // max
  {
    vec4.set(vec, local.max[0], local.max[1], local.max[2], 1.0);
    this.applyTransformation(vec, world, settings);
    world.max[0] = vec[0];
    world.max[1] = vec[1];
    world.max[2] = vec[2];
  }
};

/**
 * Checks if the local world bounds intersect with another object's world bounds
 * @param {WebGLObject} object
 * @return {Boolean}
 */
BoundingBox.prototype.intersectsWithObject = function(object) {
  let a = this.world;
  let b = object.boundings.world;
  return (
    (a.max[0] > b.min[0]) &&
    (a.min[0] < b.max[0]) &&
    (a.max[1] > b.min[1]) &&
    (a.min[1] < b.max[1]) &&
    (a.max[2] > b.min[2]) &&
    (a.min[2] < b.max[2])
  );
};

/**
 * Checks if the local world bounds intersect with a point in world space
 * @param {Object} pt
 * @return {Boolean}
 */
BoundingBox.prototype.intersectsWithPoint = function(pt) {
  let a = this.world;
  let b = pt;
  return (
    (a.max[0] > b.x) &&
    (a.min[0] < b.x) &&
    (a.max[1] > b.y) &&
    (a.min[1] < b.y) &&
    (a.max[2] > b.z) &&
    (a.min[2] < b.z)
  );
};

/**
 * Checks if local vertices intersect with a ray in world space
 * @param {Object} pt
 * @return {Boolean}
 */
BoundingBox.prototype.intersectsWithVertex = function(ray) {
  let object = this.object;
  let space = this.local;
  let size = space.size;
  let center = space.center;
  let helpers = space.helpers;
  let indices = object.data.indices;
  let vertices = object.data.vertices;
  let length = (indices.length / 3) | 0;
  let mm = MAX_INTEGER;
  let mModel = object.getModelMatrix();
  let pos = vec4.fromValues(ray.x, ray.y, ray.z, 1.0);
  // convert ray to local space
  vec4.transformMat4(pos, pos, mat4.invert(mat4.create(), mModel));
  let v0 = vec3.create();
  let v1 = vec3.create();
  let v2 = vec3.create();
  let centroid = vec3.create();
  for (let ii = 0; ii < length; ++ii) {
    let i0 = indices[ii + 0];
    let i1 = indices[ii + 1];
    let i2 = indices[ii + 2];
    vec3.set(v0, vertices[i0 + 0], vertices[i0 + 1], vertices[i0 + 2]);
    vec3.set(v1, vertices[i1 + 0], vertices[i1 + 1], vertices[i1 + 2]);
    vec3.set(v2, vertices[i2 + 0], vertices[i2 + 1], vertices[i2 + 2]);
    let x = (v0[0] + v1[0] + v2[0]) / 3;
    let y = (v0[1] + v1[1] + v2[1]) / 3;
    let z = (v0[2] + v1[2] + v2[2]) / 3;
    vec3.set(centroid, x, y, z);
    let dist = vec3.distance(pos, centroid);
    if (dist <= 0.0) return true;
  };
  return false;
};
