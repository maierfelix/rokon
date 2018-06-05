import MD5Object from "../objects/md5-object";

/**
 * Renders shadow map
 * @param {Plane} object
 */
export function renderShadow(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  if (object instanceof MD5Object) {

    let model = object.model;
    let VERTEX_STRIDE = 44;

    if (!model.vertBuffer || !model.indexBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.indexBuffer);

    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);

    let meshes = model.meshes;
    for (let ii = 0; ii < meshes.length; ++ii) {
      let mesh = meshes[ii];
      let meshOffset = mesh.vertOffset * 4;
      let variables = program.locations;
      gl.enableVertexAttribArray(variables.aVertexPosition);
      gl.vertexAttribPointer(variables.aVertexPosition, 3, gl.FLOAT, false, VERTEX_STRIDE, meshOffset + 0);
      this.drawElements(gl.TRIANGLES, mesh.elementCount, gl.UNSIGNED_SHORT, mesh.indexOffset * 2);
    };

    return; 
  }
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
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
  }
  // draw
  {
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
  }
};
