#version 300 es

precision mediump float;

layout (location = 0) in vec3 aVertexPosition;

uniform mat4 uTransformMatrix;

void main(void) {
  vec4 vertexPosition = uTransformMatrix * vec4(aVertexPosition, 1.0);
  gl_Position = vertexPosition;
}
