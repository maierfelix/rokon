#version 300 es

precision mediump float;

in vec4 vWorldSpacePosition;

layout (location = 0) out vec4 gPosition;
layout (location = 1) out vec4 gNormal;
layout (location = 2) out vec4 gAlbedo;
layout (location = 3) out vec4 gEmissive;
layout (location = 4) out vec4 gRSMA;

void main(void) {
  gPosition = vec4(0);
  gNormal = vec4(0);
  gAlbedo = vec4(1,0,0,1);
  gEmissive = vec4(0);
  gRSMA = vec4(0);
}
