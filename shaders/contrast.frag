#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform float uTime;
uniform float uContrast;
uniform sampler2D uSampler;

void main(void) {
  vec4 color = texture(uSampler, vTextureCoord);
  color.rgb = (color.rgb - 0.5) * (1.0 + uContrast) + 0.5;
  if (color.a <= 0.004) discard;
  fragColor = color;
}
