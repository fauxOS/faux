class VFS {
  constructor() {
    this.mounts = {
      "/": arguments[0] || new OFS()
    };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    return this.mounts[mountPoint] = fs;
  }

  // Unmount a filesystem by mount point
  unmount(mountPoint) {
    return delete this.mounts[mountPoint];
  }

  // Resolve the path to the mounted a filesystem
  // This is the first step to trace a path, before inodes are involved
  mountPoint(path) {
    const pathname = new Pathname(path);
    const segments = pathname.segment;
    // All the mount points
    const mounts = Object.keys(this.mounts);
    // Array of resolved mounted disks
    const resolves = [];
    for (let i in mounts) {
      let mount = new Pathname(mounts[i]).clean;
      for (let i in segments) {
        if (segments[i] === mount) {
          resolves.push(mount);
        }
      }
    }
    const mountPoint = resolves.pop();
    return mountPoint;
  }

  // Resolve a path to the fs provided data container
  // resolveHard decides if following symbolic links and the like
  // should or should not happen, default is to follow
  resolve(path, resolveHard=false) {
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    if (resolveHard) {
      return fs.resolveHard(path);
    }
    else {
      return fs.resolve(path);
    }
  }
  
  // Return data type of a file, could be "inode" for example
  type(path) {
    const container = this.resolve(path);
    if (container instanceof OFS_Inode) {
      return "inode";
    }
  }

  // Remove an inode from its parent directory by path
  rm(path) {
    const pathname = new Pathname(path);
    const parent = pathname.parent;
    const parentInode = this.resolve(parent);
    const name = pathname.name;
    if ( parentInode < 0 ) {
      // Parent directory not resolved
      return -1;
    }
    return delete parentInode.files[name];
  }

  // Make a path, and add it as a file or directory
  // We won't check if the path already exists, we don't care
  // For hard or symbolic links, target should be the path to redirect to
  mkPath(type, path, target=null) {
    const pathname = new Pathname(path);
    const parent = pathname.parent;
    const parentInode = this.resolve(parent);
    const name = pathname.name;
    const mountPoint = this.mountPoint(pathname.clean);
    const fs = this.mounts[mountPoint];
    if ( parentInode < 0 ) {
      // Parent directory not resolved
      return -1;
    }
    // Assume failure until success
    let addedInode = -1;
    if (type === "f") {
      addedInode = fs.mkFile(name, parentInode);
    }
    else if (type === "d") {
      addedInode = fs.mkDir(name, parentInode);
    }
    else if (type === "l" && target !== null) {
      const targetInode = this.resolve(target);
      if ( targetInode < 0 ) {
        // Target inode to hard link not resolved
        return -1;
      }
      addedInode = fs.mkLink(name, parentInode, targetInode);
    }
    else if (type === "sl" && target !== null) {
      addedInode = fs.mkSymLink(name, parentInode, target);
    }
    else {
      // Unknown type
      return -1;
    }
    // Check if successful addition
    if (addedInode < 0) {
      // Inode addition error
      return -1;
    }
    return addedInode;
  }

  // mkPath() wrappers

  // Create a file
  touch(path) {
   return this.mkPath("f", path);
  }

  // Create a directory
  mkdir(path) {
   return this.mkPath("d", path);
  }

  // Hard link
  ln(path, targetPath) {
    return this.mkPath("l", path, targetPath);
  }

  // Sybolic link
  lns(path, targetPath) {
    return this.mkPath("sl", path, targetPath);
  }
}
