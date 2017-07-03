import proc from "./index.js";
import Process from "./process.js";

// Raise an error
function fail(process, msgID, args) {
  const error = {
    status: "error",
    reason: args[0],
    id: msgID
  };
  process.worker.postMessage(error);
}

// Throw a success result
function pass(process, msgID, args) {
  const result = {
    status: "success",
    result: args[0],
    id: msgID
  };
  process.worker.postMessage(result);
}

export default {
  // Send a dynamic library straight to the process
  load(process, msgID, args) {
    const data = process.load(args[0]);
    pass(process, msgID, [data]);
  },

  // Spawn a new process from an executable image
  spawn(process, msgID, args) {
    if (!args[1] instanceof Array) {
      fail(process, msgID, ["Second argument should be the array argv"]);
      return -1;
    }
    const newProcess = new Process(args[0], args[1]);
    const pid = proc.add(newProcess);
    pass(process, msgID, [pid]);
  },

  // Check file access
  access(process, msgID, args) {
    if (typeof args[0] !== "string") {
      fail(process, msgID, ["Argument should be a string"]);
      return -1;
    }
    let path = "";
    // If the first character is a "/", then working dir does not matter
    if (args[0][0] === "/") {
      path = args[0];
    } else {
      path = process.cwd + "/" + args[0];
    }
    const result = process.access(path);
    pass(process, msgID, [result]);
  },

  // Resolve a path into a file descriptor, and add it to the table
  open(process, msgID, args) {
    if (typeof args[0] !== "string" && typeof args[1] !== "string") {
      fail(process, msgID, ["Arguments 1 and 2 should be a strings"]);
      return -1;
    }
    let path = "";
    // If the first character is a "/", then working dir does not matter
    if (args[0][0] === "/") {
      path = args[0];
    } else {
      path = process.cwd + "/" + args[0];
    }
    const result = process.open(path, args[1]);
    pass(process, msgID, [result]);
  },

  // Read data from a file descriptor
  read(process, msgID, args) {
    if (args.length !== 1) {
      fail(process, msgID, ["Should have only 1 argument"]);
      return -1;
    }
    if (args[0] < 0) {
      fail(process, msgID, [
        "File Descriptor should be postive, check file name"
      ]);
      return -1;
    }
    const result = process.fds[args[0]].read();
    pass(process, msgID, [result]);
  },

  // Write data to a file descriptor
  write(process, msgID, args) {
    if (args.length !== 2) {
      fail(process, msgID, ["Should have 2 arguments"]);
      return -1;
    }
    if (args[0] < 0) {
      fail(process, msgID, [
        "File Descriptor should be postive, check file name"
      ]);
      return -1;
    }
    const result = process.fds[args[0]].write(args[1]);
    pass(process, msgID, [result]);
  },

  // Tell what directory we are in
  pwd(process, msgID, args) {
    pass(process, msgID, [process.cwd]);
  },

  // Change the current working directory
  chdir(process, msgID, args) {
    if (!args[0] instanceof String) {
      fail(process, msgID, ["Argument should be a string"]);
      return -1;
    }
    process.cwd = args[0];
    pass(process, msgID, [process.cwd]);
  },

  // Get environment variable
  getenv(process, msgID, args = [""]) {
    if (!args[0] instanceof String) {
      fail(process, msgID, ["Variable name should be a string"]);
      return -1;
    }
    if ((args = [""])) {
      pass(process, msgID, [process.env]);
    }
    const value = process.env[args[0]];
    pass(process, msgID, [value]);
  },

  // Set environment variable
  setenv(process, msgID, args) {
    if (!args[0] instanceof String) {
      fail(process, msgID, ["Variable name should be a string"]);
      return -1;
    }
    if (!args[1] instanceof String) {
      fail(process, msgID, ["Variable value should be a string"]);
      return -1;
    }
    const value = (process.env[args[0]] = args[1]);
    pass(process, msgID, [value]);
  }
};
