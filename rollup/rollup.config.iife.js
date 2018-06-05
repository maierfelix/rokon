import config from "./rollup.config";
import json from "rollup-plugin-json";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";

config.output = {
  treeshake: false,
  indent: false,
  sourceMap: false,
  format: "iife",
  file: require("../package.json").browser
};
config.external = [];
config.plugins = [
  resolve({
    browser: true
  }),
  commonjs({
    sourceMap: false
  })
];

export default config;
