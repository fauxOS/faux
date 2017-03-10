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

  // Resolve path to an inode, don't follow symbolic links
  resolveHard(path) {
    let inode = 0;
    const trace = [inode];
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(pathname.clean);
    const fs = this.mounts[mountPoint];
    const fsLocalPath = pathname.clean.substring( mountPoint.length );
    if (fsLocalPath === "") {
      return fs.drive[inode];
    }
    const pathArray = new Pathname(fsLocalPath).chop;
    for (let i in pathArray) {
      const name = pathArray[i];
      const inodeObj = fs.drive[inode];
      if (inodeObj.files === undefined) {
        // Could not resolve path to inodes completely
        return -1;
      }
      inode = inodeObj.files[name];
      if (inode === undefined) {
        // Could not find end inode, failed at segment name
        return -1;
      }
      trace.push(inode);
    }
    return fs.drive[ trace.pop() ];
  }

  // Resolve and return the inode, symbolic link resolves to file it points to
  resolve(path, redirectCount=0) {
    // Don't follow if we get to 50 symbolic link redirects
    if (redirectCount >= 50) {
      // Max symbolic link redirect count reached (50)
      return -1;
    }
    const inode = this.resolveHard(path);
    if (inode < 0) {
      // Error on hard resolve
      return -1;
    }
    if (inode.type === "sl") {
      redirectCount++;
      return this.resolve(inode.redirect, redirectCount);
    }
    return inode;
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
