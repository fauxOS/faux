class FileDesc {
  constructor(path) {
    this.path = path;
    this.inode = faux.fs.resolve(this.path);
  }
}