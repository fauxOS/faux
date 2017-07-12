export default class Inode {
  constructor(config = {}) {
    this.links = 1;
    this.executable = false;
    Object.assign(this, config);
  }

  // Read file contents
  read() {
    if (this.file) {
      return this.contents;
    } else {
      // Not a file
      return -1;
    }
  }

  // Overwrite file contents
  write(contents) {
    if (this.file) {
      this.contents = contents;
      return;
    } else {
      // Not a file
      return -1;
    }
  }

  // Append file contents
  append(contents) {
    if (this.file) {
      this.contents += contents;
      return;
    } else {
      // Not a file
      return -1;
    }
  }

  // Truncate file contents
  truncate() {
    if (this.file) {
      this.contents = "";
      return;
    } else {
      // Not a file
      return -1;
    }
  }

  // Read a directory
  readdir() {
    if (this.dir) {
      return Object.keys(this.children);
    } else {
      // Not a directory
      return -1;
    }
  }
}
