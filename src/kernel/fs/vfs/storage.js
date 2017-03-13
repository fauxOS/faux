// Virtual File System Layer

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

  // Resolve the path to the mounted filesystem
  // This is the first step to trace a path, before any data containers (inodes etc) are involved
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
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(pathname.clean);
    const fs = this.mounts[mountPoint];
    const fsLocalPath = pathname.clean.substring( mountPoint.length );
    if (resolveHard) {
      return fs.resolveHard(fsLocalPath);
    }
    else {
      return fs.resolve(fsLocalPath);
    }
  }

  // Return data type of a file, could be "inode" for example
  type(path) {
    const container = this.resolve(path);
    if (container instanceof OFS_Inode) {
      return "inode";
    }
    else if (container instanceof HTMLElement) {
      return "element"
    }
    else {
      return "unknown";
    }
  }

  // Remove a path
  rm(path) {
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(pathname.clean);
    const fs = this.mounts[mountPoint];
    return fs.rm(pathname.clean);
  }

  // Make a path, and add it as a file or directory
  // We won't check if the path already exists, we don't care
  // For hard or symbolic links, target should be the path to redirect to
  mkPath(type, path, target=null) {
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(pathname.clean);
    const fs = this.mounts[mountPoint];
    // Assume failure until success
    let addedObj = -1;
    if (type === "f") {
      addedObj = fs.mkFile(pathname.clean);
    }
    else if (type === "d") {
      addedObj = fs.mkDir(pathname.clean);
    }
    else if (type === "l" && target !== null) {
      const targetObj = this.resolve(target);
      if ( targetObj < 0 ) {
        // Target data container to hard link not resolved
        return -1;
      }
      addedObj = fs.mkLink(targetObj, pathname.clean);
    }
    else if (type === "sl" && target !== null) {
      addedObj = fs.mkSymLink(target, pathname.clean);
    }
    else {
      // Unknown type
      return -1;
    }
    return addedObj;
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
  ln(refPath, linkPath) {
    return this.mkPath("l", linkPath, refPath);
  }

  // Sybolic link
  lns(refPath, linkPath) {
    return this.mkPath("sl", linkPath, refPath);
  }
}
