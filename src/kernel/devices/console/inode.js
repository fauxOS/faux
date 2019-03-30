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

  // Irrelevent
  // Void -> Result(String)
  readFile() {
    return Err("Cannot read console");
  }

  // Adds text to terminal
  // String -> Result(String)
  writeFile(contents) {
    return Ok(this.raw.write(contents));
  }

  // Same as writeFile
  // String -> Result(String)
  appendFile(contents) {
    return this.writeFile(contents);
  }

  // Clears the console
  // Void -> Result(String)
  truncateFile() {
    return Ok(this.writeFile("\x1bc"));
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return Err("Not a directory");
  }
}

const inode = new Inode();

export default inode;
