import { writeFile } from "../fs/index.js";

export async function write(str) {
  // This operation is expensive and will be replaced
  // once the console multiplexer is implemented
  return writeFile("/dev/console", str, "r+");
}
