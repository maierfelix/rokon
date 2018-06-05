#version 300 es

precision mediump float;

layout (location = 0) in vec4 aVertexPosition;
layout (location = 1) in vec2 aTextureCoord;
layout (location = 2) in vec3 aVertexNormal;
layout (location = 3) in vec3 aVertexTangent;
layout (location = 4) in vec3 aVertexBitangent;

out vec3 vNormal;
out vec3 vSurfaceNormal;
out vec3 vLightPosition;
out vec3 vCameraPosition;
out float vVisibility;
out float vOcclusionVisibility;
out vec2 vTextureCoords;
out vec4 vShadowCoords;
out vec4 vWorldSpacePosition;
out vec4 vVertexLightPosition;

out mat3 vTBN;

uniform float uTime;
uniform float uAlpha;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

// view space positions
uniform vec3 uLightViewPosition;

// bools
uniform bool uHasNormalMap;
uniform bool uHasShadowMap;
uniform bool uHasEnvironmentMap;

uniform mat4 uMVPMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uLightSpaceMatrix;

const float gradient = 1.85;
const float destinity = 3.0 / 1e3;

void main(void) {
  vec3 vertexNormal = aVertexNormal;
  vec4 vertexPosition = uMVPMatrix * aVertexPosition;
  vec4 worldPosition = uModelMatrix * aVertexPosition;
  vec4 viewPosition = uModelViewMatrix * aVertexPosition;
  vec3 lightPosition = uLightViewPosition - viewPosition.xyz;
  vec3 cameraPosition = -viewPosition.xyz;
  vec2 texCoords = aTextureCoord.xy;
  vec4 shadowCoords = vec4(0.0);
  // normal
  if (uHasNormalMap) {
    vec3 tang = normalize((uNormalMatrix * vec4(aVertexTangent, 0)).xyz);
    vec3 norm = normalize((uNormalMatrix * vec4(aVertexNormal, 0)).xyz);
    vec3 bitang = normalize((uNormalMatrix * vec4(aVertexBitangent, 0)).xyz);
    float handedness = sign(dot(cross(norm, tang), bitang));
    mat3 TBN = mat3(tang * handedness, bitang * handedness, norm);
    vTBN = TBN;
  }
  // shadow
  if (uHasShadowMap) {
    vVertexLightPosition = uLightSpaceMatrix * worldPosition;
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
  vTextureCoords = texCoords;
  vShadowCoords = shadowCoords;
  vWorldSpacePosition = worldPosition;
  vSurfaceNormal = (uNormalMatrix * vec4(vertexNormal, 0)).xyz;
}
