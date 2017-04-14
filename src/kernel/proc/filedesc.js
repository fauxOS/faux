import fs from "../fs/main.js";
import Pathname from "../../misc/pathname.js";
import getMode from "../../misc/mode.js";

export default class FileDescriptor {
  constructor(path, mode) {
    this.mode = getMode(mode);
    this.path = new Pathname(path).clean;
    this.vnode = fs.resolve(this.path);
    // Create if non-existent?
    if (this.vnode < 0) {
      if (!this.mode[3]) {
        throw new Error("Path Unresolved");
      } else {
        fs.touch(this.path);
        this.vnode = fs.resolve(this.path);
        // Probably an error creating the file
        if (this.vnode < 0) {
          throw new Error("Error on file creation or resolve");
        }
      }
    }
    // If truncate in mode
    if (this.mode[2]) {
      this.truncate();
    }
    this.type = this.vnode.type;
  }

  truncate() {
    this.vnode.data = "";
  }

  // Return read data
  read() {
    // Read mode set?
    if (!this.mode[0]) {
      return -1;
    }
    return this.vnode.data;
  }

  // Write data out
  write(data) {
    return (this.vnode.data = data);
  }

  // View "directory" contents or return null
  readdir() {
    return this.vnode.files;
  }
}
