#version 300 es

precision mediump float;

uniform sampler2D uSampler;

in vec2 vTextureCoord;

out vec4 fragColor;

void main() {

  vec4 color = texture(uSampler, vTextureCoord);

  vec4 sum = vec4(0);
  for (int i = -2; i <= 2; i++) {
    for (int j = -2; j <= 2; j++) {
      vec2 offset = vec2(i, j) * 0.005;
      sum += texture(uSampler, vTextureCoord + offset);
    }
  };
  color = (sum / 30.0) + color;
  fragColor = color;

}
