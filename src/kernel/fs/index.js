import OFS from "./ofs/index.js";
import DOMFS from "./domfs/index.js";
import VFS from "./vfs/index.js";

const rootFs = new OFS();

const bin = rootFs.mkdir(["bin"]);

rootFs.addInode(bin, "fsh", {
  file: true,
  executable: true,
  contents: "inject-fsh"
});

rootFs.mkdir(["dev"]);
rootFs.mkdir(["home"]);
rootFs.mkdir(["log"]);
rootFs.mkdir(["tmp"]);

const fs = new VFS(rootFs);

fs.mount(new DOMFS(), "/dev/dom");

export default fs;
