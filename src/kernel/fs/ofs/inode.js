export default class OFS_Inode {
  constructor(config = {}) {
    this.links = 0;
    this.perms = [true, true, false];
    Object.assign(this, config);
  }
}
