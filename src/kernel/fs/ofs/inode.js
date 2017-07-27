export default class Inode {
  constructor(config = {}) {
    // Defaults
    this.links = 1;
    this.file = false;
    this.executable = false;
    this.dir = false;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Read file contents
  read() {
    if (this.file) {
      return this.contents;
    } else {
      throw new Error("Not a file");
    }
  }

  // Overwrite file contents
  write(contents) {
    if (this.file) {
      this.contents = contents;
      return;
    } else {
      throw new Error("Not a file");
    }
  }

  // Append file contents
  append(contents) {
    if (this.file) {
      this.contents += contents;
      return;
    } else {
      throw new Error("Not a file");
    }
  }

  // Truncate file contents
  truncate() {
    if (this.file) {
      this.contents = "";
      return;
    } else {
      throw new Error("Not a file");
    }
  }

  // Read a directory
  readdir() {
    if (this.dir) {
      return Object.keys(this.children);
    } else {
      throw new Error("Not a directory");
    }
  }
}
