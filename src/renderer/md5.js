// TODO: the data should follow the engine's standards!
// => normals, vertices, uvs

const BASE_PATH = "";
const MAX_WEIGHTS = 6;
const VERTEX_ELEMENTS = 11; // 3 Pos, 2 UV, 3 Norm, 3 Tangent
const VERTEX_STRIDE = 44;

function Md5Mesh(opts = {}) {
  this.joints = null;
  this.meshes = null;
  this.opts = {
    texture: opts.texture || null
  };
};

Md5Mesh.prototype.load = function(gl, url, callback) {
  this.joints = new Array();
  this.meshes = new Array();

  let request = new XMLHttpRequest();
  request.addEventListener("load", () => {
    this.parse(request.responseText);
    this.normals = this.calculateSmoothNormals();
    this.initializeTextures(gl);
    this.initializeBuffers(gl);
    if (callback) callback(this);
  });
  request.open("GET", BASE_PATH + url, true);
  request.overrideMimeType("text/plain");
  request.setRequestHeader("Content-Type", "text/plain");
  request.send(null);

  return this;
};

Md5Mesh.prototype.calculateSmoothNormals = function() {
  let clone = this.cloneMeshes(this.meshes);
  let out = this.concatMeshes(clone);
  let mesh = {
    verts: out.verts,
    tris: out.tris,
    weights: out.weights,
    elementCount: out.tris.length
  };
  this.compile(mesh);
  return mesh;
};

Md5Mesh.prototype.cloneMeshes = function(meshes) {
  return JSON.parse(JSON.stringify(meshes));
};

Md5Mesh.prototype.concatMeshes = function(meshes) {
  let verts = [];
  let tris = [];
  let weights = [];
  let indexOffset = 0;
  let vertexOffset = 0;
  let weightOffset = 0;
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    // vertices
    mesh.verts.map((vert, i) => {
      verts[vertexOffset + i] = vert;
    });
    // faces
    for (let jj = 0; jj < mesh.tris.length; jj += 3) {
      let offset = indexOffset;
      tris[offset + 0] = mesh.tris[jj + 0] += vertexOffset;
      tris[offset + 1] = mesh.tris[jj + 1] += vertexOffset;
      tris[offset + 2] = mesh.tris[jj + 2] += vertexOffset;
      indexOffset += 3;
    };
    // weights
    mesh.verts.map((vert, i) => {
      for (let jj = 0; jj < vert.weight.count; ++jj) {
        let weight = mesh.weights[vert.weight.index + jj];
        weights[weightOffset + vert.weight.index + jj] = weight;
      };
      vert.weight.index += weightOffset;
    });
    mesh.verts.map((vert, i) => {
      weightOffset += vert.weight.count;
    });
    vertexOffset += mesh.verts.length;
  };
  return { verts, tris, weights };
};

/*
 * Md5Mesh
 */

Md5Mesh.prototype.parse = function(src) {
  let model = this;

  src.replace(/joints \{([^}]*)\}/m, function($0, jointSrc) {
    jointSrc.replace(/\"(.+)\"\s(.+) \( (.+) (.+) (.+) \) \( (.+) (.+) (.+) \)/g, function($0, name, parent, x, y, z, ox, oy, oz) {

      let orient = quat.calculateW(quat.create(), [parseFloat(ox), parseFloat(oy), parseFloat(oz), 0]);
      orient[3] *= -1;

      model.joints.push({
        name: name,
        parent: parseInt(parent),
        pos: [parseFloat(x), parseFloat(y), parseFloat(z)],
        orient: orient
      });
    });
  });

  src.replace(/mesh \{([^}]*)\}/mg, function($0, meshSrc) {
    let mesh = {
      shader: "",
      verts: new Array(),
      tris: new Array(),
      weights: new Array(),
      vertBuffer: null,
      indexBuffer: null,
      vertArray: null,
      elementCount: 0
    };

    meshSrc.replace(/shader \"(.+)\"/, function($0, shader) {
      mesh.shader = shader.replace(".tga", "");
    });

    meshSrc.replace(/vert .+ \( (.+) (.+) \) (.+) (.+)/g, function($0, u, v, weightIndex, weightCount) {
      mesh.verts.push({
        pos: [0, 0, 0],
        normal: [0, 0, 0],
        tangent: [0, 0, 0],
        texCoord: [parseFloat(u), parseFloat(v)],
        weight: {
          index: parseInt(weightIndex),
          count: parseInt(weightCount)
        }
      });
    });

    mesh.tris = new Array();
    meshSrc.replace(/tri .+ (.+) (.+) (.+)/g, function($0, i1, i2, i3) {
      mesh.tris.push(parseInt(i1));
      mesh.tris.push(parseInt(i2));
      mesh.tris.push(parseInt(i3));
    });
    mesh.elementCount = mesh.tris.length;

    meshSrc.replace(/weight .+ (.+) (.+) \( (.+) (.+) (.+) \)/g, function($0, joint, bias, x, y, z) {
      mesh.weights.push({
        joint: parseInt(joint),
        bias: parseFloat(bias),
        pos: [parseFloat(x), parseFloat(y), parseFloat(z)],
        normal: [0, 0, 0],
        tangent: [0, 0, 0]
      });
    });

    model.compile(mesh);

    model.meshes.push(mesh);

    let weightOffset = 0;
    model.meshes.map(mesh => {
      mesh.weightOffset = weightOffset;
      mesh.verts.map((vert, i) => {
        weightOffset += vert.weight.count;
      });
    });

  });
};

