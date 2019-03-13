import { Ok, Err } from "../../../misc/fp.js";

export default class Inode {
  constructor(config = {}) {
    // Defaults
    this.file = false;
    this.directory = false;
    this.children = undefined;
    this.executable = false;
    this.raw = undefined;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Read file contents
  // Void -> Result(String)
  readFile() {
    return this.file ? Ok(this.raw) : Err("Not a file");
  }

  // Overwrite file contents
  // String -> Result(String)
  writeFile(contents) {
    return this.file ? Ok((this.raw = contents)) : Err("Not a file");
  }

  // Append file contents
  // String -> Result(String)
  appendFile(contents) {
    return this.file ? Ok((this.raw += contents)) : Err("Not a file");
  }

  // Truncate file contents
  // Void -> Result(String)
  truncateFile() {
    return this.file ? Ok((this.raw = "")) : Err("Not a file");
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return this.children
      ? Ok(Object.keys(this.children))
      : Err("Not a directory");
  }
}
