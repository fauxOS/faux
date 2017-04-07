import Pathname from "../../../misc/pathname.js";
import OFS_Inode from "./inode.js";

export default class OFS {
  constructor() {
    this.drive = arguments[0] || [
      new OFS_Inode({
        links: 1,
        id: 0,
        type: "d",
        files: {
          ".": 0,
          "..": 0
        }
      })
    ];
  }

  // Resolve path to an inode, don't follow symbolic links
  resolveHard(path) {
    let inode = 0;
    const trace = [inode];
    if (path === "") {
      return this.drive[inode];
    }
    const pathArray = new Pathname(path).chop;
    for (let i = 0; i < pathArray.length; i++) {
      const name = pathArray[i];
      const inodeObj = this.drive[inode];
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
    return this.drive[trace.pop()];
  }

  // Resolve and return the inode, follow symbolic links
  resolve(path, redirectCount = 0) {
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

  // Add a new inode to the disk
  // Defaults to just adding an inode, but if you pass a parent directory inode in,
  // it will add `name` as an entry in `parentInode`
  addInode(type, name = null, parentInode = null) {
    // Reject if name contains a "/"
    if (name.match("/")) {
      return -1;
    }
    const id = this.drive.length;
    this.drive[id] = new OFS_Inode({
      links: 1,
      type: type,
      id: id
    });
    // Check parent if inode and directory
    if (parentInode instanceof OFS_Inode && parentInode.type === "d") {
      parentInode.files[name] = id;
    }
    return this.drive[id];
  }

  // Add a new file to the disk
  mkFile(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    const inode = this.addInode("f", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    inode.data = "";
    return inode;
  }

  // Add a new directory Inode to the disk
  mkDir(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    const inode = this.addInode("d", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    inode.files = {
      ".": inode.id,
      "..": parentInode.id
    };
    return inode;
  }

  // Make a hard link for an inode
  mkLink(inode, path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    // Same as in addInode, not very DRY I know...
    if (name.match("/")) {
      return -1;
    }
    parentInode.files[name] = inode.id;
    return inode;
  }

  // Make a symbolic link inode
  mkSymLink(refPath, linkPath) {
    const pathname = new Pathname(linkPath);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    const inode = this.addInode("sl", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    const path = new Pathname(refPath).clean;
    inode.redirect = path;
    return inode;
  }

  // Remove by unlinking
  rm(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    if (parentInode < 0) {
      return -1;
    }
    return delete parentInode.files[name];
  }
}
