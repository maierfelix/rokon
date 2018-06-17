/**
 * Returns the camera view matrix
 * @return {Float32Array} - The view matrix
 */
export function getViewMatrix() {
  return this.viewMatrix;
};

/**
 * Returns the projection matrix
 * @return {Float32Array} - The projection matrix
 */
export function getProjectionMatrix() {
  return this.projectionMatrix;
};

/**
 * Calculates the model-matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The model matrix
 */
export function getModelMatrix(object) {
  let translate = object.translate;
  let rotate = object.rotate;
  let scale = object.scale;
  let mView = this.getViewMatrix();
  let mModel = this.modelMatrix;
  let vScale = this.helpers.scale;
  let vTranslate = this.helpers.translate;
  mat4.identity(mModel);
  // translation
  mat4.translate(
    mModel,
    mModel,
    vec3.set(vTranslate, translate.x, translate.y, translate.z)
  );
  // 2d sprite, always face camera
  if (object.isSprite) this.setModelMatrixFaceCamera(mModel, mView);
  this.setModelMatrixRotation(mModel, rotate);
  // scale
  mat4.scale(
    mModel,
    mModel,
    vec3.set(vScale, scale.x, scale.y, scale.z)
  );
  return mModel;
};

/**
 * Calculates the model-view-matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The model view matrix
 */
export function getViewProjectionMatrix(object) {
  let mView = this.getViewMatrix();
  let mProjection = this.getProjectionMatrix();
  let mViewProjection = this.viewProjection;
  mat4.identity(mViewProjection);
  mat4.multiply(
    mViewProjection,
    mProjection,
    mView
  );
  return mViewProjection;
};

/**
 * Calculates the model-view-matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The model view matrix
 */
export function getModelViewMatrix(object) {
  let translate = object.translate;
  let rotate = object.rotate;
  let scale = object.scale;
  let mView = this.getViewMatrix();
  let mModel = object.getModelMatrix();
  let mModelView = this.modelViewMatrix;
  mat4.identity(mModelView);
  mat4.multiply(
    mModelView,
    mView,
    mModel
  );
  return mModelView;
};

/**
 * Calculates the normal matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The normal matrix
 */
export function getNormalMatrix(object) {
  let mNormal = this.normalMatrix;
  let mModel = this.getModelMatrix(object);
  mat4.identity(mNormal);
  mat4.invert(mNormal, mModel);
  mat4.transpose(mNormal, mNormal);
  return mNormal;
};

/**
 * Calculates the model-view-projection matrix of an object
 * @param {WebGLObject} object
 * @return {Float32Array} - The mvp matrix
 */
export function getModelViewProjectionMatrix(object) {
  let mModelViewProjection = this.modelViewProjectionMatrix;
  let mModelView = this.getModelViewMatrix(object);
  let mProjection = this.getProjectionMatrix();
  mat4.identity(mModelViewProjection);
  mat4.multiply(
    mModelViewProjection,
    mProjection,
    mModelView
  );
  return mModelViewProjection;
};

/**
 * Rotates a model matrix with the given vector
 * @param {Float32Array} mModel - The model matrix to rotate
 * @param {Float32Array} mView - The rotation vector
 * @return {Float32Array}
 */
export function setModelMatrixRotation(mModel, rotate) {
  // rotation
  mat4.rotateX(
    mModel,
    mModel,
    rotate.x * (Math.PI / 180)
  );
  mat4.rotateY(
    mModel,
    mModel,
    rotate.y * (Math.PI / 180)
  );
  mat4.rotateZ(
    mModel,
    mModel,
    rotate.z * (Math.PI / 180)
  );
  return mModel;
};

/**
 * Makes a model matrix always face the camera
 * @param {Float32Array} mModel - The model matrix to face
 * @param {Float32Array} mView - The camera's view matrix to use
 * @return {Float32Array}
 */
export function setModelMatrixFaceCamera(mModel, mView) {
  mModel[0] =  -mView[0];
  mModel[1] =  -mView[4];
  mModel[2] =  -mView[8];
  mModel[4] =  -mView[1];
  mModel[5] =  -mView[5];
  mModel[6] =  -mView[9];
  mModel[8] =  -mView[2];
  mModel[9] =  -mView[6];
  mModel[10] = -mView[10];
  return mModel;
};
