#version 300 es

precision highp float;

layout (location = 0) out vec4 fragColor;

in vec4 vClipSpace;
in vec2 vTextureCoords;
in vec3 vCameraPosition;
in vec4 vWorldSpacePosition;

uniform float uTime;

uniform sampler2D uReflectionTexture;
uniform sampler2D uRefractionTexture;
uniform sampler2D uDudvTexture;
uniform sampler2D uNormalTexture;
uniform sampler2D uRefractionDepthTexture;

const float distortionStrength = 0.0075;
const float waveMovementSpeed = 0.95;

vec3 ambientLight = vec3(255, 251, 131) / 255.0;
vec3 directionalLightColor = vec3(0.75, 0.75, 0.75);

void main(void) {

  vec2 nDeviceCoord = (vClipSpace.xy / vClipSpace.w) * 0.5 + 0.5;

  vec2 reflectTextureCoord = vec2(nDeviceCoord.x, -nDeviceCoord.y);
  vec2 refractTextureCoord = vec2(nDeviceCoord.x, nDeviceCoord.y);

  float far = 4096.0;
  float near = 1.0;

  float depth = texture(uRefractionDepthTexture, refractTextureCoord).r;

  // floor
  float floorDistance = (
    2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near))
  );
  // water
  depth = gl_FragCoord.z;
  float waterDistance = (
    2.0 * near * far / (far + near - (2.0 * depth - 1.0) * (far - near))
  );
  float waterDepth = floorDistance - waterDistance;

  float waveMovement = uTime * waveMovementSpeed / 1e4;

  vec2 distortion = vec2(
    (texture(uDudvTexture, vec2(vTextureCoords.x + waveMovement, vTextureCoords.y)).rg * 2.0 - 1.0) + 
    (texture(uDudvTexture, vec2(-vTextureCoords.x + waveMovement, vTextureCoords.y + waveMovement)).rg * 2.0 - 1.0)
  ) * distortionStrength;

  reflectTextureCoord += distortion;
  refractTextureCoord += distortion;

  // clamp
  reflectTextureCoord.x = clamp(reflectTextureCoord.x, 0.001, 0.999);
  reflectTextureCoord.y = clamp(reflectTextureCoord.y, -0.999, -0.001);
  refractTextureCoord = clamp(refractTextureCoord, 0.001, 0.999);

  vec4 colorA = texture(uReflectionTexture, reflectTextureCoord);
  vec4 colorB = texture(uRefractionTexture, refractTextureCoord);

  vec4 normalColor = texture(uNormalTexture, distortion);
  vec3 normal = vec3(normalColor.r * 2.0 - 1.0, -normalColor.b, normalColor.g * 2.0 - 1.0);

  vec3 unitNormal = (normal);

  vec4 color = mix(colorA, colorB * 0.5, 0.5);
  color.a = clamp(waterDepth / 4.0, 0.0, 1.0);

  fragColor = color;

}
