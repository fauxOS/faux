import fs from "./fs/index.js";
import proc from "./proc/index.js";
import * as sys from "./proc/syscalls.js";
import * as utils from "../misc/utils.js";
import browser from "../misc/browser.js";
import console from "./fs/dev/console/index.js";

export default {
  fs,
  sys,
  proc,
  utils,
  console,
  browser,
  version: "inject-version"
};
