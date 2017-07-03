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
// This wrapper returns a promise for every call
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

self.sys = {
  // Load a dynamic library
  async load(path) {
    const data = await call("load", [path]);
    if (data === -2) {
      return new Error("No data returned, possibly a directory");
    } else if (data < 0) {
      return new Error("Could not get data");
    }
    // Evaluate the library in this worker's context
    return self.eval(data);
  },

  // Spawn a new process from an executable image
  spawn(image, argv = []) {
    return call("spawn", [image, argv]);
  },

  // Execute by path, input commandline arguments
  // UNLIKE UNIX, exec will create a new process
  exec(path, argv) {
    return call("exec", [path, argv]);
  },

  // Boolean, true if we have access to file / file exists
  access(path) {
    return call("access", [path]);
  },

  // Open a file by path and promise the return of a file descriptor
  async open(path, mode = "r") {
    const fd = await call("open", [path, mode]);
    if (fd < 0) {
      return new Error("Could not open file");
    }
    return fd;
  },
  // Read a file descriptor and return data retrieved
  async read(fd) {
    const data = await call("read", [fd]);
    if (data === -2) {
      return new Error("No data returned, possibly a directory");
    } else if (data < 0) {
      return new Error("Could not get data");
    }
    return data;
  },

  // Write data to a file descriptor
  async write(fd, data) {
    const ret = await call("write", [fd, data]);
    if (ret < 0) {
      return new Error("Could not write data");
    }
    return data;
  },

  // Get the currect working directory
  pwd() {
    return call("pwd", []);
  },

  // cd
  chdir(path) {
    return call("chdir", [path]);
  },

  // Get environment variable
  getenv(varName) {
    return call("getenv", [varName]);
  },

  // Set environment variable
  setenv(varName) {
    return call("setenv", [varName]);
  }
};
