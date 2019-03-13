import OFS from "./ofs/index.js";
import Inode from "./ofs/inode.js";
import DOMFS from "./domfs/index.js";
import VFS from "./vfs/index.js";
import devices from "../devices/index.js";

// Root file system
const root = new OFS();

// Top level directories
root.createDirectory(["bin"]);
root.createDirectory(["dev"]);
root.createDirectory(["dev", "dom"]);
root.createDirectory(["home"]);
root.createDirectory(["log"]);
root.createDirectory(["tmp"]);

// Faux SHell
root.addInode(
  ["bin", "fsh"],
  new Inode({
    file: true,
    executable: true,
    raw: "inject-fsh"
  })
);
// Javascript SHell
root.addInode(
  ["bin", "jsh"],
  new Inode({
    file: true,
    executable: true,
    raw: "inject-jsh"
  })
);
// ls
root.addInode(
  ["bin", "ls"],
  new Inode({
    file: true,
    executable: true,
    raw: "inject-ls"
  })
);

// Virtual Filesystem
const fs = new VFS(root);

// Mount file systems
fs.mount(new DOMFS(), "/dev/dom");
fs.mount(devices, "/dev");

export default fs;
