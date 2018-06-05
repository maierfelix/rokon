/**
 * Represents a single keyframe of an animation
 * @class KeyFrame
 */
export default class KeyFrame {
  /**
   * @param {Number} timestamp - The timestamp of this keyframe
   * @param {Array} transforms - The local transforms of this keyframe
   * @constructor
   */
  constructor(timestamp, transforms) {
    this.timestamp = timestamp;
    this.transforms = transforms;
  }
};
