#version 300 es

precision highp float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;
uniform float uLightIntensity;

uniform float uLightRadius;
uniform vec3 uLightColor;

uniform sampler2D uPositionSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uAlbedoSampler;
uniform sampler2D uEmissiveSampler;
uniform sampler2D uRSMASampler;

layout (location = 0) out vec4 fragColor;
layout (location = 1) out vec3 brightLevel;

const float PI = 3.141592653589793;

float BRDF_D_GGX(float NdotH, float roughness) {
  float roughness2 = roughness * roughness;
  float roughness4 = roughness2 * roughness2;
  float denomA = (NdotH * NdotH * (roughness4 - 1.0) + 1.0);
  return roughness4 / (PI * denomA * denomA);
}

vec3 BRDF_F_FresnelSchlick(float VdotH, vec3 F0) {
  return (F0 + (1.0 - F0) * (pow(1.5 - max(VdotH, 0.0), 5.0)));
}

float BRDF_G_SchlickGGX(float NdotV, float roughness) {
  float k = (roughness * roughness) / 2.0;
  return (NdotV) / (NdotV * (1.0 - k) + k);
}

float BRDF_G_Smith(float NdotV, float NdotL, float roughness) {
  NdotV = max(NdotV, 0.0);
  NdotL = max(NdotL, 0.0);
  return BRDF_G_SchlickGGX(NdotV, roughness) * BRDF_G_SchlickGGX(NdotL, roughness);
}

float calcAttenuation(float distToFragment, float lightRadius) {
  float att = clamp(1.0 - distToFragment * distToFragment / (lightRadius * lightRadius), 0.0, 1.0);
  att *= att;
  return att;
}

void main(void) {
  ivec2 fragCoord = ivec2(gl_FragCoord.xy);

  vec3 position = texelFetch(uPositionSampler, fragCoord, 0).xyz;

  float dist = length(uLightPosition - position);
  float atten = calcAttenuation(dist, uLightRadius);
  if (atten == 0.0) discard;

  vec3 lightColor = (uLightColor / 255.0);

  vec3 normal = texelFetch(uNormalSampler, fragCoord, 0).xyz;
  vec3 albedo = texelFetch(uAlbedoSampler, fragCoord, 0).xyz;
  vec3 emissive = texelFetch(uEmissiveSampler, fragCoord, 0).xyz;
  vec4 rsma = texelFetch(uRSMASampler, fragCoord, 0);

  float roughness = max(rsma.x, 0.05);
  float specularity = max(rsma.y, 0.0);
  float metalness = max(rsma.z, 0.0);
  float ao = max(rsma.w, 0.0);

  float sum = (
    rsma.x + rsma.y + rsma.z + rsma.w
  );

  if (sum <= 0.01) discard;

  vec3 fragToLightNormal = uLightPosition - position;

  vec3 N = normalize(normal); //normal vector
  vec3 L = normalize(fragToLightNormal); //light vector
  vec3 V = normalize(uCameraPosition - position); //eye vector
  vec3 H = normalize(L + V); //half vector

  float NdotH = max(dot(N, H), 0.0);
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float VdotH = max(dot(V, H), 0.0);

  //------------------

  vec3 F0 = vec3(rsma.w);
  //F0 = mix(F0, albedo, metalness);

  float D = BRDF_D_GGX(NdotH, roughness); //normal distribution
  float G = BRDF_G_Smith(NdotV, NdotL, roughness); //geometric shadowing
  vec3 F = BRDF_F_FresnelSchlick(VdotH, F0); // Fresnel

  vec3 specular = ((D * F * G) / max(4.0 * NdotL * NdotV, 0.001));
  //------light----------
  float lightNormalLength = length(fragToLightNormal);
  float attenuation = calcAttenuation(lightNormalLength, uLightRadius);
  vec3 radiance = attenuation * lightColor;
  //-----------

  vec3 kS = F;
  vec3 kD = 1.0 - kS;
  kD *= 1.0 - metalness;

  vec3 diffuse = (albedo * ao) * uLightIntensity * kD / PI;
  vec3 color = ((diffuse + specular) * (radiance) * NdotL) * rsma.w + (emissive);

  vec3 brightness = (specular * radiance * NdotL) * 1.25 * uLightIntensity * kD / PI;

  fragColor = vec4(color, 1.0);
  brightLevel = brightness * 1.5;

}
