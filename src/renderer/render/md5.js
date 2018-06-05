/**
 * Renders water
 * @param {Plane} object
 */
export function renderMD5(object) {
  let gl = this.gl;
  let camera = this.camera;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let dudvTexture = object.dudvTexture;
  let normalTexture = object.normalTexture;
  let variables = program.locations;
  let model = object.model;
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  let vCameraPosition = camera.position;

  let VERTEX_STRIDE = 44;

  if (!model.vertBuffer || !model.indexBuffer) return;

  gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
  gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
  gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
  gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);

  gl.bindBuffer(gl.ARRAY_BUFFER, model.vertBuffer);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

  gl.disable(gl.CULL_FACE);

  let meshes = model.meshes;
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    let meshOffset = mesh.vertOffset * 4;

    let variables = program.locations;

    this.useTexture(mesh.diffuseMap, variables.uSampler, 0);

    gl.enableVertexAttribArray(variables.aVertexPosition);
    gl.enableVertexAttribArray(variables.aTextureCoord);
    gl.enableVertexAttribArray(variables.aVertexNormal);
    gl.enableVertexAttribArray(variables.aVertexTangent);

    // how to pull tangents
    gl.disableVertexAttribArray(variables.aVertexTangent);
    // how to pull bitangents
    gl.disableVertexAttribArray(variables.aVertexBitangent);

    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 0);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 12);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 20);
    gl.vertexAttribPointer(variables.aVertexTangent, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 32);

    gl.uniform4fv(variables.uClipPlane, this.clipPlane);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    gl.uniform3fv(variables.uCameraPosition, vCameraPosition);
    gl.uniform1f(variables.uAlpha, object.alpha);
    gl.uniform1f(variables.uGlowing, object.glow);
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform1f(variables.uIsLightSource, false);
    gl.uniform1f(variables.uHasNormalMap, false);
    gl.uniform1f(variables.uHasSpecularMap, false);
    gl.uniform1f(variables.uHasEmissiveMap, false);
    gl.uniform1f(variables.uHasSpecularLighting, false);
    gl.uniform1f(variables.uHasEnvironmentMap, false);
    gl.uniform1f(variables.uHasMetalnessMap, false);
    gl.uniform1f(variables.uHasRoughnessMap, false);
    gl.uniform1f(variables.uHasAmbientOcclusionMap, false);

    //if (this.debug.normals) this.drawDebugNormals(object);
    this.drawElements(gl.TRIANGLES, mesh.elementCount, gl.UNSIGNED_SHORT, mesh.indexOffset * 2);
  }

  gl.enable(gl.CULL_FACE);

  if (this.debug.boundings) this.renderBoundingBox(object);

};
