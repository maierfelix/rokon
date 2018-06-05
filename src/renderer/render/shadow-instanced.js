/**
 * Renders shadow map
 * @param {Plane} object
 */
export function renderShadowInstanced(batch) {
  let gl = this.gl;
  let template = batch.template;
  let buffers = template.buffers;
  let program = this.getActiveProgram();
  let mView = this.getViewMatrix();
  let variables = program.locations;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // how to pull uvs
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs);
    gl.vertexAttribPointer(variables.aTextureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aTextureCoord);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // pass uniforms
  {
    gl.uniformMatrix4fv(variables.uViewMatrix, false, mView);
  }
  // texture
  {
    this.useTexture(template.texture, variables.uSampler, 0);
  }
  // enable divisors
  {
    this.enableMatrix4AttributeDivisor(variables.aModelMatrix, batch.data.buffers.model, 1);
  }
  // flush
  {
    this.drawElementsInstanced(gl.TRIANGLES, template.data.indices.length, gl.UNSIGNED_SHORT, 0, batch.size);
  }
  // disable divisors
  {
    this.disableMatrix4AttributeDivisor(variables.aModelMatrix);
  }
};
