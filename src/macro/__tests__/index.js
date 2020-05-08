import plugin from "babel-plugin-macros";
import pluginTester from "babel-plugin-tester";
import { join } from "path";
import { imageWidths } from "../index";

pluginTester({
  plugin,
  title: "macro { importImage }",
  babelOptions: { filename: __filename },
  fixtures: join(__dirname, "..", "__fixtures__", "importImage"),
});

pluginTester({
  plugin,
  title: "macro { Picture }",
  babelOptions: { filename: __filename, plugins: ["@babel/plugin-syntax-jsx"] },
  fixtures: join(__dirname, "..", "__fixtures__", "Picture"),
});

test("imageWidths", () => {
  expect(imageWidths(100)).toEqual([100]);
  expect(imageWidths(400)).toEqual([100, 400]);
  expect(imageWidths(1000)).toEqual([100, 400, 600, 900, 1000]);
  expect(imageWidths(1500)).toEqual([100, 400, 600, 900, 1300, 1500]);
  expect(imageWidths(4556)).toEqual([100, 400, 600, 900, 1300, 1900, 2800, 4200, 4556]);
});
