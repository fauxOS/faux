import Pathname from "../../../misc/pathname.js";
import OFS from "../ofs/main.js";
import VNode from "./vnode.js";

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
    const pathname = new Pathname(path);
    const cleanName = pathname.clean;
    const mountPoint = this.mountPoint(cleanName);
    const fs = this.mounts[mountPoint];
    // This strips off the mountpoint path from the given path,
    // so that we can resolve relative to the filesystem's root.
    // Example: given path is "/dev/dom/head/title"
    // We find that the mountpoint is "/dev/dom".
    // "/dev/dom/head/title" - "/dev/dom" = "/head/title"
    // Pass "/head/title" to the local filesystem for it to resolve
    const fsLocalPath = cleanName.substring(mountPoint.length);
    const container = fs.resolve(fsLocalPath);
    if (container < 0) {
      return -1;
    }
    return new VNode(container);
  }

  touch(path) {
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    const fsLocalPath = pathname.clean.substring(mountPoint.length);
    const touched = fs.touch(fsLocalPath);
    if (touched < 0) {
      return -1;
    }
    return touched;
  }
}
