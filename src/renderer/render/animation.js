/**
 * Renders an object's animation
 * @param {WebGLObject} object
 */
export function renderAnimation(object) {
  let gl = this.gl;
  let program = this.getActiveProgram();
  let variables = program.locations;
  this.useRendererProgram("animated-object");
  this.restoreRendererProgram();
};
