import Pathname from "../../../misc/pathname.js";

export default class DOMFS {
  constructor(selectorBase = "") {
    this.base = selectorBase;
    this.resolveHard = this.resolve;
  }

  resolve(path) {
    const pathname = new Pathname(path);
    // If we are at the DOM root, i.e. /dev/dom/
    if (pathname.chop[0] === "/") {
      return document.querySelector("*");
    } else {
      let selector = " " + pathname.chop.join(" > ");
      // For child selection by index
      // element.children[0] becomes /dev/dom/element/1
      selector = selector.replace(/ (\d)/g, " :nth-child($1)");
      return document.querySelector(selector);
    }
  }
}
