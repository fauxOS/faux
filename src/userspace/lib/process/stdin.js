import { readFile } from "../fs/index.js";

export async function read(str) {
  // This operation is expensive and will be replaced
  // once the console multiplexer is implemented
  return readFile("/dev/console");
}
