import fs from "../fs/index.js";
import { normalize } from "../../misc/path.js";
import getMode from "../../misc/mode.js";
import { Err } from "../../misc/fp.js";

// prettier-ignore
export default (path, modeString) => {
  const mode = getMode(modeString);
  const normalized = normalize(path);
  const inode = fs.resolve(normalized)
    .chainErr(e => {
      mode.create
        ? fs.createFile(normalized)
        : Err(e)
    })

  mode.truncate
    ? inode.map(n => n.truncateFile())
    : null
  
  return {
    mode,
    path: normalized,
    inode,

    // Return file contents
    readFile: () =>
      mode.read
        ? inode.map(n => n.readFile())
        : Err("Read mode unset"),

    // Write file contents
    writeFile: contents =>
      mode.write
        ? mode.append
            ? inode.map(n => n.appendFile(contents))
            : inode.map(n => n.writeFile(contents))
        : Err("Write mode unset"),

    // Read directory contents
    readDirectory: () =>
      inode.map(n => n.readDirectory())
  }
}
