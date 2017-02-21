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
        type: "d",
        files: {
          ".": 0,
          "..": 0
        }
      })
    ];
  }

  // Add a new inode to the disk
  addInode(type, name, parent) {
    // Reject if name contains a "/"
    if ( name.match("/") ) {
      console.warn("No '/' allowed in a name");
      return -1;
    }
    const id = this.inodes.length;
    this.inodes[id] = new Inode({
      links: 1,
      type: type
    });
    this.inodes[parent].files[name] = id;
    return id;
  }

  // Add a new file to the disk
  mkFile(name, parent) {
    const id = this.addInode("f", name, parent);
    if (id < 0) {
      return -1;
    }
    this.inodes[id].data = "";
    return id;
  }

  // Add a new directory Inode to the disk
  mkDir(name, parent) {
    const id = this.addInode("d", name, parent);
    if (id < 0) {
      return -1;
    }
    this.inodes[id].files = {
      ".": id,
      "..": parent
    }
    return id;
  }

  // Make a hard link inode
  mkLink(name, parent, targetID) {
    // Same as in addInode, not very DRY I know...
    if ( name.match("/") ) {
      console.warn("No '/' allowed in a name");
      return -1;
    }
    this.inodes[parent].files[name] = targetID;
    return targetID;
  }

  // Make a symbolic link inode
  mkSymLink(name, parent, targetPath) {
    const id = this.addInode("sl", name, parent);
    if (id < 0) {
      return -1;
    }
    const path = new Pathname(targetPath).clean();
    this.inodes[id].redirect = path;
    return id;
  }
}