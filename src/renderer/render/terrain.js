/**
 * Renders a terrain
 * @param {Terrain} terrain
 */
export function renderTerrain(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let vClipPlane = this.clipPlane;
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
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
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniform4fv(variables.uClipPlane, vClipPlane);
    gl.uniform1f(variables.uAlpha, object.alpha);
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniform4fv(variables.uFogColor, this.fogColor);
    //gl.uniform3fv(variables.uLightPosition, this.getViewPosition(sun.translate.toArray()));
    gl.uniform3fv(variables.uCameraPosition, this.getViewPosition(camera.position));
    gl.uniform1i(variables.uShadowMapDimension, object.shadowmap.dimension);
  }
  {
    this.useTexture(object.texture, variables.uSampler, 0);
    if (object.shadowmap) this.useTexture(object.shadowmap.texture, variables.uShadowMap, 1);
  }
  // draw
  {
    /*{
      gl.uniform1i(variables.uWireframe, 1);
      gl.drawElements(gl.LINE_STRIP, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(variables.uWireframe, 0);
    }*/
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  }
};
