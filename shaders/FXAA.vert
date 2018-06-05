#version 300 es

precision mediump float;

in vec2 aPosition;

out vec2 vRgbNW;
out vec2 vRgbNE;
out vec2 vRgbSW;
out vec2 vRgbSE;
out vec2 vRgbM;
out vec2 vTextureCoord;

uniform vec2 uResolution;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void texcoords(
  vec2 fragCoord, vec2 resolution,
  out vec2 v_rgbNW, out vec2 v_rgbNE,
  out vec2 v_rgbSW, out vec2 v_rgbSE,
  out vec2 v_rgbM
) {
  vec2 inverseVP = 1.0 / resolution.xy;
  v_rgbNW = (fragCoord + vec2(-1.0, -1.0)) * inverseVP;
  v_rgbNE = (fragCoord + vec2(1.0, -1.0)) * inverseVP;
  v_rgbSW = (fragCoord + vec2(-1.0, 1.0)) * inverseVP;
  v_rgbSE = (fragCoord + vec2(1.0, 1.0)) * inverseVP;
  v_rgbM = vec2(fragCoord * inverseVP);
}

void main(void) {
  vec2 textureCoord = aPosition * 0.5 + 0.5;
  vec2 fragCoord = textureCoord * uResolution;
  texcoords(fragCoord, uResolution, vRgbNW, vRgbNE, vRgbSW, vRgbSE, vRgbM);
  gl_Position = vec4(aPosition, 0.0, 1.0);
  vTextureCoord = textureCoord; 
}
