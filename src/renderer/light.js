import {
  uid
} from "../utils";

/**
 * A light
 * @class Light
 */
export default class Light {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    this.uid = uid();
    this.gl = opts.gl;
    this.renderer = opts.renderer;
    this.radius = opts.radius || 1.0;
    this.color = new Float32Array(opts.color);
    this.intensity = opts.intensity || 1.0;
  }
};