function findSimilarVertices(vert, verts) {
  let pos = vert.pos;
  let index = pos[0] + pos[1] + pos[2];
  let duplicates = [];
  for (let ii = 0; ii < verts.length; ii++) {
    let nvert = verts[ii];
    let npos = nvert.pos;
    let nindex = npos[0] + npos[1] + npos[2];
    if (nindex === index) duplicates.push(ii);
  }
  return duplicates;
};

Md5Mesh.prototype.compile = function(mesh) {
  let joints = this.joints;
  let rotatedPos = [0, 0, 0];

  // Calculate transformed vertices in the bind pose
  for (let ii = 0; ii < mesh.verts.length; ++ii) {
    let vert = mesh.verts[ii];

    vert.pos = [0, 0, 0];
    for (let jj = 0; jj < vert.weight.count; ++jj) {
      let weight = mesh.weights[vert.weight.index + jj];
      let joint = joints[weight.joint];

      // Rotate position
      quat.multiplyVec3(rotatedPos, joint.orient, weight.pos);

      // Translate position
      // The sum of all weight biases should be 1.0
      vert.pos[0] += (joint.pos[0] + rotatedPos[0]) * weight.bias;
      vert.pos[1] += (joint.pos[1] + rotatedPos[1]) * weight.bias;
      vert.pos[2] += (joint.pos[2] + rotatedPos[2]) * weight.bias;
    }
  }

  // Calculate normals/tangents
  let a = [0, 0, 0];
  let b = [0, 0, 0];
  let n = [0, 0, 0];

  for (let ii = 0; ii < mesh.tris.length; ii += 3) {
    let i1 = mesh.tris[ii + 0];
    let i2 = mesh.tris[ii + 1];
    let i3 = mesh.tris[ii + 2];
    let v1 = mesh.verts[i1];
    let v2 = mesh.verts[i2];
    let v3 = mesh.verts[i3];

    // normal
    vec3.subtract(a, v2.pos, v1.pos);
    vec3.subtract(b, v3.pos, v1.pos);
    vec3.cross(n, b, a);

    // angles
    let a1 = vec3.angle(
      vec3.subtract(a, v2.pos, v1.pos),
      vec3.subtract(b, v3.pos, v1.pos)
    );
    let a2 = vec3.angle(
      vec3.subtract(a, v3.pos, v2.pos),
      vec3.subtract(b, v1.pos, v2.pos)
    );
    let a3 = vec3.angle(
      vec3.subtract(a, v1.pos, v3.pos),
      vec3.subtract(b, v2.pos, v3.pos)
    );

    vec3.add(v1.normal, v1.normal, vec3.scale(vec3.create(), n, a1));
    vec3.add(v2.normal, v2.normal, vec3.scale(vec3.create(), n, a2));
    vec3.add(v3.normal, v3.normal, vec3.scale(vec3.create(), n, a3));
  };

  let invOrient = [0, 0, 0, 0];

  // Get the "weighted" normal and tangent
  for (let ii = 0; ii < mesh.verts.length; ++ii) {
    let vert = mesh.verts[ii];

    let duplicates = findSimilarVertices(vert, mesh.verts);
    vec3.scale(vert.normal, vert.normal, duplicates.length);

    vec3.normalize(vert.normal, vert.normal);

    for (let jj = 0; jj < duplicates.length; ++jj) {
      let vertIndex = duplicates[jj];
      let nvert = mesh.verts[vertIndex];
      nvert.normal = vert.normal;
    };

    for (let jj = 0; jj < vert.weight.count; ++jj) {
      let weight = mesh.weights[vert.weight.index + jj];
      if (weight.bias != 0) {
        let joint = joints[weight.joint];

        // Rotate position
        quat.invert(invOrient, joint.orient);
        quat.multiplyVec3(weight.normal, invOrient, vert.normal);
      }
    }
  };

};

