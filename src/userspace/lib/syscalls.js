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
function call(name, args) {
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

// Spawn a new process from an executable image
export async function spawn(image, argv = []) {
  return call("spawn", [image, argv]);
}

// Execute by path, input commandline arguments
// UNLIKE UNIX, exec will create a new process
export async function exec(path, argv) {
  return call("exec", [path, argv]);
}

// Boolean, true if we have access to file / file exists
export async function access(path) {
  return call("access", [path]);
}

// Open a file by path and promise the return of a file descriptor
export async function open(path, mode = "r") {
  const fd = await call("open", [path, mode]);
  if (fd < 0) {
    return new Error("Could not open file");
  }
  return fd;
}
// Read a file descriptor and return data retrieved
export async function read(fd) {
  const data = await call("read", [fd]);
  if (data === -2) {
    return new Error("No data returned, possibly a directory");
  } else if (data < 0) {
    return new Error("Could not get data");
  }
  return data;
}

// Write data to a file descriptor
export async function write(fd, data) {
  const ret = await call("write", [fd, data]);
  if (ret < 0) {
    return new Error("Could not write data");
  }
  return data;
}

// Get the currect working directory
export async function pwd() {
  return call("pwd", []);
}

// cd
export async function chdir(path) {
  return call("chdir", [path]);
}

// Get environment variable
export async function getenv(varName) {
  return call("getenv", [varName]);
}

// Set environment variable
export async function setenv(varName) {
  return call("setenv", [varName]);
}
