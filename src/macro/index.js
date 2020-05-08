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

const publicPath = "/images";
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
const metadataScrubber = (path) => `
require("sharp")("${path}").metadata().then(metadata => {
  process.stdout.write(JSON.stringify(metadata));
});
`;

const sourceImageFetcher = (url, path) => `
const { get } = require("https");
const { createWriteStream } = require("fs");

get("${url}", res => { res.pipe(createWriteStream("${path}")); })
`;

const toBlurHash = (path) => {
  const script = `
const { encode } = require("blurhash");
require("sharp")("${path}")
  .resize({ width: 200 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => { process.stdout.write(encode(data, info.width, info.height, 4, 3)); });
`;

  return execFileSync(process.execPath, ["-e", script], { encoding: "utf8" });
};

module.exports = createMacro(({ references, babel }) => {
  const t = babel.types;

  const toValue = (referencePath, sourceImage) => {
    /*
     * Resolve the path to the source image and make it absolute. We also
     * get the filename (without the extension).
     */
    const { path, name } = (() => {
      const ext = extname(sourceImage);
      const name = basename(sourceImage, ext);

      if (sourceImage.startsWith("https://")) {
        mkdirp.sync(cacheDirectory);
        const path = join(
          cacheDirectory,
          `zhif.${name}.${fingerprint(sourceImage)}${ext}`
        );
        if (!fs.existsSync(path)) {
          execFileSync(process.execPath, [
            "-e",
            sourceImageFetcher(sourceImage, path),
          ]);
        }
        return { name, path };
      } else {
        const { sourceFileName } = referencePath.hub.file.opts.parserOpts;
        return { name, path: join(dirname(sourceFileName), sourceImage) };
      }
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
        options: {},
      }),
    };

    /*
     * Pick a set of widths, reasonably spaced apart, but only up to the width of
     * the source image. It does not make sense to scale the image up.
     *
     * We include the width of the original image in this set, so that we generate
     * alternative formats (eg. WebP) in the same resolution as the original image.
     */
    const widths = imageWidths(metadata.width);

    const sources = (() => {
      const variants = [
        { type: "image/webp", ext: ".webp" },
        metadata.hasAlpha
          ? { type: "image/png", ext: ".png" }
          : { type: "image/jpeg", ext: ".jpg" },
      ];

      return variants.map(({ type, ext }) => {
        const files = widths.map((width) => ({
          src: generateImage({
            name: `${name}-${width}w`,
            image: image.clone().resize(width, null),
            hash,
            options: { width },
            ext,
          }),
          width,
        }));

        return {
          srcSet: files.map((x) => `${x.src} ${x.width}w`).join(", "),
          type,
        };
      });
    })();

    const value = {
      blurHash: toBlurHash(path),
      metadata: {
        width: metadata.width,
        height: metadata.height,
      },
      img,
      sources,
    };

    return { sourceImage, value };
  };

  if (references.Picture) {
    references.Picture.forEach((referencePath) => {
      const attrs = referencePath.parent.attributes;

      /*
       * The 'src' attribute is required, it must be present. All other attributes are passed
       * down to the <img> element.
       */
      const isSrcAttr = ({ name }) =>
        name.type === "JSXIdentifier" && name.name === "src";
      const src = attrs.find(isSrcAttr).value.value;
      const otherAttributes = attrs.filter((attr) => !isSrcAttr(attr));

      /*
       * These attributes are passed to the <source> elements.
       */
      const sourceAttributes = attrs.filter(
        (attr) =>
          attr.name.type === "JSXIdentifier" &&
          ["sizes"].includes(attr.name.name)
      );

      const { value } = toValue(referencePath, src);

      referencePath.parentPath.parentPath.replaceWith(
        t.jsxElement(
          t.jsxOpeningElement(t.jsxIdentifier("picture"), [
            t.jsxAttribute(
              t.jsxIdentifier("data-blur-hash"),
              t.stringLiteral(value.blurHash)
            ),
          ]),
          t.jsxClosingElement(t.jsxIdentifier("picture")),
          [
            ...value.sources.map((source) => {
              return t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier("source"),
                  [
                    ...sourceAttributes,
                    t.jsxAttribute(
                      t.jsxIdentifier("srcSet"),
                      t.stringLiteral(source.srcSet)
                    ),
                    t.jsxAttribute(
                      t.jsxIdentifier("type"),
                      t.stringLiteral(source.type)
                    ),
                  ],
                  true
                ),
                null,
                [],
                true
              );
            }),
            t.jsxElement(
              t.jsxOpeningElement(
                t.jsxIdentifier("img"),
                [
                  t.jsxAttribute(
                    t.jsxIdentifier("src"),
                    t.stringLiteral(value.img.src)
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier("width"),
                    t.jsxExpressionContainer(
                      t.numericLiteral(value.metadata.width)
                    )
                  ),
                  t.jsxAttribute(
                    t.jsxIdentifier("height"),
                    t.jsxExpressionContainer(
                      t.numericLiteral(value.metadata.height)
                    )
                  ),
                  ...otherAttributes,
                ],
                true
              ),
              null,
              [],
              true
            ),
          ],
          false
        )
      );
    });
  }

  if (references.importImage) {
    references.importImage.forEach((referencePath) => {
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
  const alnum = (x) => {
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

  return (t) => {
    q.push(t);
    go();
  };
})();

const generateImage = ({ name, image, hash, options = {}, ext }) => {
  if (process.env.NODE_ENV === "test") {
    return `${publicPath}/${name}-FINGERPRINT${ext}`;
  }

  const fp = fingerprint(hash, JSON.stringify(options), ext);
  const filename = `${name}-${fp}${ext}`;
  const path = `${publicPath}/${filename}`;

  queue(async () => {
    const t0 = performance.now();
    const cachePath = join(cacheDirectory, filename);
    await mkdirp(join(outputDirectory, "public", publicPath));

    try {
      await fs.promises.stat(join(outputDirectory, "public", path));
    } catch (e) {
      try {
        await fs.promises.stat(cachePath);
        await fs.promises.copyFile(
          cachePath,
          join(outputDirectory, "public", path)
        );
      } catch (e) {
        await image.toFile(join(outputDirectory, "public", path));
        await mkdirp(cacheDirectory);
        await fs.promises.copyFile(
          join(outputDirectory, "public", path),
          cachePath
        );
      }
    }

    const t1 = performance.now();
    const td = t1 - t0;
    console.log(`[ ${padLeft(5, formatDuration(td))} ] ${path}`);
  });

  return path;
};

const formatDuration = (td) => {
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

function* geometricSequence(a, r) {
  const round = (n) => {
    const c = Math.pow(10, Math.floor(Math.log10(n)) - 1);
    return Math.floor(n / c) * c;
  };

  while (true) {
    yield a;
    a = round(a * r);
  }
}

function* take(n, iterator) {
  for (const val of iterator) {
    if (!n--) {
      return;
    }
    yield val;
  }
}

function imageWidths(width) {
  return [100, ...take(10, geometricSequence(400, 1.5))]
    .filter((x) => x < width)
    .concat([width]);
}

module.exports.imageWidths = imageWidths;
