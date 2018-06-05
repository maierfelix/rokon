/**
 * Renders an object's bounding box
 * @param {WebGLObject} object
 */
export function renderBoundingBox(source) {
  let gl = this.gl;
  let camera = this.camera;
  let program = this.getActiveProgram();
  let variables = program.locations;
  let object = this.boundingBox;
  let buffers = object.buffers;
  let mModel = object.getModelMatrix();
  let mNormal = object.getNormalMatrix();
  let mModelView = object.getModelViewMatrix();
  let mModelViewProjection = object.getModelViewProjectionMatrix();
  // world bounding box
  {
    let boundings = source.boundings;
    let size = boundings.world.size;
    let center = boundings.world.center;
    object.translate.setArray(center);
    object.scale.setArray(size);
    object.rotate.set(0);
  }
  // data
  {
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
    // how to pull tangents
    gl.disableVertexAttribArray(variables.aVertexTangent);
    // how to pull bitangents
    gl.disableVertexAttribArray(variables.aVertexBitangent);
    // which indices to use
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
    // matrices
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uNormalMatrix, false, mNormal);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniformMatrix4fv(variables.uMVPMatrix, false, mModelViewProjection);
  }
  // wireframe mode
  let ostate = this.debug.wireframe;
  this.debug.wireframe = true;
  // draw
  {
    gl.disable(gl.CULL_FACE);
    this.drawElements(gl.TRIANGLES, object.data.indices.length, gl.UNSIGNED_SHORT, 0);
    gl.enable(gl.CULL_FACE);
  }
  this.debug.wireframe = ostate;
};
