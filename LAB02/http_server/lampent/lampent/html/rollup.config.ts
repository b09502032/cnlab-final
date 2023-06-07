import { nodeResolve } from "@rollup/plugin-node-resolve";
import * as rollupPluginTypescript from "@rollup/plugin-typescript";
import { copy } from "@web/rollup-plugin-copy";
import { rollupPluginHTML } from "@web/rollup-plugin-html";
import * as rollup from "rollup";

const options: rollup.RollupOptions = {
  input: [],
  output: {
    dir: "build",
  },
  plugins: [
    rollupPluginHTML({
      input: ["**/*.html"],
      flattenOutput: false,
      rootDir: "pages",
      extractAssets: false,
    }),
    nodeResolve(),
    rollupPluginTypescript.default(),
    copy({
      patterns: ["images/**/*", "css/**/*"],
      exclude: [],
      rootDir: undefined,
    }),
  ],
};

export default options;
