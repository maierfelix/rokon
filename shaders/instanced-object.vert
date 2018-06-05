#version 300 es

precision mediump float;

layout (location = 0) in vec3 aVertexPosition;
layout (location = 1) in vec2 aTextureCoord;
layout (location = 2) in vec3 aVertexNormal;
layout (location = 3) in vec3 aVertexTangent;
layout (location = 4) in vec3 aVertexBitangent;

// instanced
layout (location = 5) in float aAlpha;
layout (location = 6) in float aGlowing;
layout (location = 7) in mat4 aModelMatrix;

out float vAlpha;
out float vGlowing;

out vec3 vLighting;
out vec3 vSurfaceNormal;
out vec3 vLightPosition;
out vec3 vCameraPosition;
out float vVisibility;
out float vOcclusionVisibility;
out vec2 vTextureCoord;
out vec4 vWorldSpacePosition;

uniform float uTime;
uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

// bools
uniform bool uHasNormalMap;
uniform bool uHasEnvironmentMap;

uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

vec3 ambientLight = vec3(255, 251, 131) / 255.0;
vec3 directionalLightColor = vec3(0.75, 0.75, 0.75);

const float gradient = 1.85;
const float destinity = 3.0 / 1e3;

void main(void) {
  mat4 modelViewMatrix = uViewMatrix * aModelMatrix;
  vec4 vertexPosition = uProjectionMatrix * modelViewMatrix * vec4(aVertexPosition, 1.0);
  vec4 worldSpacePosition = aModelMatrix * vec4(aVertexPosition, 1.0);
  vec4 viewSpacePosition = modelViewMatrix * vec4(aVertexPosition, 1.0);
  vec3 surfaceNormal = (modelViewMatrix * vec4(aVertexNormal, 0.0)).xyz;  
  vec3 lightPosition = uLightPosition - viewSpacePosition.xyz;
  vec3 cameraPosition = -viewSpacePosition.xyz;
  // normal
  if (uHasNormalMap) {
    vec3 tang = normalize((modelViewMatrix * vec4(aVertexTangent, 0.0)).xyz);
    vec3 norm = normalize((modelViewMatrix * vec4(aVertexNormal, 0.0)).xyz);
    vec3 bitang = normalize((modelViewMatrix * vec4(aVertexBitangent, 0.0)).xyz);
    mat3 TBN = mat3(
      tang.x, bitang.x, norm.x,
      tang.y, bitang.y, norm.y,
      tang.z, bitang.z, norm.z
    );
    lightPosition = TBN * (uLightPosition - viewSpacePosition.xyz);
    cameraPosition = TBN * (-viewSpacePosition.xyz);
  }
  // occlusion
  {
    vOcclusionVisibility = 1.0;
  }
  // fog
  {
    float distanceFromCamera = length(uViewMatrix * worldSpacePosition);
    vVisibility = clamp(exp(-pow((distanceFromCamera * destinity), gradient)), 0.0, 1.0);
  }
  // position
  gl_Position = vertexPosition;
  // varyings
  vTextureCoord = aTextureCoord;
  vWorldSpacePosition = worldSpacePosition;
  vSurfaceNormal = surfaceNormal;
  vLightPosition = lightPosition;
  vCameraPosition = cameraPosition;
  vAlpha = aAlpha;
  vGlowing = aGlowing;
  vLighting = ambientLight + (directionalLightColor);
}
