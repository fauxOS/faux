class VFS {
  constructor(rootDisk) {
    this.mounts = {
      "/": rootDisk
    };
  }

  // Mount a disk
  mount(disk, mountPoint) {
    return this.mounts[mountPoint] = disk;
  }

  // Unmount a disk by mount point
  unmount(mountPoint) {
    return delete this.mounts[mountPoint];
  }

  // Unmount a disk by uuid specifically
  unmountByUUID(uuid) {
    const mountPoints = Object.keys(box.fs.mounts);
    for ( let i in mountPoints ) {
      let mountPoint = mountPoints[i];
      if ( this.mounts[mountPoint].uuid === uuid ) {
        return delete this.mounts[mountPoint];
      }
    }
  }

  // Resolve a path to the mounted that disk it is on
  // This is the first step to trace a path, before inodes are involved
  getDisk(path) {
    const segments = [];
    const resolves = [];
    const pathArray = new Pathname(path).chop();
    for (let i = 0; i <= pathArray.length; i++) {
      let matchPath = pathArray.slice(0, i);
      segments.push( "/" + matchPath.join("/") );
    }
    const mounts = Object.keys(this.mounts);
    for (let i in mounts) {
      let mount = new Pathname(mounts[i]).clean();
      for (let i in segments) {
        if (segments[i] === mount) {
          resolves.push(mount);
        }
      }
    }
    const mountPoint = resolves.pop();
    const disk = this.mounts[mountPoint];
    const mountPointSegLen = new Pathname(mountPoint).chop().length;
    let returnPathArray = [];
    if (mountPointSegLen <= 1) {
      returnPathArray = pathArray.slice( mountPointSegLen );
    }
    else {
      returnPathArray = pathArray.slice( mountPointSegLen - 1 );
    }
    return {
      disk: disk,
      pathArray: returnPathArray
    };
  }

  // Resolve path to an inode, don't follow symbolic links
  resolveHard(path) {
    let inode = 0;
    const trace = [inode];
    const resolveInfo = this.getDisk(path);
    const disk = resolveInfo.disk;
    const pathArray = resolveInfo.pathArray;
    for (let i in pathArray) {
      const name = pathArray[i];
      const inodeObj = disk.inodes[inode];
      if (inodeObj.files === undefined) {
        console.warn("Could not resolve path to inodes completely, stopping at inode : " + inode);
        console.warn(trace);
        return -1;
      }
      inode = inodeObj.files[name];
      if (inode === undefined) {
        console.warn("Could not find end inode, failed at segment name : " + name);
        console.warn(trace);
        return -1;
      }
      trace.push(inode);
    }
    return disk.inodes[ trace.pop() ];
  }

  // Resolve and return the inode, symbolic link resolves to file it points to
  resolve(path, redirectCount=0) {
    // Don't follow if we get to 50 symbolic link redirects
    if (redirectCount >= 50) {
      console.warn("Max symbolic link redirect count reached (50) at " + path);
      return -1;
    }
    const inode = this.resolveHard(path);
    if (inode.type === "sl") {
      redirectCount++;
      return this.resolve(inode.redirect, redirectCount);
    }
    return inode;
  }

  // Remove an inode from its parent directory by path
  rm(path) {
    const pathname = new Pathname(path);
    const parent = pathname.parent();
    const name = pathname.name();
    const disk = this.getDisk(parent).disk;
    const parentInode = this.resolve(parent);
    if ( parentInode < 0 ) {
      console.warn("Parent directory, " + parent + " not resolved");
      return -1;
    }
    return delete disk.inodes[parentInode].files[name];
  }

  // Make a path, and add it as a file or directory
  // We won't check if the path already exists, we don't care
  // For hard or symbolic links, target should be the path to redirect to
  mkPath(type, path, target=null) {
    const pathname = new Pathname(path);
    const parent = pathname.parent();
    const name = pathname.name();
    const disk = this.getDisk(parent).disk;
    const parentInode = this.resolve(parent);
    if ( parentInode < 0 ) {
      console.warn("Parent directory, " + parent + " not resolved");
      return -1;
    }
    // Assume failure until success
    let addedInode = -1;
    if (type === "f") {
      addedInode = disk.mkFile(name, parentInode);
    }
    else if (type === "d") {
      addedInode = disk.mkDir(name, parentInode);
    }
    else if (type === "l" && target !== null) {
      const targetInode = this.resolve(target);
      if ( targetInode < 0 ) {
        console.warn("Target inode to hard link not resolved");
        return -1;
      }
      addedInode = disk.mkLink(name, parentInode, targetInode);
    }
    else if (type === "sl" && target !== null) {
      addedInode = disk.mkSymLink(name, parentInode, target);
    }
    else {
      console.warn("Unknown type : " + type);
      return -1;
    }
    // Check if successful addition
    if (addedInode < 0) {
      console.warn("Inode addition error");
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