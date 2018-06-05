#version 300 es

precision mediump float;

layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec4 glowColor;
layout (location = 2) out vec4 occlusionColor;

// instanced
in float vAlpha;
in float vGlowing;

in vec3 vLighting;
in float vVisibility;
in float vOcclusionVisibility;
in vec2 vTextureCoord;
in vec3 vSurfaceNormal;
in vec3 vLightPosition;
in vec3 vCameraPosition;
in vec4 vWorldSpacePosition;

uniform float uTime;
uniform float uAlpha;
uniform float uGlowing;
uniform vec4 uClipPlane;

// bools
uniform bool uIsLightSource;
uniform bool uHasNormalMap;
uniform bool uHasSpecularMap;
uniform bool uHasSpecularLighting;

uniform vec4 uFogColor;
uniform float uGlossFactor;

uniform sampler2D uSampler;
uniform sampler2D uNormalMap;
uniform sampler2D uSpecularMap;

float fogLevel = 2.25;

const float ALPHA_TRESHOLD = 0.004;

void main(void) {
  vec4 final;
  vec4 color;
  // clipping plane
  if (dot(vWorldSpacePosition, uClipPlane) < 0.0) discard;
  vec3 unitNormal = normalize(vSurfaceNormal);
  vec3 unitLight = normalize(vLightPosition);
  vec3 unitCamera = normalize(vCameraPosition);
  // texture color
  {
    color = texture(uSampler, vTextureCoord);
    if (color.a <= ALPHA_TRESHOLD) discard;
  }
  // normal mapping
  if (uHasNormalMap) {
    vec3 normal = texture(uNormalMap, vTextureCoord).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    unitNormal = normal;
  }
  // diffuse lighting
  {
    vec3 lightDir = unitLight;
    float diffuse = max(dot(unitNormal, lightDir), 0.5);
    color.rgb *= vLighting * diffuse;
  }
  // specular lighting
  if (uHasSpecularLighting || uHasNormalMap) {
    float diff = max(0.0, dot(unitNormal, unitLight));
    float nh = max(0.0, dot(unitNormal, normalize(unitLight + unitCamera)));
    float shineFactor = (uGlossFactor * 10.0) * 1.25;
    float damp = pow(nh, shineFactor) * uGlossFactor * sqrt(diff);
    if (dot(unitNormal, unitLight) < 0.0) damp = 0.0;
    color.rgb += damp;
  }
  // specular mapping
  if (uHasSpecularMap) {
    color.rgb += texture(uSpecularMap, vTextureCoord).rgb * 0.5;
  }
  // apply fog
  {
    final = mix(color, uFogColor / 255.0, 1.0 - vVisibility);
  }
  // out
  {
    fragColor = final;
    glowColor = vec4(0);
    if (uIsLightSource) occlusionColor = vec4(1);
    else occlusionColor = vec4(vOcclusionVisibility,0,0,1);
  }
}
