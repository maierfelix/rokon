#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform float uTime;
uniform sampler2D uSampler;

void main(void) {
  vec4 color = texture(uSampler, vTextureCoord);
  fragColor = color;
}
