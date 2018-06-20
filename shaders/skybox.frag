#version 300 es

precision mediump float;

in vec3 vTextureCoord;

out vec4 fragColor;

uniform samplerCube uSkyCube;

const vec3 ambientLight = vec3(255) / 255.0;
const vec3 directionalLightColor = vec3(150, 80, 50) / 512.0;

void main(void) {
  vec4 color = texture(uSkyCube, vTextureCoord);
  color = vec4(32) / 255.0;
  color.rgb *= (ambientLight + directionalLightColor) * 1.1;
  fragColor = color;
}
