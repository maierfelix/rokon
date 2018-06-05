#version 300 es

precision mediump float;

in vec4 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uLightSpaceMatrix;

void main(void) {
  vec4 worldPosition = uModelMatrix * aVertexPosition;
  gl_Position = uLightSpaceMatrix * worldPosition;
}
