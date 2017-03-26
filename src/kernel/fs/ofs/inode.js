export default class OFS_Inode {
  constructor(config = {}) {
    this.links = 0;
    Object.assign(this, config);
  }
}