import OFS from "./ofs/index.js";
import DOMFS from "./domfs/index.js";
import VFS from "./vfs/index.js";
import Inode from "./ofs/inode.js";

const fsh = new Inode({
  file: true,
  executable: true,
  contents: "inject-fsh"
});

const bin = new Inode({
  dir: true,
  children: {
    fsh
  }
});

const dev = new Inode({
  dir: true,
  children: {}
});

const home = new Inode({
  dir: true,
  children: {}
});

const log = new Inode({
  dir: true,
  children: {}
});

const tmp = new Inode({
  dir: true,
  children: {}
});

const root = new Inode({
  dir: true,
  children: {
    bin,
    dev,
    home,
    log,
    tmp
  }
});

const fs = new VFS(new OFS([root, bin, dev, home, log, tmp, binFsh]));

fs.mount(new DOMFS(), "/dev/dom");

export default fs;
