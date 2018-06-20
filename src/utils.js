let uiid = 0;

/**
 * Returns a unique number
 * @return {Number}
 */
export function uid() {
  return uiid++;
};

/**
 * Loads and resolves a text
 * @param {String} path - Path to the text
 * @return {Promise}
 */
export function loadText(path) {
  return new Promise(resolve => {
    fetch(path)
    .then(resp => resp.text())
    .then(resolve);
  });
};

/**
 * Loads and resolves a binary file
 * @param {String} path - Path to the text
 * @return {Promise}
 */
export function loadBinaryFile(path) {
  return new Promise(resolve => {
    fetch(path)
    .then(resp => resp.arrayBuffer())
    .then(buffer => resolve(new Uint8Array(buffer)));
  });
};

/**
 * Loads and resolves an image
 * @param {String} path - Path to the image
 * @return {Promise}
 */
export function loadImage(path) {
  return new Promise(resolve => {
    let img = new Image();
    img.onload = () => resolve(img);
    img.src = path;
  });
};

/**
 * Loads an image and resolves it as a canvas
 * @param {String} path - Path to the image
 * @return {Promise}
 */
export function loadImageAsCanvas(path) {
  return new Promise(resolve => {
    loadImage(path).then(img => {
      let width = img.width;
      let height = img.height;
      let buffer = createCanvasBuffer(width, height);
      let canvas = buffer.canvas;
      buffer.drawImage(img, 0, 0);
      resolve(canvas);
    });
  });
};

/**
 * Creates a canvas with the given dimensions
 * @param {Number} width
 * @param {Number} height
 * @return {Canvas2DRenderingContext}
 */
export function createCanvasBuffer(width, height) {
  let canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let ctx = canvas.getContext("2d");
  return ctx;
};

/**
 * Merges 3 RSM canvae into one canvae
 * @param {HTMLCanvasElement} r
 * @param {HTMLCanvasElement} s
 * @param {HTMLCanvasElement} m
 * @return {Canvas2DRenderingContext}
 */
export function mergeRSMCanvae(r, s, m) {
  let { width, height } = r;
  let buffer = createCanvasBuffer(width, height);
  let imgData = new ImageData(width, height);
  let rData = r.getContext("2d").getImageData(0, 0, width, height);
  let sData = s.getContext("2d").getImageData(0, 0, width, height);
  let mData = m.getContext("2d").getImageData(0, 0, width, height);
  for (let ii = 0; ii < width * height; ++ii) {
    let index = (ii * 4) | 0;
    imgData.data[index + 0] = rData.data[index + 0];
    imgData.data[index + 1] = sData.data[index + 0];
    imgData.data[index + 2] = mData.data[index + 0];
    imgData.data[index + 3] = 255;
  };
  buffer.putImageData(imgData, 0, 0);
  return buffer;
};

/**
 * Indicates if a number is power of two
 * @param {Number} v
 * @return {Boolean}
 */
export function isPowerOf2(v) {
  return (v & (v - 1)) === 0;
};

/**
 * Converts radians to degrees
 * @param {Number} r
 * @return {Number}
 */
export function radToDeg(r) {
  return r * 180 / Math.PI;
};

/**
 * Converts degrees to radians
 * @param {Number} d
 * @return {Number}
 */
export function degToRad(d) {
  return d * Math.PI / 180;
};

/**
 * Clamps number between min, max
 * @param {Number} n
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
export function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
};

/**
 * @param {Number} b - bias
 * @param {Number} t - time 0-1
 * @return {Number}
 */
function biasLerp(b, t) {
  return (t / ((((1.0 / b) - 2.0) * (1.0 - t)) + 1.0));
};

/**
 * Max safe integer
 */
export const MAX_INTEGER = Number.MAX_SAFE_INTEGER;

/**
 * Creates a new transformation matrix
 * @param {Float32Array} translation
 * @param {Float32Array} rotation
 * @param {Float32Array} scale
 * @return {Float32Array}
 */
