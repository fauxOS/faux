import processTable from "./index.js";
import Process from "./process.js";
import fs from "../fs/index.js";

// Relative to absolute path based on a process
function resolvePath(inputPath, process) {
  if (inputPath[0] === "/") {
    return inputPath;
  } else {
    return process.cwd + "/" + inputPath;
  }
}

// Raise an error
function fail(process, id, reason) {
  process.worker.postMessage({
    status: "error",
    reason,
    id
  });
}

// Pass a success result
function pass(process, id, result) {
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
  try {
    const newProcess = new Process(image, argv);
    const pid = processTable.add(newProcess);
    return pass(process, msgID, pid);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Spawn a new process from a file path
export function exec(process, msgID, [inputPath, argv]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  if (!argv instanceof Array) {
    return fail(process, msgID, "Second argument - argv - should be an array");
  }
  try {
    const safePath = resolvePath(inputPath, process);
    const image = fs.resolve(safePath).data;
    const newProcess = new Process(image, argv);
    const pid = processTable.add(newProcess);
    return pass(process, msgID, pid);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Check if a file exists
export function exists(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  try {
    const safePath = resolvePath(inputPath, process);
    const result = process.exists(safePath);
    return pass(process, msgID, result);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Get file/directory info
export function stat(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  try {
    const safePath = resolvePath(inputPath, process);
    const inode = fs.resolve(safePath);
    return pass(process, msgID, {
      file: !!inode.file,
      dir: !!inode.dir,
      device: !!inode.device,
      executable: !!inode.executable,
      links: inode.links
    });
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Resolve a path into a file descriptor, and add it to the table
export function open(process, msgID, [inputPath, mode]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  if (typeof mode !== "string") {
    return fail(process, msgID, "Second argument - mode - should be a string");
  }
  try {
    const safePath = resolvePath(inputPath, process);
    const fd = process.open(safePath, mode);
    return pass(process, msgID, fd);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Remove a file descriptor from the table
export function close(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  if (!process.fds[fd]) {
    return fail(process, msgID, "File Descriptor must exist");
  }
  try {
    const result = process.close(fd);
    return pass(process, msgID, result);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Duplicate a file descriptor
export function dup(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  if (!process.fds[fd]) {
    return fail(process, msgID, "File Descriptor must exist");
  }
  try {
    const newFd = process.dup(fd);
    return pass(process, msgID, newFd);
  } catch (err) {
    return fail(process, msgID, err);
  }
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
  try {
    const newFd = process.dup2(fd1, fd2);
    return pass(process, msgID, newFd);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Read data from a file descriptor
export function read(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  try {
    const data = process.fds[fd].read();
    return pass(process, msgID, data);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Read directory children
export function readdir(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  try {
    const children = process.fds[fd].readdir();
    return pass(process, msgID, children);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Write data to a file descriptor
export function write(process, msgID, [fd, data]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  if (typeof data !== "string") {
    return fail(process, msgID, "Second argument - data - should be a string");
  }
  try {
    const result = process.fds[fd].write(data);
    return pass(process, msgID, result);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Create a new directory
export function mkdir(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  try {
    const safePath = resolvePath(inputPath, process);
    const result = fs.mkdir(safePath);
    return pass(process, msgID, result);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Remove a hard link, what rm does
export function unlink(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  try {
    const safePath = resolvePath(inputPath, process);
    const result = fs.unlink(safePath);
    return pass(process, msgID, result);
  } catch (err) {
    return fail(process, msgID, err);
  }
}

// Tell what directory we are in
export function pwd(process, msgID, args) {
  return pass(process, msgID, process.cwd);
}

// Change the current working directory
export function chdir(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  const result = (process.cwd = safePath);
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
