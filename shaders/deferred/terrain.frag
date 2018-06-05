#version 300 es

precision mediump float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gEmissive;
layout (location = 4) out vec4 gRSMA;

in vec2 vTextureCoord;
in vec4 vShadowCoords;
in float vVisibility;
in float vOcclusionVisibility;
in vec3 vSurfaceNormal;
in vec4 vWorldSpacePosition;

uniform float uAlpha;
uniform float uTime;

uniform sampler2D uSampler;
uniform sampler2D uShadowMap;

uniform vec4 uFogColor;
uniform vec4 uClipPlane;

const float fogLevel = 2.25;

const int pcfCount = 1;
const float totalTexels = (float(pcfCount) * 2.0 + 1.0) * (float(pcfCount) * 2.0 + 1.0);

void main(void) {
  // clipping plane
  if (dot(vWorldSpacePosition, uClipPlane) < 0.0) discard;

  vec3 unitNormal = (vSurfaceNormal);

  // texture color
  vec4 texelColor = texture(uSampler, vTextureCoord);
  vec4 color = texelColor;
  // apply fog
  float fogFactor = clamp(smoothstep(0.0, fogLevel, max(0.0, 1.0 - (vWorldSpacePosition.y / fogLevel))), 0.0, 1.0);
  vec4 final = mix(uFogColor / 255.0, color, fogFactor);
  final = color;
  // out
  {
    gPosition = vWorldSpacePosition;
    gNormal = vec4(unitNormal, 0);
    gAlbedo = final;
    gEmissive = vec4(0.0);
    gRSMA = vec4(1.0,0.0,0.0,0.0);
  }
}
