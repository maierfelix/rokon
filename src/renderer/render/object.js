/**
 * Renders a object
 * @param {WebGLObject} object
 */
export function renderObject(object) {
  let gl = this.gl;
  let camera = this.camera;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let vClipPlane = this.clipPlane;
  let hasNormalMap = object.normalTexture !== null;
  let hasShadowMap = object.shadowTexture !== null;
  let hasSpecularMap = object.specularTexture !== null;
  let useSpecularLighting = object.specularLighting;
  let useEnvironmentMapping = (
    object.environmentMapping && object.environmentTexture !== null
  );
  let useEmissiveMapping = object.emissiveTexture !== null;
  let useMetalnessMapping = object.metalnessTexture !== null;
  let useRoughnessMapping = object.roughnessTexture !== null;
  let useAmbientOcclusionMapping = object.ambientOcclusionTexture !== null;
  let variables = program.locations;
  let vCameraPosition = camera.position;
  let vCameraViewPosition = this.getViewPosition(vCameraPosition);
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  // occlusion culling
  if (object.occlusionCulling && false) {
    let query = object.query;
    if (query.enabled && query.isReady()) {
      let passedSamples = query.getResult();
      if (passedSamples > 0) object.occlusionFactor = 0;
      else object.occlusionFactor++;
    }
    if (!query.enabled) {
      gl.colorMask(false, false, false, false);
      gl.depthMask(false);
      gl.disable(gl.CULL_FACE);
      query.enable();
      this.renderBoundingBox(object);
      query.disable();
      gl.colorMask(true, true, true, true);
      gl.depthMask(true);
      gl.enable(gl.CULL_FACE);
    }
    this.renderObject(object);
    return;
  }
  if (object.isOccluded()) return;
  if (object.environmentTexture && !object.environmentMapping) return;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    /*if (!program.isAttributeBufferEnabled(variables.aVertexPosition)) {
      program.enableAttributeBuffer(variables.aVertexPosition, buffers.vertices, 3);
    }*/
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull uvs
  if (object.data.uvs.length) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
  }
  // how to pull normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexNormal);
  }
  // how to pull tangents
  if (object.data.tangents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.tangents);
    gl.vertexAttribPointer(variables.aVertexTangent, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexTangent);
  } else {
    gl.disableVertexAttribArray(variables.aVertexTangent);
  }
  // how to pull bitangents
  if (object.data.bitangents) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.bitangents);
    gl.vertexAttribPointer(variables.aVertexBitangent, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexBitangent);
  } else {
    gl.disableVertexAttribArray(variables.aVertexBitangent);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
    if (hasShadowMap) {
      gl.uniformMatrix4fv(variables.uLightSpaceMatrix, false, object.lightSpaceMatrix);
    }
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    gl.uniform3fv(variables.uCameraPosition, vCameraPosition);
    gl.uniform3fv(variables.uCameraViewPosition, vCameraViewPosition);
    gl.uniform1f(variables.uAlpha, object.alpha);
    gl.uniform1f(variables.uGlowing, object.glow);
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform1f(variables.uGlossFactor, object.glossiness);
  }
  // send bools
  {
    gl.uniform1f(variables.uIsLightSource, (object.light !== null) | 0);
    gl.uniform1f(variables.uHasNormalMap, hasNormalMap | 0);
    gl.uniform1f(variables.uHasShadowMap, hasShadowMap | 0);
    gl.uniform1f(variables.uHasSpecularMap, hasSpecularMap | 0);
    gl.uniform1f(variables.uHasEmissiveMap, useEmissiveMapping | 0);
    gl.uniform1f(variables.uHasSpecularLighting, useSpecularLighting | 0);
    gl.uniform1f(variables.uHasEnvironmentMap, useEnvironmentMapping | 0);
    gl.uniform1f(variables.uHasMetalnessMap, useMetalnessMapping | 0);
    gl.uniform1f(variables.uHasRoughnessMap, useRoughnessMapping | 0);
    gl.uniform1f(variables.uHasAmbientOcclusionMap, useAmbientOcclusionMapping | 0);
  }
  // texture
  {
    this.useTexture(object.texture, variables.uSampler, 0);
    if (hasNormalMap) {
      this.useTexture(object.normalTexture, variables.uNormalMap, 1);
    }
    if (hasShadowMap) {
      this.useTexture(object.shadowTexture, variables.uShadowMap, 2);
    }
    if (hasSpecularMap) {
      this.useTexture(object.specularTexture, variables.uSpecularMap, 3);
    }
    if (useEmissiveMapping) {
      this.useTexture(object.emissiveTexture, variables.uEmissiveMap, 4);
    }
    if (useMetalnessMapping) {
      this.useTexture(object.metalnessTexture, variables.uMetalnessMap, 5);
    }
    if (useRoughnessMapping) {
      this.useTexture(object.roughnessTexture, variables.uRoughnessMap, 6);
    }
    if (useAmbientOcclusionMapping) {
      this.useTexture(object.ambientOcclusionTexture, variables.uAmbientOcclusionMap, 7);
    }
    if (useEnvironmentMapping) {
      this.useTexture(object.environmentTexture, variables.uEnvironmentMap, 10);
    } else {
      this.useTexture(this.emptyCubeTexture, variables.uEnvironmentMap, 10);
    }
  }
  // draw
  if (this.debug.normals) this.drawDebugNormals(object);
  if (object.culling === false) gl.disable(gl.CULL_FACE);
  this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  if (object.culling === false) gl.enable(gl.CULL_FACE);
  if (this.debug.boundings) this.renderBoundingBox(object);
};
