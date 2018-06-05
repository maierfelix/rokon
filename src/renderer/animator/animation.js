import KeyFrame from "./keyframe";
import Joint from "./joint";
import JointTransform from "./joint-transform";

/**
 * An animation class
 * @class WebGLAnimation
 */
export default class WebGLAnimation {
  /**
   * @param {Object} opts - Options
   * @constructor
   */
  constructor(opts) {
    this.data = opts.data;
    this.object = opts.object;
    this.frames = 0;
    this.duration = 0;
    this.joints = this.processJoints(this.data);
    this.jointCount = this.joints.length;
    this.rootJoint = this.getRootJoint(this.joints);
    this.keyframes = this.processKeyframes(this.data.keyframes);
    this.duration = this.keyframes[this.keyframes.length - 1].timestamp;
  }
};

/**
 * Finds the root joint of a group of joints
 * @param {Array} joints - Array of joints
 * @return {Joint}
 */
WebGLAnimation.prototype.getRootJoint = function(joints) {
  return joints[0];
};

/**
 * Processed joints
 * @param {Object} data
 * @return {Array} - Array of instantiated joints
 */
WebGLAnimation.prototype.processJoints = function(input) {
  let joints = [];
  let data = this.normalizeRAWJoints(input);
  data.map(data => {
    let name = data.name;
    let index = data.index;
    let children = data.children;
    let inverseBindings = data.inverseBindings;
    let joint = new Joint(name, index, children, inverseBindings);
    joints.push(joint);
  });
  return joints;
};

/**
 * Converts an object of RAW joints into
 * processable list of joints in ascending order
 * Note: Object property orders are not reliable!
 * @param {Object} data - Unprocessed data
 * @return {Array} Processed and sorted joints
 */
WebGLAnimation.prototype.normalizeRAWJoints = function(data) {
  let out = [];
  let names = data.jointNamePositionIndex;
  let joints = data.jointInverseBindPoses;
  let length = Object.keys(joints).length;
  for (let ii = 0; ii < length; ++ii) {
    let index = ii;
    let inverseBindings = joints[ii];
    let name = this.getJointNameByIndex(names, ii);
    out.push({ index: index, inverseBindings, name });
  };
  out.map(joint => {
    joint.children = this.getJointChildren(out, data, joint.name, joint.index);
  });
  return out;
};

/**
 * Returns a joint's connected children
 * @param {Array} joints - Processed joint data
 * @param {Object} data - Joint data
 * @param {String} name - Joint name
 * @param {Number} index  - Joint's index
 * @return {Array} joint children
 */
WebGLAnimation.prototype.getJointChildren = function(joints, data, name, index) {
  let parents = data.jointParents;
  let children = [];
  for (let key in parents) {
    let parent = parents[key];
    if (parent === name) {
      let index = data.jointNamePositionIndex[key];
      children.push(joints[index]);
    }
  };
  return children;
};

/**
 * Returns the joint's name by the given joint's index
 * @param {Object} names - Joint name map
 * @param {Number} index  - Joint's index
 * @return {String} joint's name
 */
WebGLAnimation.prototype.getJointNameByIndex = function(names, index) {
  for (let key in names) {
    if (names[key] === index) return key;
  };
  return null;
};

/**
 * Converts an array of RAW keyframes into keyframes
 * @param {Array} rawFrames
 * @return {Array} - Array of instantiated keyframe
 */
WebGLAnimation.prototype.processKeyframes = function(rawFrames) {
  let frames = this.normalizeRAWFrames(rawFrames);
  let keyframes = [];
  for (let ii = 0; ii < frames.length; ++ii) {
    let frame = frames[ii];
    let keyframe = new KeyFrame(frame.ts, frame.data);
    keyframes.push(keyframe);
  };
  return keyframes;
};

/**
 * Converts an object of RAW keyframes into
 * processable list of keyframes in ascending order
 * Note: Object property orders are not reliable!
 * @param {Array} frames - Unprocessed frames
 * @return {Array} Processed and sorted frames
 */
WebGLAnimation.prototype.normalizeRAWFrames = function(frames) {
  let out = [];
  for (let key in frames) {
    let ts = parseFloat(key);
    let data = frames[key];
    let transform = this.createKeyframeTransforms(data);
    out.push({ ts, data: transform });
  };
  // ascending order
  out = out.sort((a, b) => a.ts > b.ts);
  return out;
};

/**
 * @param {Array} data - List of joint transform data
 * @return {Array} - List of joint transforms
 */
WebGLAnimation.prototype.createKeyframeTransforms = function(transforms) {
  let out = [];
  let joints = this.joints;
  for (let ii = 0; ii < transforms.length; ++ii) {
    let data = transforms[ii];
    let joint = joints[ii];
    let rotate = quat.fromMat3(quat.create(), data);
    let translate = quat.fromEuler(vec3.create(), data[13], data[14], data[15]);
    let transform = new JointTransform(translate, rotate, joint);
    out.push(transform);
  };
  return out;
};
