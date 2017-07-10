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
 */
export async function exec(path = "", argv = []) {
  return call("exec", [path, argv]);
}

/**
 * Check if a file exists
 * @async
 * @param {string} path
 * @return {Promise<boolean>}
 */
export async function access(path = "") {
  return call("access", [path]);
}

/**
 * Get file/directory info
 * @async
 * @param {string} path
 * @return {Promise<object>}
 */
export async function stat(path = "") {
  return call("stat", [path]);
}

/**
 * Open a file/directory to get its file descriptor
 * @async
 * @param {string} path
 * @return {Promise<number>} fd - new file descriptor
 */
export async function open(path = "", mode = "r") {
  const fd = await call("open", [path, mode]);
  if (fd < 0) {
    return new Error("Could not open file");
  }
  return fd;
}

/**
 * Read file contents from a file descriptor
 * @async
 * @param {number} fd
 * @return {Promise<string>} data - file contents
 */
export async function read(fd) {
  const data = await call("read", [fd]);
  if (data === -2) {
    return new Error("No data returned, possibly a directory");
  } else if (data < 0) {
    return new Error("Could not get data");
  }
  return data;
}

/**
 * Write data to a file descriptor
 * @async
 * @param {number} fd
 * @param {string} data - new file contents
 */
export async function write(fd, data = "") {
  const ret = await call("write", [fd, data]);
  if (ret < 0) {
    return new Error("Could not write data");
  }
  return data;
}

/**
 * Get the currect working directory
 * @async
 * @return {Promise<string>} current working directory
 */
export async function pwd() {
  return call("pwd", []);
}

/**
 * Change the working directory
 * @async
 * @param {string} path - new working directory
 */
export async function chdir(path = "") {
  return call("chdir", [path]);
}

/**
 * Get an environment variable value by key,
 * invoke with no arguments to return the whole environment variable object
 * @async
 * @param {string} key
 * @return {Promise<string>} value
 */
export async function getenv(key) {
  return call("getenv", [key]);
}

/**
 * Set an environment variable to a new value
 * @async
 * @param {string} key
 * @param {string} value
 */
export async function setenv(key = "", value = "") {
  return call("setenv", [key, value]);
}
