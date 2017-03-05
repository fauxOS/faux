class FileDesc {
  constructor(path) {
    this.path = path;
    this.inode = box.fs.resolve(this.path);
  }
}