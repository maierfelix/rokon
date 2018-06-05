#version 300 es

precision mediump float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

out vec3 vLighting;
out vec2 vTextureCoord;
out vec4 vShadowCoords;
out vec4 vWorldSpacePosition;
out float vVisibility;
out float vOcclusionVisibility;

uniform float uTime;
uniform float uAlpha;
uniform vec4 uClipPlane;
uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uShadowMapSpace;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

const vec3 ambientLight = vec3(255, 251, 131) / 255.0;
const vec3 directionalLightColor = vec3(1, 1, 1);
const vec3 directionalVector = normalize(vec3(0.5, 0.5, 0.5));

const float gradient = 1.85;
const float destinity = 3.0 / 1e3;

void main(void) {
  vec4 vertexPosition = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vec4 worldSpacePosition = uModelMatrix * aVertexPosition;
  vec4 viewSpacePosition = uModelViewMatrix * aVertexPosition;
  vec4 relativeCameraPosition = uViewMatrix * worldSpacePosition;
  float visibility = clamp(exp(-pow((length(relativeCameraPosition.xyz) * destinity), gradient)), 0.0, 1.0);
  // shadows
  vec4 shadowCoords = uShadowMapSpace * worldSpacePosition;
  // lighting
  vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
  float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
  // position
  gl_Position = vertexPosition;
  // occlusion
  {
    vOcclusionVisibility = 1.0;
  }
  // fog
  {
    float distanceFromCamera = length(uViewMatrix * worldSpacePosition);
    vVisibility = clamp(exp(-pow((distanceFromCamera * destinity), gradient)), 0.0, 1.0);
  }
  // varyings
  vTextureCoord = aTextureCoord;
  vWorldSpacePosition = worldSpacePosition;
  vLighting = ambientLight + (directionalLightColor * directional);
  vShadowCoords = shadowCoords;
}
