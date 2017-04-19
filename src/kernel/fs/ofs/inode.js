export default class OFS_Inode {
  constructor(config = {}) {
    this.links = 0;
    this.exec = false;
    Object.assign(this, config);
  }
}
