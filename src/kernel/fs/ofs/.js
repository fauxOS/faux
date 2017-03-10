
class OFS_Inode {
  constructor(config = {}) {
    this.links = 0;
    Object.assign(this, config);
  }
}

class OFS {
  constructor() {
    this.drive = arguments[0] || [
      new OFS_Inode({
        links: 1,
        id: 0,
        type: "d",
        files: {
          ".": 0,
          "..": 0
        }
      })
    ];
  }

  // Add a new inode to the disk
  // Defaults to just adding an inode, but if you pass a parent directory inode in,
  // it will add `name` as an entry in `parentInode`
  addInode(type, name=null, parentInode=null) {
    // Reject if name contains a "/"
    if ( name.match("/") ) {
      return -1;
    }
    const id = this.drive.length;
    this.drive[id] = new OFS_Inode({
      links: 1,
      type: type,
      id: id
    });
    // Check if inode and directory
    if (parentInode instanceof OFS_Inode && parentInode.type === "d") {
      parentInode.files[name] = id;
    }
    return this.drive[id];
  }

  // Add a new file to the disk
  mkFile(name, parentInode) {
    const inode = this.addInode("f", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    inode.data = "";
    return inode;
  }

  // Add a new directory Inode to the disk
  mkDir(name, parentInode) {
    const inode = this.addInode("d", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    inode.files = {
      ".": inode.id,
      "..": parentInode.id
    }
    return inode;
  }

  // Make a hard link inode
  mkLink(name, parentInode, targetInode) {
    // Same as in addInode, not very DRY I know...
    if ( name.match("/") ) {
      return -1;
    }
    parentInode.files[name] = targetInode.id;
    return targetInode;
  }

  // Make a symbolic link inode
  mkSymLink(name, parentInode, targetPath) {
    const inode = this.addInode("sl", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    const path = new Pathname(targetPath).clean;
    inode.redirect = path;
    return inode;
  }
}