export function createTransformationMatrix(translation, rotation, scale) {
  let out = mat4.create();
  mat4.translate(out, out, translation);
  mat4.rotateX(out, out, rotation[0]);
  mat4.rotateY(out, out, rotation[1]);
  mat4.rotateZ(out, out, rotation[2]);
  mat4.scale(out, out, scale);
  return out;
};

/**
 * Returns the binary data representation of an image
 * @param {HTMLImageElement}
 * @return {Uint8Array}
 */
export function getImageBinaryData(img) {
  let width = img.width;
  let height = img.height;
  let ctx = createCanvasBuffer(width, height);
  let canvas = ctx.canvas;
  ctx.drawImage(
    img,
    0, 0
  );
  let data = ctx.getImageData(0, 0, width, height).data;
  return new Uint8Array(data);
};

/**
 * @param {Array} p1
 * @param {Array} p2
 * @param {Array} p3
 * @param {Array} pos
 * @return {Number}
 */
export function baryCentric(p1, p2, p3, pos) {
  let det = (p2[2] - p3[2]) * (p1[0] - p3[0]) + (p3[0] - p2[0]) * (p1[2] - p3[2]);
  let l1 = ((p2[2] - p3[2]) * (pos[0] - p3[0]) + (p3[0] - p2[0]) * (pos[1] - p3[2])) / det;
  let l2 = ((p3[2] - p1[2]) * (pos[0] - p3[0]) + (p1[0] - p3[0]) * (pos[1] - p3[2])) / det;
  let l3 = 1.0 - l1 - l2;
  return l1 * p1[1] + l2 * p2[1] + l3 * p3[1];
};

/**
 * Calculates the tangents and bitangents of an object
 * @param {WebGLObject} obj
 * @return {Object} tangents, bitangents
 */
