import OFS from "./ofs/index.js";
import DOMFS from "./domfs/index.js";
import VFS from "./vfs/index.js";
import OFS_Inode from "./ofs/inode.js";

const fs = new VFS(
  new OFS([
    new OFS_Inode({
      links: 1,
      id: 0,
      type: "d",
      files: {
        bin: 1,
        dev: 2,
        etc: 3,
        home: 4,
        log: 5,
        tmp: 6
      }
    }),

    // /bin
    new OFS_Inode({
      links: 1,
      type: "d",
      id: 1,
      files: {
        fsh: 7
      }
    }),

    // /dev
    new OFS_Inode({
      links: 1,
      type: "d",
      id: 2,
      files: {}
    }),

    // /etc
    new OFS_Inode({
      links: 1,
      type: "d",
      id: 3,
      files: {}
    }),

    // /home
    new OFS_Inode({
      links: 1,
      type: "d",
      id: 4,
      files: {}
    }),

    // /log
    new OFS_Inode({
      links: 1,
      type: "d",
      id: 5,
      files: {}
    }),

    // /tmp
    new OFS_Inode({
      links: 1,
      type: "d",
      id: 6,
      files: {}
    }),

    // /bin/fsh
    new OFS_Inode({
      links: 1,
      type: "f",
      exec: true,
      id: 7,
      /* fsh */ data: "" /* end */
    })
  ])
);

fs.mount(new DOMFS(), "/dev/dom");

export default fs;
