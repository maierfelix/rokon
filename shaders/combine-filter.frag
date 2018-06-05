#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform sampler2D uSamplerA;
uniform sampler2D uSamplerB;

uniform float uCombineFactor;

void main() {
  vec4 colorA = texture(uSamplerA, vTextureCoord);
  vec4 colorB = texture(uSamplerB, vTextureCoord);
  vec4 final = mix(colorA, colorB, 0.5);
  fragColor = final;
}
