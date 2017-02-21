/*
 * Path name manipulations
 * p = new Pathname("/some///./../some/strange/././path")
 * p.clean() => "/some/strange/path"
 */
class Pathname {
  constructor(input) {
    this.input = input;
  }

  // clean up a crazy path
  // e.g. "/some///./../some/strange/././path" => "/some/strange/path"
  clean() {
    let clean = [];
    // Split the path by "/", match() because it doesn't add empty strings
    const pathArray = this.input.match( /[^/]+/g );
    // Iterate each name in the path
    for (let i in pathArray) {
      const name = pathArray[i];
      // If it's the current directory, don't do anything
      if (name === ".") {}
      // If it's the previous directory, remove the last added entry
      else if (name === "..") { clean.pop() }
      // Anything else, we add to the array plainly
      else { clean.push(name) }
    }
    // Array to path
    return "/" + clean.join("/");
  }

  // Chop a path into an array of names
  // "/paths/are/like/arrays" => ["paths", "are", "like", "arrays"]
  chop() {
    const segments = this.clean().match( /[^/]+/g );
    if (segments === null) {
      return ["/"];
    }
    else {
      return segments;
    }
  }

  // Just the name of the file/directory the path leads to
  name() {
    return this.chop().pop()
  }

  // Basename from the normal name
  // "filename.txt" => "filename"
  basename() {
    const name = this.name();
    if ( name === "" ) {
      return name;
    }
    else {
      const base = name.match( /^[^\.]+/ );
      if (base !== null) {
        return base[0];
      }
      else {
        return "";
      }
    }
  }

  // Parent name, get the directory holding this
  // "/directories/hold/files/like-this-one" => "/directories/hold/files"
  parent() {
    if ( this.name() === "/" ) {
      return null;
    }
    else {
      // Get the length of the path without the name in it
      const parentLen = this.clean().length - this.name().length;
      // Slice the name out of the path
      return this.clean().slice( 0, parentLen );
    }
  }

  // Extentions array from the name
  // "archive.tar.gz" => [".tar", ".gz"]
  extentions() {
    return this.name().match( /\.[^\.]+/g );
  }
}
class Inode {
  constructor(config = {}) {
    this.links = 0;
    // Merge inode config with `this` to override anything
    Object.assign( this, config );
  }
}

class Disk {
  constructor() {
    this.uuid = genUUID();
    this.inodes = [
      new Inode({
        links: 1,
        type: "d",
        files: {
          ".": 0,
          "..": 0
        }
      })
    ];
  }

  // Add a new inode to the disk
  addInode(type, name, parent) {
    // Reject if name contains a "/"
    if ( name.match("/") ) {
      console.warn("No '/' allowed in a name");
      return -1;
    }
    const id = this.inodes.length;
    this.inodes[id] = new Inode({
      links: 1,
      type: type
    });
    this.inodes[parent].files[name] = id;
    return id;
  }

  // Add a new file to the disk
  mkFile(name, parent) {
    const id = this.addInode("f", name, parent);
    if (id < 0) {
      return -1;
    }
    this.inodes[id].data = "";
    return id;
  }

  // Add a new directory Inode to the disk
  mkDir(name, parent) {
    const id = this.addInode("d", name, parent);
    if (id < 0) {
      return -1;
    }
    this.inodes[id].files = {
      ".": id,
      "..": parent
    }
    return id;
  }

  // Make a hard link inode
  mkLink(name, parent, targetID) {
    // Same as in addInode, not very DRY I know...
    if ( name.match("/") ) {
      console.warn("No '/' allowed in a name");
      return -1;
    }
    this.inodes[parent].files[name] = targetID;
    return targetID;
  }

  // Make a symbolic link inode
  mkSymLink(name, parent, targetPath) {
    const id = this.addInode("sl", name, parent);
    if (id < 0) {
      return -1;
    }
    const path = new Pathname(targetPath).clean();
    this.inodes[id].redirect = path;
    return id;
  }
}
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
    let add = -1;
    if (type === "f") {
      add = disk.mkFile(name, parentInode);
    }
    else if (type === "d") {
      add = disk.mkDir(name, parentInode);
    }
    else if (type === "l" && target !== null) {
      const targetInode = this.resolve(target);
      if ( targetInode < 0 ) {
        console.warn("Target inode to hard link not resolved");
        return -1;
      }
      add = disk.mkLink(name, parentInode, targetInode);
    }
    else if (type === "sl" && target !== null) {
      add = disk.mkSymLink(name, parentInode, target);
    }
    else {
      console.warn("Unknown type : " + type);
      return -1;
    }
    // Check if successful addition
    if (add < 0) {
      console.warn("Inode addition error");
      return -1;
    }
    return pathname.clean();
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
class Computer {
  constructor(name) {
    this.name = name;
    this.fs = new VFS( new Disk );
  }
}

// Use this as the computer
window.box = new Computer("fauxOS");