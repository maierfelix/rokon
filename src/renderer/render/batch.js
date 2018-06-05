import {
  BATCH_MAT4_SIZE,
  BATCH_VEC3_SIZE
} from "../batch";

/**
 * Renders a batched object
 * @param {WebGLBatch} batch
 */
export function renderBatch(batch, shadow) {
  let data = batch.data;
  let objects = data.objects;
  this.prepareBatch(batch, shadow);
  this.flushBatch(batch, shadow);
};

/**
 * Flushes the batch
 * @param {WebGLBatch} batch
 */
export function flushBatch(batch) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let template = batch.template;
  let variables = program.locations;
  //batch.fill();
  // enable divisors
  {
    this.enableFloatAttributeDivisor(variables.aAlpha, batch.data.buffers.alpha, 1);
    this.enableFloatAttributeDivisor(variables.aGlowing, batch.data.buffers.glow, 1);
    this.enableMatrix4AttributeDivisor(variables.aModelMatrix, batch.data.buffers.model, 1);
    //this.enableMatrix4AttributeDivisor(variables.aNormalMatrix, batch.data.buffers.normal, 1);
  }
  // flush
  {
    this.drawElementsInstanced(gl.TRIANGLES, template.data.indices.length, gl.UNSIGNED_SHORT, 0, batch.size);
  }
  // disable divisors
  {
    this.disableFloatAttributeDivisor(variables.aAlpha);
    this.disableFloatAttributeDivisor(variables.aGlowing);
    this.disableMatrix4AttributeDivisor(variables.aModelMatrix);
    //this.disableMatrix4AttributeDivisor(variables.aNormalMatrix);
  }
};

/**
 * Prepares the batch
 * @param {WebGLBatch} batch
 */
export function prepareBatch(batch) {
  let gl = this.gl;
  let camera = this.camera;
  let object = batch.template;
  let buffers = object.buffers;
  let program = this.getActiveProgram();
  let vClipPlane = this.clipPlane;
  let variables = program.locations;
  let hasNormalMap = object.normalTexture !== null;
  let hasSpecularMap = object.specularTexture !== null;
  let useSpecularLighting = object.specularLighting;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull normals
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
    gl.vertexAttribPointer(variables.aVertexNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexNormal);
  }
  // how to pull uvs
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
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
  // pass uniforms
  {
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    
    gl.uniform3fv(variables.uLightPosition, this.getViewPosition(sun.translate.toArray()));
    gl.uniform3fv(variables.uCameraPosition, this.getViewPosition(camera.position));
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    gl.uniform1f(variables.uGlossFactor, object.glossiness);
    gl.uniform1f(variables.uHasNormalMap, hasNormalMap | 0);
    gl.uniform1f(variables.uHasSpecularMap, hasSpecularMap | 0);
    gl.uniform1f(variables.uHasSpecularLighting, useSpecularLighting | 0);
    if (object.useSpecularLighting) {
      gl.uniform1f(variables.uGlossFactor, object.glossiness);
    }
  }
  // texture
  {
    this.useTexture(object.texture, variables.uSampler, 0);
    if (hasNormalMap) {
      this.useTexture(object.normalTexture, variables.uNormalMap, 1);
    }
    if (hasSpecularMap) {
      this.useTexture(object.specularTexture, variables.uSpecularMap, 2);
    }
  }
};
