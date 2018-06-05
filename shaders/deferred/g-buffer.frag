#version 300 es

precision mediump float;

in vec2 vTextureCoord;

out vec4 fragColor;

uniform float uTime;

uniform vec4 uClipPlane;

uniform vec4 uFogColor;

uniform vec3 uLightPosition;
uniform vec3 uCameraPosition;

uniform sampler2D uAlbedoSampler;

const float ALPHA_TRESHOLD = 0.004;

void main(void) {
  ivec2 fragCoord = ivec2(gl_FragCoord.xy);

  vec4 albedo = texelFetch(uAlbedoSampler, fragCoord, 0);

  vec4 color = vec4(0);
  // texture color
  {
    color = albedo;
    if (color.a <= ALPHA_TRESHOLD) discard;
  }
  // out
  {
    fragColor = color;
  }
}
