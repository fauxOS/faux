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

rootFs.addInode(dev, "console", {
  file: true,
  get contents() {
    return console.read();
  },
  set contents(contents) {
    return console.write(contents);
  }
});

rootFs.mkdir(["home"]);
rootFs.mkdir(["log"]);
rootFs.mkdir(["tmp"]);

const fs = new VFS(rootFs);

fs.mount(new DOMFS(), "/dev/dom");

export default fs;
