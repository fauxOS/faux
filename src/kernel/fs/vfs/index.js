import OFS from "../ofs/index.js";
import { normalize, chop } from "../../../misc/path.js";

export default class VFS {
  constructor(rootDrive = new OFS()) {
    this.mounts = {
      "/": rootDrive
    };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    const normalized = normalize(mountPoint);
    const inode = this.resolve(normalized);
    if (inode && inode.dir) {
      this.mounts[normalized] = fs;
      return normalized;
    } else {
      throw new Error("No directory to mount to");
    }
  }

  // Unmount a filesystem by mount point
  unmount(mountPoint) {
    const normalized = normalize(mountPoint);
    this.mounts[normalized] = null;
  }

  // Resolve the path to the mounted filesystem
  // This is the first step to trace a path, before any data containers (inodes etc) are involved
  getMountPoint(path) {
    // Get the segments of a path like this : ["/", "/path", "/path/example"]
    const segments = (() => {
      const pathArray = chop(path);
      const segments = [];
      // Applies to any other path
      for (let i = 0; i <= pathArray.length; i++) {
        let matchPath = pathArray.slice(0, i);
        segments.push("/" + matchPath.join("/"));
      }
      return segments;
    })();
    // Array of resolved mounted disks
    const resolves = [];
    // Iterate all of the mount points
    const mountPoints = Object.keys(this.mounts).sort(
      (a, b) => a.length - b.length
    );
    mountPoints.forEach(point => {
      for (let i in segments) {
        if (segments[i] === point) {
          resolves.push(point);
        }
      }
    });
    // The most relevent mount point will be the last one resolved
    return resolves.pop();
  }

  // Resolve a path to its mounted filesystem, and get its absolute path
  // relative to its local file system's root
  getPathInfo(path) {
    const normalized = normalize(path);
    const mountPoint = this.getMountPoint(normalized);
    const localFsPath = normalized.substring(mountPoint.length) || "/";
    return {
      localFs: this.mounts[mountPoint],
      localFsPathArray: chop(localFsPath)
    };
  }

  // Resolve a path to the fs provided data container
  resolve(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.resolve(localFsPathArray);
  }

  // Make a new file
  create(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.create(localFsPathArray);
  }

  // Make a new directory
  mkdir(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.mkdir(localFsPathArray);
  }

  // Hard link newPath to the same inode as oldPath
  link(oldPath, newPath) {}

  // Unlink (remove) a file
  unlink(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    localFs.unlink(localFsPathArray);
  }
}
