import fs from "./fs/index.js";
import proc from "./proc/index.js";
import * as sys from "./proc/syscalls.js";
import * as utils from "../misc/utils.js";
import browser from "../misc/browser.js";

export default {
  fs,
  sys,
  proc,
  utils,
  browser,
  name: "faux",
  version: ""
};
