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
      HOME: "/home",
      TERM: "xterm-256color"
    };
    this.image = image;
    // We auto-load the /lib/lib dynamic library
    const lib = this.load("/lib/lib");
    // Information that we need to expose to userspace
    const expose =
      "process.argv = " +
      JSON.stringify(this.argv) +
      ";" +
      "process.argc = " +
      this.argc +
      ";" +
      "process.env = " +
      JSON.stringify(this.env) +
      ";";
    // The worker is where the process is actually executed
    this.worker = utils.mkWorker([lib, expose, image].join("\n\n"));
    // This event listener intercepts worker messages and then
    // passes to the message handler, which decides what next
    this.worker.addEventListener("message", message => {
      this.messageHandler(message);
    });
  }

  // Handle messages coming from the worker
  messageHandler(message) {
    const msg = message.data;
    // This does some quick message format validation, but
    // all value validation must be handled by the system call function itself
    if (msg.type === "syscall" && msg.name in sys) {
      // Execute a system call with given arguments
      if (msg.id !== undefined && msg.args instanceof Array) {
        sys[msg.name](this, msg.id, msg.args);
      }
    } else if (msg.type === "event" && msg.name && msg.payload) {
      // Fire the event natively
      const event = new CustomEvent(msg.name, { detail: msg.payload });
      dispatchEvent(event);
    } else {
      // The message is not valid because of the type or name
      const error = {
        status: "error",
        reason: "Invalid request - Rejected by the message handler",
        id: msg.id
      };
      this.worker.postMessage(error);
    }
  }

  // Check if we can access/it exists
  access(path, mode = "r") {
    try {
      const fd = new FileDescriptor(path, mode);
      if (fd.vnode) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  // Where open() actually runs
  // Return a file descriptor
  open(path, mode) {
    if (!this.access(path, mode)) {
      return -1;
    }
    const fd = new FileDescriptor(path, mode);
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
