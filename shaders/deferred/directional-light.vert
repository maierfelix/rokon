#version 300 es

precision mediump float;

in vec2 aPosition;

void main(void) {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
