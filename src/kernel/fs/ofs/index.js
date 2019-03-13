import Inode from "./inode.js";
import { Ok, Err, propR } from "../../../misc/fp.js";

export default class OFS {
  constructor() {
    // Array of all inodes in this file system
    this.inodes = [
      new Inode({
        children: {},
        directory: true
      })
    ];
  }

  // Resolve path to an inode, don't follow symbolic links
  // [String] -> Result(Inode)
  resolve(pathArray) {
    // Follow the path, starting with the root inode
    return pathArray.reduce(
      (previousInode, name) =>
        previousInode.chain(propR("children")).chain(propR(name)),
      Ok(this.inodes[0])
    );
  }

  // Add an inode directly
  // [String] * Inode -> Result(Inode)
  addInode(pathArray, inode) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    return name.match("/")
      ? Err("Name can't contain forward slashes")
      : this.resolve(parent)
          .chain(propR("children"))
          .chain(children => (children[name] = inode));
  }

  // Add a new file to the disk
  // [String] -> Result(Inode)
  createFile(pathArray) {
    const inode = new Inode({ contents: "" });
    return this.addInode(pathArray, inode);
  }

  // Add a new directory Inode to the disk
  // [String] -> Result(Inode)
  createDirectory(pathArray) {
    const inode = new Inode({ children: {}, directory: true });
    return this.addInode(pathArray, inode);
  }

  // Remove
  // [String] -> Result(Boolean)
  remove(pathArray) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    return this.resolve(parent)
      .chain(propR("children"))
      .chain(children => delete children[name]);
  }
}
