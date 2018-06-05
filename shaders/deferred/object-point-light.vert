#version 300 es

precision highp float;

layout (location = 0) in vec4 aVertexPosition;

uniform mat4 uMVPMatrix;

void main(void) {
  vec4 vertexPosition = uMVPMatrix * aVertexPosition;
  gl_Position = vertexPosition;
}
