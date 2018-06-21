#version 300 es

precision mediump float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gEmissive;
layout (location = 4) out vec4 gRSMA;

in float vVisibility;
in float vOcclusionVisibility;
in vec2 vTextureCoords;
in vec4 vShadowCoords;
in vec3 vSurfaceNormal;
in vec3 vReflectPosition;
in vec4 vWorldSpacePosition;
in vec3 vLightPosition;
in vec3 vCameraPosition;
in vec4 vVertexLightPosition;

in mat3 vTBN;

uniform float uTime;
uniform float uAlpha;
uniform float uGlowing;
uniform vec4 uClipPlane;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

// bools
uniform bool uHasRSMMap;
uniform bool uIsLightSource;
uniform bool uHasNormalMap;
uniform bool uHasShadowMap;
uniform bool uHasSpecularMap;
uniform bool uHasEmissiveMap;
uniform bool uHasSpecularLighting;
uniform bool uHasEnvironmentMap;
uniform bool uHasMetalnessMap;
uniform bool uHasRoughnessMap;
uniform bool uHasAmbientOcclusionMap;

uniform vec4 uFogColor;
uniform float uGlossFactor;

// texture samplers
uniform sampler2D uRSMMap;
uniform sampler2D uSampler;
uniform sampler2D uNormalMap;
uniform sampler2D uShadowMap;
uniform sampler2D uSpecularMap;
uniform sampler2D uEmissiveMap;
uniform sampler2D uMetalnessMap;
uniform sampler2D uRoughnessMap;
uniform sampler2D uAmbientOcclusionMap;
uniform samplerCube uEnvironmentMap;

// texture scales
uniform vec2 uSamplerScale;

float fogLevel = 2.25;

const int PCF_COUNT = 2;

const float ALPHA_TRESHOLD = 0.04;
const float TOTAL_TEXELS = (
  float(PCF_COUNT) * 2.0 + 1.0) * (float(PCF_COUNT) * 2.0 + 1.0
);

float shadowCalculation(vec4 fragPosLightSpace, float bias) {
  // perform perspective divide
  vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
  // transform to [0,1] range
  projCoords = projCoords * 0.5 + 0.5;
  // get closest depth value from light's perspective (using [0,1] range fragPosLight as coords)
  float closestDepth = texture(uShadowMap, projCoords.xy).r; 
  // get depth of current fragment from light's perspective
  float currentDepth = projCoords.z;
  // check whether current frag pos is in shadow
  float shadow = currentDepth - bias > closestDepth ? 1.0 : 0.0;
  if (projCoords.z > 1.0) shadow = 0.0;
  return shadow;
}

void main(void) {
  vec4 rsma = vec4(0.0, 0.0, 0.0, 1.0);
  vec4 color = vec4(0.0);
  vec4 emissive = vec4(0.0);
  vec4 envColor = vec4(0.0);
  vec2 texCoord = vTextureCoords;
  float lightFactor = 1.0;
  // clipping plane
  if (dot(vWorldSpacePosition, uClipPlane) < 0.0) discard;
  vec3 surfaceNormal = (vSurfaceNormal);
  // texture color
  {
    color = texture(uSampler, texCoord * uSamplerScale);
    if (color.a <= ALPHA_TRESHOLD) discard;
  }
  // normal mapping
  if (uHasNormalMap) {
    vec3 normal = texture(uNormalMap, texCoord).rgb;
    normal = (normal * 2.0 - 1.0);
    surfaceNormal = (vTBN * normal);
  }
  // environment mapping
  if (uHasEnvironmentMap) {
    vec3 view = normalize(vWorldSpacePosition.xyz - uCameraPosition);
    vec3 normal = normalize(surfaceNormal);
    float refractRatio = 1.0 / 1.52;
    vec4 reflectColor = texture(uEnvironmentMap, reflect(view, normal));
    vec4 refractColor = texture(uEnvironmentMap, refract(view, normal, refractRatio));
    vec4 environmentColor = mix(reflectColor, refractColor, 1.5);
    envColor = environmentColor * 1.0;
  }
  // shadow mapping
  lightFactor = (
    uHasShadowMap ?
    1.0 - (shadowCalculation(vVertexLightPosition, 0.0)) * 0.175 :
    lightFactor
  );
  // RSMA mapping
  // Roughness | Specular | Metalness | Ambient Occlusion
  if (!uHasRSMMap) {
    // roughness
    rsma.x = (
      uHasRoughnessMap ?
      texture(uRoughnessMap, texCoord).r :
      0.0
    );
    // specular
    rsma.y = (
      uHasSpecularMap ?
      texture(uSpecularMap, texCoord).r :
      0.0
    );
    // metalness
    rsma.z = (
      uHasMetalnessMap ?
      texture(uMetalnessMap, texCoord).r :
      0.0
    );
    // ao
    rsma.w = (
      uHasAmbientOcclusionMap ?
      texture(uAmbientOcclusionMap, texCoord).r :
      1.0
    );
  // use joined RSM map
  } else {
    vec4 rsmTexture = texture(uRSMMap, texCoord);
    //rsma.xyz = texture(uRSMMap, texCoord).rgb;
    // roughness
    rsma.x = rsmTexture.r;
    // specular
    rsma.y = rsmTexture.g;
    // metalness
    rsma.z = rsmTexture.b;
  }
  // emissive
  emissive = (
    uHasEmissiveMap ?
    texture(uEmissiveMap, texCoord) :
    vec4(0.0)
  );
  // environment color
  //color = (envColor) * 1.25;
  // apply fog
  {
    //color = mix(color, uFogColor / 255.0, 1.0 - vVisibility);
  }
  // out
  {
    gPosition = vWorldSpacePosition;
    gNormal = vec4(surfaceNormal, 0);
    gAlbedo = color * lightFactor;
    gEmissive = emissive;
    gRSMA = rsma;
  }
}
