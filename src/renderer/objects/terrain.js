import {
  clamp,
  baryCentric,
  calculateTangentsBitangents
} from "../../utils";

import WebGLObject from "./object";

import SimplexNoise from "../../simplex-noise";

let SCALE = 6;
let SIZE = 512 * SCALE;
let VERTEX_COUNT = 256;

/**
 * A simple terrain
 * @class Terrain
 * @extends WebGLObject
 */
export default class Terrain extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.shadowTexture = null;
    this.lightSpaceMatrix = mat4.create();
    this.init();
  }
};

Terrain.prototype.init = function() {
  let gl = this.gl;
  let renderer = this.renderer;
  let opts = {
    width: 2048, height: 2048,
    wrap: {
      s: gl.CLAMP_TO_EDGE,
      t: gl.CLAMP_TO_EDGE,
      r: gl.CLAMP_TO_EDGE
    },
    attachments: [
      { format: gl.DEPTH_COMPONENT32F, size: gl.FLOAT }
    ]
  };
  this.shadowTexture = renderer.createFrameBuffer(opts);
};

Terrain.prototype.bufferShadows = function(cbDrawScene) {
  let gl = this.gl;
  let renderer = this.renderer;
  let shadowTexture = this.shadowTexture;
  let program = renderer.useRendererProgram("object-shadow");
  let variables = program.locations;
  // setup fbo
  {
    renderer.useFrameBuffer(shadowTexture);
    gl.clear(gl.DEPTH_BUFFER_BIT);
  }
  // setup camera
  {
    camera.mode = 1;
    // enable orthographic projection
    renderer.useCamera(camera);
    // disable clipping
    //renderer.resetClipPlane();
    // we only care about back faces
    gl.cullFace(gl.FRONT);
  }
  // move camera to light source
  {
    let mProjection = renderer.getProjectionMatrix();
    let rotation = new Float32Array([0.9, -0.0, 0.0]);
    let position = new Float32Array([350.0, -750.0, 1000]);
    let mView = mat4.create();
    mat4.rotateX(mView, mView, rotation[0]);
    mat4.rotateY(mView, mView, rotation[1]);
    mat4.rotateZ(mView, mView, rotation[2] - Math.PI);
    mat4.translate(mView, mView, [-position[0], -position[1], -position[2]]);
    this.lightSpaceMatrix = mat4.multiply(
      mat4.create(),
      mProjection,
      mView
    );
  }
  // send uniforms
  {
    gl.uniformMatrix4fv(variables.uLightSpaceMatrix, false, this.lightSpaceMatrix);
  }
  // draw objects
  {
    objects.map(obj => {
      if (
        obj.isInstanced ||
        obj.light ||
        !camera.isObjectInView(obj)
      ) return;
      renderer.renderShadow(obj);
    });
  }
  // restore
  {
    camera.mode = 0;
    gl.cullFace(gl.BACK);
    renderer.useCamera(camera);
    renderer.restoreFrameBuffer();
  }
};

Terrain.prototype.calculateNormal = function(x, y, heights) {
  let length = heights.length;
  let l = heights[clamp((y * VERTEX_COUNT) + (x - 1), 0, length)];
  let r = heights[clamp((y * VERTEX_COUNT) + (x + 1), 0, length)];
  let d = heights[clamp(((y - 1) * VERTEX_COUNT) + x, 0, length)];
  let u = heights[clamp(((y + 1) * VERTEX_COUNT) + x, 0, length)];
  let norm = vec3.create();
  vec3.set(norm, (l - r), -10, (d - u));
  vec3.normalize(norm, norm);
  return norm;
};

