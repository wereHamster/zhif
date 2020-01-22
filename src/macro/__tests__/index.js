import pluginTester from "babel-plugin-tester";
import plugin from "babel-plugin-macros";
import { join } from "path";

pluginTester({
  plugin,
  title: "macro { importImage }",
  babelOptions: { filename: __filename },
  fixtures: join(__dirname, "..", "__fixtures__", "importImage")
});

pluginTester({
  plugin,
  title: "macro { Picture }",
  babelOptions: { filename: __filename, plugins: ["@babel/plugin-syntax-jsx"] },
  fixtures: join(__dirname, "..", "__fixtures__", "Picture")
});
