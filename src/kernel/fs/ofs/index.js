import Inode from "./inode.js";

export default class OFS {
  constructor(inodes) {
    this.inodes = inodes || [
      new Inode({
        dir: true,
        children: {}
      })
    ];
  }

  // Resolve path to an inode, don't follow symbolic links
  resolve(pathArray) {
    const rootInode = this.inodes[0];
    // An array of inodes, maps 1:1 with the pathArray
    const inodeArray = [rootInode];
    // We iterate over each part of the path, filling up inodeArray
    for (let i in pathArray) {
      // We need the previous inode's directory contents
      const prevInode = inodeArray.slice(-1)[0];
      // Path contains segement that isn't a directory
      if (!prevInode.children) {
        return -1;
      }
      // Get the next inode
      const name = pathArray[i];
      const nextInode = prevInode.children[name];
      // Path contains non-existent entry
      if (!nextInode) {
        return -2;
      }
      inodeArray.push(nextInode);
    }
    // Return the last inode resolved
    return inodeArray.pop();
  }

  // Add a new inode to the disk
  // Defaults to just adding an inode, but if you pass a parent directory inode in,
  // it will add `name` as an entry in `parent`
  addInode(parent, name, config) {
    // Reject if name contains a "/"
    if (name.match("/")) {
      return -1;
    }
    const inode = new Inode(config);
    // Check if parent is a directory
    if (parent.dir) {
      this.inodes.push(inode);
      parent.children[name] = inode;
    } else {
      // Parent is not a directory
      return -1;
    }
    return inode;
  }

  // Add a new file to the disk
  create(pathArray) {
    const parent = this.resolve(pathArray.slice(0, -1));
    const name = pathArray.slice(-1)[0];
    const inode = this.addInode(parent, name, { file: true, contents: "" });
    if (inode < 0) {
      return -1;
    }
    return inode;
  }

  // Add a new directory Inode to the disk
  mkdir(pathArray) {
    const parent = this.resolve(pathArray.slice(0, -1));
    const name = pathArray.slice(-1)[0];
    const inode = this.addInode(parent, name, { dir: true, children: {} });
    if (inode < 0) {
      return -1;
    }
    return inode;
  }

  // Make a hard link for an inode
  link(oldPathArray, newPathArray) {
    const oldInode = this.resolve(oldPathArray);
    const newParent = this.resolve(newPathArray.slice(0, -1));
    const newName = newPathArray.slice(-1)[0];
    // Reject if new name contains a "/"
    if (newName.match("/")) {
      return -1;
    }
    // Check if new parent is a directory
    if (newParent.dir) {
      newParent.children[newName] = oldInode;
    } else {
      // New parent is not a directory
      return -1;
    }
  }

  // Remove by unlinking
  unlink(pathArray) {
    const parent = this.resolve(pathArray.slice(0, -1));
    const name = pathArray.slice(-1)[0];
    if (parent < 0) {
      return -1;
    }
    // Check if parent is a directory
    if (parent.dir) {
      delete parent.children[name];
      return;
    } else {
      // Parent is not a directory
      return -1;
    }
  }
}
