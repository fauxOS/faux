import Pathname from "../pathname.js";
import OFS_Inode from "../ofs/inode.js";
import OFS from "../ofs/main.js";
import DOMFS from "../domfs/main.js";

export default class VFS {
  constructor() {
    this.mounts = {
      "/": arguments[0] || new OFS()
    };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    this.mounts[mountPoint] = fs;
    return mountPoint;
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
    for (let i = 0; i < mounts.length; i++) {
      let mount = new Pathname(mounts[i]).clean;
      for (let i in segments) {
        if (segments[i] === mount) {
          resolves.push(mount);
        }
      }
    }
    // The most relevent mount point will be the last one resolved
    return resolves.pop();
  }

  // Resolve a path to the fs provided data container
  resolve(path) {
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    // This strips off the mountpoint path from the given path,
    // so that we can resolve relative to the filesystem's root.
    // Example: given path is "/dev/dom/head/title"
    // We find that the mountpoint is "/dev/dom".
    // "/dev/dom/head/title" - "/dev/dom" = "/head/title"
    // Pass "/head/title" to the local filesystem for it to resolve
    const fsLocalPath = new Pathname(path).clean.substring(mountPoint.length);
    return fs.resolve(fsLocalPath);
  }

  // Return data type of a file, could be "inode" for example
  type(path) {
    const container = this.resolve(path);
    if (container instanceof OFS_Inode) {
      return "inode";
    } else if (container instanceof HTMLElement) {
      return "element";
    } else {
      return "unknown";
    }
  }

  // Get permissions
  perms(path, type = this.type(path)) {
    if (type === "inode") {
      return this.resolve(path).perms;
    } else if (type === "element") {
      // Read and write only for HTML elements
      return [true, true, false];
    } else {
      // RW for anything unset
      return [true, true, false];
    }
  }

  // Remove a path
  rm(path) {
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    return fs.rm(pathname.clean);
  }

  // Make a path, and add it as a file or directory
  // We won't check if the path already exists, we don't care
  // For hard or symbolic links, target should be the path to redirect to
  mkPath(type, path, target = null) {
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    // Assume failure until success
    let addedObj = -1;
    if (type === "f") {
      addedObj = fs.mkFile(pathname.clean);
    } else if (type === "d") {
      addedObj = fs.mkDir(pathname.clean);
    } else if (type === "l" && target !== null) {
      const targetObj = this.resolve(target);
      if (targetObj < 0) {
        // Target data container to hard link not resolved
        return -1;
      }
      addedObj = fs.mkLink(targetObj, pathname.clean);
    } else if (type === "sl" && target !== null) {
      addedObj = fs.mkSymLink(target, pathname.clean);
    } else {
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
