import { normalize, chop } from "../../../misc/path.js";
import { propR, Ok, Err } from "../../../misc/fp.js";

export default class VFS {
  constructor(rootFS) {
    this.mounts = { "/": rootFS };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    const normalized = normalize(mountPoint);
    this.resolve(normalized)
      .chain(propR("directory"))
      .map(
        isDirectory =>
          isDirectory
            ? Ok((this.mounts[normalized] = fs))
            : Err("No directory to mount to")
      );
  }

  // Unmount a filesystem by mount point
  unmount(mountPoint) {
    const normalized = normalize(mountPoint);
    return Ok(delete this.mounts[normalized]);
  }

  // Resolve a path to its mounted filesystem, and get its absolute path
  // relative to its local file system's root
  getPathInfo(path) {
    const normalized = normalize(path);
    const mountPoint = Object.keys(this.mounts)
      .filter(mount => normalized.startsWith(mount))
      .sort((a, b) => chop(b).length - chop(a).length)[0];

    const localFsPath = normalized.substring(mountPoint.length) || "/";
    return {
      localFs: this.mounts[mountPoint],
      localFsPathArray: chop(localFsPath)
    };
  }

  // Resolve a path to the fs provided data container
  // String -> Result(Inode)
  resolve(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.resolve(localFsPathArray);
  }

  // Make a new file
  // String -> Result(Inode)
  createFile(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.createFile(localFsPathArray);
  }

  // Make a new directory
  // String -> Result(Inode)
  createDirectory(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.createDirectory(localFsPathArray);
  }

  // Remove
  // String -> Result(Boolean)
  remove(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.remove(localFsPathArray);
  }
}
