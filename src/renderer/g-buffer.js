import {
  uid
} from "../utils";

import FrameBuffer from "./framebuffer";

/**
 * A basic gBuffer
 * @class GBuffer
 */
export default class GBuffer extends FrameBuffer {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.isGBuffer = true;
  }
};

/**
 * Binds all gbuffer textures
 */
GBuffer.prototype.bind = function() {
  let renderer = this.renderer;
  let textures = this.textures;
  let program = renderer.currentProgram;
  let variables = program.locations;
  // textures
  let position = textures[0];
  let normal = textures[1];
  let albedo = textures[2];
  let emissive = textures[3];
  let rsma = textures[4];
  renderer.useTexture(position, variables.uPositionSampler, 0);
  renderer.useTexture(normal, variables.uNormalSampler, 1);
  renderer.useTexture(albedo, variables.uAlbedoSampler, 2);
  renderer.useTexture(emissive, variables.uEmissiveSampler, 3);
  renderer.useTexture(rsma, variables.uRSMASampler, 4);
};
