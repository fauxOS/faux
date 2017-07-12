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
    // Return an inode that VFS can understand
    return new Inode({
      dir: true,
      children: element.children,
      file: true,
      contents: element.outerHTML
    });
  }

  // Create a new element
  create(pathArray) {
    const parent = this.resolve(pathArray.slice(0, -1));
    if (!parent) {
      return -1;
    }
    // When creating an element, you are only allowed to use the element name
    // e.g. create("/dev/dom/body/#container/span")
    // You cannot create a class, index, or id
    const name = pathArray.slice(-1)[0];
    const element = document.createElement(name);
    parent.appendChild(element);
    // Again, so that VFS understands
    return new Inode({
      dir: true,
      children: element.children,
      file: true,
      contents: element.outerHTML
    });
  }

  // In the DOM, link and unlink make no sense
  link() {}

  unlink() {}
}
