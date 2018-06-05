import { BATCH_MAT4_SIZE } from "./batch";

/**
 * Enables the given matrix attribute
 * @param {Number} location - The shader attribute location
 * @param {WebGLBuffer} buffer - The buffer containing our data
 * @param {Number} divisor
 */
export function enableMatrix4AttributeDivisor(location, buffer, divisor = -1) {
  let gl = this.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  {
    gl.enableVertexAttribArray(location + 0);
    gl.enableVertexAttribArray(location + 1);
    gl.enableVertexAttribArray(location + 2);
    gl.enableVertexAttribArray(location + 3);
  }
  {
    let sFloat = Float32Array.BYTES_PER_ELEMENT;
    let stride = sFloat * BATCH_MAT4_SIZE;
    gl.vertexAttribPointer(location + 0, 4, gl.FLOAT, false, stride, sFloat * 0);
    gl.vertexAttribPointer(location + 1, 4, gl.FLOAT, false, stride, sFloat * 4);
    gl.vertexAttribPointer(location + 2, 4, gl.FLOAT, false, stride, sFloat * 8);
    gl.vertexAttribPointer(location + 3, 4, gl.FLOAT, false, stride, sFloat * 12);
  }
  if (divisor !== -1) {
    gl.vertexAttribDivisor(location + 0, divisor);
    gl.vertexAttribDivisor(location + 1, divisor);
    gl.vertexAttribDivisor(location + 2, divisor);
    gl.vertexAttribDivisor(location + 3, divisor);
  }
};

/**
 * Enables the given vector attribute
 * @param {Number} location - The shader attribute location
 * @param {WebGLBuffer} buffer - The buffer containing our data
 * @param {Number} size - The vector size
 * @param {Number} divisor
 */
export function enableVectorAttributeDivisor(location, buffer, size, divisor = -1) {
  let gl = this.gl;
  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  if (divisor !== -1) gl.vertexAttribDivisor(location, divisor);
};

/**
 * Enables the given float attribute
 * @param {Number} location - The shader attribute location
 * @param {WebGLBuffer} buffer - The buffer containing our data
 * @param {Number} divisor
 */
export function enableFloatAttributeDivisor(location, buffer, divisor = -1) {
  let gl = this.gl;
  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, 1, gl.FLOAT, false, 0, 0);
  if (divisor !== -1) gl.vertexAttribDivisor(location, divisor);
};

/**
 * Disables the given matrix attribute
 * @param {Number} location - The shader attribute location
 */
export function disableMatrix4AttributeDivisor(location) {
  let gl = this.gl;
  gl.vertexAttribDivisor(location + 0, 0);
  gl.vertexAttribDivisor(location + 1, 0);
  gl.vertexAttribDivisor(location + 2, 0);
  gl.vertexAttribDivisor(location + 3, 0);
};

/**
 * Disables the given vector attribute
 * @param {Number} location - The shader attribute location
 */
export function disableVectorAttributeDivisor(location) {
  let gl = this.gl;
  gl.vertexAttribDivisor(location + 0, 0);
};

/**
 * Disables the given vector attribute
 * @param {Number} location - The shader attribute location
 */
export function disableFloatAttributeDivisor(location) {
  let gl = this.gl;
  gl.vertexAttribDivisor(location + 0, 0);
};
