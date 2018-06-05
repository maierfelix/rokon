/**
 * Represents a single transformable joint
 * @class JointTransform
 */
export default class JointTransform {
  /**
   * @param {Float32Array} position
   * @param {Float32Array} rotation
   * @param {Joint} joint - The relative joint
   * @constructor
   */
  constructor(position, rotation, joint) {
    this.matrix = mat4.create();
    this.translate = position;
    this.rotate = rotation;
    this.joint = joint;
  }
  /**
   * Returns the joint's local transform
   * @return {Float32Array}
   */
  getLocalTransform() {
    let out = this.matrix;
    let translate = this.translate;
    let rotate = this.rotate;
    mat4.identity(out);
    mat4.translate(
      out,
      out,
      translate
    );
    mat4.multiply(
      out,
      out,
      quat.toRotationMatrix(mat4.create(), rotate)
    );
    return out;
  }
  /**
   * Interpolate between two transforms
   * @param {JointTransform} a
   * @param {JointTransform} b
   * @param {Number} t
   * @return {JointTransform}
   */
  static interpolate(a, b, t) {
    let pos = JointTransform.interpolatePosition(a.translate, b.translate, t);
    let rot = JointTransform.interpolateRotation(a.rotate, b.rotate, t);
    if (a.joint !== b.joint) console.error(`Fatal error: Joints doesn't match!`);
    return new JointTransform(pos, rot, a.joint);
  }
  /**
   * Interpolate position of two transforms
   * @param {Float32Array} a
   * @param {Float32Array} b
   * @param {Number} t
   * @return {Float32Array}
   */
  static interpolatePosition(a, b, t) {
    let out = vec3.create();
    out[0] = a[0] + (b[0] - a[0]) * t;
    out[1] = a[1] + (b[1] - a[1]) * t;
    out[2] = a[2] + (b[2] - a[2]) * t;
    return out;
  }
  /**
   * Interpolate rotation of two transforms
   * @param {Float32Array} a
   * @param {Float32Array} b
   * @param {Number} t
   * @return {Float32Array}
   */
  static interpolateRotation(a, b, t) {
    let out = quat.create();
    quat.slerp(out, a, b, t);
    return out;
  }
};
