#version 300 es

precision mediump float;

in vec2 vTextureCoord;
in vec4 vWorldSpacePosition;

out vec4 fragColor;

uniform float uTime;
uniform sampler2D uSampler;
uniform vec2 uScreenSpaceLightPos;

const int NUM_SAMPLES = 100;
const float density = 1.99;
const float decay = 0.975;
const float exposure = 0.2;
const float weight = 1.0;

void main(void) {
  vec2 deltaTextCoord = vec2(vTextureCoord - uScreenSpaceLightPos);
  vec2 textCoo = vTextureCoord;
  deltaTextCoord *= 1.0 /  float(NUM_SAMPLES) * density;
  float illuminationDecay = 1.0;
  vec3 final = vec3(0);
  if (texture(uSampler, textCoo).a == 1.0) {
    for (int ii = 0; ii < NUM_SAMPLES; ++ii) {
      textCoo -= deltaTextCoord;
      vec3 color = texture(uSampler, textCoo).rgb * 0.425;
      color *= illuminationDecay * weight;
      final += color;
      illuminationDecay *= decay;
    };
  }
  fragColor = vec4(final * exposure, 1.0);
}
