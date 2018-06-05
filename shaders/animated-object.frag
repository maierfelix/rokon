#version 300 es

precision mediump float;

in vec3 vLighting;
in vec4 vPosition;
in vec4 vClipPlane;
in vec2 vTextureCoord;
in vec4 vWorldSpacePosition;

out vec4 fragColor;

uniform float uTime;
uniform float uAlpha;
uniform sampler2D uSampler;

float fogLevel = 2.25;
vec4 fogColor = vec4(180, 224, 255, 255) / 255.0;

void main(void) {
  // clipping plane
  if (dot(vWorldSpacePosition, vClipPlane) < 0.0) discard;
  // texture color
  vec4 texelColor = texture(uSampler, vTextureCoord);
  vec4 color = vec4(texelColor.rgb * vLighting, texelColor.a);
  // apply fog
  float fogFactor = clamp(smoothstep(0.0, fogLevel, max(0.0, 1.0 - (vWorldSpacePosition.y / fogLevel))), 0.0, 1.0);
  vec4 final = mix(fogColor, color, fogFactor);
  final.a = uAlpha;
  //final.r += -(cos(uTime * 0.0025)) * 0.2;
  //final.g += (sin(uTime * 0.0025)) * 0.2;
  fragColor = final;
}
