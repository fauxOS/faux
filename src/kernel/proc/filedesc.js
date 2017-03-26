import fs from "../fs/main.js";
import Pathname from "../fs/pathname.js";

export default class FileDescriptor {
  constructor(path) {
    this.path = new Pathname(path).clean;
    this.type = fs.type(this.path);
    this.container = fs.resolve(this.path);
    if (this.container < 0) {
      throw new Error("Path Unresolved");
    }
  }

  // Return read data
  read() {
    if (this.type === "inode") {
      const data = this.container.data;
      // Directory or other
      if (data === undefined) {
        return -1;
      }
      return data;
    }
    else if (this.type === "element") {
      return this.container.innerHTML;
    }
    else {
      return -1;
    }
  }

  // Write data out
  write(data) {
    if (this.type === "inode") {
      this.container.data = data;
      return data;
    }
    else if (this.type === "element") {
      this.container.innerHTML = data;
      return data;
    }
    else {
      return -1;
    }
  }

  // View "directory" contents or return null
  dir() {
    if (this.type === "inode") {
      if ( this.container.type === "f" ) {
        return Object.keys( this.container.files );
      }
      else {
        return null;
      }
    }
    else if (this.type === "element") {
      if ( this.container.hasChildNodes() ) {
        const children = this.container.children;
        const elements = [];
        for (let i = 0; i < children.length; i++) {
          let el = children[i].localName;
          let id = children[i].id;
          let classes = children[i].className.split(" ").join(".");
          elements.push( el + id + classes );
          // Child by index
          elements.push(i + 1);
        }
        return elements;
      }
      else {
        return null;
      }
    }
    else {
      return -1;
    }
  }
}