import fs from "../fs/index.js";
import FileDescriptor from "./filedesc.js";
import * as sys from "./syscalls.js";
import { spawnWorker } from "../../misc/utils.js";
import history from "../../history/index.js";
import { Err, Ok } from "../../misc/fp.js";

export default class Process {
  constructor(image = "", argv = []) {
    this.image = image;
    this.argv = argv;
    this.fds = [];
    this.currentDirectory = "/";
    this.env = {
      SHELL: "fsh",
      PATH: "./:/bin",
      HOME: "/home",
      TERM: "xterm-256color"
    };
    // Information that we need to expose to userspace
    const jsonArgv = JSON.stringify(this.argv);
    const expose = `const argv = ${jsonArgv}; const argc = argv.length;`;
    const lib = "inject-lib";
    // The worker is where the process is actually executed
    this.worker = spawnWorker([expose, lib, image].join("\n\n"));
    // This event listener intercepts worker messages and then
    // passes to the message handler, which decides what next
    this.worker.addEventListener("message", this.messageHandler.bind(this));
  }

  // Handle messages coming from the worker
  messageHandler(message) {
    const msg = message.data;
    // This does some quick message format validation, but
    // all value validation must be handled by the system call function itself
    if (msg.type === "syscall" && msg.name in sys) {
      // Execute a system call with given arguments
      if (msg.id !== undefined && msg.args instanceof Array) {
        history[msg.id] = {
          time: new Date(),
          call: `${msg.name}(${msg.args.map(JSON.stringify).join(", ")})`
        };
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
  // String -> Boolean
  exists(path) {
    return fs.resolve(path).fold(() => false)(() => true);
  }

  // Where open() actually runs
  // Return a file descriptor
  open(path, mode = "r") {
    // The new file descriptor takes the first open space (from a closed fd),
    // or just gets pushed to the array if there are no open spots.
    let newFd = this.fds.indexOf(null);
    if (newFd === -1) {
      newFd = this.fds.length;
    }
    const fd = FileDescriptor(path, mode);
    return fd.inode.chain(
      function(x) {
        this.fds[newFd] = x;
        return Ok(newFd);
      }.bind(this)
    );
  }

  // Close a file descriptor
  close(fd) {
    return this.fds[fd]
      ? Ok((this.fds[fd] = null))
      : Err("File descriptor does not exist");
  }

  // Duplicate a file descriptor
  dup(fd) {
    return this.fds[fd]
      ? Ok(this.fds.push(this.fds[fd]) - 1)
      : Err("File descriptor does not exist");
  }

  // Copy a file descriptor to a specified location
  dup2(fd1, fd2) {
    return this.fds[fd1]
      ? Ok(((this.fds[fd2] = this.fds[fd1]), fd1))
      : Err("File descriptor does not exist");
  }
}
