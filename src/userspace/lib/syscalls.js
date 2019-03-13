// Generate a new random message id
const newID = length =>
  [...Array(length).keys()]
    .map(_ => Math.round(Math.random() * 2 ** 16))
    .map(n => String.fromCharCode(n))
    .join("");

// Make a request from the kernel with a system call
// This wrapper returns a promise for every call
// Usage: call("callName", ["arg1", "arg2"]).then(handleResult);
function call(name, args = []) {
  // We use a message ID so that we can order the kernel's responses
  const id = newID(5);
  // This is just the system call request format
  postMessage({
    type: "syscall",
    name,
    args,
    id
  });

  return new Promise((resolve, reject) => {
    function listener(message) {
      const msg = message.data;
      // Short circuit ignore messages without the same id
      if (msg.id !== id) return;

      removeEventListener("message", listener);
      msg.status === "success" ? resolve(msg.result) : reject(msg.reason);
    }

    addEventListener("message", listener);
  });
}

/**
 * Spawn a new process from an executable image
 * @async
 * @param {string} image - The executable code to run
 * @param {array} argv - Argument vector for the new process
 * @return {Promise<number>} pid - The ID of the new process
 * 
 * @example sys.spawn("console.log(argv)", ["hello", "world"])
 */
export async function spawn(image = "", argv = []) {
  return call("spawn", [image, argv]);
}

/**
 * Spawn a new process from a path
 * @async
 * @param {string} path - The executable code file's path
 * @param {array} argv
 * @return {Promise<number>} pid
 * 
 * @example sys.exec("/bin/ls", ["ls", "-a"])
 */
export async function exec(path, argv = []) {
  return call("exec", [path, argv]);
}

/**
 * Exit the current process (terminate)
 * @async
 * 
 * @example sys.exit()
 */
export async function exit() {
  return call("exit", []);
}

/**
 * Check if a file exists
 * @async
 * @param {string} path
 * @return {Promise<boolean>}
 * 
 * @example const exists = await sys.exists("/file")
 */
export async function exists(path) {
  return call("exists", [path]);
}

/**
 * Get file/directory info
 * @async
 * @param {string} path
 * @return {Promise<object>}
 * 
 * @example const info = await sys.stat("/file")
 */
export async function stat(path) {
  return call("stat", [path]);
}

/**
 * Open a file/directory to get its file descriptor
 * @async
 * @param {string} path
 * @return {Promise<number>} fd - new file descriptor
 * 
 * @example const fd = await sys.open("/file")
 */
export async function open(path, mode = "r") {
  return call("open", [path, mode]);
}

/**
 * Close a file descriptor from use
 * @async
 * @param {number} fd
 * 
 * @example sys.close(3)
 */
export async function close(fd) {
  return call("close", [fd]);
}

/**
 * Duplicate a file descriptor
 * @async
 * @param {number} fd - File descriptor to copy
 * @return {Promise<number>} duplicated file descriptor
 * 
 * @example const copied = await sys.dup(0)
 */
export async function dup(fd) {
  return call("dup", [fd]);
}

/**
 * Duplicate a file descriptor to a new location, possibly overwriting one
 * @async
 * @param {number} fd1 - File descriptor to copy
 * @param {number} fd2 - Target to copy to
 * @return {Promise<number>} Second file descriptor
 * 
 * @example sys.dup2(1, 2)
 */
export async function dup2(fd1, fd2) {
  return call("dup2", [fd1, fd2]);
}

/**
 * Read file contents from a file descriptor
 * @async
 * @param {number} fd
 * @return {Promise<string>} data - file contents
 * 
 * @example const contents = await sys.readFile(fd)
 */
export async function readFile(fd) {
  return call("readFile", [fd]);
}

/**
 * Read directory children, like what ls does
 * @async
 * @param {number} fd
 * @return {Promise<array>} children - directory entries
 * 
 * @example const dirArray = await sys.readDirectory(fd)
 */
export async function readDirectory(fd) {
  return call("readDirectory", [fd]);
}

/**
 * Write data to a file descriptor
 * @async
 * @param {number} fd
 * @param {string} data - new file contents
 * 
 * @example sys.write(1, "hello world")
 */
export async function writeFile(fd, data = "") {
  return call("writeFile", [fd, data]);
}

/**
 * Create a new directory
 * @async
 * @param {string} path
 * 
 * @example sys.createDirectory("/home/newdir")
 */
export async function createDirectory(path) {
  return call("createDirectory", [path]);
}

/**
 * Remove, what rm does
 * @async
 * @param {string} path
 * 
 * @example sys.remove("/home/oldfile")
 */
export async function remove(path) {
  return call("remove", [path]);
}

/**
 * Get the current working directory
 * @async
 * @return {Promise<string>} current working directory
 * 
 * @example const cwd = await sys.currentDirectory()
 */
export async function currentDirectory() {
  return call("currentDirectory", []);
}

/**
 * Change the working directory
 * @async
 * @param {string} path - new working directory
 * 
 * @example sys.changeDirectory("/home")
 */
export async function changeDirectory(path = "/home") {
  return call("changeDirectory", [path]);
}

/**
 * Get an environment variable value by key,
 * invoke with no arguments to return the whole environment variable object
 * @async
 * @param {string} key
 * @return {Promise<string>} value
 * 
 * @example const usingAwait = (await sys.getenv("PATH")).split(":")
 * @example const usingPromise = sys.getenv("PATH").then(path => path.split(":"))
 */
export async function getenv(key) {
  return call("getenv", [key]);
}

/**
 * Set an environment variable to a new value
 * @async
 * @param {string} key
 * @param {string} value
 * 
 * @example sys.setenv("varName", "It doesn't have to be all caps")
 */
export async function setenv(key, value = "") {
  return call("setenv", [key, value]);
}
