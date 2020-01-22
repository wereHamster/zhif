/*
 * This small module exists for the sole reason so that we can get the image
 * metadata in synchronous code.
 *
 * The code running in a babel macro must be synchronous (no async code). But
 * the sharp function to get the image metadata is async. There is a 'deasync'
 * node module but its use is discouraged.
 *
 * We solve this problem by running this code in synchronous subprocess
 * (child_process execFileSync), and parsing its stdout.
 */

const sharp = require("sharp");

const image = sharp(process.argv[2]);
image.metadata().then(metadata => {
  process.stdout.write(JSON.stringify(metadata));
});
