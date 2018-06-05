#version 300 es

precision mediump float;

in vec2 aPosition;

out vec2 vBlurTexCoords[11];

uniform vec2 uDirection;
uniform vec2 uResolution;

void main(void) {
  vec2 textureCoord = aPosition * 0.5 + 0.5; 
  float pxSize = 1.0;
  // blur direction
  if (uDirection.x == 1.0) pxSize = 1.0 / uResolution.x;
  else if (uDirection.y == 1.0) pxSize = 1.0 / uResolution.y;
  // blur kernel
  for (int ii = -5; ii <= 5; ++ii) {
    float px = pxSize * float(ii);
    vec2 step = vec2(px * uDirection.x, px * uDirection.y);
    vBlurTexCoords[ii + 5] = textureCoord + step;
  };
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
