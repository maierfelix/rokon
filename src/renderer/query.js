import {
  uid
} from "../utils";

/**
 * A basic query class
 * @class WebGLQuery
 */
export default class WebGLQuery {
  /**
   * @param {Object} opts
   * @constructor
   */
  constructor(opts = {}) {
    this.uid = uid();
    this.enabled = false;
    this.type = opts.type;
    this.renderer = opts.renderer;
    this.gl = opts.gl;
    this.query = this.createQuery();
  }
};

/**
 * Creates the query
 */
WebGLQuery.prototype.createQuery = function() {
  let gl = this.gl;
  let query = gl.createQuery();
  return query;
};

/**
 * Enables the query
 */
WebGLQuery.prototype.enable = function() {
  let gl = this.gl;
  let query = this.query;
  gl.beginQuery(this.type, query);
  this.enabled = true;
};

/**
 * Disables the query
 */
WebGLQuery.prototype.disable = function() {
  let gl = this.gl;
  gl.endQuery(this.type);
};

/**
 * Indictes if the query is ready
 */
WebGLQuery.prototype.isReady = function() {
  let gl = this.gl;
  let query = this.query;
  return gl.getQueryParameter(query, gl.QUERY_RESULT_AVAILABLE);
};

/**
 * Returns the query's result
 */
WebGLQuery.prototype.getResult = function() {
  let gl = this.gl;
  let query = this.query;
  this.enabled = false;
  return gl.getQueryParameter(query, gl.QUERY_RESULT);
};
