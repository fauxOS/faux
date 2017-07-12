import fs from "../fs/index.js";
import { normalize } from "../../misc/path.js";
import getMode from "../../misc/mode.js";

export default class FileDescriptor {
  constructor(path, mode) {
    this.mode = getMode(mode);
    this.path = normalize(path);
    this.inode = fs.resolve(this.path);
    // Create if non-existent?
    if (!this.inode) {
      if (this.mode.create) {
        fs.create(this.path);
        // Try resolving a second time
        this.inode = fs.resolve(this.path);
        // Probably an error creating the file
        if (!this.inode) {
          // Error on file creation
          return -2;
        }
      } else {
        // Does not exist
        return -1;
      }
    }
    // Truncate if mode is set
    if (this.mode.truncate) {
      this.inode.truncate();
    }
  }

  // Return file contents
  read() {
    if (this.mode.read) {
      return this.inode.read();
    } else {
      // Read mode not set
      return -1;
    }
  }

  // Write file contents
  write(contents) {
    if (this.mode.write) {
      // Append if in append mode
      if (this.mode.append) {
        return this.inode.append(contents);
      } else {
        return this.inode.write(contents);
      }
    } else {
      // Write mode not set
      return -1;
    }
  }

  // Read directory contents
  readdir() {
    return this.inode.readdir();
  }
}
