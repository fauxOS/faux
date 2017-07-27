import Inode from "./inode.js";

export default class DOMFS {
  constructor() {
    // In the DOM context, this alias makes sense
    this.mkdir = this.create;
  }

  resolve(pathArray) {
    let element;
    // Return root if pathArray is empty
    if (pathArray.length === 0) {
      // Return the document root element
      element = document.querySelector("*");
    } else {
      let selector = " " + pathArray.join(" > ");
      // For child selection by index
      // element.children[0] becomes /dev/dom/element/1
      selector = selector.replace(/ (\d)/g, " :nth-child($1)");
      element = document.querySelector(selector);
    }
    if (!element) {
      throw new Error("Failed to resolve");
    }
    // Return an inode that VFS can understand
    return new Inode({
      raw: element
    });
  }

  // Create a new element
  create(pathArray) {
    const parent = this.resolve(pathArray.slice(0, -1));
    // When creating an element, you are only allowed to use the element name
    // e.g. create("/dev/dom/body/#container/span")
    // You cannot create a class, index, or id
    const name = pathArray.slice(-1)[0];
    const element = document.createElement(name);
    // Access the DOM node in parent.raw
    parent.raw.appendChild(element);
    // Again, so that VFS understands
    return new Inode({
      raw: element
    });
  }

  // In the DOM, link and unlink make no sense
  link() {}
  unlink() {}
}
