import {
  uid,
  MAX_INTEGER
} from "../../utils";

import ObjectLoader from "../loader";
import ObjectReflector from "object-reflector";

import BoundingBox from "../boundings/box";

import Query from "../query";

import {
  Vector3D,
  MutableVector3D
} from "../../vector";

import { BATCH_BUFFER_UPDATE } from "../batch";

/**
 * Raw model
 * @class WebGLObject
 */
export default class WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this._alpha = 1.0;
    this._glow = 1.0;
    this.translate = new MutableVector3D(0, 0, 0);
    this.rotate = new MutableVector3D(0, 0, 0);
    this.scale = new MutableVector3D(1, 1, 1);
    this.cameraDistance = vec3.create();
    this.buffers = null;
    this.parent = null;
    this.reflector = null;
    this.boundings = null;
    this.light = null;
    this.batchElement = null;
    this.isSprite = false;
    this.specularLighting = false;
    this.occlusionCulling = false;
    this.environmentMapping = false;
    this.glossiness = 1.0;
    this.modelMatrix = null;
    this.normalMatrix = null;
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.query = new Query({
      gl: this.gl,
      renderer: this.renderer,
      type: this.gl.ANY_SAMPLES_PASSED_CONSERVATIVE 
    });
    this.occlusionFactor = 0;
    // linkable area
    {
      this.data = {
        vertices: null,
        normals: null,
        uvs: null,
        indices: null
      };
      this.loader = null;
      this.texture = null;
      this.rsmTexture = null;
      this.normalTexture = null;
      this.shadowTexture = null;
      this.specularTexture = null;
      this.emissiveTexture = null;
      this.metalnessTexture = null;
      this.roughnessTexture = null;
      this.displacementTexture = null;
      this.ambientOcclusionTexture = null;
      this.environmentTexture = null;
    }
    if (opts.inherit) this.useParent(opts.inherit);
    else {
      this.createReflector();
      if (opts.useMesh) {
        this.createMesh(opts.useMesh);
      } else {
        this.createMesh();
        this.createLoader();
      }
    }
  }
  get isInstanced() {
    return this.batchElement !== null;
  }
  get alpha() {
    return this._alpha;
  }
  set alpha(v) {
    this._alpha = v;
    // batch data needs to be updated
    if (this.batchElement !== null) {
      let batch = this.batchElement.batch;
      batch.updateObject(this, BATCH_BUFFER_UPDATE.ALPHA);
    }
  }
  get glow() {
    return this._glow;
  }
  set glow(v) {
    this._glow = v;
    // batch data needs to be updated
    if (this.batchElement !== null) {
      let batch = this.batchElement.batch;
      batch.updateObject(this, BATCH_BUFFER_UPDATE.GLOW);
    }
  }
};

/**
 * This runs after each frame got drawn
 */
WebGLObject.prototype.update = function() {
  // environment mapping
  if (this.environmentMapping && !this.environmentTexture) {
    let map = this.renderer.createCubeMap();
    this.useEnvironmentMap(map);
    map.drawFaces(window.drawScene);
    this.environmentMapping = true;
  }
  // boundings
  if (this.needsBoundingUpdate()) {
    // check this before we update the object's boundings
    let isTranslationUpdate = this.isTranslationUpdate();
    this.updateWorldBoundings();
    this.updateMatrices();
    if (this.batchElement !== null) {
      let batch = this.batchElement.batch;
      batch.updateObject(this, BATCH_BUFFER_UPDATE.MODEL);
    }
    // refresh environment texture
    if (isTranslationUpdate && this.environmentMapping) {
      this.environmentTexture.refresh();
    }
  }
  // camera distance
  {
    let mModelView = this.getModelViewMatrix();
    let vCenter = this.boundings.local.center;
    vec3.transformMat4(this.cameraDistance, vCenter, mModelView);
  }
};

/**
 * Makes the given properties reflective to childs
 */
WebGLObject.prototype.createReflector = function() {
  this.reflector = new ObjectReflector({
    object: this,
    properties: [
      "data", "loader", "buffers",
      "texture", "normalTexture", "specularTexture",
      "emissiveTexture", "metalnessTexture", "roughnessTexture",
      "ambientOcclusionTexture", "environmentTexture", "displacementTexture"
    ]
  });
};

/**
 * Refreshes the object's mesh data on the GPU
 */
WebGLObject.prototype.refresh = function() {
  if (this.loader) {
    this.loader.load();
    // also force an update for the object's boundings
    this.updateWorldBoundings();
  }
  else console.warn("Invalid load, no loader linked!");
};

/**
 * Create the object's mesh data
 */
WebGLObject.prototype.createMesh = function() {
  // inherit
};

/**
 * Creates a loader to send the object's
 * mesh to our GPU program
 */
WebGLObject.prototype.createLoader = function() {
  let renderer = this.renderer;
  let loader = new ObjectLoader(renderer, this);
  this.loader = loader;
  this.buffers = loader.buffers;
  this.boundings = new BoundingBox(this);
  this.updateBoundings();
};

/**
 * Uses the given texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useTexture = function(texture) {
  this.texture = texture;
};

/**
 * Uses the given color texture
 * @param {Array} color
 */
WebGLObject.prototype.useColor = function(color) {
  let renderer = this.renderer;
  this.useTexture(renderer.createTexture().fromColor(color));
};

