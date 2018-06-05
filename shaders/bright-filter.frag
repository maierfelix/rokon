#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform float uTime;
uniform float uContrast;
uniform sampler2D uSampler;

void main(void) {
  vec4 color = texture(uSampler, vTextureCoord);
  float brightness = (color.r * 0.2126) + (color.g * 0.7152) + (color.b * 0.0722);
  fragColor = color * (brightness * 1.25);
}
