import WebGLAnimation from "./animation";
import JointTransform from "./joint-transform";

/**
 * The animator class
 * @class WebGLAnimator
 */
export default class WebGLAnimator {
  /**
   * @param {WebGLObject} object - The object to animate
   * @param {Object} animationData - The animation data to use
   * @constructor
   */
  constructor(object, animationData) {
    this.object = object;
    this.renderer = object.renderer;
    this.gl = this.renderer.gl;
    this.animation = this.createAnimation(animationData);
    this.frames = 0;
    this.currentFrame = 0;
    this.currentPose = null;
    this.animationTime = 0;
  }
};

/**
 * Creates an animation with the given animation data
 * @param {Object} data
 * @return {WebGLAnimation}
 */
WebGLAnimator.prototype.createAnimation = function(data) {
  let anim = new WebGLAnimation({
    data: data,
    object: this.object
  });
  return anim;
};

/**
 * Updates the animation frames locally and of the attached object
 */
WebGLAnimator.prototype.update = function(delta) {
  let animation = this.animation;
  if (!animation) return;
  this.frames++;
  this.animationTime += delta;
  if (this.animationTime > animation.duration) {
    this.animationTime %= animation.duration;
  }
  this.updateObjectAnimation();
};

/**
 * Updates an object's animation state
 */
WebGLAnimator.prototype.updateObjectAnimation = function() {
  let pose = this.getCurrentAnimationPose();
  let animation = this.animation;
  this.currentPose = pose;
  this.applyPoseToJoints(pose, animation.rootJoint, mat4.create());
};

WebGLAnimator.prototype.applyPoseToJoints = function(currentPose, joint, parentTransform) {
  let currentLocalTransform = currentPose[joint.index].getLocalTransform();
  let currentTransform = mat4.multiply(mat4.create(), currentLocalTransform, parentTransform);
  joint.children.map(child => {
    this.applyPoseToJoints(currentPose, child, currentTransform);
  });
  mat4.multiply(currentTransform, currentTransform, joint.inverseBindings);
  joint.localTransform = currentTransform;
};

/**
 * Calculates and returns the current pose of the animation
 */
WebGLAnimator.prototype.getCurrentAnimationPose = function() {
  let frames = this.getPreviousAndNextKeyframe();
  let previous = frames.previous;
  let next = frames.next;
  let t = this.getFrameProgression(previous, next);
  let pose = this.interpolatePoses(previous, next, t);
  return pose;
};

WebGLAnimator.prototype.getPreviousAndNextKeyframe = function() {
  let frames = this.animation.keyframes;
  let previousFrame = frames[0];
  let nextFrame = frames[0];
  for (let ii = 1; ii < frames.length; ++ii) {
    nextFrame = frames[ii];
    if (nextFrame.timestamp > this.animationTime) break;
    previousFrame = frames[ii];
  };
  return {
    previous: previousFrame,
    next: nextFrame
  };
};

/**
 * Calculates progression between previous and next keyframes
 * @param {KeyFrame} a - Previous keyframe
 * @param {KeyFrame} b - Next keyframe
 * @return {Number} - The progression
 */
WebGLAnimator.prototype.getFrameProgression = function(a, b) {
  let total = b.timestamp - a.timestamp;
  let current = this.animationTime - a.timestamp;
  return current / total;
};

WebGLAnimator.prototype.interpolatePoses = function(a, b, t) {
  let pose = [];
  let poseA = a.transforms;
  let poseB = b.transforms;
  for (let ii = 0; ii < poseA.length; ++ii) {
    let previous = poseA[ii];
    let next = poseB[ii];
    let current = JointTransform.interpolate(previous, next, t);
    pose.push(current);
  };
  return pose;
};