/**
 * Uses the given normal texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useNormalMap = function(texture) {
  this.normalTexture = texture;
};

/**
 * Uses the given specular texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useSpecularMap = function(texture) {
  this.specularTexture = texture;
};

/**
 * Uses the given emissive texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useEmissiveMap = function(texture) {
  this.emissiveTexture = texture;
};

/**
 * Uses the given metalness texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useMetalnessMap = function(texture) {
  this.metalnessTexture = texture;
};

/**
 * Uses the given roughness texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useRoughnessMap = function(texture) {
  this.roughnessTexture = texture;
};

/**
 * Uses the given RSM map
 * @param {WebGLObjectTexture}
 */
WebGLObject.prototype.useRSMMap = function(texture) {
  this.rsmTexture = texture;
};

/**
 * Uses the given displacement texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useDisplacementMap = function(texture) {
  this.displacementTexture = texture;
};

/**
 * Uses the given ambient occlusion texture
 * @param {WebGLObjectTexture} texture
 */
WebGLObject.prototype.useAmbientOcclusionMap = function(texture) {
  this.ambientOcclusionTexture = texture;
};

/**
 * Uses the given specular texture
 * @param {CubeMap} cubemap
 */
WebGLObject.prototype.useEnvironmentMap = function(cubemap) {
  this.environmentTexture = cubemap;
  cubemap.target = this;
};

/**
 * Creates link to a parent
 * @param {WebGLObject} parent
 */
WebGLObject.prototype.useParent = function(parent) {
  this.parent = parent;
  this.parent.reflector.createReflection(this);
  this.boundings = new BoundingBox(this);
  this.scale.setVector(parent.scale);
  this.rotate.setVector(parent.rotate);
  this.translate.setVector(parent.translate);
  this.updateBoundings();
};

/**
 * Indicates if the boundings of the object need to get recalculated
 * @return {Boolean}
 */
WebGLObject.prototype.needsBoundingUpdate = function() {
  return (
    this.scale.mutated ||
    this.rotate.mutated ||
    this.translate.mutated
  );
};

/**
 * Indicates if the environment position changed
 * @return {Boolean}
 */
WebGLObject.prototype.isTranslationUpdate = function() {
  return this.translate.mutated;
};

/**
 * Updates the object's world boundings
 */
WebGLObject.prototype.updateLocalBoundings = function() {
  this.boundings.update(this.boundings.local);
};

/**
 * Updates the object's world boundings
 */
WebGLObject.prototype.updateWorldBoundings = function() {
  this.boundings.update(this.boundings.world);
  this.scale.mutated = false;
  this.rotate.mutated = false;
  this.translate.mutated = false;
};

/**
 * Updates the object's local and world boundings
 */
WebGLObject.prototype.updateBoundings = function() {
  this.updateLocalBoundings();
  this.updateWorldBoundings();
};

/**
 * Check if local object intersects with given object
 * @param {WebGLObject} object
 */
WebGLObject.prototype.intersectsWith = function(object) {
  return this.boundings.intersectsWithObject(object);
};

/**
 * Updates the cached version of the object's model matrix
 */
WebGLObject.prototype.updateMatrices = function() {
  let renderer = this.renderer;
  let mModel = renderer.getModelMatrix(this);
  let mNormal = renderer.getNormalMatrix(this);
  // create cached matrices
  if (!this.modelMatrix) this.modelMatrix = mat4.create();
  if (!this.normalMatrix) this.normalMatrix = mat4.create();
  mat4.copy(this.modelMatrix, mModel);
  mat4.copy(this.normalMatrix, mNormal);
};

/**
 * Calculates and returns the object's model matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getModelMatrix = function() {
  let renderer = this.renderer;
  let mModel = this.modelMatrix;
  // we can use a cached version
  if (mModel !== null && !this.isSprite) {
    // we make sure that always the same modelMatrix
    // is uploaded to the GPU - we just copy the cached
    // model matrix's content to "uniformed" modelMatrix
    // because this seems to be faster than uploading different matrices
    mat4.copy(renderer.modelMatrix, mModel);
    return renderer.modelMatrix;
  }
  // non-cached version
  return renderer.getModelMatrix(this);
};

/**
 * Calculates and returns the object's model matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getNormalMatrix = function() {
  let renderer = this.renderer;
  let mNormal = this.normalMatrix;
  // we can use a cached version
  if (mNormal !== null && !this.isSprite) {
    // we make sure that always the same modelMatrix
    // is uploaded to the GPU - we just copy the cached
    // model matrix's content to "uniformed" modelMatrix
    // because this seems to be faster than uploading different matrices
    mat4.copy(renderer.normalMatrix, mNormal);
    return renderer.normalMatrix;
  }
  // non-cached version
  return renderer.getNormalMatrix(this);
};

/**
 * Calculates and returns the object's model matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getModelViewMatrix = function() {
  return this.renderer.getModelViewMatrix(this);
};

/**
 * Calculates and returns the object's model-view-projection matrix
 * @return {Float32Array}
 */
WebGLObject.prototype.getModelViewProjectionMatrix = function() {
  return this.renderer.getModelViewProjectionMatrix(this);
};

/**
 * Indicates if the object is in view frustum
 * @return {Boolean}
 */
WebGLObject.prototype.isInView = function() {
  return this.renderer.camera.isObjectInView(this);
};

/**
 * Returns if the object is fully occluded
 * @return {Boolean}
 */
WebGLObject.prototype.isOccluded = function() {
  return this.occlusionCulling && this.occlusionFactor > 100;
};

/**
 * Returns the euclidian distance to the camera object
 * @return {Number}
 */
WebGLObject.prototype.getCameraDistance = function() {
  let cPos = this.renderer.camera.position;
  let oPos = this.boundings.world.center;
  let dist = vec3.distance(cPos, oPos);
  return dist;
};
