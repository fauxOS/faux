// Generate a new random message id
function newID(length = 10) {
  // Make an array of alphanumeric characters
  const chars = ("0123456789" +
    "abcdefghiklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXTZ").split("");
  let id = "";
  for (let i = 0; i < length; i++) {
    // Create a random index tht has a maximum possible value of chars.length - 1
    const randomIndex = Math.floor(Math.random() * chars.length);
    // Append some random character to the id
    id += chars[randomIndex];
  }
  return id;
}

// Make a request from the kernel with a system call
// This wrapper returns a promise for every call
// Usage: call("callName", ["arg1", "arg2"]).then(handleResult);
function call(name = "", args = []) {
  // We use a message ID so we can order the kernel's responses
  const id = newID();
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
      // Ignore messages without the same id
      if (msg.id === id) {
        // Resolve when we get a success
        if (msg.status === "success") {
          resolve(msg.result);
        } else {
          // Reject with the reason for error
          reject(msg.reason);
        }
        // Make sure we remove this event listener
        removeEventListener("message", listener);
      }
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
 * @example const contents = await sys.read(fd)
 */
export async function read(fd) {
  return call("read", [fd]);
}

/**
 * Read directory children, like what ls does
 * @async
 * @param {number} fd
 * @return {Promise<array>} children - directory entries
 * 
 * @example const dirArray = await sys.readdir(fd)
 */
export async function readdir(fd) {
  return call("readdir", [fd]);
}

/**
 * Write data to a file descriptor
 * @async
 * @param {number} fd
 * @param {string} data - new file contents
 * 
 * @example sys.write(1, "hello world")
 */
export async function write(fd, data = "") {
  return call("write", [fd, data]);
}

/**
 * Create a new directory
 * @async
 * @param {string} path
 * 
 * @example sys.mkdir("/home/newdir")
 */
export async function mkdir(path) {
  return call("mkdir", [path]);
}

/**
 * Remove a hard link, what rm does
 * @async
 * @param {string} path
 * 
 * @example sys.rm("/home/oldfile")
 */
export async function unlink(path) {
  return call("unlink", [path]);
}

/**
 * Get the currect working directory
 * @async
 * @return {Promise<string>} current working directory
 * 
 * @example const cwd = await sys.pwd()
 */
export async function pwd() {
  return call("pwd", []);
}

/**
 * Change the working directory
 * @async
 * @param {string} path - new working directory
 * 
 * @example sys.chdir("/home")
 */
export async function chdir(path = "/home") {
  return call("chdir", [path]);
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
