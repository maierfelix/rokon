#version 300 es

precision mediump float;

in vec4 aVertexPosition;
in vec2 aTextureCoord;
in mat4 aModelMatrix;

out vec2 vTextureCoord;

uniform float uTime;
uniform float uAlpha;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

const vec2 direction = vec2(0, 1);

void main(void) {
  mat4 modelViewMatrix = uProjectionMatrix * uViewMatrix * aModelMatrix;
  vec4 vertexPosition = modelViewMatrix * aVertexPosition;
  // position
  gl_Position = vertexPosition;
  // varyings
  vTextureCoord = aTextureCoord;
}
