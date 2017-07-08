import OFS from "../ofs/index.js";
import { normalize, chop } from "../../../misc/path.js";
import VNode from "./vnode.js";

export default class VFS {
  constructor(rootDrive = new OFS()) {
    this.mounts = {
      "/": rootDrive
    };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    const normalized = normalize(mountPoint);
    this.mounts[normalized] = fs;
    return normalized;
  }

  // Unmount a filesystem by mount point
  unmount(mountPoint) {
    const normalized = normalize(mountPoint);
    return delete this.mounts[normalized];
  }

  // Resolve the path to the mounted filesystem
  // This is the first step to trace a path, before any data containers (inodes etc) are involved
  mountPoint(path) {
    // Get the segments of a path like this : ["/", "/path", "/path/example"]
    const pathArray = chop(path);
    // If its a root path, skip segments
    if (pathArray.length === 1 && pathArray[0] === "/") {
      return pathArray;
    }
    const segments = [];
    // Applies to any other path
    for (let i = 0; i <= pathArray.length; i++) {
      let matchPath = pathArray.slice(0, i);
      segments.push("/" + matchPath.join("/"));
    }
    // Array of resolved mounted disks
    const resolves = [];
    // Iterate all of the mount points
    Object.keys(this.mounts).forEach(mount => {
      for (let i in segments) {
        if (segments[i] === mount) {
          resolves.push(mount);
        }
      }
    });
    // The most relevent mount point will be the last one resolved
    return resolves.pop();
  }

  // Resolve a path to the fs provided data container
  resolve(path) {
    const normalized = normalize(path);
    const mountPoint = this.mountPoint(normalized);
    const fs = this.mounts[mountPoint];
    // This strips off the mountpoint path from the given path,
    // so that we can resolve relative to the filesystem's root.
    // Example: given path is "/dev/dom/head/title"
    // We find that the mountpoint is "/dev/dom".
    // "/dev/dom/head/title" - "/dev/dom" = "/head/title"
    // Pass "/head/title" to the local filesystem for it to resolve
    const fsLocalPath = normalized.substring(mountPoint.length);
    const container = fs.resolve(fsLocalPath);
    if (container < 0) {
      return -1;
    }
    return new VNode(container);
  }

  touch(path) {
    const normalized = normalize(path);
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    const fsLocalPath = normalized.substring(mountPoint.length);
    const touched = fs.touch(fsLocalPath);
    if (touched < 0) {
      return -1;
    }
    return touched;
  }
}