Md5Mesh.prototype.initializeTextures = function(gl) {
  let renderer = gl.renderer;
  for (let ii = 0; ii < this.meshes.length; ++ii) {
    let mesh = this.meshes[ii];

    // Set defaults
    mesh.diffuseMap = renderer.createTexture().fromColor([0, 0, 0]);
    mesh.specularMap = renderer.createTexture().fromColor([0, 0, 0]);
    mesh.normalMap = renderer.createTexture().fromColor([0, 0, 0]);

    this.loadMeshTextures(gl, mesh);
  }
};

// Finds the meshes texures
// Confession: Okay, so this function is a big giant cheat... 
// but have you SEEN how those mtr files are structured?
Md5Mesh.prototype.loadMeshTextures = function(gl, mesh) {
  let renderer = gl.renderer;
  let opts = {
    flip: {
      x: true,
      y: true
    },
    wrap: this.opts.texture || {
      s: gl.MIRRORED_REPEAT,
      t: gl.CLAMP_TO_EDGE,
      r: gl.MIRRORED_REPEAT
    },
    onload: texture => {
      mesh.diffuseMap = texture;
    }
  };
  // Attempt to load actual textures
  renderer.createTexture(opts).fromImagePath("md5/pokepark/" + mesh.shader + '.png');
  /*
  renderer.createTexture({ onload: texture => {
      mesh.specularMap = texture.native;
  }}).fromImagePath(BASE_PATH + mesh.shader + '_s.png');

  renderer.createTexture({ onload: texture => {
      mesh.normalMap = texture.native;
  }}).fromImagePath(BASE_PATH + mesh.shader + '_local.png');*/

};

// Creates the model's gl buffers and populates them with the bind-pose mesh
Md5Mesh.prototype.initializeBuffers = function(gl) {
  let meshes = this.meshes;

  let vertBufferLength = 0;
  let indexBufferLength = 0;
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    mesh.vertOffset = vertBufferLength;
    vertBufferLength += VERTEX_ELEMENTS * mesh.verts.length;

    mesh.indexOffset = indexBufferLength;
    indexBufferLength += mesh.elementCount;
  };

  // Fill the vertex buffer
  this.vertArray = new Float32Array(vertBufferLength);
  this.skin();
  this.vertBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertArray, gl.STATIC_DRAW);

  // Fill the index buffer
  let indexArray = new Uint16Array(indexBufferLength);
  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    indexArray.set(mesh.tris, mesh.indexOffset);
  };

  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
};

