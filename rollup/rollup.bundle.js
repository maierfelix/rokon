const fs = require("fs");
const pkg = require("../package.json");

const rollup = require("rollup");
const json = require("rollup-plugin-json");
const buble = require("rollup-plugin-buble");
const resolve = require("rollup-plugin-node-resolve");
const commonjs = require("rollup-plugin-commonjs");

let inputOptions = {
  input: "src/index.js",
  external: [],
  plugins: [
    json(),
    buble(),
    resolve({
      jsnext: true,
      browser: true
    }),
    commonjs({
      namedExports: {}
    })
  ]
};

let outputOptions = {
  file: require("../package.json").browser,
  format: "iife"
};

async function build() {
  const bundle = await rollup.rollup(inputOptions);
  const { code, map } = await bundle.generate(outputOptions);
  await bundle.write(outputOptions);
};

build();
