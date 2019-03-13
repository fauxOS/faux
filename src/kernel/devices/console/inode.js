import { Ok } from "../../../misc/fp.js";
import console from "./index.js";

class Inode {
  constructor(config = {}) {
    // Defaults
    this.file = true;
    this.directory = false;
    this.children = undefined;
    this.executable = false;
    this.raw = console;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Read file contents
  // Void -> Result(String)
  readFile() {
    return Ok(this.raw.read());
  }

  // Overwrite file contents
  // String -> Result(String)
  writeFile(contents) {
    return Ok(this.raw.write(contents));
  }

  // Append file contents
  // String -> Result(String)
  appendFile(contents) {
    return this.writeFile(contents);
  }

  // Truncate file contents
  // Void -> Result(String)
  truncateFile() {
    return Ok("");
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return Err("Not a directory");
  }
}

const inode = new Inode();

export default inode;
