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
        ".": 0,
        "..": 0,
        bin: 1,
        dev: 2,
        etc: 3,
        home: 4,
        lib: 5,
        log: 6,
        mnt: 7,
        tmp: 8,
        usr: 9
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 1,
      files: {
        ".": 1,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 2,
      files: {
        ".": 2,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 3,
      files: {
        ".": 3,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 4,
      files: {
        ".": 4,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 5,
      files: {
        ".": 5,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 6,
      files: {
        ".": 6,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 7,
      files: {
        ".": 7,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 8,
      files: {
        ".": 8,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 9,
      files: {
        ".": 9,
        "..": 0
      }
    })
  ])
);

// Mount /lib
fs.mount(
  new OFS([
    new OFS_Inode({
      links: 1,
      id: 0,
      type: "d",
      files: {
        ".": 0,
        "..": 0,
        lib: 1
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "f",
      exec: true,
      id: 1,
      /* lib */ data: "" /* end */
    })
  ]),
  "/lib"
);

// Mount /bin
fs.mount(
  new OFS([
    new OFS_Inode({
      links: 1,
      id: 0,
      type: "d",
      files: {
        ".": 0,
        "..": 0,
        fsh: 1
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "f",
      exec: true,
      id: 1,
      /* fsh */ data: "" /* end */
    })
  ]),
  "/bin"
);

fs.mount(new DOMFS(), "/dev/dom");

export default fs;
