#version 300 es

precision mediump float;

in vec2 aTextureCoord;
in vec4 aVertexPosition;
in mat4 aModelMatrix;

out vec2 vTextureCoord;

uniform mat4 uShadowMapSpace;

void main(void) {
  vec4 worldSpacePosition = aModelMatrix * aVertexPosition;
  gl_Position = uShadowMapSpace * worldSpacePosition;
  vTextureCoord = aTextureCoord;
}
