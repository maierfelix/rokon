#version 300 es

precision mediump float;

uniform float uTime;
uniform sampler2D uSampler;

out vec4 fragColor;

in vec2 vBlurTexCoords[11];

void main() {
  vec4 color = vec4(0);
  color += texture(uSampler, vBlurTexCoords[0]) * 0.0093;
  color += texture(uSampler, vBlurTexCoords[1]) * 0.028002;
  color += texture(uSampler, vBlurTexCoords[2]) * 0.065984;
  color += texture(uSampler, vBlurTexCoords[3]) * 0.121703;
  color += texture(uSampler, vBlurTexCoords[4]) * 0.175713;
  color += texture(uSampler, vBlurTexCoords[5]) * 0.198596;
  color += texture(uSampler, vBlurTexCoords[6]) * 0.175713;
  color += texture(uSampler, vBlurTexCoords[7]) * 0.121703;
  color += texture(uSampler, vBlurTexCoords[8]) * 0.065984;
  color += texture(uSampler, vBlurTexCoords[9]) * 0.028002;
  color += texture(uSampler, vBlurTexCoords[10]) * 0.0093;
  fragColor = color * 1.25;
}
