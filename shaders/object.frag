#version 300 es

precision mediump float;

layout (location = 0) out vec4 fragColor;

in vec3 vLighting;
in float vVisibility;
in float vOcclusionVisibility;
in vec2 vTextureCoord;
in vec3 vNormal;
in vec3 vSurfaceNormal;
in vec3 vLightPosition;
in vec3 vCameraPosition;
in vec3 vReflectPosition;
in vec4 vWorldSpacePosition;

uniform float uTime;
uniform float uAlpha;
uniform float uGlowing;
uniform vec4 uClipPlane;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

// bools
uniform bool uIsLightSource;
uniform bool uHasNormalMap;
uniform bool uHasSpecularMap;
uniform bool uHasSpecularLighting;
uniform bool uHasEnvironmentMap;

uniform vec4 uFogColor;
uniform float uGlossFactor;

uniform sampler2D uSampler;
uniform sampler2D uNormalMap;
uniform sampler2D uSpecularMap;
uniform samplerCube uEnvironmentMap;

float fogLevel = 2.25;

const float ALPHA_TRESHOLD = 0.004;

void main(void) {
  vec4 final;
  vec4 color;
  // clipping plane
  if (dot(vWorldSpacePosition, uClipPlane) < 0.0) discard;
  // texture color
  {
    color = texture(uSampler, vTextureCoord);
    if (color.a <= ALPHA_TRESHOLD) discard;
  }
  // apply fog
  {
    final = mix(color, uFogColor / 255.0, 1.0 - vVisibility);
  }
  // out
  {
    fragColor = final;
  }
}
