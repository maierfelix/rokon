#version 300 es

precision mediump float;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

uniform sampler2D uPositionSampler;
uniform sampler2D uNormalSampler;
uniform sampler2D uAlbedoSampler;
uniform sampler2D uEmissiveSampler;
uniform sampler2D uRSMASampler;

out vec4 fragColor;

const float ALPHA_TRESHOLD = 0.004;

const vec3 ambientLight = vec3(144) / 255.0;
const vec3 directionalLightColor = vec3(239, 210, 183) / 255.0;

void main(void) {
  ivec2 fragCoord = ivec2(gl_FragCoord.xy);
  vec4 albedo = texelFetch(uAlbedoSampler, fragCoord, 0);
  if (albedo.a <= ALPHA_TRESHOLD) discard;

  vec3 worldPosition = texelFetch(uPositionSampler, fragCoord, 0).xyz;
  vec3 normal = texelFetch(uNormalSampler, fragCoord, 0).xyz;

  vec3 unitNormal = normalize(normal);
  vec3 unitLight = normalize(uLightPosition - worldPosition);

  vec4 color = albedo;
  float diffuseLighting = max(dot(unitNormal, unitLight), 0.5);
  color.rgb *= (ambientLight + directionalLightColor) * diffuseLighting;
  fragColor = color;
}
