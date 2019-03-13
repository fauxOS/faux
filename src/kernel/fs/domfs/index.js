import Inode from "./inode.js";
import { Ok, Err, Just, Nothing, propM, propR } from "../../../misc/fp.js";

export default class DOMFS {
  // [String] -> Result(Inode)
  resolve(pathArray) {
    // element.children[0] becomes /dev/dom/element/1
    const selector =
      pathArray.length === 0
        ? "*" // Return root if pathArray is empty
        : (" " + pathArray.join(" > ")).replace(/ (\d)/g, " :nth-child($1)");
    const element = document.querySelector(selector);
    return element ? Ok(new Inode({ raw: element })) : Err("Failed to resolve");
  }

  // Create a new element
  // [String] -> Result(Inode)
  createFile(pathArray) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    const element = document.createElement(name);
    return this.resolve(parent)
      .chain(propR("raw"))
      .chain(parentEl => parentEl.appendChild(element))
      .map(() => new Inode({ raw: element }));
  }

  // Only makes sense in the DOM, all nodes are both files and directories
  // [String] -> Result(Inode)
  createDirectory(pathArray) {
    return this.createFile(pathArray);
  }

  // Remove
  // [String] -> Result(Boolean)
  remove(pathArray) {
    return this.resolve(pathArray)
      .chain(propR("raw"))
      .chain(element => element.remove());
  }
}
