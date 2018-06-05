#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform sampler2D uSampler;

uniform vec3 uBackgroundColor;

void main() {
  vec4 color = texture(uSampler, vTextureCoord);
  float rgb = color.r + color.g + color.b;
  float rgba = rgb + color.a;
  if (rgba >= 4.0) color = vec4(1,1,1,1);
  else if (color.r > 0.0) color = vec4(0,0,0,1);
  else color = vec4(uBackgroundColor / 255.0, 1.0);
  fragColor = color;
}
