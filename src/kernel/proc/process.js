class Process {
  constructor(execImage) {
    this.fds = [];
    // The worker is where the process is actually executed
    this.worker = mkWorker(execImage);
    // The system call interface intercepts worker messages
    this.worker.addEventListener("message", msg => {
      const obj = msg.data;
      if (obj.type === "syscall") {
        if (obj.name in sys) {
          // Execute a system call with given arguments
          // Argument validation is not handled here
          sys[obj.name](this, obj.id, obj.args);
        }
      }
    });
  }

  // IO methods

  // Return a file descriptor
  open(path) {
    const fd = new FileDesc(path);
    this.fds.push(fd);
    return this.fds.length - 1;
  }

  // Read from a file descriptor
  read(fdID) {
    const fd = this.fds[fdID];
    if (fd.inode.data !== undefined) {
      return fd.inode.data;
    }
    else {
      // No place to read data from
      return -1;
    }
  }

  // Write data to a file descriptor
  write(fdID, data) {
    const fd = this.fds[fdID];
    if (fd.inode.data !== undefined) {
      return fd.inode.data = data;
    }
    else {
      // No place to write data in the inode
      return -1;
    }
  }
}

// System call wrappers

sys.open = function(process, msgID, args) {
  if (args.length !== 1) {
    const error = {
      status: "error",
      reason: "Should have only 1 argument",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else if (typeof args[0] !== "string") {
    const error = {
      status: "error",
      reason: "Argument should be a string",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else {
    const result = {
      status: "success",
      result: process.open(args[0]),
      id: msgID
    }
    process.worker.postMessage(result);
  }
}