Terrain.prototype.getHeightAt = function(x, y, z) {
  // bring input to world space
  {
    let vec = vec4.fromValues(x, y, z, 0.0);
    let mModel = this.getModelMatrix();
    let mModelInverse = mat4.invert(mat4.create(), mModel);
    vec4.transformMat4(vec, vec, mModelInverse);
    x = vec[0];
    z = vec[2];
  }
  let heights = this.heights;
  let tx = z - this.translate.x;
  let tz = x - this.translate.z;
  let sqSize = SIZE / (VERTEX_COUNT - 1);
  let gx = Math.floor(tx / sqSize);
  let gz = Math.floor(tz / sqSize);
  if (
    (gx >= (VERTEX_COUNT - 1) || gx < 0) ||
    (gz >= (VERTEX_COUNT - 1) || gz < 0)
  ) return 0;
  let xCoord = (tx % sqSize) / sqSize;
  let zCoord = (tz % sqSize) / sqSize;
  let result = null;
  if (xCoord <= (1 - zCoord)) {
    result = baryCentric(
      [0, heights[((gz + 0) * (VERTEX_COUNT)) + (gx + 0)], 0],
      [1, heights[((gz + 0) * (VERTEX_COUNT)) + (gx + 1)], 0],
      [0, heights[((gz + 1) * (VERTEX_COUNT)) + (gx + 0)], 1],
      [xCoord, zCoord]
    );
  } else {
    result = baryCentric(
      [1, heights[((gz + 0) * (VERTEX_COUNT)) + (gx + 1)], 0],
      [1, heights[((gz + 1) * (VERTEX_COUNT)) + (gx + 1)], 1],
      [0, heights[((gz + 1) * (VERTEX_COUNT)) + (gx + 0)], 1],
      [xCoord, zCoord]
    );
  }
  return result;
};

/**
 * Create cube data
 */
Terrain.prototype.createMesh = function() {
  let data = this.data;

  let count = VERTEX_COUNT * VERTEX_COUNT;

  let noise = new SimplexNoise(Math.random.bind(this));

  let vertices = new Float32Array(count * 3);
  let normals = new Float32Array(count * 3);
  let indices = new Uint16Array(6 * (VERTEX_COUNT - 1) * (VERTEX_COUNT - 1));
  let uvs = new Float32Array(count * 2);

  let freq = 0.0125;
  let ampl = SCALE ** 2.125;
  let heights = new Float32Array(VERTEX_COUNT * VERTEX_COUNT);

  // build height data
  {
    for (let z = 0; z < VERTEX_COUNT; ++z) {
      for (let x = 0; x < VERTEX_COUNT; ++x) {
        let n = (
          1 * noise.noise2D((1 * x) * freq, (1 * z) * freq) * ampl +
          0.25 * noise.noise2D((2 * x) * freq, (2 * z) * freq) * ampl +
          0.125 * noise.noise2D((4 * x) * freq, (4 * z) * freq) * ampl
        );
        heights[(z * VERTEX_COUNT) + x] = n;
      };
    };
  }

  {
    for (let z = 0; z < VERTEX_COUNT; ++z) {
      for (let x = 0; x < VERTEX_COUNT; ++x) {
        let index = (z * VERTEX_COUNT) + x;
        let height = heights[index];
        // vert
        vertices[index * 3 + 0] = (z / (VERTEX_COUNT - 1) * SIZE);
        vertices[index * 3 + 1] = height;
        vertices[index * 3 + 2] = x / (VERTEX_COUNT - 1) * SIZE;
        // normal
        let normal = this.calculateNormal(x, z, heights);
        normals[index * 3 + 0] = normal[0];
        normals[index * 3 + 1] = normal[1];
        normals[index * 3 + 2] = normal[2];
        // uv
        uvs[index * 2 + 0] = (z / (VERTEX_COUNT - 1)) * 16.0;
        uvs[index * 2 + 1] = (x / (VERTEX_COUNT - 1)) * 16.0;
      };
    };
  }

  let pointer = 0;
  for (let gz = 0; gz < VERTEX_COUNT - 1; gz++) {
    for (let gx = 0; gx < VERTEX_COUNT - 1; gx++) {
      let topLeft = (gz * VERTEX_COUNT) + gx;
      let topRight = topLeft + 1;
      let bottomLeft = ((gz + 1) * VERTEX_COUNT) + gx;
      let bottomRight = bottomLeft + 1;
      indices[pointer++] = topLeft;
      indices[pointer++] = bottomLeft;
      indices[pointer++] = topRight;
      indices[pointer++] = topRight;
      indices[pointer++] = bottomLeft;
      indices[pointer++] = bottomRight;
    };
  };

  this.heights = heights;

  data.vertices = vertices;
  data.normals = normals;
  data.indices = indices;
  data.uvs = uvs;

  let tabi = calculateTangentsBitangents(this);
  data.tangents = tabi.tangents;
  data.bitangents = tabi.bitangents;

};
