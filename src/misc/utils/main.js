import flags from "../flags.js";
import common from "./common.js";
import browser from "./browser.js";
import node from "./node.js";

const utils = common;

if (flags.isBrowser) {
  Object.assign(utils, browser);
}
else if (flags.isNode) {
  Object.assign(utils, node);
}

export default utils;