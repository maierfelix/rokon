#version 300 es

precision mediump float;

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec2 aTextureCoord;
layout (location = 2) in vec3 aVertexNormal;
layout (location = 3) in vec3 aVertexTangent;
layout (location = 4) in vec3 aVertexBitangent;

out vec3 vLighting;
out vec3 vNormal;
out vec3 vSurfaceNormal;
out vec3 vLightPosition;
out vec3 vCameraPosition;
out float vVisibility;
out float vOcclusionVisibility;
out vec2 vTextureCoord;
out vec4 vWorldSpacePosition;

uniform float uTime;
uniform float uAlpha;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

// view space positions
uniform vec3 uLightViewPosition;

// bools
uniform bool uHasNormalMap;
uniform bool uHasEnvironmentMap;

uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

vec3 ambientLight = vec3(255, 251, 131) / 255.0;
vec3 directionalLightColor = vec3(0.75, 0.75, 0.75);

const float gradient = 1.85;
const float destinity = 3.0 / 1e3;

void main(void) {
  vec4 vertexPosition = uProjectionMatrix * uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vec4 worldPosition = uModelMatrix * vec4(aVertexPosition, 1.0);
  vec4 viewSpacePosition = uModelViewMatrix * vec4(aVertexPosition, 1.0);
  vec3 surfaceNormal = (uModelViewMatrix * vec4(aVertexNormal, 0.0)).xyz;
  vec3 lightPosition = uLightViewPosition - viewSpacePosition.xyz;
  vec3 cameraPosition = -viewSpacePosition.xyz;
  // normal
  if (uHasNormalMap) {
    vec3 tang = normalize((uModelViewMatrix * vec4(aVertexTangent, 0.0)).xyz);
    vec3 norm = normalize((uModelViewMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vec3 bitang = normalize((uModelViewMatrix * vec4(aVertexBitangent, 0.0)).xyz);
    mat3 TBN = mat3(
      tang.x, bitang.x, norm.x,
      tang.y, bitang.y, norm.y,
      tang.z, bitang.z, norm.z
    );
    lightPosition = TBN * (uLightViewPosition - viewSpacePosition.xyz);
    cameraPosition = TBN * (-viewSpacePosition.xyz);
  }
  // occlusion
  {
    vOcclusionVisibility = 1.0;
  }
  // fog
  {
    float distanceFromCamera = length(uViewMatrix * worldPosition);
    vVisibility = clamp(exp(-pow((distanceFromCamera * destinity), gradient)), 0.0, 1.0);
  }
  // position
  gl_Position = vertexPosition;
  // varyings
  vTextureCoord = aTextureCoord;
  vWorldSpacePosition = worldPosition;
  vNormal = (transpose(inverse(uModelMatrix)) * vec4(aVertexNormal, 0.0)).xyz;
  vSurfaceNormal = surfaceNormal;
  vLightPosition = lightPosition;
  vCameraPosition = cameraPosition;
  vLighting = ambientLight + (directionalLightColor);
}
