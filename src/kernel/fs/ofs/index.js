import Inode from "./inode.js";

export default class OFS {
  constructor(inodes) {
    // Array of all inodes in this file system
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
      if (!prevInode.children) {
        throw new Error("Path contains segement that isn't a directory");
      }
      // Get the next inode
      const name = pathArray[i];
      const nextInode = prevInode.children[name];
      if (!nextInode) {
        throw new Error("Path contains non-existent entry");
      }
      inodeArray.push(nextInode);
    }
    // Return the last inode resolved
    return inodeArray.pop();
  }

  // Add an inode directly to a parent
  addInode(parentPathArray, name, inode) {
    if (name.match("/")) {
      throw new Error("Name can't contain forward slashes");
    }
    const parent = this.resolve(parentPathArray);
    // Check if parent is a directory
    if (parent.dir) {
      this.inodes.push(inode);
      parent.children[name] = inode;
    } else {
      throw new Error("Parent is not a directory");
    }
  }

  // Add a new file to the disk
  create(pathArray) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    const inode = new Inode({ file: true, contents: "" });
    this.addInode(parent, name, inode);
    return inode;
  }

  // Add a new directory Inode to the disk
  mkdir(pathArray) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    const inode = new Inode({ dir: true, children: {} });
    this.addInode(parent, name, inode);
    return inode;
  }

  // Make a hard link for an inode
  link(oldPathArray, newPathArray) {
    const oldInode = this.resolve(oldPathArray);
    const newParent = this.resolve(newPathArray.slice(0, -1));
    const newName = newPathArray.slice(-1)[0];
    if (newName.match("/")) {
      throw new Error("Name can't contain forward slashes");
    }
    // Check if new parent is a directory
    if (newParent.dir) {
      newParent.children[newName] = oldInode;
      oldInode.links++;
    } else {
      throw new Error("New parent is not a directory");
    }
  }

  // Remove by unlinking
  unlink(pathArray) {
    const parent = this.resolve(pathArray.slice(0, -1));
    const name = pathArray.slice(-1)[0];
    // Check if parent is a directory
    if (parent.dir) {
      delete parent.children[name];
      return;
    } else {
      throw new Error("Parent is not a directory");
    }
  }
}
