#version 300 es

precision mediump float;

in vec4 aVertexPosition;

out vec4 vClipSpace;
out vec2 vTextureCoords;
out vec4 vWorldSpacePosition;

uniform float uTime;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

const float tiling = 6.0;

void main(void) {
  vec4 vertexPosition = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vec4 worldSpacePosition = uModelMatrix * aVertexPosition;
  vec4 viewSpacePosition = uModelViewMatrix * aVertexPosition;
  gl_Position = vertexPosition;
  vClipSpace = vertexPosition;
  vTextureCoords = vec2(aVertexPosition.x, aVertexPosition.y) * tiling;
  vWorldSpacePosition = worldSpacePosition;
}
