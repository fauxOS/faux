// Generate a new random message id
function newID(length = 8) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
  let id = "";
  for (let i = 0; i < length; i++) {
    const randNum = Math.floor(Math.random() * chars.length);
    id += chars.substring(randNum, randNum + 1);
  }
  return id;
}

// Make a request from the kernel with a system call
// This wrapper makes it easy promises for every call
// Usage: call("callName", ["arg1", "arg2"]).then(handleResult);
function call(name, args) {
  // We use a message ID so we can order the kernel's responses
  const id = newID();
  // This is just the system call request format
  postMessage({
    type: "syscall",
    name: name,
    args: args,
    id: id
  });
  return new Promise(function(resolve, reject) {
    self.addEventListener("message", msg => {
      // Resolve when we get a message with the same id
      if (msg.data.id === id) {
        if (msg.data.status === "success") {
          resolve(msg.data.result);
        } else {
          reject(msg.data.reason);
        }
      }
    });
  });
}

// Load a dynamic library
function load(path) {
  const data = call("load", [path]);
  // Evaluate the library in this worker's context
  return data.then(eval);
}

// Spawn a new process from an executable image
function spawn(image, argv = []) {
  return call("spawn", [image, argv]);
}

// Execute by path, input commandline arguments
// UNLIKE UNIX, exec will create a new process
function exec(path, argv) {
  return call("exec", [path, argv]);
}

// Boolean, true if we have access to file / file exists
function access(path) {
  return call("access", [path]);
}

// Open a file by path and promise the return of a file descriptor
function open(path, mode = "r") {
  return call("open", [path, mode]);
}

// Read a file descriptor and return data retrieved
function read(fd) {
  return call("read", [fd]);
}

// Write data to a file descriptor
function write(fd, data) {
  return call("write", [fd, data]);
}

// Get the currect working directory
function pwd() {
  return call("pwd", []);
}

// cd
function chdir(path) {
  return call("chdir", [path]);
}

// Get environment variable
function getenv(varName) {
  return call("getenv", [varName]);
}

// Set environment variable
function setenv(varName) {
  return call("setenv", [varName]);
}