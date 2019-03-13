import processTable from "./index.js";
import Process from "./process.js";
import fs from "../fs/index.js";
import history from "../../history/index.js";
import { propR } from "../../misc/fp.js";

// Relative to absolute path based on a process
function resolvePath(inputPath, process) {
  return inputPath[0] === "/"
    ? inputPath
    : process.currentDirectory + "/" + inputPath;
}

// Raise an error
function fail(process, id, reason) {
  history[id].call += ` -> Fail: "${reason.toString()}"`;
  process.worker.postMessage({
    status: "error",
    reason: reason.toString(),
    id
  });
}

// Pass a success result
function pass(process, id, result) {
  history[id].call += ` -> Pass: ${JSON.stringify(result, null, 2)}`;
  process.worker.postMessage({
    status: "success",
    result,
    id
  });
}

// Spawn a new process from an executable image
export function spawn(process, msgID, [image, argv]) {
  if (typeof image !== "string") {
    return fail(process, msgID, "First argument - image - should be a string");
  }
  if (!argv instanceof Array) {
    return fail(process, msgID, "Second argument - argv - should be an array");
  }
  const newProcess = new Process(image, argv);
  const pid = processTable.add(newProcess);
  return pass(process, msgID, pid);
}

// Spawn a new process from a file path
export function exec(process, msgID, [inputPath, argv]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  if (!argv instanceof Array) {
    return fail(process, msgID, "Second argument - argv - should be an array");
  }
  const safePath = resolvePath(inputPath, process);
  return fs
    .resolve(safePath)
    .chain(propR("raw"))
    .map(image => processTable.add(new Process(image, argv)))
    .fold(e => fail(process, msgID, e))(pid => pass(process, msgID, pid));
}

// Terminate the process that calls this
export function exit(process, msgID, args) {
  return pass(process, msgID, process.worker.terminate());
}

// Check if a file exists
export function exists(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  return pass(process, msgID, process.exists(safePath));
}

// Get file/directory info
export function stat(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  return fs.resolve(safePath).fold(e => fail(process, msgID, e))(inode =>
    pass(process, msgID, {
      file: inode.file,
      executable: inode.executable,
      directory: inode.directory
    })
  );
}

// Resolve a path into a file descriptor, and add it to the table
export function open(process, msgID, [inputPath, mode]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  if (typeof mode !== "string") {
    return fail(process, msgID, "Second argument - mode - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  return process.open(safePath, mode).fold(e => fail(process, msgID, e))(fd =>
    pass(process, msgID, fd)
  );
}

// Remove a file descriptor from the table
export function close(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  if (!process.fds[fd]) {
    return fail(process, msgID, "File Descriptor must exist");
  }
  return process.close(fd).fold(e => fail(process, msgID, e))(r =>
    pass(process, msgID, r)
  );
}

// Duplicate a file descriptor
export function dup(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  if (!process.fds[fd]) {
    return fail(process, msgID, "File Descriptor must exist");
  }
  return process.dup(fd).fold(e => fail(process, msgID, e))(fd =>
    pass(process, msgID, fd)
  );
}

// Duplicate a file descriptor to a specified location
export function dup2(process, msgID, [fd1, fd2]) {
  if (fd1 < 0) {
    return fail(process, msgID, "File Descriptor 1 should be >= 0");
  }
  if (!process.fds[fd1]) {
    return fail(process, msgID, "File Descriptor 1 must exist");
  }
  if (fd2 < 0) {
    return fail(process, msgID, "File Descriptor 2 should be >= 0");
  }
  return process.dup2(fd1, fd2).fold(e => fail(process, msgID, e))(fd =>
    pass(process, msgID, fd)
  );
}

// Read data from a file descriptor
export function readFile(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  return process.fds[fd].readFile().fold(e => fail(process, msgID, e))(data =>
    pass(process, msgID, data)
  );
}

// Read directory children
export function readDirectory(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  return process.fds[fd]
    .readDirectory()
    .fold(e => fail(process, msgID, e))(children =>
    pass(process, msgID, children)
  );
}

// Write data to a file descriptor
export function writeFile(process, msgID, [fd, data]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  if (typeof data !== "string") {
    return fail(process, msgID, "Second argument - data - should be a string");
  }
  return process.fds[fd].writeFile(data).fold(e => fail(process, msgID, e))(r =>
    pass(process, msgID, r)
  );
}

// Create a new directory
export function createDirectory(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  fs.createDirectory(safePath).fold(e => fail(process, msgID, e))(r =>
    pass(process, msgID, r)
  );
}

// Remove, what rm does
export function remove(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  fs.remove(safePath).fold(e => fail(process, msgID, e))(r =>
    pass(process, msgID, r)
  );
}

// Tell what directory we are in
export function currentDirectory(process, msgID, args) {
  return pass(process, msgID, process.currentDirectory);
}

// Change the current working directory
export function changeDirectory(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  const result = (process.currentDirectory = safePath);
  return pass(process, msgID, result);
}

// Get environment variable
export function getenv(process, msgID, [key]) {
  if (key) {
    if (typeof key !== "string") {
      return fail(
        process,
        msgID,
        "First argument - key - should be a string (or a falsey value)"
      );
    }
    const value = process.env[key];
    return pass(process, msgID, value);
  } else {
    return pass(process, msgID, process.env);
  }
}

// Set environment variable
export function setenv(process, msgID, [key, value]) {
  if (typeof key !== "string") {
    return fail(process, msgID, "First argument - key - should be a string");
  }
  if (typeof value !== "string") {
    return fail(process, msgID, "Second argument - value - should be a string");
  }
  const result = (process.env[key] = value);
  return pass(process, msgID, result);
}
