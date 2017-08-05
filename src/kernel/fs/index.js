import OFS from "./ofs/index.js";
import Inode from "./ofs/inode.js";
import DOMFS from "./domfs/index.js";
import VFS from "./vfs/index.js";
import devices from "../devices/index.js";

// Root file system
const root = new OFS();

// Top level directories
root.mkdir(["bin"]);
root.mkdir(["dev"]);
root.mkdir(["dev", "dom"]);
root.mkdir(["home"]);
root.mkdir(["log"]);
root.mkdir(["tmp"]);

// Faux SHell
root.addInode(
  ["bin"],
  "fsh",
  new Inode({
    file: true,
    executable: true,
    contents: "inject-fsh"
  })
);
// Javascript SHell
root.addInode(
  ["bin"],
  "jsh",
  new Inode({
    file: true,
    executable: true,
    contents: "inject-jsh"
  })
);
// ls
root.addInode(
  ["bin"],
  "ls",
  new Inode({
    file: true,
    executable: true,
    contents: "inject-ls"
  })
);

// Virtual Filesystem Switch
const fs = new VFS(root);

// Mount other file systems
fs.mount(new DOMFS(), "/dev/dom");
fs.mount(devices, "/dev");

export default fs;
