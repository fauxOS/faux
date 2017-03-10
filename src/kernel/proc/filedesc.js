// "Everything is a file"
// This is the layer that makes that idea possible

class FileDescriptor {
  constructor(path) {
    this.path = new Pathname(path).clean;
    this.type = faux.fs.type(this.path);
    this.container = faux.fs.resolve(this.path);
    if (this.container < 0) {
      throw new Error("Path Unresolved");
    }
  }

  // Return read data
  read() {
    if (this.type === "inode") {
      const data = this.container.data;
      // Directory or other
      if (data == null) {
        return -1;
      }
      return data;
    }
  }

  // Write data out
  write(data) {
    if (this.type === "inode") {
      return this.container.data = data;
    }
  }
}
