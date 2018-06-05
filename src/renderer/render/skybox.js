/**
 * Renders a object
 * @param {WebGLObject} object
 */
export function renderSkybox(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let cubemap = object.environmentTexture;
  let variables = program.locations;
  let mView = this.getViewMatrix();
  let mModelView = object.getModelViewMatrix();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniform1f(variables.uTime, this.frames);
    gl.uniformMatrix4fv(variables.uViewMatrix, false, mView);
    gl.uniform1f(variables.uSkyboxDimension, cubemap.size);
  }
  // texture
  {
    this.useTexture(cubemap, variables.uSkyCube, 10);
  }
  // draw
  {
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  }
};
