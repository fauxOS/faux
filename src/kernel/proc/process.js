import fs from "../fs/index.js";
import FileDescriptor from "./filedesc.js";
import * as sys from "./syscalls.js";
import { spawnWorker } from "../../misc/utils.js";

export default class Process {
  constructor(image = "", argv = []) {
    this.image = image;
    this.argv = argv;
    this.argc = this.argv.length;
    this.fds = [];
    this.cwd = "/";
    this.env = {
      SHELL: "fsh",
      PATH: "./:/bin",
      HOME: "/home",
      TERM: "xterm-256color"
    };
    // Information that we need to expose to userspace
    const jsonArgv = JSON.stringify(this.argv);
    const expose = `const argv = ${jsonArgv}; const argc = argv.length`;
    const lib = "inject-lib";
    // The worker is where the process is actually executed
    this.worker = spawnWorker([expose, lib, image].join("\n\n"));
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
    } else if (msg.type === "event" && msg.name && msg.detail) {
      // Fire the event natively
      const event = new CustomEvent(msg.name, { detail: msg.detail });
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

  // Check if it exists
  exists(path) {
    if (fs.resolve(path)) {
      return true;
    } else {
      return false;
    }
  }

  // Where open() actually runs
  // Return a file descriptor
  open(path, mode = "r") {
    const fd = new FileDescriptor(path, mode);
    // The new file descriptor takes the first open space (from a closed fd),
    // or just gets pushed to the array if there are no open spots.
    let newFd = this.fds.indexOf(null);
    if (newFd === -1) {
      newFd = this.fds.length;
    }
    this.fds[newFd] = fd;
    return newFd;
  }

  // Close a file descriptor
  close(fd) {
    if (!this.fds[fd]) {
      throw new Error("File descriptor does not exist");
    }
    return (this.fds[fd] = null);
  }

  // Duplicate a file descriptor
  dup(fd) {
    if (!this.fds[fd]) {
      throw new Error("File descriptor does not exist");
    }
    const copied = this.fds[fd];
    this.fds.push(copied);
    return this.fds.length - 1;
  }

  // Copy a file descriptor to a specified location
  dup2(fd1, fd2) {
    if (!this.fds[fd1]) {
      throw new Error("File descriptor does not exist");
    }
    this.fds[fd2] = this.fds[fd1];
    return fd2;
  }
}
