#version 300 es

precision mediump float;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gEmissive;
layout (location = 4) out vec4 gRSMA;

in vec4 vClipSpace;
in vec2 vTextureCoords;
in vec3 vCameraPosition;
in vec4 vWorldSpacePosition;

uniform float uTime;

uniform sampler2D uReflectionTexture;
uniform sampler2D uRefractionTexture;
uniform sampler2D uDudvTexture;
uniform sampler2D uAnimeTexture1;
uniform sampler2D uNormalTexture;
uniform sampler2D uRefractionDepthTexture;

const float distortionStrength = 3.25;
const float waveMovementSpeed = 2.5;

vec3 ambientLight = vec3(255, 251, 131) / 255.0;
vec3 directionalLightColor = vec3(0.75, 0.75, 0.75);

void main(void) {

  vec2 nDeviceCoord = (vClipSpace.xy / vClipSpace.w) * 0.5 + 0.5;

  vec2 reflectTextureCoord = vTextureCoords;
  vec2 refractTextureCoord = vTextureCoords;

  float far = 4096.0;
  float near = 1.0;

  float depth = texture(uRefractionDepthTexture, vec2(nDeviceCoord.x, nDeviceCoord.y)).r;

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

  float dudvScale = 0.0125;
  vec2 distortion = waveMovement + vec2(
    (texture(uDudvTexture, vec2(vTextureCoords.x + waveMovement, vTextureCoords.y)).r * dudvScale - 1.0) + 
    (texture(uDudvTexture, vec2(-vTextureCoords.x + waveMovement, vTextureCoords.y + waveMovement)).r * dudvScale - 1.0)
  ) * distortionStrength;

  reflectTextureCoord += distortion;
  refractTextureCoord += distortion;

  // clamp
  reflectTextureCoord.x = clamp(reflectTextureCoord.x, 0.001, 0.999);
  reflectTextureCoord.y = clamp(reflectTextureCoord.y, -0.999, -0.001);
  refractTextureCoord = clamp(refractTextureCoord, 0.001, 0.999);

  vec4 normalColor = texture(uNormalTexture, distortion);
  vec3 normal = vec3(normalColor.r * 2.0 - 1.0, -normalColor.b, normalColor.g * 2.0 - 1.0);

  vec3 unitNormal = (normal);

  vec4 color = texture(uAnimeTexture1, vTextureCoords);
  //color.a = clamp(waterDepth / 10.0, 0.0, 1.0);

  vec4 baseColor = vec4(37, 192, 244, 255) / 200.0;

  vec4 animTex1 = texture(uAnimeTexture1, (vTextureCoords + distortion) * 0.025) * 1.5;
  vec4 animTex2 = texture(uAnimeTexture1, (vTextureCoords + distortion + 1.5) * 0.2) * 2.25;
  vec4 animTex3 = texture(uAnimeTexture1, ((vTextureCoords * 0.1) + (distortion * 0.1) - 0.5) * 1.75);

  waterDepth = clamp(waterDepth - 0.15, 0.0, 1.0);

  gPosition = vWorldSpacePosition;
  gNormal = vec4(vec3(1), 0);
  gAlbedo = vec4(mix(animTex1.rgb, animTex2.rgb, 0.5), 1.0) * (animTex3 * smoothstep(0.0, 1.0, waterDepth) * 1.1);
  gEmissive = vec4(0.0);
  gRSMA = vec4(0.25,0.0,0.75,0.0);

}
