import fs from "./fs/index.js";
import proc from "./proc/index.js";
import sys from "./proc/syscalls.js";
import flags from "../misc/flags.js";
import utils from "../misc/utils.js";

export default {
  fs: fs,
  sys: sys,
  proc: proc,
  name: "faux",
  flags: flags,
  utils: utils,
  version: ""
};
