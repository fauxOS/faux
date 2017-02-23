class Process {
  constructor( computer=window.box ) { 
    this.fs = computer.fs;
    this.fds = [];
  }

  // IO methods

  // Return a file descriptor
  open(path) {
    const fd = new FileDesc(path, this.fs);
    this.fds.push(fd);
    return this.fds.length - 1;
  }

  // Read from a file descriptor
  read(fdID) {
    const fd = this.fds[fdID];
    if (fd.inode.data !== undefined) {
      return fd.inode.data;
    }
    else {
      // No place to read data from
      return -1;
    }
  }

  // Write data to a file descriptor
  write(fdID, data) {
    const fd = this.fds[fdID];
    if (fd.inode.data !== undefined) {
      return fd.inode.data = data;
    }
    else {
      // No place to write data in the inode
      return -1;
    }
  }
}
