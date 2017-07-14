import OFS from "./ofs/index.js";
import DOMFS from "./domfs/index.js";
import VFS from "./vfs/index.js";
import console from "./dev/console/index.js";

const rootFs = new OFS();

const bin = rootFs.mkdir(["bin"]);

rootFs.addInode(bin, "fsh", {
  file: true,
  executable: true,
  contents: "inject-fsh"
});

const dev = rootFs.mkdir(["dev"]);

rootFs.mkdir(["dev", "dom"]);
fs.mount(new DOMFS(), "/dev/dom");
rootFs.addInode(dev, "console", { device: true });

rootFs.mkdir(["home"]);
rootFs.mkdir(["log"]);
rootFs.mkdir(["tmp"]);

const fs = new VFS(rootFs);

export default fs;
