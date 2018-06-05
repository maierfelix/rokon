/**
 * Represents a single joint of an animation's skeleton
 * @class Joint
 */
export default class Joint {
  /**
   * @param {String} name
   * @param {Number} index
   * @param {Array} children
   * @param {Array} inverseBindings
   * @constructor
   */
  constructor(name, index, children, inverseBindings) {
    this.name = name;
    this.index = index;
    this.children = children;
    this.localTransform = mat4.create();
    this.inverseBindings = inverseBindings;
  }
};