export function calculateTangentsBitangents(obj) {
  let data = obj.data;
  let uvs = data.uvs;
  let normals = data.normals;
  let indices = data.indices;
  let vertices = data.vertices;

  let tangents = new Float32Array(vertices.length);
  let bitangents = new Float32Array(vertices.length);
  for (let ii = 0; ii < indices.length; ii += 3) {
    let i0 = indices[ii + 0];
    let i1 = indices[ii + 1];
    let i2 = indices[ii + 2];

    let x_v0 = vertices[i0 * 3 + 0];
    let y_v0 = vertices[i0 * 3 + 1];
    let z_v0 = vertices[i0 * 3 + 2];

    let x_uv0 = uvs[i0 * 2 + 0];
    let y_uv0 = uvs[i0 * 2 + 1];

    let x_v1 = vertices[i1 * 3 + 0];
    let y_v1 = vertices[i1 * 3 + 1];
    let z_v1 = vertices[i1 * 3 + 2];

    let x_uv1 = uvs[i1 * 2 + 0];
    let y_uv1 = uvs[i1 * 2 + 1];

    let x_v2 = vertices[i2 * 3 + 0];
    let y_v2 = vertices[i2 * 3 + 1];
    let z_v2 = vertices[i2 * 3 + 2];

    let x_uv2 = uvs[i2 * 2 + 0];
    let y_uv2 = uvs[i2 * 2 + 1];

    let x_deltaPos1 = x_v1 - x_v0;
    let y_deltaPos1 = y_v1 - y_v0;
    let z_deltaPos1 = z_v1 - z_v0;

    let x_deltaPos2 = x_v2 - x_v0;
    let y_deltaPos2 = y_v2 - y_v0;
    let z_deltaPos2 = z_v2 - z_v0;

    let x_uvDeltaPos1 = x_uv1 - x_uv0;
    let y_uvDeltaPos1 = y_uv1 - y_uv0;

    let x_uvDeltaPos2 = x_uv2 - x_uv0;
    let y_uvDeltaPos2 = y_uv2 - y_uv0;

    let rInv = x_uvDeltaPos1 * y_uvDeltaPos2 - y_uvDeltaPos1 * x_uvDeltaPos2;
    let r = 1.0 / (Math.abs(rInv < 0.0001) ? 1.0 : rInv);

    // tangent
    let x_tangent = (x_deltaPos1 * y_uvDeltaPos2 - x_deltaPos2 * y_uvDeltaPos1) * r;
    let y_tangent = (y_deltaPos1 * y_uvDeltaPos2 - y_deltaPos2 * y_uvDeltaPos1) * r;
    let z_tangent = (z_deltaPos1 * y_uvDeltaPos2 - z_deltaPos2 * y_uvDeltaPos1) * r;

    // bitangent
    let x_bitangent = (x_deltaPos2 * x_uvDeltaPos1 - x_deltaPos1 * x_uvDeltaPos2) * r;
    let y_bitangent = (y_deltaPos2 * x_uvDeltaPos1 - y_deltaPos1 * x_uvDeltaPos2) * r;
    let z_bitangent = (z_deltaPos2 * x_uvDeltaPos1 - z_deltaPos1 * x_uvDeltaPos2) * r;

    // Gram-Schmidt orthogonalize
    //t = glm::normalize(t - n * glm:: dot(n, t));
    let x_n0 = normals[i0 * 3 + 0];
    let y_n0 = normals[i0 * 3 + 1];
    let z_n0 = normals[i0 * 3 + 2];

    let x_n1 = normals[i1 * 3 + 0];
    let y_n1 = normals[i1 * 3 + 1];
    let z_n1 = normals[i1 * 3 + 2];

    let x_n2 = normals[i2 * 3 + 0];
    let y_n2 = normals[i2 * 3 + 1];
    let z_n2 = normals[i2 * 3 + 2];

    // tangent
    let n0_dot_t = x_tangent * x_n0 + y_tangent * y_n0 + z_tangent * z_n0;
    let n1_dot_t = x_tangent * x_n1 + y_tangent * y_n1 + z_tangent * z_n1;
    let n2_dot_t = x_tangent * x_n2 + y_tangent * y_n2 + z_tangent * z_n2;

    let x_resTangent0 = x_tangent - x_n0 * n0_dot_t;
    let y_resTangent0 = y_tangent - y_n0 * n0_dot_t;
    let z_resTangent0 = z_tangent - z_n0 * n0_dot_t;

    let x_resTangent1 = x_tangent - x_n1 * n1_dot_t;
    let y_resTangent1 = y_tangent - y_n1 * n1_dot_t;
    let z_resTangent1 = z_tangent - z_n1 * n1_dot_t;

    let x_resTangent2 = x_tangent - x_n2 * n2_dot_t;
    let y_resTangent2 = y_tangent - y_n2 * n2_dot_t;
    let z_resTangent2 = z_tangent - z_n2 * n2_dot_t;

    let magTangent0 = Math.sqrt(
      x_resTangent0 * x_resTangent0 + y_resTangent0 * y_resTangent0 + z_resTangent0 * z_resTangent0
    );
    let magTangent1 = Math.sqrt(
      x_resTangent1 * x_resTangent1 + y_resTangent1 * y_resTangent1 + z_resTangent1 * z_resTangent1
    );
    let magTangent2 = Math.sqrt(
      x_resTangent2 * x_resTangent2 + y_resTangent2 * y_resTangent2 + z_resTangent2 * z_resTangent2
    );

    // bitangent
    let n0_dot_bt = x_bitangent * x_n0 + y_bitangent * y_n0 + z_bitangent * z_n0;
    let n1_dot_bt = x_bitangent * x_n1 + y_bitangent * y_n1 + z_bitangent * z_n1;
    let n2_dot_bt = x_bitangent * x_n2 + y_bitangent * y_n2 + z_bitangent * z_n2;

    let x_resBitangent0 = x_bitangent - x_n0 * n0_dot_bt;
    let y_resBitangent0 = y_bitangent - y_n0 * n0_dot_bt;
    let z_resBitangent0 = z_bitangent - z_n0 * n0_dot_bt;

    let x_resBitangent1 = x_bitangent - x_n1 * n1_dot_bt;
    let y_resBitangent1 = y_bitangent - y_n1 * n1_dot_bt;
    let z_resBitangent1 = z_bitangent - z_n1 * n1_dot_bt;

    let x_resBitangent2 = x_bitangent - x_n2 * n2_dot_bt;
    let y_resBitangent2 = y_bitangent - y_n2 * n2_dot_bt;
    let z_resBitangent2 = z_bitangent - z_n2 * n2_dot_bt;

    let magBitangent0 = Math.sqrt(
      x_resBitangent0 * x_resBitangent0 +
      y_resBitangent0 * y_resBitangent0 +
      z_resBitangent0 * z_resBitangent0
    );
    let magBitangent1 = Math.sqrt(
      x_resBitangent1 * x_resBitangent1 +
      y_resBitangent1 * y_resBitangent1 +
      z_resBitangent1 * z_resBitangent1
    );
    let magBitangent2 = Math.sqrt(
      x_resBitangent2 * x_resBitangent2 +
      y_resBitangent2 * y_resBitangent2 +
      z_resBitangent2 * z_resBitangent2
    );

    tangents[i0 * 3 + 0] += x_resTangent0 / magTangent0;
    tangents[i0 * 3 + 1] += y_resTangent0 / magTangent0;
    tangents[i0 * 3 + 2] += z_resTangent0 / magTangent0;

    tangents[i1 * 3 + 0] += x_resTangent1 / magTangent1;
    tangents[i1 * 3 + 1] += y_resTangent1 / magTangent1;
    tangents[i1 * 3 + 2] += z_resTangent1 / magTangent1;

    tangents[i2 * 3 + 0] += x_resTangent2 / magTangent2;
    tangents[i2 * 3 + 1] += y_resTangent2 / magTangent2;
    tangents[i2 * 3 + 2] += z_resTangent2 / magTangent2;

    bitangents[i0 * 3 + 0] += x_resBitangent0 / magBitangent0;
    bitangents[i0 * 3 + 1] += y_resBitangent0 / magBitangent0;
    bitangents[i0 * 3 + 2] += z_resBitangent0 / magBitangent0;

    bitangents[i1 * 3 + 0] += x_resBitangent1 / magBitangent1;
    bitangents[i1 * 3 + 1] += y_resBitangent1 / magBitangent1;
    bitangents[i1 * 3 + 2] += z_resBitangent1 / magBitangent1;

    bitangents[i2 * 3 + 0] += x_resBitangent2 / magBitangent2;
    bitangents[i2 * 3 + 1] += y_resBitangent2 / magBitangent2;
    bitangents[i2 * 3 + 2] += z_resBitangent2 / magBitangent2;
  };

  let dataIndex = 0;
  let debugNormals = new Float32Array(vertices.length * 2);
  for (let ii = 0; ii < vertices.length; ii += 3) {
    let v0 = vertices[ii + 0];
    let v1 = vertices[ii + 1];
    let v2 = vertices[ii + 2];
    let n0 = normals[ii + 0];
    let n1 = normals[ii + 1];
    let n2 = normals[ii + 2];
    debugNormals[dataIndex + 0] = v0;
    debugNormals[dataIndex + 1] = v1;
    debugNormals[dataIndex + 2] = v2;
    debugNormals[dataIndex + 3] = v0 + n0;
    debugNormals[dataIndex + 4] = v1 + n1;
    debugNormals[dataIndex + 5] = v2 + n2;
    dataIndex += 6;
  };

  return { tangents, bitangents, debugNormals };
};
