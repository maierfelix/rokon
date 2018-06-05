#version 300 es

precision mediump float;

layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec4 glowColor;
layout (location = 2) out vec4 occlusionColor;

in vec3 vLighting;
in vec2 vTextureCoord;
in vec4 vShadowCoords;
in float vVisibility;
in float vOcclusionVisibility;
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

  //  pcf
  float mapSize = 1024.0;
  float texelSize = 0.5 / mapSize;
  float total = 0.0;
  for (int x = -pcfCount; x <= pcfCount; x++) {
    for (int y = -pcfCount; y <= pcfCount; y++) {
      vec3 projCoords = vShadowCoords.xyz / vShadowCoords.w;
      vec2 depthCoords = projCoords.xy + vec2(x, y) * texelSize;
      float closestDepth = texture(uShadowMap, depthCoords).r;
      if (projCoords.z > closestDepth && closestDepth > 0.0004) {
        if (
          projCoords.x <= 1.0 && projCoords.x >= 0.0 &&
          projCoords.y <= 1.0 && projCoords.y >= 0.0
        ) {
          total += 0.125;
        }
      }
    };
  };
  total /= totalTexels;

  float lightFactor = (total * (vShadowCoords.w > 0.0 ? 50.0 : 0.0)) * 0.05;
  //lightFactor = lightFactor  - (vShadowCoords.w * 0.4);

  // texture color
  vec4 texelColor = texture(uSampler, vTextureCoord);
  vec4 color = vec4(texelColor.rgb * (vLighting * (1.0 - lightFactor)), texelColor.a);
  // apply fog
  float fogFactor = clamp(smoothstep(0.0, fogLevel, max(0.0, 1.0 - (vWorldSpacePosition.y / fogLevel))), 0.0, 1.0);
  vec4 final = mix(uFogColor / 255.0, color, fogFactor);
  final = mix(final, uFogColor / 255.0, 1.0 - vVisibility);
  final.a = uAlpha;
  {
    vec3 projCoords = vShadowCoords.xyz / vShadowCoords.w;
    if (
      projCoords.x <= 1.0 && projCoords.x >= 0.0 &&
      projCoords.y <= 1.0 && projCoords.y >= 0.0
    ) final += vec4(0,0,0,0);
  }
  // out
  {
    fragColor = final;
    glowColor = vec4(0);
    occlusionColor = vec4(vOcclusionVisibility,0,0,1);
  }
}
