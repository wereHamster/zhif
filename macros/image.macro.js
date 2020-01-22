const { join, dirname, basename, extname } = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { performance } = require("perf_hooks");
const { cpus } = require("os");
const { execFileSync } = require("child_process");

/*
 * Third-party dependencies
 */
const { parse } = require("@babel/parser");
const sharp = require("sharp");
const { createMacro } = require("babel-plugin-macros");
const pkgDir = require("pkg-dir");
const mkdirp = require("mkdirp");

/*
 * Configuration
 */

const publicPath = "/static/images";
const outputDirectory = pkgDir.sync();
const cacheDirectory = `${outputDirectory}/node_modules/.cache/images/`;

/*
 * This small inline module exists for the sole reason so that we can get the image
 * metadata inside synchronous code.
 *
 * The code running in a babel macro must be synchronous (no async code). But
 * the sharp function to get the image metadata is async. There is a 'deasync'
 * node module which one can use to convert async code to sync code, but its
 * use is discouraged.
 *
 * We solve this problem by running the following code in a synchronous subprocess
 * (child_process execFileSync). The code loads the metadata from the image and
 * prints it to stdout, where we can read it from.
 */
const metadataScrubber = path => `
require("sharp")("${path}").metadata().then(metadata => {
  process.stdout.write(JSON.stringify(metadata));
});
`;

module.exports = createMacro(({ references, babel }) => {
  const t = babel.types;

  const toValue = (referencePath, sourceImage) => {
    /*
     * Resolve the path to the source image and make it absolute. We also
     * get the filename (without the extension).
     */
    const { path, name } = (() => {
      const { sourceFileName } = referencePath.hub.file.opts;
      return {
        path: join(dirname(sourceFileName), sourceImage),
        name: basename(sourceImage, extname(sourceImage))
      };
    })();

    /*
     * Read the file so we can construct its hash, which we use to generate
     * the output filenames. This needs to happen synchronously, because we
     * use this hash in the generated code.
     */
    const hash = fingerprint(fs.readFileSync(path));

    /*
     * Load the file into Sharp.
     */
    const image = sharp(path);

    /*
     * Synchronously get the metadata. See the './metadata.js' file for details.
     */
    const metadata = JSON.parse(
      execFileSync(process.execPath, ["-e", metadataScrubber(path)])
    );

    /*
     * The fallback for browsers which don't support the <picture> element.
     *
     * If the original image uses transparency, then we generate a png,
     * otherwise we convert to jpg.
     *
     * There are situations where it's better to use a png even if the image
     * does not use transparency. However we don't support that option. Modern
     * browsers will use WebP anyways.
     */
    const img = {
      src: generateImage({
        name: `${name}`,
        image: image.clone(),
        hash,
        ext: metadata.hasAlpha ? ".png" : ".jpg",
        options: {}
      })
    };

    /*
     * Pick a set of widths, reasonably spaced apart, but only up to the width of
     * the source image. It does not make sense to scale the image up.
     *
     * We include the width of the original image in this set, so that we generate
     * alternative formats (eg. WebP) in the same resolution as the original image.
     */
    const widths = [400, 1000, 2500, 5000]
      .filter(x => x < (metadata.width * 2) / 3)
      .concat([metadata.width]);

    const sources = (() => {
      const variants = [
        { type: "image/webp", ext: ".webp" },
        metadata.hasAlpha
          ? { type: "image/png", ext: ".png" }
          : { type: "image/jpeg", ext: ".jpg" }
      ];

      return variants.map(({ type, ext }) => {
        const files = widths.map(width => ({
          src: generateImage({
            name: `${name}-${width}w`,
            image: image.clone().resize(width, null),
            hash,
            options: { width },
            ext
          }),
          width
        }));

        return {
          srcSet: files.map(x => `${x.src} ${x.width}w`).join(", "),
          type
        };
      });
    })();

    const value = {
      metadata: {
        width: metadata.width,
        height: metadata.height
      },
      img,
      sources
    };

    return { sourceImage, value };
  };

  if (references.Picture) {
    references.Picture.forEach(referencePath => {
      const attrs = referencePath.parent.attributes;

      /*
       * The 'src' attribute is required, it must be present. All other attributes are passed
       * down to the <img> element.
       */
      const isSrcAttr = ({ name }) =>
        name.type === "JSXIdentifier" && name.name === "src";
      const src = attrs.find(isSrcAttr).value.value;
      const otherAttributes = attrs.filter(attr => !isSrcAttr(attr));

      const { value } = toValue(referencePath, src);

      referencePath.parentPath.parentPath.replaceWith(
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier("picture"), []),
          t.jsxClosingElement(t.jsxIdentifier("picture")),
          [
            ...value.sources.map(source => {
              return t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier("source"), [
                  t.jsxAttribute(
                    t.jsxIdentifier("srcSet"),
                    t.stringLiteral(source.srcSet)
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier("type"),
                    t.stringLiteral(source.type)
                  )
                ]),
                null,
                [],
                true
              );
            }),
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier("img"), [
                t.jsxAttribute(
                  t.jsxIdentifier("src"),
                  t.stringLiteral(value.img.src)
                ),
                ...otherAttributes
              ]),
              null,
              [],
              true
            )
          ],
          false
        )
      );
    });
  }

  if (references.importImage) {
    references.importImage.forEach(referencePath => {
      const { sourceImage, value } = toValue(
        referencePath,
        referencePath.parent.arguments[0].value
      );

      const replacement = parse(`
      (() => {
        require("null-loader!!${sourceImage}")
        return ${JSON.stringify(value)}
      })()
    `);

      referencePath.parentPath.replaceWith(replacement.program.body[0]);
    });
  }
});

