import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

export default [
  {
    input: "src/macro/index.js",
    output: {
      file: "packages/macro/index.js",
      format: "commonjs",
    },
    plugins: [
      resolve(),
      commonjs(),
      terser(),
      copy({
        targets: [{ src: "src/macro/index.d.ts", dest: "packages/macro/" }],
      }),
    ],
    external: [
      ...require("builtin-modules"),
      ...Object.keys(require("./packages/macro/package.json").peerDependencies),
    ],
  },
];
