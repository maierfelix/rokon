#version 300 es

precision mediump float;

uniform sampler2D uSampler;

in vec2 vTextureCoord;

const float ALPHA_TRESHOLD = 0.004;

void main(void) {
  vec4 texelColor = texture(uSampler, vTextureCoord);
  if (texelColor.a <= ALPHA_TRESHOLD) discard;
}