const fingerprint = (...buffers) => {
  const hash = crypto.createHash("sha256");
  for (const buffer of buffers) {
    hash.update(buffer);
  }
  const ret = hash.digest();
  const alnum = x => {
    if (x < 26) return x + 65;
    if (x < 52) return x - 26 + 97;
    if (x < 62) return x - 52 + 48;
    throw new Error(`alnum: value out of range: ${x}`);
  };
  for (const [index, value] of ret.entries()) {
    ret[index] = alnum(value % 62);
  }
  return ret.toString("utf8");
};

const queue = (() => {
  const maxRunning = cpus().length - 1;
  const q = [];
  let numRunning = 0;

  const go = async () => {
    if (numRunning >= maxRunning) {
      return;
    }

    const t = q.pop();
    if (t) {
      numRunning++;
      await t();
      numRunning--;
    }

    if (q.length > 0) {
      go();
    }
  };

  return t => {
    q.push(t);
    go();
  };
})();

const generateImage = ({ name, image, hash, options = {}, ext }) => {
  const fp = fingerprint(hash, JSON.stringify(options), ext);
  const filename = `${name}-${fp}${ext}`;
  const path = `${publicPath}/${filename}`;

  queue(async () => {
    const t0 = performance.now();
    const cachePath = join(cacheDirectory, filename);
    mkdirp.sync(join(outputDirectory, publicPath));

    try {
      await fs.promises.stat(`${outputDirectory}${path}`);
    } catch (e) {
      try {
        await fs.promises.stat(cachePath);
        await fs.promises.copyFile(cachePath, `${outputDirectory}${path}`);
      } catch (e) {
        await image.toFile(`${outputDirectory}${path}`);
        mkdirp.sync(cacheDirectory);
        await fs.promises.copyFile(`${outputDirectory}${path}`, cachePath);
      }
    }

    const t1 = performance.now();
    const td = t1 - t0;
    console.log(`[ ${padLeft(5, formatDuration(td))} ] ${path}`);
  });

  return path;
};

const formatDuration = td => {
  if (td >= 1000) {
    return `${Math.round(td / 100) / 10}s`;
  } else {
    return `${Math.round(td)}ms`;
  }
};

const padLeft = (n, s) =>
  `${Array(Math.max(0, n - s.length))
    .fill(" ")
    .join("")}${s}`;
