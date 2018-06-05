import {
  uid
} from "../utils";

/**
 * A uniform buffer to batch uniforms
 * @class UniformBuffer
 */
export default class UniformBuffer {
  /**
   * @param {WebGLRenderer} renderer
   * @constructor
   */
  constructor(renderer) {
    this.uid = uid();
    this.renderer = renderer;
    this.gl = this.renderer.gl;
    this.size = 0;
    this.buffer = null;
  }
};
