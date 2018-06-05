import {
  uid
} from "../../utils";

import WebGLObject from "./object";

import MD5 from "../md5";

/**
 * A md5 object
 * @class MD5Object
 * @extends WebGLObject
 */
export default class MD5Object extends WebGLObject {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts) {
    super(opts);
    this.animated = !!opts.animated;
    this.rotate.x = 90;
    this.rotate.z = 90;
    this.events = {
      onend: []
    };
    this.playbackSpeed = 1.0;
    this.animations = [];
    this.nextAnimation = null;
    this.currentAnimation = null;
    // blending properties
    {
      this.endDelta = 0;
      this.blendDelta = 0;
      this.endAnimation = null;
      this.blendAnimation = null;
    }
    this.endAnimationPlaybackDirection = 1.0;
  }
};

MD5Object.prototype.createMesh = function(mesh) {
  let data = this.data;
  data.vertices = new Float32Array(mesh.vertices);
  this.createLoader();
};

MD5Object.prototype.isActiveAnimation = function() {
  return this.currentAnimation !== null;
};

MD5Object.prototype.isDifferentAnimation = function(anim) {
  return this.currentAnimation !== anim;
};

MD5Object.prototype.isAnimationFinished = function(anim) {
  return (
    (anim.currentFrame <= 0) ||
    (anim.currentFrame >= anim.frames.length)
  );
};

MD5Object.prototype.addAnimation = function(path, opts = {}) {
  let anim = new MD5.Md5Anim(opts);
  anim.load(path, anim => {
    anim.loaded = true;
  });
  this.animations.push(anim);
};

MD5Object.prototype.getAnimationByName = function(name) {
  let animations = this.animations;
  for (let ii = 0; ii < animations.length; ++ii) {
    let anim = animations[ii];
    if (anim.name === name) return anim;
  };
  return null;
};

MD5Object.prototype.useAnimation = function(name, opts = {}) {
  let anim = this.getAnimationByName(name);
  let force = opts.force || false;
  if (!anim) return console.warn(`Cannot find animation ${name}!`);
  if (opts.onend) this.registerEvent("onend", opts.onend);
  // interpolate between current and new animation
  if (!force && this.isActiveAnimation() && this.isDifferentAnimation(anim)) {
    this.nextAnimation = anim;
  }
  // skip current animation and force direct replay
  else {
    if (force) anim.currentFrame = 0;
    this.currentAnimation = anim;
  }
  return anim;
};

MD5Object.prototype.isTransitionable = function(a, b) {
  return (
    (a.smoothTransitions.indexOf(b.name) > -1) ||
    (b.smoothTransitions.indexOf(a.name) > -1)
  );
};

MD5Object.prototype.isAnimationQueueEmpty = function() {
  return (
    (this.endAnimation === null) &&
    (this.nextAnimation === null) &&
    (this.blendAnimation === null)
  );
};

MD5Object.prototype.isAnimationAlreadyQueded = function(name) {
  return (
    (this.endAnimation && this.endAnimation.name === name) ||
    (this.nextAnimation && this.nextAnimation.name === name) ||
    (this.blendAnimation && this.blendAnimation.name === name) ||
    (this.currentAnimation && this.currentAnimation.name === name)
  );
};

MD5Object.prototype.animate = function(delta) {
  let gl = this.gl;
  let model = this.model;
  let endAnim = this.endAnimation;
  let nextAnim = this.nextAnimation;
  let blendAnim = this.blendAnimation;
  let currentAnim = this.currentAnimation;
  // we need to finish the current animation first!
  if (endAnim !== null) {
    let finished = this.finishAnimation(currentAnim, delta);
    if (finished) {
      this.endAnimation = null;
      this.currentAnimation = this.nextAnimation;
      this.nextAnimation = null;
      this.currentAnimation.currentFrame = 0;
    }
  }
  // we got another animation queued, interpolate to it!
  else if (nextAnim !== null) {
    let isSmoothTransition = this.isTransitionable(currentAnim, nextAnim);
    // we want to end the current animation
    // and then play the next animation
    if (isSmoothTransition) {
      let frame = this.playAnimation(this.currentAnimation, delta);
      let currentFrame = Math.floor(frame) % currentAnim.frames.length;
      if (currentFrame === currentAnim.frames.length - 1) {
        this.setBlendAnimation(nextAnim);
      }
    }
    // a different, non-transitionable animation
    else {
      // we need to end the current animation as quickly as possible
      this.setBlendAnimation(nextAnim);
    }
  }
  // play a blend animation
  if (this.blendAnimation !== null) {
    this.blendAnimations(this.currentAnimation, this.blendAnimation, delta);
  }
  // play the current animation looped
  else if (this.isAnimationQueueEmpty()) {
    this.playAnimation(this.currentAnimation, delta);
  }
};

MD5Object.prototype.setEndAnimation = function(anim) {
  this.endDelta = 0;
  this.endAnimation = anim;
  // we want to end the current animation as fast as possible
  {
    // find the shortest path to end the animation
    let playbackDir = this.getEndPlaybackDirection(this.currentAnimation);
    this.endAnimationPlaybackDirection = -1;
  }
};

MD5Object.prototype.getEndPlaybackDirection = function(anim) {
  // TODO: is this maybe better?
  // if frame <= 1/3 -> play anim to begin fast
  // if frame >= 3/4 -> play anim to end fast
  let totalFrames = anim.frames.length;
  let frame = Math.floor(anim.currentFrame) % totalFrames;
  let direction = (
    (frame <= (totalFrames / 2.75)) ? -1.0 : 0.0
  );
  return direction;
};

MD5Object.prototype.setBlendAnimation = function(anim) {
  this.blendDelta = 0;
  this.nextAnimation = null;
  this.blendAnimation = anim;
  anim.currentFrame = 1;
};

MD5Object.prototype.playAnimation = function(anim, delta) {
  let gl = this.gl;
  let model = this.model;
  anim.currentFrame += (delta * anim.playbackSpeed) * this.playbackSpeed;
  model.setAnimationFrame(gl, anim);
  return anim.currentFrame;
};

MD5Object.prototype.blendAnimations = function(animA, animB, delta) {
  let gl = this.gl;
  let model = this.model;
  this.blendDelta += (delta * 0.4 * animB.playbackSpeed) * this.playbackSpeed;
  model.blendAnimations(gl, animA, animB, this.blendDelta);
  // blending finished, set blended-to animation as our current animation
  if (this.blendDelta >= 1.0) {
    this.blendAnimation = null;
    this.currentAnimation = animB;
    this.blendDelta = 0;
  }
};

MD5Object.prototype.finishAnimation = function(anim, delta) {
  let dir = this.endAnimationPlaybackDirection;
  // play reversed
  if (dir === -1) {
    let frame = this.playAnimation(anim, -delta * 2.0);
    let currentFrame = Math.floor(frame) % anim.frames.length;
    if (currentFrame <= 0) return true;
  }
  return false;
};

MD5Object.prototype.registerEvent = function(name, callback) {

};

MD5Object.prototype.triggerEvent = function(name, value) {

};
