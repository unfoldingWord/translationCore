import fs from 'fs-extra';

/**
 * replacement for ncp which is no longer maintained
 * @param {string} src
 * @param {string} out
 * @param {function} err - callback function err(e) where e is the error or undefined if success
 */
export function ncp(src, out, err) {
  try {
    fs.ensureDirSync(out);
    fs.copySync(src, out);
    err && err();
  } catch (e) {
    console.log(`ncp(${src}, ${out}) - error`, e);
    err && err(e);
  }
}
