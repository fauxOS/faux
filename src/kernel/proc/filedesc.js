import fs from "../fs/index.js";
import { normalize } from "../../misc/path.js";
import getMode from "../../misc/mode.js";

export default class FileDescriptor {
  constructor(path, mode) {
    this.mode = getMode(mode);
    this.path = normalize(path);
    try {
      this.inode = fs.resolve(this.path);
    } catch (err) {
      // Create if non-existent?
      if (this.mode.create) {
        fs.create(this.path);
        // Try resolving a second time
        this.inode = fs.resolve(this.path);
        // Probably an error creating the file
        if (!this.inode) {
          throw new Error("Error on file creation");
        }
      } else {
        throw new Error("Does not exist");
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
      throw new Error("Read mode unset");
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
      throw new Error("Write mode unset");
    }
  }

  // Read directory contents
  readdir() {
    return this.inode.readdir();
  }
}
