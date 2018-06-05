#version 300 es

precision mediump float;

layout (location = 0) in vec3 aVertexPosition;

out vec4 vWorldSpacePosition;

uniform mat4 uMVPMatrix;
uniform mat4 uModelMatrix;

void main(void) {
  vec4 vertexPosition = uMVPMatrix * vec4(aVertexPosition, 1.0);
  vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);
  // position
  gl_Position = vertexPosition;
  vWorldSpacePosition = worldPosition;
}
