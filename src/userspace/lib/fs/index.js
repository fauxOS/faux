/**
 * Read a file's contents
 * @async
 * @param {string} path - File name
 * @return {Promise<string>} file contents
 * 
 * @example fs.readFile("./file").then(console.log)
 */
export async function readFile(path, mode = "r") {
  const fd = await sys.open(path, mode);
  const data = sys.read(fd);
  sys.close(fd);
  return data;
}

/**
 * Overwrite a file or create a new one
 * @async
 * @param {string} path
 * @param {string} data - New file contents
 * 
 * @example fs.writeFile("./file", "contents")
 */
export async function writeFile(path, data = "", mode = "w") {
  const fd = await sys.open(path, mode);
  sys.write(fd, data);
  sys.close(fd);
  return;
}

/**
 * Append data to a file or create a new one
 * @async
 * @param {string} path
 * @param {string} data - Data to append
 * 
 * @example fs.appendFile("/log/something", "[time]: Event\n")
 */
export async function appendFile(path, data = "", mode = "a") {
  const fd = await sys.open(path, mode);
  sys.write(fd, data);
  sys.close(fd);
  return;
}
