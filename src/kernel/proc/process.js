class Process {
  constructor(execImage) {
    this.fds = [];
    // The worker is where the process is actually executed
    this.worker = mkWorker(execImage);
    // This event listener intercepts worker messages and then
    // passes to the message handler, which decides what next
    this.worker.addEventListener( "message", msg => { this.messageHandler(msg) });
  }

  // Handle messages coming from the worker
  messageHandler(msg) {
    const obj = msg.data;
    // This does some quick message format validation, but,
    // all value validation must be handled by the system call function itself
    if (obj.type === "syscall" && obj.name in faux.sys) {
      // Execute a system call with given arguments
      // Argument validation is not handled here
      // But, we do validate the message format
      if (obj.id !== undefined && obj.args instanceof Array) {
        faux.sys[obj.name](this, obj.id, obj.args);
      }
    }
    // The message is not valid because of the type or name
    else {
      const error = {
        status: "error",
        reason: "Invalid request type and/or name",
        id: obj.id
      };
      this.worker.postMessage(error);
    }
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

faux.sys.open = function(process, msgID, args) {
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