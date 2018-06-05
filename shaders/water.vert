#version 300 es

precision highp float;

in vec4 aVertexPosition;

out vec4 vClipSpace;
out vec2 vTextureCoords;
out vec3 vLightPosition;
out vec3 vCameraPosition;
out vec4 vWorldSpacePosition;

uniform float uTime;
uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

uniform mat4 uModelMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

const float waveSpeed = 4.0;
const float waveIntensity = 1.25;

const float tiling = 6.0;

void main(void) {
  float t = sin(uTime * (waveSpeed / 1000.0)) * waveIntensity;
  vec4 vertexPosition = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vec4 worldSpacePosition = uModelMatrix * aVertexPosition;
  vec4 viewSpacePosition = uModelViewMatrix * aVertexPosition;
  gl_Position = vertexPosition;
  //gl_Position.y += (cos(aVertexPosition.y) * waveIntensity) * t;
  vClipSpace = vertexPosition;
  vTextureCoords = (vec2(aVertexPosition.x, aVertexPosition.y)) * tiling;
  vLightPosition = uLightPosition - worldSpacePosition.xyz;
  vCameraPosition = uCameraPosition - worldSpacePosition.xyz;
  vWorldSpacePosition = worldSpacePosition;
}
