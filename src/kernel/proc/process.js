import FileDescriptor from "./filedesc.js";
import sys from "./syscalls.js";
import utils from "../../misc/utils.js";
import flags from "../../misc/flags.js";

export default class Process {
  constructor(image, argv) {
    this.argv = [] || argv;
    this.argc = this.argv.length;
    this.fds = [];
    this.libs = [];
    this.cwd = "/";
    this.env = {
      SHELL: "fsh",
      PATH: "/sbin:/bin",
      HOME: "/home"
    };
    this.image = image;
    // The worker is where the process is actually executed
    // We auto-load the /lib/lib.js dynamic library
    const libjs = this.load("/lib/lib.js");
    this.worker = utils.mkWorker(libjs + image);
    // This event listener intercepts worker messages and then
    // passes to the message handler, which decides what next
    this.worker.addEventListener("message", msg => {
      this.messageHandler(msg);
    });
  }

  // Handle messages coming from the worker
  messageHandler(msg) {
    const obj = msg.data;
    // This does some quick message format validation, but,
    // all value validation must be handled by the system call function itself
    if (obj.type === "syscall" && obj.name in sys) {
      // Execute a system call with given arguments
      // Argument validation is not handled here
      // But, we do validate the message format
      if (obj.id !== undefined && obj.args instanceof Array) {
        sys[obj.name](this, obj.id, obj.args);
      }
    } else {
      // The message is not valid because of the type or name
      const error = {
        status: "error",
        reason: "Invalid request type and/or name",
        id: obj.id
      };
      this.worker.postMessage(error);
    }
  }

  // Check if we can access/it exists
  access(path) {
    const fd = new FileDescriptor(path);
    if (fd.container) {
      return true;
    } else {
      return false;
    }
  }

  // Where open() actually runs
  // Return a file descriptor
  open(path) {
    if (!this.access(path)) {
      return -1;
    }
    const fd = new FileDescriptor(path);
    this.fds.push(fd);
    return this.fds.length - 1;
  }

  // Like opening a file, execept we add it to the library list
  load(path) {
    const fd = new FileDescriptor(path);
    this.libs.push(fd);
    return fd.read();
  }
}