// Skins the vertexArray with the given joint set
// Passing null to joints results in the bind pose
Md5Mesh.prototype.skin = function(joints, vertArray, arrayOffset) {
  if (!joints) {
    joints = this.joints;
  }
  if (!vertArray) {
    vertArray = this.vertArray;
  }
  if (!arrayOffset) {
    arrayOffset = 0;
  }

  let rotatedPos = [0, 0, 0];

  let vx, vy, vz;
  let nx, ny, nz;
  let tx, ty, tz;

  let meshes = this.meshes;

  for (let ii = 0; ii < meshes.length; ++ii) {
    let mesh = meshes[ii];
    let meshOffset = mesh.vertOffset + arrayOffset;

    // Calculate transformed vertices in the bind pose
    for (let jj = 0; jj < mesh.verts.length; ++jj) {
      let vertOffset = (jj * VERTEX_ELEMENTS) + meshOffset;
      let vert = mesh.verts[jj];

      vx = 0;
      vy = 0;
      vz = 0;
      nx = 0;
      ny = 0;
      nz = 0;
      tx = 0;
      ty = 0;
      tz = 0;

      vert.pos = [0, 0, 0];

      for (let kk = 0; kk < vert.weight.count; ++kk) {
        let weight = mesh.weights[vert.weight.index + kk];
        let joint = joints[weight.joint];

        let normal = this.normals.weights[mesh.weightOffset + vert.weight.index + kk].normal;

        // Rotate position
        quat.multiplyVec3(rotatedPos, joint.orient, weight.pos);

        // Translate position
        vert.pos[0] += (joint.pos[0] + rotatedPos[0]) * weight.bias;
        vert.pos[1] += (joint.pos[1] + rotatedPos[1]) * weight.bias;
        vert.pos[2] += (joint.pos[2] + rotatedPos[2]) * weight.bias;
        vx += (joint.pos[0] + rotatedPos[0]) * weight.bias;
        vy += (joint.pos[1] + rotatedPos[1]) * weight.bias;
        vz += (joint.pos[2] + rotatedPos[2]) * weight.bias;

        // Rotate Normal
        quat.multiplyVec3(rotatedPos, joint.orient, normal);
        nx += rotatedPos[0] * weight.bias;
        ny += rotatedPos[1] * weight.bias;
        nz += rotatedPos[2] * weight.bias;

        // Rotate Tangent
        quat.multiplyVec3(rotatedPos, joint.orient, weight.tangent);
        tx += rotatedPos[0] * weight.bias;
        ty += rotatedPos[1] * weight.bias;
        tz += rotatedPos[2] * weight.bias;
      }

      // Position
      vertArray[vertOffset] = vx;
      vertArray[vertOffset + 1] = vy;
      vertArray[vertOffset + 2] = vz;

      // TexCoord
      vertArray[vertOffset + 3] = vert.texCoord[0];
      vertArray[vertOffset + 4] = vert.texCoord[1];

      // Normal
      vertArray[vertOffset + 5] = nx;
      vertArray[vertOffset + 6] = ny;
      vertArray[vertOffset + 7] = nz;

      // Tangent
      vertArray[vertOffset + 8] = tx;
      vertArray[vertOffset + 9] = ty;
      vertArray[vertOffset + 10] = tz;
    }
  }
};

Md5Mesh.prototype.getAnimationFrame = function(animation, frame) {
  let currentFrame = Math.floor(frame);
  let delta = frame - currentFrame;
  let joints1 = animation.getFrameJoints(currentFrame);
  let joints2 = animation.getFrameJoints(currentFrame + 1);
  let joints = [];
  for (let ii = 0; ii < joints1.length; ++ii) {
    let jA = joints1[ii];
    let jB = joints2[ii];
    let posA = jA.pos;
    let posB = jB.pos;
    let orientA = jA.orient;
    let orientB = jB.orient;
    let joint = {
      pos: vec3.lerp(vec3.create(), posA, posB, delta),
      orient: quat.slerp(vec4.create(), orientA, orientB, delta)
    };
    joints.push(joint);
  };
  return joints;
};

Md5Mesh.prototype.setAnimationFrame = function(gl, animation) {
  let joints = this.getAnimationFrame(animation, animation.currentFrame);
  this.skin(joints);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertArray, gl.STATIC_DRAW);
};

Md5Mesh.prototype.blendAnimations = function(gl, animationA, animationB, delta) {
  let currentFrame = Math.floor(animationA.currentFrame);
  let nextFrame = Math.floor(animationB.currentFrame);
  let jointsA = animationA.getFrameJoints(currentFrame);
  let jointsB = animationB.getFrameJoints(nextFrame);
  let joints = [];
  for (let ii = 0; ii < jointsA.length; ++ii) {
    let jA = jointsA[ii];
    let jB = jointsB[ii];
    let posA = jA.pos;
    let posB = jB.pos;
    let orientA = jA.orient;
    let orientB = jB.orient;
    let joint = {
      pos: vec3.lerp(vec3.create(), posA, posB, delta),
      orient: quat.slerp(vec4.create(), orientA, orientB, delta)
    };
    joints.push(joint);
  };
  this.skin(joints);
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.vertArray, gl.STATIC_DRAW);
};


function Md5Anim(opts) {
  this.name = "";
  this.playbackSpeed = opts.playbackSpeed || 1.0;
  this.smoothTransitions = opts.smoothTransitions || [];
  this.currentFrame = 0;
  this.frameRate = 24;
  this.frameTime = 1000.0 / this.frameRate;
  this.hierarchy = null;
  this.baseFrame = null;
  this.frames = null;
};

