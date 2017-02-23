class Inode {
  constructor(config = {}) {
    this.links = 0;
    // Merge inode config with `this` to override anything
    Object.assign( this, config );
  }
}

class Disk {
  constructor() {
    this.uuid = genUUID();
    this.inodes = [
      new Inode({
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
  // Defaults to just adding an inode, but if you pass
  // `parentInode` as an Inode instance, it will add the name to the parent file list
  addInode(type, name=null, parentInode=null) {
    // Reject if name contains a "/"
    if ( name.match("/") ) {
      return -1;
    }
    const id = this.inodes.length;
    this.inodes[id] = new Inode({
      links: 1,
      type: type,
      id: id
    });
    // Check if inode and directory
    if (parentInode instanceof Inode && parentInode.type === "d") {
      parentInode.files[name] = id;
    }
    return this.inodes[id];
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
