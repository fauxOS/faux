class FileDesc {
  constructor(path, fs=window.box.fs) {
    this.path = path;
    this.inode = fs.resolve(this.path);
  }
}