Md5Anim.prototype.getNameFromURL = function(url) {
  return url.substr(url.lastIndexOf("/") + 1, url.length).replace(".md5anim", "");
};

Md5Anim.prototype.load = function(url, callback) {
  this.name = this.getNameFromURL(url);
  this.hierarchy = new Array();
  this.baseFrame = new Array();
  this.frames = new Array();

  let request = new XMLHttpRequest();
  request.addEventListener("load", () => {
    this.parse(request.responseText);
    if (callback) callback(this);
  });

  request.open("GET", BASE_PATH + url, true);
  request.overrideMimeType("text/plain");
  request.setRequestHeader("Content-Type", "text/plain");
  request.send(null);

  return this;
};

Md5Anim.prototype.parse = function(src) {
  let anim = this;

  src.replace(/frameRate (.+)/, function($0, frameRate) {
    anim.frameRate = parseInt(frameRate);
    anim.frameTime = 1000 / frameRate;
  });

  src.replace(/hierarchy \{([^}]*)\}/m, function($0, hierarchySrc) {
    hierarchySrc.replace(/\"(.+)\"\s([-\d]+) (\d+) (\d+)\s/g, function($0, name, parent, flags, index) {
      anim.hierarchy.push({
        name: name,
        parent: parseInt(parent),
        flags: parseInt(flags),
        index: parseInt(index)
      });
    });
  });

  src.replace(/baseframe \{([^}]*)\}/m, function($0, baseframeSrc) {
    baseframeSrc.replace(/\( (.+) (.+) (.+) \) \( (.+) (.+) (.+) \)/g, function($0, x, y, z, ox, oy, oz) {
      anim.baseFrame.push({
        pos: [parseFloat(x), parseFloat(y), parseFloat(z)],
        orient: [parseFloat(ox), parseFloat(oy), parseFloat(oz)]
      });
    });
  });


  src.replace(/frame \d+ \{([^}]*)\}/mg, function($0, frameSrc) {
    let frame = new Array();

    frameSrc.replace(/([-\.\d]+)/g, function($0, value) {
      frame.push(parseFloat(value));
    });

    anim.frames.push(frame);
  });
};

Md5Anim.prototype.getFrameJoints = function(frame) {
  let maxFrames = this.frames.length;
  let currentFrame = Math.floor(frame);
  let frameDelta = frame - currentFrame;

  let frameData = this.frames[currentFrame % maxFrames];
  let joints = new Array();

  for (let ii = 0; ii < this.baseFrame.length; ++ii) {
    let baseJoint = this.baseFrame[ii];
    let offset = this.hierarchy[ii].index;
    let flags = this.hierarchy[ii].flags;

    let aPos = [baseJoint.pos[0], baseJoint.pos[1], baseJoint.pos[2]];
    let aOrient = [baseJoint.orient[0], baseJoint.orient[1], baseJoint.orient[2], 0];

    let j = 0;

    if (flags & 1) { // Translate X
      aPos[0] = frameData[offset + j];
      ++j;
    }

    if (flags & 2) { // Translate Y
      aPos[1] = frameData[offset + j];
      ++j;
    }

    if (flags & 4) { // Translate Z
      aPos[2] = frameData[offset + j];
      ++j;
    }

    if (flags & 8) { // Orient X
      aOrient[0] = frameData[offset + j];
      ++j;
    }

    if (flags & 16) { // Orient Y
      aOrient[1] = frameData[offset + j];
      ++j;
    }

    if (flags & 32) { // Orient Z
      aOrient[2] = frameData[offset + j];
      ++j;
    }

    // Recompute W value
    quat.calculateW(aOrient, aOrient);
    //aOrient[3] *= -1;

    // Multiply against parent 
    //(assumes parents always have a lower index than their children)
    let parentIndex = this.hierarchy[ii].parent;

    let pos = aPos;
    let orient = aOrient;
    aOrient[3] = -Math.abs(aOrient[3]);
    if (parentIndex >= 0) {
      let parentJoint = joints[parentIndex];

      quat.multiplyVec3(pos, parentJoint.orient, pos);
      vec3.add(pos, parentJoint.pos, pos);
      quat.multiply(orient, parentJoint.orient, orient);

    }

    joints.push({
      pos: pos,
      orient: orient
    }); // This could be so much better!
  }

  return joints;
};

export default {
  Md5Mesh: Md5Mesh,
  Md5Anim: Md5Anim
};
