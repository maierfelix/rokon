import ColladaObject from "./collada-object";

import WebGLAnimator from "../animator/index";

/**
 * An animated object
 * @class AnimatedObject
 * @extends WebGLObject
 */
export default class AnimatedObject extends ColladaObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.animation = new WebGLAnimator(this, opts.animation);
  }
};
