#version 300 es

precision mediump float;

in vec3 aVertexPosition;

uniform float uSkyboxDimension;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec3 vTextureCoord;

void main(void) {
  vec3 vertexPosition = aVertexPosition * uSkyboxDimension;
  mat4 viewMatrix = mat4(mat3(uViewMatrix));
  vec4 position = (uProjectionMatrix * viewMatrix * vec4(vertexPosition, 1.0)).xyww;
  gl_Position = position;
  // varyings
  vTextureCoord = aVertexPosition;
}
