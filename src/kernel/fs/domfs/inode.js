import { Ok, Err } from "../../../misc/fp.js";

export default class Inode {
  constructor(config = {}) {
    // Defaults
    this.file = true;
    this.directory = true;
    this.executable = false;
    this.raw = undefined;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Array(HTMLElement)
  get children() {
    return Array.from(this.raw.children).flatMap((child, i) => {
      const name = child.localName;
      const id = child.id ? "#" + child.id : "";
      const classes = child.className
        ? "." + child.className.replace(/\s+/g, ".")
        : "";
      return [
        name + id + classes, // A css selector for the child
        i + 1 // A complementary css :nth-child() selector number
      ];
    });
  }

  // Read file contents
  // Void -> Result(String)
  readFile() {
    return Ok(this.raw.innerHTML);
  }

  // Overwrite file contents
  // String -> Result(String)
  writeFile(contents) {
    return Ok((this.raw.innerHTML = contents));
  }

  // Append file contents
  // String -> Result(String)
  appendFile(contents) {
    return Ok((this.raw.innerHTML += contents));
  }

  // Truncate file contents
  // Void -> Result(String)
  truncateFile() {
    return Ok((this.raw.innerHTML = ""));
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return Ok(Object.keys(this.children));
  }
}
