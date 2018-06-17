import {
  createTransformationMatrix
} from "../../utils";

import Water from "../objects/water";

/**
 * Renders water
 * @param {Plane} object
 */
export function renderPlane(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let buffers = object.buffers;
  let variables = program.locations;
  let mModel = object.getModelMatrix();
  let mModelView = object.getModelViewMatrix();
  // how to pull vertices
  {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices);
    gl.vertexAttribPointer(variables.aVertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(variables.aVertexPosition);
  }
  // which indices to use
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uModelMatrix, false, mModel);
    gl.uniformMatrix4fv(variables.uModelViewMatrix, false, mModelView);
    gl.uniform1f(variables.uTime, this.frames);
    //gl.uniform3fv(variables.uLightPosition, sun.translate.toArray());
    gl.uniform3fv(variables.uCameraPosition, camera.position);
  }
  // water related
  if (object instanceof Water) {
    let {
      dudvTexture,
      depthTexture,
      normalTexture,
      reflectionTexture,
      refractionTexture,
      refractionDepthTexture
    } = object;
    this.useTexture(reflectionTexture, variables.uReflectionTexture, 0);
    this.useTexture(refractionTexture, variables.uRefractionTexture, 1);
    this.useTexture(refractionDepthTexture, variables.uRefractionDepthTexture, 1);
    this.useTexture(dudvTexture, variables.uDudvTexture, 2);
    this.useTexture(normalTexture, variables.uNormalTexture, 3);
  } else {
    this.useTexture(object.texture, variables.uSampler, 0);
  }
  // draw
  {
    this.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
};
