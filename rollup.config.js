import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

function packageExternal(path) {
  return [
    ...Object.keys(require(path).dependencies || {}),
    ...Object.keys(require(path).peerDependencies || {}),
  ];
}

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
      ...packageExternal("./packages/macro/package.json"),
    ],
  },
  {
    input: "packages/components/index.js",
    output: {
      file: "packages/components/index.cjs",
      format: "commonjs",
    },
    plugins: [resolve(), commonjs()],
    external: [
      ...require("builtin-modules"),
      ...packageExternal("./packages/components/package.json"),
    ],
  },
];
