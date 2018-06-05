#version 300 es

precision mediump float;

in vec4 aVertexPosition;
in vec3 aVertexNormal;
in vec2 aTextureCoord;

out vec4 vPosition;
out vec3 vLighting;
out vec4 vClipPlane;
out vec2 vTextureCoord;
out vec4 vWorldSpacePosition;

uniform float uTime;
uniform float uAlpha;
uniform int uWireframe;
uniform vec4 uClipPlane;

uniform mat4 uModelMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

vec3 ambientLight = vec3(255, 251, 131) / 255.0;
vec3 directionalLightColor = vec3(1, 1, 1);
vec3 directionalVector = normalize(vec3(0.5, 0.5, 0.5));

// skeletal animation
const int MAX_JOINTS = 50;
const int MAX_WEIGHTS = 3;
in vec3 aJointIndices;
in vec3 aWeights;
uniform mat4 uJointTransforms[MAX_JOINTS];

void main(void) {
  vec4 vertexPosition = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
  vec4 worldSpacePosition = uModelMatrix * aVertexPosition;
  // lighting
  vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

  // animation
  vec4 totalLocalPos = vec4(0.0);
  vec4 totalNormal = vec4(0.0);

  for (int ii = 0; ii < MAX_WEIGHTS; ++ii) {
    mat4 jointTransform = uJointTransforms[int(aJointIndices[ii])];
    vec4 posePosition = jointTransform * vec4(aVertexPosition.xyz, 1.0);
    totalLocalPos += posePosition * aWeights[ii];

    vec4 worldNormal = jointTransform * vec4(aVertexNormal, 0.0);
    totalNormal += worldNormal * aWeights[ii];
  };

  // position
  gl_Position = vertexPosition * totalLocalPos;
  // varyings
  vClipPlane = uClipPlane;
  vTextureCoord = aTextureCoord;
  vPosition = vertexPosition;
  vWorldSpacePosition = worldSpacePosition;
  float directional = max(dot(transformedNormal.xyz * totalNormal.xyz, directionalVector), 0.0);
  if (uWireframe != 1) vLighting = ambientLight + (directionalLightColor * directional);
}
