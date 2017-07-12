export default class Inode {
  constructor(config = {}) {
    this.links = 1;
    this.executable = false;
    Object.assign(this, config);
  }

  // Read file contents
  read() {
    return this.contents;
  }

  // Overwrite file contents
  write(contents) {
    this.contents = contents;
  }

  // Append file contents
  append(contents) {
    this.contents += contents;
  }

  // Truncate file contents
  truncate() {
    this.contents = "";
  }

  // Read a directory
  readdir() {
    const dir = [];
    const children = $0.children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const name = child.localName;
      const id = child.id ? "#" + child.id : "";
      const classes = child.className
        ? "." + child.className.replace(/\s+/g, ".")
        : "";
      // Push a css selector for the child
      dir.push(name + id + classes);
      // Push a css :nth-child() selector number
      dir.push(i + 1);
    }
    return dir;
  }
}
