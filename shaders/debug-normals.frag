#version 300 es

precision mediump float;

layout (location = 0) out vec4 fragColor;

uniform vec4 uColor;

void main(void) {
  fragColor = uColor / 255.0;
}
