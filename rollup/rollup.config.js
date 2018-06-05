import json from "rollup-plugin-json";

export default {
  input: "src/index.js",
  name: require("../package.json").moduleName,
  external: [],
  plugins: [
    json()
  ]
};
