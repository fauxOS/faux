import OFS_Inode from "../ofs/inode.js";

export default class VNode {
  constructor(container) {
    this.container = container;
    this.type = this.findType();
    this.perms = this.findPerms();
  }

  findType() {
    if (this.container instanceof OFS_Inode) {
      return "inode";
    } else if (this.container instanceof HTMLElement) {
      return "element";
    } else {
      return "unknown";
    }
  }

  findPerms() {
    if (this.type === "inode") {
      return this.container.perms;
    } else {
      return [true, true, false];
    }
  }

  get data() {
    // Check read permission
    if (!this.perms[0]) {
      return -1;
    }
    if (this.type === "inode") {
      const data = this.container.data;
      // Directory or other
      if (data === undefined) {
        return -2;
      }
      return data;
    } else if (this.type === "element") {
      return this.container.innerHTML;
    } else {
      return -1;
    }
  }

  set data(data) {
    // Check write permission
    if (!this.perms[1]) {
      return -1;
    }
    if (this.type === "inode") {
      this.container.data = data;
      return data;
    } else if (this.type === "element") {
      this.container.innerHTML = data;
      return data;
    } else {
      return -1;
    }
  }

  get files() {
    // Check read permission
    if (!this.perms[0]) {
      return -1;
    }
    if (this.type === "inode") {
      if (this.container.type === "d") {
        return Object.keys(this.container.files);
      } else {
        return null;
      }
    } else if (this.type === "element") {
      if (this.container.hasChildNodes()) {
        const children = this.container.children;
        const elements = [];
        for (let i = 0; i < children.length; i++) {
          let el = children[i].localName;
          let id = children[i].id;
          let classes = children[i].className.split(" ").join(".");
          elements.push(el + id + classes);
          // Child by index
          elements.push(i + 1);
        }
        return elements;
      } else {
        return null;
      }
    } else {
      return -1;
    }
  }
}
