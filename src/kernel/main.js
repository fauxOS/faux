import fs from "./fs/main.js";
import sys from "./proc/syscalls.js";
import flags from "../misc/flags.js";
import utils from "../misc/utils.js";
import proc from "./proc/main.js";

export default {
  fs: fs,
  sys: sys,
  proc: proc,
  name: "faux",
  flags: flags,
  utils: utils,
  version: ""
};