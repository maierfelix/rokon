/**
 * Renders a quad
 * @param {Quad} quad
 */
export function renderQuad(quad) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = quad.buffers;
  let variables = program.locations;
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aPosition);
  }
  // send uniforms
  {
    gl.uniform1f(variables.uTime, this.frames);
    // resolution
    {
      let resolution = this.helpers.quadResolution;
      resolution[0] = quad.texture.width;
      resolution[1] = quad.texture.height;
      gl.uniform2fv(variables.uResolution, resolution);
    }
  }
  // texture
  {
    //this.useTexture(quad, variables.uSampler, 0);
  }
  // draw
  {
    this.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
};
