(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('faux', factory) :
	(global.faux = factory());
}(this, (function () { 'use strict';

// Maybe(a) : Just(a) | Nothing



// String -> a -> Maybe(b)


// Result(a) : Ok(a) | Err(String)
const Ok = x => ({
  // Ok(a) ~> (a -> b) -> Ok(b)
  map: f => Ok(f(x)),
  // Ok(a) ~> (a -> Result(b)) -> Result(b)
  chain: f => f(x),
  // Ok(a) ~> (a -> Result(b)) -> Result(b)
  chainOk: f => f(x),
  // Ok(a) ~> (a -> Result(b)) -> Ok(a)
  chainErr: f => Ok(x),
  // Ok(a) ~> (a -> e) -> (a -> r) -> r
  fold: fail => pass => pass(x),
  // Ok(a) ~> Void -> String
  toString: () => `Ok(${x})`
});
const Err$1 = x => ({
  // Err(a) ~> (a -> b) -> Err(a)
  map: f => Err$1(x),
  // Err(a) ~> (a -> Result(b)) -> Err(a)
  chain: f => Err$1(x),
  // Err(a) ~> (a -> Result(b)) -> Err(a)
  chainOk: f => Err$1(x),
  // Err(a) ~> (a -> Result(b)) -> Result(b)
  chainErr: f => f(x),
  // Err(a) ~> (a -> e) -> (a -> r) -> e
  fold: fail => pass => fail(x),
  // Err(a) ~> Void -> String
  toString: () => `Err(${x})`
});

// String -> a -> Result(b)
const propR = name => obj =>
  name in obj ? Ok(obj[name]) : Err$1(`${name} not in ${JSON.stringify(obj)}`);

// Similar to Promise
// prettier-ignore
const Task = run => ({
  // (a -> e) -> (a -> r) -> Task(a)
  run,

  // Task(a) ~> (a -> b) -> Task(b)
  map: f => Task(err => res =>
    run(err)
       (x => res(f(x))) ),

  // Task(a) ~> (a -> Task(b)) -> Task(b)
  runMap: f => Task(err => res =>
    run(err)
       (x => f(x).run(err)
                     (res) )),

  // Task(a) ~> Void -> Void
  log: () =>
    run(console.error)
       (console.log)
});

class Inode {
  constructor(config = {}) {
    // Defaults
    this.file = false;
    this.directory = false;
    this.children = undefined;
    this.executable = false;
    this.raw = undefined;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Read file contents
  // Void -> Result(String)
  readFile() {
    return this.file ? Ok(this.raw) : Err$1("Not a file");
  }

  // Overwrite file contents
  // String -> Result(String)
  writeFile(contents) {
    return this.file ? Ok((this.raw = contents)) : Err$1("Not a file");
  }

  // Append file contents
  // String -> Result(String)
  appendFile(contents) {
    return this.file ? Ok((this.raw += contents)) : Err$1("Not a file");
  }

  // Truncate file contents
  // Void -> Result(String)
  truncateFile() {
    return this.file ? Ok((this.raw = "")) : Err$1("Not a file");
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return this.children
      ? Ok(Object.keys(this.children))
      : Err$1("Not a directory");
  }
}

class OFS {
  constructor() {
    // Array of all inodes in this file system
    this.inodes = [
      new Inode({
        children: {},
        directory: true
      })
    ];
  }

  // Resolve path to an inode, don't follow symbolic links
  // [String] -> Result(Inode)
  resolve(pathArray) {
    // Follow the path, starting with the root inode
    return pathArray.reduce(
      (previousInode, name) =>
        previousInode.chain(propR("children")).chain(propR(name)),
      Ok(this.inodes[0])
    );
  }

  // Add an inode directly
  // [String] * Inode -> Result(Inode)
  addInode(pathArray, inode) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    return name.match("/")
      ? Err$1("Name can't contain forward slashes")
      : this.resolve(parent)
          .chain(propR("children"))
          .chain(children => (children[name] = inode));
  }

  // Add a new file to the disk
  // [String] -> Result(Inode)
  createFile(pathArray) {
    const inode = new Inode({ contents: "" });
    return this.addInode(pathArray, inode);
  }

  // Add a new directory Inode to the disk
  // [String] -> Result(Inode)
  createDirectory(pathArray) {
    const inode = new Inode({ children: {}, directory: true });
    return this.addInode(pathArray, inode);
  }

  // Remove
  // [String] -> Result(Boolean)
  remove(pathArray) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    return this.resolve(parent)
      .chain(propR("children"))
      .chain(children => delete children[name]);
  }
}

class Inode$1 {
  constructor(config = {}) {
    // Defaults
    this.file = true;
    this.directory = true;
    this.executable = false;
    this.raw = undefined;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Array(HTMLElement)
  get children() {
    return Array.from(this.raw.children).flatMap((child, i) => {
      const name = child.localName;
      const id = child.id ? "#" + child.id : "";
      const classes = child.className
        ? "." + child.className.replace(/\s+/g, ".")
        : "";
      return [
        name + id + classes, // A css selector for the child
        i + 1 // A complementary css :nth-child() selector number
      ];
    });
  }

  // Read file contents
  // Void -> Result(String)
  readFile() {
    return Ok(this.raw.innerHTML);
  }

  // Overwrite file contents
  // String -> Result(String)
  writeFile(contents) {
    return Ok((this.raw.innerHTML = contents));
  }

  // Append file contents
  // String -> Result(String)
  appendFile(contents) {
    return Ok((this.raw.innerHTML += contents));
  }

  // Truncate file contents
  // Void -> Result(String)
  truncateFile() {
    return Ok((this.raw.innerHTML = ""));
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return Ok(Object.keys(this.children));
  }
}

class DOMFS {
  // [String] -> Result(Inode)
  resolve(pathArray) {
    // element.children[0] becomes /dev/dom/element/1
    const selector =
      pathArray.length === 0
        ? "*" // Return root if pathArray is empty
        : (" " + pathArray.join(" > ")).replace(/ (\d)/g, " :nth-child($1)");
    const element = document.querySelector(selector);
    return element ? Ok(new Inode$1({ raw: element })) : Err$1("Failed to resolve");
  }

  // Create a new element
  // [String] -> Result(Inode)
  createFile(pathArray) {
    const parent = pathArray.slice(0, -1);
    const name = pathArray.slice(-1)[0];
    const element = document.createElement(name);
    return this.resolve(parent)
      .chain(propR("raw"))
      .chain(parentEl => parentEl.appendChild(element))
      .map(() => new Inode$1({ raw: element }));
  }

  // Only makes sense in the DOM, all nodes are both files and directories
  // [String] -> Result(Inode)
  createDirectory(pathArray) {
    return this.createFile(pathArray);
  }

  // Remove
  // [String] -> Result(Boolean)
  remove(pathArray) {
    return this.resolve(pathArray)
      .chain(propR("raw"))
      .chain(element => element.remove());
  }
}

// Throws an error if argument is not a string
// normalize a crazy path
// e.g. "/the///./../a/crazy/././path" => "/a/crazy/path"
function normalize(path) {
  // Empty or no input
  if (!path) {
    return ".";
  }
  // Assume relative path,
  let isAbsolute = false;
  // but reassign if absolute
  if (path.indexOf("/") === 0) {
    isAbsolute = true;
  }

  const significant = (path.match(/[^/]+/g) || []) // Split path on "/" into an array
    .filter(name => name !== ".") // Remove redundant current directory names "."
    .reduce(
      (pathArray, name) =>
        // If a normal name, array is empty, or child of an unresolved ".."
        name !== ".." ||
        !pathArray.length ||
        pathArray[pathArray.length - 1] === ".."
          ? [...pathArray, name] // Add to the path array
          : pathArray.slice(0, -1), // Otherwise remove the last name
      []
    );

  if (isAbsolute) {
    return "/" + significant.join("/");
  } else {
    return significant.join("/");
  }
}

// POSIX parse the path


// Get the parent directory name
// "/directories/hold/files/like-this-one" -> "/directories/hold/files"


// Basename from the normal name
// "/path/to/filename.txt" => "filename.txt"
// You can also specify an extention
// basename("filename.txt", ".txt") => "filename"


// Chop a path into an array of names
// "/paths/are/just/arrays" => ["paths", "are", "just", "arrays"]
const chop = path => normalize(path).match(/[^/]+/g) || [];

class VFS {
  constructor(rootFS) {
    this.mounts = { "/": rootFS };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    const normalized = normalize(mountPoint);
    this.resolve(normalized)
      .chain(propR("directory"))
      .map(
        isDirectory =>
          isDirectory
            ? Ok((this.mounts[normalized] = fs))
            : Err$1("No directory to mount to")
      );
  }

  // Unmount a filesystem by mount point
  unmount(mountPoint) {
    const normalized = normalize(mountPoint);
    return Ok(delete this.mounts[normalized]);
  }

  // Resolve a path to its mounted filesystem, and get its absolute path
  // relative to its local file system's root
  getPathInfo(path) {
    const normalized = normalize(path);
    const mountPoint = Object.keys(this.mounts)
      .filter(mount => normalized.startsWith(mount))
      .sort((a, b) => chop(b).length - chop(a).length)[0];

    const localFsPath = normalized.substring(mountPoint.length) || "/";
    return {
      localFs: this.mounts[mountPoint],
      localFsPathArray: chop(localFsPath)
    };
  }

  // Resolve a path to the fs provided data container
  // String -> Result(Inode)
  resolve(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.resolve(localFsPathArray);
  }

  // Make a new file
  // String -> Result(Inode)
  createFile(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.createFile(localFsPathArray);
  }

  // Make a new directory
  // String -> Result(Inode)
  createDirectory(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.createDirectory(localFsPathArray);
  }

  // Remove
  // String -> Result(Boolean)
  remove(path) {
    const { localFs, localFsPathArray } = this.getPathInfo(path);
    return localFs.remove(localFsPathArray);
  }
}

function getMode(mode = "r") {
  const map = {
    r: {
      read: true,
      write: false,
      truncate: false,
      create: false,
      append: false
    },
    "r+": {
      read: true,
      write: true,
      truncate: false,
      create: false,
      append: false
    },
    w: {
      read: false,
      write: true,
      truncate: true,
      create: true,
      append: false
    },
    "w+": {
      read: true,
      write: true,
      truncate: true,
      create: true,
      append: false
    },
    a: {
      read: false,
      write: true,
      truncate: false,
      create: true,
      append: true
    },
    "a+": {
      read: true,
      write: true,
      truncate: false,
      create: true,
      append: true
    }
  };
  return map[mode];
}

// prettier-ignore
var FileDescriptor = (path, modeString) => {
  const mode = getMode(modeString);
  const normalized = normalize(path);
  const inode = fs.resolve(normalized)
    .chainErr(e => {
      mode.create
        ? fs.createFile(normalized)
        : Err$1(e);
    });

  mode.truncate
    ? inode.map(n => n.truncateFile())
    : null;
  
  return {
    mode,
    path: normalized,
    inode,

    // Return file contents
    readFile: () =>
      mode.read
        ? inode.map(n => n.readFile())
        : Err$1("Read mode unset"),

    // Write file contents
    writeFile: contents =>
      mode.write
        ? mode.append
            ? inode.map(n => n.appendFile(contents))
            : inode.map(n => n.writeFile(contents))
        : Err$1("Write mode unset"),

    // Read directory contents
    readDirectory: () =>
      inode.map(n => n.readDirectory())
  }
};

var history = {};

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
function spawn(process, msgID, [image, argv]) {
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
function exec(process, msgID, [inputPath, argv]) {
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
function exit(process, msgID, args) {
  return pass(process, msgID, process.worker.terminate());
}

// Check if a file exists
function exists(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  return pass(process, msgID, process.exists(safePath));
}

// Get file/directory info
function stat(process, msgID, [inputPath]) {
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
function open(process, msgID, [inputPath, mode]) {
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
function close(process, msgID, [fd]) {
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
function dup(process, msgID, [fd]) {
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
function dup2(process, msgID, [fd1, fd2]) {
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
function readFile(process, msgID, [fd]) {
  if (fd < 0) {
    return fail(process, msgID, "File Descriptor should be >= 0");
  }
  return process.fds[fd].readFile().fold(e => fail(process, msgID, e))(data =>
    pass(process, msgID, data)
  );
}

// Read directory children
function readDirectory(process, msgID, [fd]) {
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
function writeFile(process, msgID, [fd, data]) {
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
function createDirectory(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  fs.createDirectory(safePath).fold(e => fail(process, msgID, e))(r =>
    pass(process, msgID, r)
  );
}

// Remove, what rm does
function remove(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  fs.remove(safePath).fold(e => fail(process, msgID, e))(r =>
    pass(process, msgID, r)
  );
}

// Tell what directory we are in
function currentDirectory(process, msgID, args) {
  return pass(process, msgID, process.currentDirectory);
}

// Change the current working directory
function changeDirectory(process, msgID, [inputPath]) {
  if (typeof inputPath !== "string") {
    return fail(process, msgID, "First argument - path - should be a string");
  }
  const safePath = resolvePath(inputPath, process);
  const result = (process.currentDirectory = safePath);
  return pass(process, msgID, result);
}

// Get environment variable
function getenv(process, msgID, [key]) {
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
function setenv(process, msgID, [key, value]) {
  if (typeof key !== "string") {
    return fail(process, msgID, "First argument - key - should be a string");
  }
  if (typeof value !== "string") {
    return fail(process, msgID, "Second argument - value - should be a string");
  }
  const result = (process.env[key] = value);
  return pass(process, msgID, result);
}


var sys = Object.freeze({
	spawn: spawn,
	exec: exec,
	exit: exit,
	exists: exists,
	stat: stat,
	open: open,
	close: close,
	dup: dup,
	dup2: dup2,
	readFile: readFile,
	readDirectory: readDirectory,
	writeFile: writeFile,
	createDirectory: createDirectory,
	remove: remove,
	currentDirectory: currentDirectory,
	changeDirectory: changeDirectory,
	getenv: getenv,
	setenv: setenv
});

function genUUID() {
  const base = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return base.replace(/[xy]/g, char => {
    // Random integer between 0 and 16
    const randFloat = Math.random() * 16;
    const randInt = parseInt(randFloat);
    if (char === "x") {
      // "x" is replaced with any hex number
      return randInt.toString(16);
    } else {
      // "y" is replaced with either 8, 9, a, or b
      return ((randInt & 3) | 8).toString(16);
    }
  });
}

const spawnWorker = script => {
  const blob = new Blob([script], { type: "application/javascript" });
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
};

const openLocalFile = (readAs = "readAsText") => {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return Task(err => res => {
    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader[readAs](file);
      reader.onloadend = () => res(reader.result);
    };
  });
};

const http = (uri, method = "GET") =>
  Task(err => res => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, uri, true);
    xhr.onload = () =>
      xhr.status < 300 && xhr.status >= 200
        ? res(xhr.response)
        : err(xhr.status + " " + xhr.statusText);
    xhr.onerror = err;
    xhr.send();
  });

const type = value =>
  Object.prototype.toString.call(value).match(/\[object (.+)\]/i)[1];


var utils = Object.freeze({
	genUUID: genUUID,
	spawnWorker: spawnWorker,
	openLocalFile: openLocalFile,
	http: http,
	type: type
});

class Process {
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
    const lib = "(function () {\n'use strict';\n\n// Generate a new random message id\nconst newID = length =>\n  [...Array(length).keys()]\n    .map(_ => Math.round(Math.random() * 2 ** 16))\n    .map(n => String.fromCharCode(n))\n    .join(\"\");\n\n// Make a request from the kernel with a system call\n// This wrapper returns a promise for every call\n// Usage: call(\"callName\", [\"arg1\", \"arg2\"]).then(handleResult);\nfunction call(name, args = []) {\n  // We use a message ID so that we can order the kernel's responses\n  const id = newID(5);\n  // This is just the system call request format\n  postMessage({\n    type: \"syscall\",\n    name,\n    args,\n    id\n  });\n\n  return new Promise((resolve, reject) => {\n    function listener(message) {\n      const msg = message.data;\n      // Short circuit ignore messages without the same id\n      if (msg.id !== id) return;\n\n      removeEventListener(\"message\", listener);\n      msg.status === \"success\" ? resolve(msg.result) : reject(msg.reason);\n    }\n\n    addEventListener(\"message\", listener);\n  });\n}\n\n/**\n * Spawn a new process from an executable image\n * @async\n * @param {string} image - The executable code to run\n * @param {array} argv - Argument vector for the new process\n * @return {Promise<number>} pid - The ID of the new process\n * \n * @example sys.spawn(\"console.log(argv)\", [\"hello\", \"world\"])\n */\nasync function spawn(image = \"\", argv = []) {\n  return call(\"spawn\", [image, argv]);\n}\n\n/**\n * Spawn a new process from a path\n * @async\n * @param {string} path - The executable code file's path\n * @param {array} argv\n * @return {Promise<number>} pid\n * \n * @example sys.exec(\"/bin/ls\", [\"ls\", \"-a\"])\n */\nasync function exec(path, argv = []) {\n  return call(\"exec\", [path, argv]);\n}\n\n/**\n * Exit the current process (terminate)\n * @async\n * \n * @example sys.exit()\n */\nasync function exit() {\n  return call(\"exit\", []);\n}\n\n/**\n * Check if a file exists\n * @async\n * @param {string} path\n * @return {Promise<boolean>}\n * \n * @example const exists = await sys.exists(\"/file\")\n */\nasync function exists(path) {\n  return call(\"exists\", [path]);\n}\n\n/**\n * Get file/directory info\n * @async\n * @param {string} path\n * @return {Promise<object>}\n * \n * @example const info = await sys.stat(\"/file\")\n */\nasync function stat(path) {\n  return call(\"stat\", [path]);\n}\n\n/**\n * Open a file/directory to get its file descriptor\n * @async\n * @param {string} path\n * @return {Promise<number>} fd - new file descriptor\n * \n * @example const fd = await sys.open(\"/file\")\n */\nasync function open(path, mode = \"r\") {\n  return call(\"open\", [path, mode]);\n}\n\n/**\n * Close a file descriptor from use\n * @async\n * @param {number} fd\n * \n * @example sys.close(3)\n */\nasync function close(fd) {\n  return call(\"close\", [fd]);\n}\n\n/**\n * Duplicate a file descriptor\n * @async\n * @param {number} fd - File descriptor to copy\n * @return {Promise<number>} duplicated file descriptor\n * \n * @example const copied = await sys.dup(0)\n */\nasync function dup(fd) {\n  return call(\"dup\", [fd]);\n}\n\n/**\n * Duplicate a file descriptor to a new location, possibly overwriting one\n * @async\n * @param {number} fd1 - File descriptor to copy\n * @param {number} fd2 - Target to copy to\n * @return {Promise<number>} Second file descriptor\n * \n * @example sys.dup2(1, 2)\n */\nasync function dup2(fd1, fd2) {\n  return call(\"dup2\", [fd1, fd2]);\n}\n\n/**\n * Read file contents from a file descriptor\n * @async\n * @param {number} fd\n * @return {Promise<string>} data - file contents\n * \n * @example const contents = await sys.readFile(fd)\n */\nasync function readFile(fd) {\n  return call(\"readFile\", [fd]);\n}\n\n/**\n * Read directory children, like what ls does\n * @async\n * @param {number} fd\n * @return {Promise<array>} children - directory entries\n * \n * @example const dirArray = await sys.readDirectory(fd)\n */\nasync function readDirectory(fd) {\n  return call(\"readDirectory\", [fd]);\n}\n\n/**\n * Write data to a file descriptor\n * @async\n * @param {number} fd\n * @param {string} data - new file contents\n * \n * @example sys.write(1, \"hello world\")\n */\nasync function writeFile(fd, data = \"\") {\n  return call(\"writeFile\", [fd, data]);\n}\n\n/**\n * Create a new directory\n * @async\n * @param {string} path\n * \n * @example sys.createDirectory(\"/home/newdir\")\n */\nasync function createDirectory(path) {\n  return call(\"createDirectory\", [path]);\n}\n\n/**\n * Remove, what rm does\n * @async\n * @param {string} path\n * \n * @example sys.remove(\"/home/oldfile\")\n */\nasync function remove(path) {\n  return call(\"remove\", [path]);\n}\n\n/**\n * Get the current working directory\n * @async\n * @return {Promise<string>} current working directory\n * \n * @example const cwd = await sys.currentDirectory()\n */\nasync function currentDirectory() {\n  return call(\"currentDirectory\", []);\n}\n\n/**\n * Change the working directory\n * @async\n * @param {string} path - new working directory\n * \n * @example sys.changeDirectory(\"/home\")\n */\nasync function changeDirectory(path = \"/home\") {\n  return call(\"changeDirectory\", [path]);\n}\n\n/**\n * Get an environment variable value by key,\n * invoke with no arguments to return the whole environment variable object\n * @async\n * @param {string} key\n * @return {Promise<string>} value\n * \n * @example const usingAwait = (await sys.getenv(\"PATH\")).split(\":\")\n * @example const usingPromise = sys.getenv(\"PATH\").then(path => path.split(\":\"))\n */\nasync function getenv(key) {\n  return call(\"getenv\", [key]);\n}\n\n/**\n * Set an environment variable to a new value\n * @async\n * @param {string} key\n * @param {string} value\n * \n * @example sys.setenv(\"varName\", \"It doesn't have to be all caps\")\n */\nasync function setenv(key, value = \"\") {\n  return call(\"setenv\", [key, value]);\n}\n\n\nvar sys$1 = Object.freeze({\n\tspawn: spawn,\n\texec: exec,\n\texit: exit,\n\texists: exists,\n\tstat: stat,\n\topen: open,\n\tclose: close,\n\tdup: dup,\n\tdup2: dup2,\n\treadFile: readFile,\n\treadDirectory: readDirectory,\n\twriteFile: writeFile,\n\tcreateDirectory: createDirectory,\n\tremove: remove,\n\tcurrentDirectory: currentDirectory,\n\tchangeDirectory: changeDirectory,\n\tgetenv: getenv,\n\tsetenv: setenv\n});\n\n// Example output: [\"Browser\", \"xx.xx.xx\"]\nfunction browserInfo() {\n  const ua = navigator.userAgent;\n  const matches =\n    ua.match(\n      /(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\\/))\\/?\\s*([\\d.]+)/i\n    ) || [];\n  if (/trident/i.test(matches[1])) {\n    const tem = ua.match(/\\brv[ :]+([\\d.]+)/g) || \"\";\n    return [\"IE\", tem[1]];\n  }\n  if (matches[1] === \"Chrome\") {\n    const tem = ua.match(/\\b(OPR|Edge)\\/([\\d.]+)/);\n    if (tem) {\n      return [\"Opera\", tem[1]];\n    }\n  }\n  if (matches[2]) {\n    return {\n      name: matches[1],\n      version: matches[2]\n    };\n  } else {\n    return {\n      name: navigator.appName,\n      version: navigator.appVersion\n    };\n  }\n}\n\nvar browser = browserInfo();\n\n// Maybe(a) : Just(a) | Nothing\nconst Just = x => ({\n  // Just(a) ~> (a -> b) -> Just(b)\n  map: f => Just(f(x)),\n  // Just(a) ~> (a -> Maybe(b)) -> Maybe(b)\n  chain: f => f(x),\n  // Just(a) ~> (Void -> e) -> (a -> r) -> r\n  fold: fail => pass => pass(x),\n  // Just(a) ~> Void -> String\n  toString: () => `Just(${x})`\n});\nconst Nothing = {\n  // Nothing ~> (a -> b) -> Nothing\n  map: f => Nothing,\n  // Nothing ~> (a -> Maybe(b)) -> Maybe(b)\n  chain: f => Nothing,\n  // Nothing ~> (Void -> e) -> (a -> r) -> e\n  fold: fail => pass => fail(),\n  // Nothing ~> Void -> String\n  toString: () => `Nothing`\n};\n\n// String -> a -> Maybe(b)\nconst propM = name => obj => (name in obj ? Just(obj[name]) : Nothing);\n\n// Result(a) : Ok(a) | Err(String)\nconst Ok = x => ({\n  // Ok(a) ~> (a -> b) -> Ok(b)\n  map: f => Ok(f(x)),\n  // Ok(a) ~> (a -> Result(b)) -> Result(b)\n  chain: f => f(x),\n  // Ok(a) ~> (a -> Result(b)) -> Result(b)\n  chainOk: f => f(x),\n  // Ok(a) ~> (a -> Result(b)) -> Ok(a)\n  chainErr: f => Ok(x),\n  // Ok(a) ~> (a -> e) -> (a -> r) -> r\n  fold: fail => pass => pass(x),\n  // Ok(a) ~> Void -> String\n  toString: () => `Ok(${x})`\n});\nconst Err = x => ({\n  // Err(a) ~> (a -> b) -> Err(a)\n  map: f => Err(x),\n  // Err(a) ~> (a -> Result(b)) -> Err(a)\n  chain: f => Err(x),\n  // Err(a) ~> (a -> Result(b)) -> Err(a)\n  chainOk: f => Err(x),\n  // Err(a) ~> (a -> Result(b)) -> Result(b)\n  chainErr: f => f(x),\n  // Err(a) ~> (a -> e) -> (a -> r) -> e\n  fold: fail => pass => fail(x),\n  // Err(a) ~> Void -> String\n  toString: () => `Err(${x})`\n});\n\n// String -> a -> Result(b)\nconst propR = name => obj =>\n  name in obj ? Ok(obj[name]) : Err(`${name} not in ${JSON.stringify(obj)}`);\n\n// Similar to Promise\n// prettier-ignore\nconst Task = run => ({\n  // (a -> e) -> (a -> r) -> Task(a)\n  run,\n\n  // Task(a) ~> (a -> b) -> Task(b)\n  map: f => Task(err => res =>\n    run(err)\n       (x => res(f(x))) ),\n\n  // Task(a) ~> (a -> Task(b)) -> Task(b)\n  runMap: f => Task(err => res =>\n    run(err)\n       (x => f(x).run(err)\n                     (res) )),\n\n  // Task(a) ~> Void -> Void\n  log: () =>\n    run(console.error)\n       (console.log)\n});\n\nconst match = to => (...cases) => def => {\n  for (let i in cases) {\n    const c = cases[i];\n    for (let i in c[0]) {\n      if (c[0][i] == to) {\n        return c[1](c[0][i]);\n      }\n    }\n  }\n  return def(to);\n};\n\nvar fp = Object.freeze({\n\tJust: Just,\n\tNothing: Nothing,\n\tpropM: propM,\n\tOk: Ok,\n\tErr: Err,\n\tpropR: propR,\n\tTask: Task,\n\tmatch: match\n});\n\n// Throws an error if argument is not a string\nfunction assertString(str) {\n  if (typeof str !== \"string\") {\n    throw new Error(\"Some argument is not a string\");\n  }\n}\n\n// normalize a crazy path\n// e.g. \"/the///./../a/crazy/././path\" => \"/a/crazy/path\"\nfunction normalize(path) {\n  // Empty or no input\n  if (!path) {\n    return \".\";\n  }\n  // Assume relative path,\n  let isAbsolute = false;\n  // but reassign if absolute\n  if (path.indexOf(\"/\") === 0) {\n    isAbsolute = true;\n  }\n\n  const significant = (path.match(/[^/]+/g) || []) // Split path on \"/\" into an array\n    .filter(name => name !== \".\") // Remove redundant current directory names \".\"\n    .reduce(\n      (pathArray, name) =>\n        // If a normal name, array is empty, or child of an unresolved \"..\"\n        name !== \"..\" ||\n        !pathArray.length ||\n        pathArray[pathArray.length - 1] === \"..\"\n          ? [...pathArray, name] // Add to the path array\n          : pathArray.slice(0, -1), // Otherwise remove the last name\n      []\n    );\n\n  if (isAbsolute) {\n    return \"/\" + significant.join(\"/\");\n  } else {\n    return significant.join(\"/\");\n  }\n}\n\n// Splits POSIX path (\"/directories/leading/to/file.ext\") into\n// 1: \"/\" (if absolute)\n// 2: \"directories/leading/to/\" (if any)\n// 3: \"file.ext\" (the basename)\n// 4: \".ext\" (extention)\nconst splitPathRe = /^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;\n\n// POSIX parse the path\nfunction parse(path = \"\") {\n  assertString(path);\n  // Use the POSIX path split regex\n  const [, root, parent, base, extention] = normalize(path).match(splitPathRe);\n  return {\n    absolute: !!root,\n    parent,\n    base,\n    extention,\n    name: base.slice(0, base.length - extention.length)\n  };\n}\n\n// Get the parent directory name\n// \"/directories/hold/files/like-this-one\" -> \"/directories/hold/files\"\nfunction parentname(path = \"\") {\n  const parsed = parse(path);\n  // If absolute path\n  if (parsed.absolute) {\n    return \"/\" + parsed.parent;\n  } else {\n    return parsed.parent;\n  }\n}\n\n// Basename from the normal name\n// \"/path/to/filename.txt\" => \"filename.txt\"\n// You can also specify an extention\n// basename(\"filename.txt\", \".txt\") => \"filename\"\nfunction basename(path = \"\", extension = \"\") {\n  const basename = parse(path).base;\n  // The basename is returned unless an extension argument is set and valid\n  const indexOf = basename.indexOf(extension);\n  // Extention must be included specifically at the end of the basename\n  if (indexOf && indexOf + extension.length === basename.length) {\n    return basename.slice(0, indexOf);\n  } else {\n    return basename;\n  }\n}\n\n// Chop a path into an array of names\n// \"/paths/are/just/arrays\" => [\"paths\", \"are\", \"just\", \"arrays\"]\nconst chop = path => normalize(path).match(/[^/]+/g) || [];\n\n\nvar path = Object.freeze({\n\tnormalize: normalize,\n\tparse: parse,\n\tparentname: parentname,\n\tbasename: basename,\n\tchop: chop\n});\n\nconst http = (uri, method = \"GET\") =>\n  Task(err => res => {\n    const xhr = new XMLHttpRequest();\n    xhr.open(method, uri, true);\n    xhr.onload = () =>\n      xhr.status < 300 && xhr.status >= 200\n        ? res(xhr.response)\n        : err(xhr.status + \" \" + xhr.statusText);\n    xhr.onerror = err;\n    xhr.send();\n  });\n\n/**\n * Read a file's contents\n * @async\n * @param {string} path - File name\n * @return {Promise<string>} file contents\n * \n * @example fs.readFile(\"./file\").then(console.log)\n */\nasync function readFile$1(path, mode = \"r\") {\n  const fd = await sys.open(path, mode);\n  const data = sys.readFile(fd);\n  sys.close(fd);\n  return data;\n}\n\n/**\n * Overwrite a file or create a new one\n * @async\n * @param {string} path\n * @param {string} data - New file contents\n * \n * @example fs.writeFile(\"./file\", \"contents\")\n */\nasync function writeFile$1(path, data = \"\", mode = \"w\") {\n  const fd = await sys.open(path, mode);\n  sys.writeFile(fd, data);\n  sys.close(fd);\n  return;\n}\n\n/**\n * Append data to a file or create a new one\n * @async\n * @param {string} path\n * @param {string} data - Data to append\n * \n * @example fs.appendFile(\"/log/something\", \"[time]: Event\\n\")\n */\nasync function appendFile(path, data = \"\", mode = \"a\") {\n  const fd = await sys.open(path, mode);\n  sys.write(fd, data);\n  sys.close(fd);\n  return;\n}\n\n\nvar fs = Object.freeze({\n\treadFile: readFile$1,\n\twriteFile: writeFile$1,\n\tappendFile: appendFile\n});\n\nasync function read(str) {\n  // This operation is expensive and will be replaced\n  // once the console multiplexer is implemented\n  return readFile$1(\"/dev/console\");\n}\n\n\nvar stdin = Object.freeze({\n\tread: read\n});\n\nasync function write(str) {\n  // This operation is expensive and will be replaced\n  // once the console multiplexer is implemented\n  return writeFile$1(\"/dev/console\", str, \"r+\");\n}\n\n\nvar stdout = Object.freeze({\n\twrite: write\n});\n\nconst stderr = {};\n\nvar process$1 = {\n  stdin,\n  stdout,\n  stderr\n};\n\nasync function loadFile(path) {\n  // If path is a file\n  const pathStat = await stat(path);\n  if (pathStat.file) {\n    return self.eval(await readFile$1(path));\n  }\n  // If path.js is a file\n  const pathJsStat = await stat(path + \".js\");\n  if (pathJsStat.file) {\n    return self.eval(await readFile$1(path + \".js\"));\n  }\n  // If path.json is a file\n  const pathJsonStat = await stat(path + \".json\");\n  if (pathJsonStat.file) {\n    return JSON.parse(await readFile$1(path + \".json\"));\n  }\n  // None worked\n  throw new Error(\"not found\");\n}\n\nvar require = requirePath =>\n  loadFile(requirePath).catch(_ => loadFile(requirePath + \"/index\"));\n\nclass ArgParser {\n  constructor(options) {\n    this.options = options || {};\n  }\n\n  parse(argv = process.argv) {}\n}\n\nconst esc = \"\\x1b\";\nconst beep = \"\\x07\";\n\nconst cursor = {\n  move: {\n    to: (x = 1, y = 1) => esc + \"[\" + x + \";\" + y + \"H\",\n    up: (n = 1) => esc + \"[\" + n + \"A\",\n    down: (n = 1) => esc + \"[\" + n + \"B\",\n    right: (n = 1) => esc + \"[\" + n + \"C\",\n    left: (n = 1) => esc + \"[\" + n + \"D\",\n    nextLine: () => esc + \"[E\",\n    prevLine: () => esc + \"[F\",\n    leftMost: () => esc + \"[G\"\n  },\n  hide: () => esc + \"[?25l\",\n  show: () => esc + \"[?25h\",\n  shape: {\n    block: () => esc + \"]50;CursorShape=0\" + beep,\n    bar: () => esc + \"]50;CursorShape=1\" + beep,\n    underscore: () => esc + \"50;CursorShape=2\" + beep\n  },\n  savePosition: () => esc + \"[s\",\n  restorePosition: () => esc + \"[u\"\n};\n\nconst line = {\n  eraseEnd: () => esc + \"[K\",\n  eraseStart: () => esc + \"[1K\",\n  erase: () => esc + \"[2K\"\n};\n\nconst screen = {\n  eraseDown: () => esc + \"[J\",\n  eraseUp: () => esc + \"[1J\",\n  erase: () => esc + \"[2J\",\n  clear: () => esc + \"c\",\n  scrollUp: (n = 1) => esc + \"[\" + n + \"S\",\n  scrollDown: (n = 1) => esc + \"[\" + n + \"T\"\n};\n\nconst misc = {\n  beep: () => beep,\n  setTitle: str => esc + \"]0;\" + str + beep,\n  link: (url, str) => esc + \"[8;;\" + url + beep + (str || url) + esc + \"[8;;\" + beep\n};\n\n\nvar control = Object.freeze({\n\tcursor: cursor,\n\tline: line,\n\tscreen: screen,\n\tmisc: misc\n});\n\nvar ansi = {\n  // Styles\n  reset: [0, 0],\n  bold: [1, 22],\n  dim: [2, 22],\n  italic: [3, 23],\n  underline: [4, 24],\n  inverse: [7, 27],\n  hidden: [8, 28],\n  strikethrough: [9, 29],\n\n  // Foreground base colors\n  black: [30, 39],\n  red: [31, 39],\n  green: [32, 39],\n  yellow: [33, 39],\n  blue: [34, 39],\n  magenta: [35, 39],\n  cyan: [36, 39],\n  white: [37, 39],\n\n  // Foreground bright colors\n  gray: [90, 39],\n  grey: [90, 39],\n  brightRed: [91, 39],\n  brightGreen: [92, 39],\n  brightYellow: [93, 39],\n  brightBlue: [94, 39],\n  brightMagenta: [95, 39],\n  brightCyan: [96, 39],\n  brightWhite: [97, 39],\n\n  // Background base colors\n  bgBlack: [40, 49],\n  bgRed: [41, 49],\n  bgGreen: [42, 49],\n  bgYellow: [43, 49],\n  bgBlue: [44, 49],\n  bgMagenta: [45, 49],\n  bgCyan: [46, 49],\n  bgWhite: [47, 49],\n\n  // Background bright colors\n  bgGray: [100, 49],\n  bgGrey: [100, 49],\n  bgBrightRed: [101, 49],\n  bgBrightGreen: [102, 49],\n  bgBrightYellow: [103, 49],\n  bgBrightBlue: [104, 49],\n  bgBrightMagenta: [105, 49],\n  bgBrightCyan: [106, 49],\n  bgBrightWhite: [107, 49]\n};\n\nfunction wrap(style, str) {\n  const [open, close] = ansi[style];\n  return `\\x1b[${open}m${str}\\x1b[${close}m`;\n}\n\nfunction colorize(styles, str) {\n  if (styles instanceof Array) {\n    for (let i in styles) {\n      str = wrap(styles[i], str);\n    }\n  } else if (typeof styles === \"string\") {\n    str = wrap(styles, str);\n  }\n  return str;\n}\n\n/*\n\nconst styles = [];\n\nObject.keys(ansi).forEach(style => {\n  if (style.match(\"(reset|hidden|grey|bgGrey)\")) {\n    return;\n  }\n\n  styles.push(colorize(style, style));\n});\n\nconsole.log(styles.join(\" \"));\n\n\"\u001b\\u001b[1mbold\\u001b[22m \\u001b[2mdim\\u001b[22m \\u001b[3mitalic\\u001b[23m \\u001b[4munderline\\u001b[24m \\u001b[7minverse\\u001b[27m \\u001b[9mstrikethrough\\u001b[29m \\u001b[30mblack\\u001b[39m \\u001b[31mred\\u001b[39m \\u001b[32mgreen\\u001b[39m \\u001b[33myellow\\u001b[39m \\u001b[34mblue\\u001b[39m \\u001b[35mmagenta\\u001b[39m \\u001b[36mcyan\\u001b[39m \\u001b[37mwhite\\u001b[39m \\u001b[90mgray\\u001b[39m \\u001b[91mredBright\\u001b[39m \\u001b[92mgreenBright\\u001b[39m \\u001b[93myellowBright\\u001b[39m \\u001b[94mblueBright\\u001b[39m \\u001b[95mmagentaBright\\u001b[39m \\u001b[96mcyanBright\\u001b[39m \\u001b[97mwhiteBright\\u001b[39m \\u001b[40mbgBlack\\u001b[49m \\u001b[41mbgRed\\u001b[49m \\u001b[42mbgGreen\\u001b[49m \\u001b[43mbgYellow\\u001b[49m \\u001b[44mbgBlue\\u001b[49m \\u001b[45mbgMagenta\\u001b[49m \\u001b[46mbgCyan\\u001b[49m \\u001b[47mbgWhite\\u001b[49m \\u001b[100mbgGray\\u001b[49m \\u001b[101mbgRedBright\\u001b[49m \\u001b[102mbgGreenBright\\u001b[49m \\u001b[103mbgYellowBright\\u001b[49m \\u001b[104mbgBlueBright\\u001b[49m \\u001b[105mbgMagentaBright\\u001b[49m \\u001b[106mbgCyanBright\\u001b[49m \\u001b[107mbgWhiteBright\\u001b[49m\"\n\n*/\n\nconst info = colorize(\"blue\", \"ℹ\");\nconst success = colorize(\"green\", \"✔\");\nconst warning = colorize(\"yellow\", \"⚠\");\nconst error = colorize(\"red\", \"✖\");\nconst star = colorize(\"brightYellow\", \"★\");\nconst radioOn = colorize(\"green\", \"◉\");\nconst radioOff = colorize(\"red\", \"◯\");\nconst checkboxOn = colorize(\"green\", \"☒\");\nconst checkboxOff = colorize(\"red\", \"☐\");\nconst arrowUp = \"↑\";\nconst arrowDown = \"↓\";\nconst arrowLeft = \"←\";\nconst arrowRight = \"→\";\nconst line$1 = \"─\";\nconst play = \"▶\";\nconst pointer = \"❯\";\nconst pointerSmall = \"›\";\nconst square = \"▇\";\nconst squareSmall = \"◼\";\nconst bullet = \"●\";\n\n\nvar symbols = Object.freeze({\n\tinfo: info,\n\tsuccess: success,\n\twarning: warning,\n\terror: error,\n\tstar: star,\n\tradioOn: radioOn,\n\tradioOff: radioOff,\n\tcheckboxOn: checkboxOn,\n\tcheckboxOff: checkboxOff,\n\tarrowUp: arrowUp,\n\tarrowDown: arrowDown,\n\tarrowLeft: arrowLeft,\n\tarrowRight: arrowRight,\n\tline: line$1,\n\tplay: play,\n\tpointer: pointer,\n\tpointerSmall: pointerSmall,\n\tsquare: square,\n\tsquareSmall: squareSmall,\n\tbullet: bullet\n});\n\nconst line$2 = {\n  fps: 8,\n  frames: [\"-\", \"\\\\\", \"|\", \"/\"]\n};\n\nconst dots = {\n  fps: 12.5,\n  frames: [\"⠋\", \"⠙\", \"⠹\", \"⠸\", \"⠼\", \"⠴\", \"⠦\", \"⠧\", \"⠇\", \"⠏\"]\n};\n\nconst scrolling = {\n  fps: 5,\n  frames: [\".  \", \".. \", \"...\", \" ..\", \"  .\", \"   \"]\n};\n\nconst scrolling2 = {\n  fps: 2.5,\n  frames: [\".  \", \".. \", \"...\", \"   \"]\n};\n\nconst star$1 = {\n  fps: 14,\n  frames: [\"✶\", \"✸\", \"✹\", \"✺\", \"✹\", \"✷\"]\n};\n\nconst ball = {\n  fps: 8,\n  frames: [\"⠁\", \"⠂\", \"⠄\", \"⠂\"]\n};\n\nconst triangle = {\n  fps: 15,\n  frames: [\"◢\", \"◣\", \"◤\", \"◥\"]\n};\n\nconst circle = {\n  fps: 15,\n  frames: [\"◐\", \"◓\", \"◑\", \"◒\"]\n};\n\nconst bounce = {\n  fps: 12.5,\n  frames: [\n    \"( ●    )\",\n    \"(  ●   )\",\n    \"(   ●  )\",\n    \"(    ● )\",\n    \"(     ●)\",\n    \"(    ● )\",\n    \"(   ●  )\",\n    \"(  ●   )\",\n    \"( ●    )\",\n    \"(●     )\"\n  ]\n};\n\nconst clock = {\n  fps: 10,\n  frames: [\n    \"🕐 \",\n    \"🕑 \",\n    \"🕒 \",\n    \"🕓 \",\n    \"🕔 \",\n    \"🕕 \",\n    \"🕖 \",\n    \"🕗 \",\n    \"🕘 \",\n    \"🕙 \",\n    \"🕚 \"\n  ]\n};\n\nconst pong = {\n  fps: 12.5,\n  frames: [\n    \"▐⠂       ▌\",\n    \"▐⠈       ▌\",\n    \"▐ ⠂      ▌\",\n    \"▐ ⠠      ▌\",\n    \"▐  ⡀     ▌\",\n    \"▐  ⠠     ▌\",\n    \"▐   ⠂    ▌\",\n    \"▐   ⠈    ▌\",\n    \"▐    ⠂   ▌\",\n    \"▐    ⠠   ▌\",\n    \"▐     ⡀  ▌\",\n    \"▐     ⠠  ▌\",\n    \"▐      ⠂ ▌\",\n    \"▐      ⠈ ▌\",\n    \"▐       ⠂▌\",\n    \"▐       ⠠▌\",\n    \"▐       ⡀▌\",\n    \"▐      ⠠ ▌\",\n    \"▐      ⠂ ▌\",\n    \"▐     ⠈  ▌\",\n    \"▐     ⠂  ▌\",\n    \"▐    ⠠   ▌\",\n    \"▐    ⡀   ▌\",\n    \"▐   ⠠    ▌\",\n    \"▐   ⠂    ▌\",\n    \"▐  ⠈     ▌\",\n    \"▐  ⠂     ▌\",\n    \"▐ ⠠      ▌\",\n    \"▐ ⡀      ▌\",\n    \"▐⠠       ▌\"\n  ]\n};\n\n\nvar spinners = Object.freeze({\n\tline: line$2,\n\tdots: dots,\n\tscrolling: scrolling,\n\tscrolling2: scrolling2,\n\tstar: star$1,\n\tball: ball,\n\ttriangle: triangle,\n\tcircle: circle,\n\tbounce: bounce,\n\tclock: clock,\n\tpong: pong\n});\n\nclass Spinner {\n  constructor(name = \"circle\") {\n    const spinner = spinners[name];\n    this.frames = spinner.frames;\n    this.index = 0;\n    this.interval = Math.round(1000 / spinner.fps);\n    this.setIntervalIndex = null;\n  }\n\n  next() {\n    this.index++;\n    const realIndex = (this.index - 1) % this.frames.length;\n    return this.frames[realIndex];\n  }\n\n  start(outputFunction) {\n    outputFunction = outputFunction || (str => process.stdout.write(str));\n    this.setIntervalIndex = setInterval(() => {\n      let frame = this.next();\n      let clearFrame = frame.replace(/./g, \"\\b\");\n      outputFunction(clearFrame);\n      outputFunction(frame);\n    }, this.interval);\n  }\n\n  stop() {\n    clearInterval(this.setIntervalIndex);\n  }\n}\n\nvar cli = {\n  ArgParser,\n  control,\n  colorize,\n  symbols,\n  Spinner\n};\n\n// Copy all these imports to the global scope\nObject.assign(self, {\n  sys: sys$1,\n\n  browser,\n\n  fp,\n  path,\n  http,\n  fs,\n  process: process$1,\n  require,\n\n  cli\n});\n\n// Convenience globals\nself.print = (...args) => process$1.stdout.write(args.join(\" \"));\nself.println = (...args) => process$1.stdout.write(args.join(\" \") + \"\\n\");\n\n// Safari for whatever reason does not implement CustomEvent in web workers.\n// The error I get is \"ReferenceError: Can't find variable: CustomEvent\".\n// This is a little work-around, but it's not 100% compatable\nif (typeof CustomEvent === \"undefined\") {\n  self.CustomEvent = class CustomEvent extends Event {\n    constructor(name, obj) {\n      super(name);\n      Object.assign(this, obj);\n    }\n  };\n}\n\n// This transforms message events into native js events\naddEventListener(\"message\", message => {\n  const { type: type$1, name, detail } = message.data;\n  if (type$1 === \"event\" && name) {\n    // Fire the event natively\n    const event = new CustomEvent(name, { detail });\n    dispatchEvent(event);\n  }\n});\n\n}());\n";
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
      : Err$1("File descriptor does not exist");
  }

  // Duplicate a file descriptor
  dup(fd) {
    return this.fds[fd]
      ? Ok(this.fds.push(this.fds[fd]) - 1)
      : Err$1("File descriptor does not exist");
  }

  // Copy a file descriptor to a specified location
  dup2(fd1, fd2) {
    return this.fds[fd1]
      ? Ok(((this.fds[fd2] = this.fds[fd1]), fd1))
      : Err$1("File descriptor does not exist");
  }
}

class ProcessTable {
  constructor(init) {
    if (!init instanceof Process) {
      throw new Error("Init process is invalid");
    }
    this.list = [init];
  }

  add(process) {
    return this.list.push(process) - 1;
  }

  // Emit an event to each specified process
  emit(name, detail, pids = Object.keys(this.list)) {
    pids.map(pid =>
      this.list[pid].worker.postMessage({
        type: "event",
        name,
        detail
      })
    );
  }
}

const init = new Process("(function () {\n'use strict';\n\n// For now, all init does is launch the jsh\nsys.exec(\"/bin/jsh\");\n\n}());\n");
var processTable = new ProcessTable(init);

class Console {
  // Raw terminal write function that terminal emulators override
  writeRaw(str) {
    console.warn(`Unhandled console write: ${str}`);
  }

  // Add a carriage-return to each line-feed, as terminal emulators require it
  write(contents) {
    return this.writeRaw(contents.replace(/\n/g, "\r\n"));
  }

  // Takes a key and decides what to do
  handle(key) {
    processTable.emit("consoleInput", { key });
  }
}

var console$2 = new Console();

class Inode$2 {
  constructor(config = {}) {
    // Defaults
    this.file = true;
    this.directory = false;
    this.children = undefined;
    this.executable = false;
    this.raw = console$2;
    // Overwrite defaults
    Object.assign(this, config);
  }

  // Irrelevent
  // Void -> Result(String)
  readFile() {
    return Err("Cannot read console");
  }

  // Adds text to terminal
  // String -> Result(String)
  writeFile(contents) {
    return Ok(this.raw.write(contents));
  }

  // Same as writeFile
  // String -> Result(String)
  appendFile(contents) {
    return this.writeFile(contents);
  }

  // Clears the console
  // Void -> Result(String)
  truncateFile() {
    return Ok(this.writeFile("\x1bc"));
  }

  // Read a directory
  // Void -> Result(Array(String))
  readDirectory() {
    return Err("Not a directory");
  }
}

const inode = new Inode$2();

const devices = new OFS();

devices.addInode(["console"], inode);

// Root file system
const root = new OFS();

// Top level directories
root.createDirectory(["bin"]);
root.createDirectory(["dev"]);
root.createDirectory(["dev", "dom"]);
root.createDirectory(["home"]);
root.createDirectory(["log"]);
root.createDirectory(["tmp"]);

// Faux SHell
root.addInode(
  ["bin", "fsh"],
  new Inode({
    file: true,
    executable: true,
    raw: "(function () {\n'use strict';\n\n// Eventually, this should be a complete\n// lexer, but for now, it basically just does a whitespace split...\n\n// Just deal with a single line\nfunction tokenizeLine(line = \"\") {\n  // Split line but don't strip anything\n  const tokens = line\n    .match(/([\"'])(?:\\\\|.)+\\1|((?:[^\\\\\\s]|\\\\.)*)/g)\n    .filter(String);\n  for (let i = 0; i < tokens.length; i++) {\n    let token = tokens[i];\n    // Unescape all backlashes\n    // 'escaped\\ string\\;' > 'escaped string;'\n    tokens[i] = token.replace(/\\\\(?=.)/g, \"\");\n    // Strip off wrapper double and single quotes\n    // '\"string\"' > \"string\"\n    if (token.match(/^[\"'].+(\\1)$/m)) {\n      tokens[i] = /^([\"'])(.+)(\\1)$/gm.exec(token)[2];\n    }\n  }\n  return tokens;\n}\n\n// Split by semicolons and then tokenize each line\nfunction lex(input = \"\") {\n  // Split by unescaped semicolons\n  return input.match(/(\\\\;|[^;])+/g)\n    .map(tokenizeLine)\n}\n\n/* Test with this\n\nlex(`some\\\\ spaces\\\\ here should not \"matter \\\\; 'at all'\";\n./command one; two | piped | over > here;\nfalse || true && echo \"anything\\\\\"\\\\ \"`);\n\n*/\n\n// For now, all commands are simple\n// No pipes/redirection/anything else\n\nfunction parseCommand(tokens) {\n  return {\n    type: \"simple\",\n    argv: tokens,\n    name: tokens[0]\n  };\n}\n\nfunction parse(input = \"\") {\n  const AST = {\n    type: \"script\",\n    commands: []\n  };\n  const commands = lex(input);\n  // Parse the tokenized commands\n  for (let i in commands) {\n    const parsed = parseCommand(commands[i]);\n    AST.commands[i] = parsed;\n  }\n  return AST;\n}\n\nasync function which(name) {\n  const toCheck = await sys\n    .getenv(\"PATH\")\n    .then(PATH => PATH.split(\":\").map(path => path + \"/\" + name));\n  for (let i in toCheck) {\n    const path = toCheck[i];\n    try {\n      const { file, executable } = await sys.stat(path);\n      if (file && executable) {\n        return path;\n      }\n    } catch (e) {}\n  }\n}\n\n// prettier-ignore\nvar evaluate = str =>\n  parse(str).commands\n    .map(command =>\n      which(command.name)\n        .then(execPath => sys.exec(execPath, command.argv))\n        .catch(console.warn));\n\nclass ArgParser {\n  constructor(options) {\n    this.options = options || {};\n  }\n\n  parse(argv = process.argv) {}\n}\n\nconst esc = \"\\x1b\";\nconst beep = \"\\x07\";\n\nconst cursor = {\n  move: {\n    to: (x = 1, y = 1) => esc + \"[\" + x + \";\" + y + \"H\",\n    up: (n = 1) => esc + \"[\" + n + \"A\",\n    down: (n = 1) => esc + \"[\" + n + \"B\",\n    right: (n = 1) => esc + \"[\" + n + \"C\",\n    left: (n = 1) => esc + \"[\" + n + \"D\",\n    nextLine: () => esc + \"[E\",\n    prevLine: () => esc + \"[F\",\n    leftMost: () => esc + \"[G\"\n  },\n  hide: () => esc + \"[?25l\",\n  show: () => esc + \"[?25h\",\n  shape: {\n    block: () => esc + \"]50;CursorShape=0\" + beep,\n    bar: () => esc + \"]50;CursorShape=1\" + beep,\n    underscore: () => esc + \"50;CursorShape=2\" + beep\n  },\n  savePosition: () => esc + \"[s\",\n  restorePosition: () => esc + \"[u\"\n};\n\nconst line = {\n  eraseEnd: () => esc + \"[K\",\n  eraseStart: () => esc + \"[1K\",\n  erase: () => esc + \"[2K\"\n};\n\nconst screen = {\n  eraseDown: () => esc + \"[J\",\n  eraseUp: () => esc + \"[1J\",\n  erase: () => esc + \"[2J\",\n  clear: () => esc + \"c\",\n  scrollUp: (n = 1) => esc + \"[\" + n + \"S\",\n  scrollDown: (n = 1) => esc + \"[\" + n + \"T\"\n};\n\nconst misc = {\n  beep: () => beep,\n  setTitle: str => esc + \"]0;\" + str + beep,\n  link: (url, str) => esc + \"[8;;\" + url + beep + (str || url) + esc + \"[8;;\" + beep\n};\n\n\nvar control = Object.freeze({\n\tcursor: cursor,\n\tline: line,\n\tscreen: screen,\n\tmisc: misc\n});\n\nvar ansi = {\n  // Styles\n  reset: [0, 0],\n  bold: [1, 22],\n  dim: [2, 22],\n  italic: [3, 23],\n  underline: [4, 24],\n  inverse: [7, 27],\n  hidden: [8, 28],\n  strikethrough: [9, 29],\n\n  // Foreground base colors\n  black: [30, 39],\n  red: [31, 39],\n  green: [32, 39],\n  yellow: [33, 39],\n  blue: [34, 39],\n  magenta: [35, 39],\n  cyan: [36, 39],\n  white: [37, 39],\n\n  // Foreground bright colors\n  gray: [90, 39],\n  grey: [90, 39],\n  brightRed: [91, 39],\n  brightGreen: [92, 39],\n  brightYellow: [93, 39],\n  brightBlue: [94, 39],\n  brightMagenta: [95, 39],\n  brightCyan: [96, 39],\n  brightWhite: [97, 39],\n\n  // Background base colors\n  bgBlack: [40, 49],\n  bgRed: [41, 49],\n  bgGreen: [42, 49],\n  bgYellow: [43, 49],\n  bgBlue: [44, 49],\n  bgMagenta: [45, 49],\n  bgCyan: [46, 49],\n  bgWhite: [47, 49],\n\n  // Background bright colors\n  bgGray: [100, 49],\n  bgGrey: [100, 49],\n  bgBrightRed: [101, 49],\n  bgBrightGreen: [102, 49],\n  bgBrightYellow: [103, 49],\n  bgBrightBlue: [104, 49],\n  bgBrightMagenta: [105, 49],\n  bgBrightCyan: [106, 49],\n  bgBrightWhite: [107, 49]\n};\n\nfunction wrap(style, str) {\n  const [open, close] = ansi[style];\n  return `\\x1b[${open}m${str}\\x1b[${close}m`;\n}\n\nfunction colorize(styles, str) {\n  if (styles instanceof Array) {\n    for (let i in styles) {\n      str = wrap(styles[i], str);\n    }\n  } else if (typeof styles === \"string\") {\n    str = wrap(styles, str);\n  }\n  return str;\n}\n\n/*\n\nconst styles = [];\n\nObject.keys(ansi).forEach(style => {\n  if (style.match(\"(reset|hidden|grey|bgGrey)\")) {\n    return;\n  }\n\n  styles.push(colorize(style, style));\n});\n\nconsole.log(styles.join(\" \"));\n\n\"\u001b\\u001b[1mbold\\u001b[22m \\u001b[2mdim\\u001b[22m \\u001b[3mitalic\\u001b[23m \\u001b[4munderline\\u001b[24m \\u001b[7minverse\\u001b[27m \\u001b[9mstrikethrough\\u001b[29m \\u001b[30mblack\\u001b[39m \\u001b[31mred\\u001b[39m \\u001b[32mgreen\\u001b[39m \\u001b[33myellow\\u001b[39m \\u001b[34mblue\\u001b[39m \\u001b[35mmagenta\\u001b[39m \\u001b[36mcyan\\u001b[39m \\u001b[37mwhite\\u001b[39m \\u001b[90mgray\\u001b[39m \\u001b[91mredBright\\u001b[39m \\u001b[92mgreenBright\\u001b[39m \\u001b[93myellowBright\\u001b[39m \\u001b[94mblueBright\\u001b[39m \\u001b[95mmagentaBright\\u001b[39m \\u001b[96mcyanBright\\u001b[39m \\u001b[97mwhiteBright\\u001b[39m \\u001b[40mbgBlack\\u001b[49m \\u001b[41mbgRed\\u001b[49m \\u001b[42mbgGreen\\u001b[49m \\u001b[43mbgYellow\\u001b[49m \\u001b[44mbgBlue\\u001b[49m \\u001b[45mbgMagenta\\u001b[49m \\u001b[46mbgCyan\\u001b[49m \\u001b[47mbgWhite\\u001b[49m \\u001b[100mbgGray\\u001b[49m \\u001b[101mbgRedBright\\u001b[49m \\u001b[102mbgGreenBright\\u001b[49m \\u001b[103mbgYellowBright\\u001b[49m \\u001b[104mbgBlueBright\\u001b[49m \\u001b[105mbgMagentaBright\\u001b[49m \\u001b[106mbgCyanBright\\u001b[49m \\u001b[107mbgWhiteBright\\u001b[49m\"\n\n*/\n\nconst info = colorize(\"blue\", \"ℹ\");\nconst success = colorize(\"green\", \"✔\");\nconst warning = colorize(\"yellow\", \"⚠\");\nconst error = colorize(\"red\", \"✖\");\nconst star = colorize(\"brightYellow\", \"★\");\nconst radioOn = colorize(\"green\", \"◉\");\nconst radioOff = colorize(\"red\", \"◯\");\nconst checkboxOn = colorize(\"green\", \"☒\");\nconst checkboxOff = colorize(\"red\", \"☐\");\nconst arrowUp = \"↑\";\nconst arrowDown = \"↓\";\nconst arrowLeft = \"←\";\nconst arrowRight = \"→\";\nconst line$1 = \"─\";\nconst play = \"▶\";\nconst pointer = \"❯\";\nconst pointerSmall = \"›\";\nconst square = \"▇\";\nconst squareSmall = \"◼\";\nconst bullet = \"●\";\n\n\nvar symbols = Object.freeze({\n\tinfo: info,\n\tsuccess: success,\n\twarning: warning,\n\terror: error,\n\tstar: star,\n\tradioOn: radioOn,\n\tradioOff: radioOff,\n\tcheckboxOn: checkboxOn,\n\tcheckboxOff: checkboxOff,\n\tarrowUp: arrowUp,\n\tarrowDown: arrowDown,\n\tarrowLeft: arrowLeft,\n\tarrowRight: arrowRight,\n\tline: line$1,\n\tplay: play,\n\tpointer: pointer,\n\tpointerSmall: pointerSmall,\n\tsquare: square,\n\tsquareSmall: squareSmall,\n\tbullet: bullet\n});\n\nconst line$2 = {\n  fps: 8,\n  frames: [\"-\", \"\\\\\", \"|\", \"/\"]\n};\n\nconst dots = {\n  fps: 12.5,\n  frames: [\"⠋\", \"⠙\", \"⠹\", \"⠸\", \"⠼\", \"⠴\", \"⠦\", \"⠧\", \"⠇\", \"⠏\"]\n};\n\nconst scrolling = {\n  fps: 5,\n  frames: [\".  \", \".. \", \"...\", \" ..\", \"  .\", \"   \"]\n};\n\nconst scrolling2 = {\n  fps: 2.5,\n  frames: [\".  \", \".. \", \"...\", \"   \"]\n};\n\nconst star$1 = {\n  fps: 14,\n  frames: [\"✶\", \"✸\", \"✹\", \"✺\", \"✹\", \"✷\"]\n};\n\nconst ball = {\n  fps: 8,\n  frames: [\"⠁\", \"⠂\", \"⠄\", \"⠂\"]\n};\n\nconst triangle = {\n  fps: 15,\n  frames: [\"◢\", \"◣\", \"◤\", \"◥\"]\n};\n\nconst circle = {\n  fps: 15,\n  frames: [\"◐\", \"◓\", \"◑\", \"◒\"]\n};\n\nconst bounce = {\n  fps: 12.5,\n  frames: [\n    \"( ●    )\",\n    \"(  ●   )\",\n    \"(   ●  )\",\n    \"(    ● )\",\n    \"(     ●)\",\n    \"(    ● )\",\n    \"(   ●  )\",\n    \"(  ●   )\",\n    \"( ●    )\",\n    \"(●     )\"\n  ]\n};\n\nconst clock = {\n  fps: 10,\n  frames: [\n    \"🕐 \",\n    \"🕑 \",\n    \"🕒 \",\n    \"🕓 \",\n    \"🕔 \",\n    \"🕕 \",\n    \"🕖 \",\n    \"🕗 \",\n    \"🕘 \",\n    \"🕙 \",\n    \"🕚 \"\n  ]\n};\n\nconst pong = {\n  fps: 12.5,\n  frames: [\n    \"▐⠂       ▌\",\n    \"▐⠈       ▌\",\n    \"▐ ⠂      ▌\",\n    \"▐ ⠠      ▌\",\n    \"▐  ⡀     ▌\",\n    \"▐  ⠠     ▌\",\n    \"▐   ⠂    ▌\",\n    \"▐   ⠈    ▌\",\n    \"▐    ⠂   ▌\",\n    \"▐    ⠠   ▌\",\n    \"▐     ⡀  ▌\",\n    \"▐     ⠠  ▌\",\n    \"▐      ⠂ ▌\",\n    \"▐      ⠈ ▌\",\n    \"▐       ⠂▌\",\n    \"▐       ⠠▌\",\n    \"▐       ⡀▌\",\n    \"▐      ⠠ ▌\",\n    \"▐      ⠂ ▌\",\n    \"▐     ⠈  ▌\",\n    \"▐     ⠂  ▌\",\n    \"▐    ⠠   ▌\",\n    \"▐    ⡀   ▌\",\n    \"▐   ⠠    ▌\",\n    \"▐   ⠂    ▌\",\n    \"▐  ⠈     ▌\",\n    \"▐  ⠂     ▌\",\n    \"▐ ⠠      ▌\",\n    \"▐ ⡀      ▌\",\n    \"▐⠠       ▌\"\n  ]\n};\n\n\nvar spinners = Object.freeze({\n\tline: line$2,\n\tdots: dots,\n\tscrolling: scrolling,\n\tscrolling2: scrolling2,\n\tstar: star$1,\n\tball: ball,\n\ttriangle: triangle,\n\tcircle: circle,\n\tbounce: bounce,\n\tclock: clock,\n\tpong: pong\n});\n\nclass Spinner {\n  constructor(name = \"circle\") {\n    const spinner = spinners[name];\n    this.frames = spinner.frames;\n    this.index = 0;\n    this.interval = Math.round(1000 / spinner.fps);\n    this.setIntervalIndex = null;\n  }\n\n  next() {\n    this.index++;\n    const realIndex = (this.index - 1) % this.frames.length;\n    return this.frames[realIndex];\n  }\n\n  start(outputFunction) {\n    outputFunction = outputFunction || (str => process.stdout.write(str));\n    this.setIntervalIndex = setInterval(() => {\n      let frame = this.next();\n      let clearFrame = frame.replace(/./g, \"\\b\");\n      outputFunction(clearFrame);\n      outputFunction(frame);\n    }, this.interval);\n  }\n\n  stop() {\n    clearInterval(this.setIntervalIndex);\n  }\n}\n\nvar cli = {\n  ArgParser,\n  control,\n  colorize,\n  symbols,\n  Spinner\n};\n\n// Maybe(a) : Just(a) | Nothing\n\n\n\n// String -> a -> Maybe(b)\n\n\n// Result(a) : Ok(a) | Err(String)\n\n\n\n// String -> a -> Result(b)\n\n\n// Similar to Promise\n// prettier-ignore\n\n\nconst match = to => (...cases) => def => {\n  for (let i in cases) {\n    const c = cases[i];\n    for (let i in c[0]) {\n      if (c[0][i] == to) {\n        return c[1](c[0][i]);\n      }\n    }\n  }\n  return def(to);\n};\n\nconst state = {\n  //get prompt() {\n  //  return sys.currentDirectory()\n  //    .then(cwd => cli.colorize(\"gray\", `faux:${cwd} # `))\n  //},\n  prompt: cli.colorize(\"gray\", `faux # `),\n  input: [],\n  inputPosition: 0,\n  history: [],\n  historyPosition: undefined\n};\n\naddEventListener(\"consoleInput\", ({ detail }) => handle(detail.key));\n\nconst handle = key =>\n  match (key) (\n    // Backspace\n    [[\"\\x7f\", \"\\b\"],\n      remove],\n    [[\"\\r\"],\n      enter],\n    // Arrow keys\n    [[\"\\x1b[A\", \"\\x1b[B\", \"\\x1b[C\", \"\\x1b[D\"],\n      arrow]\n  ) (insert);\n\nconst insert = key => {\n  state.input.splice(state.inputPosition, 0, key);\n  state.inputPosition++;\n  const trailing = state.input.slice(state.inputPosition);\n  print(\n    key + cli.control.cursor.savePosition() + trailing.join(\"\") + cli.control.cursor.restorePosition()\n  );\n};\n\nconst remove = _ => {\n  if (state.inputPosition == 0) {\n    return\n  }\n  state.inputPosition--;\n  state.input.splice(state.inputPosition, 1);\n  const trailing = state.input.slice(state.inputPosition);\n  print(\n    cli.control.cursor.move.left() + cli.control.cursor.savePosition() + cli.control.line.eraseEnd() + trailing.join(\"\") + cli.control.cursor.restorePosition()\n  );\n};\n\nconst enter = _ => {\n  evaluate(state.input.join(\"\"))\n    .then(result => print(\"\\n\" + result + \"\\n\" + state.prompt));\n  if (JSON.stringify(state.input) != JSON.stringify(state.history[0])) {\n    state.history.unshift(state.input);\n  }\n  state.historyPosition = undefined;\n  state.input = [];\n  state.inputPosition = 0;\n};\n\nconst arrow = key =>\n  key == \"\\x1b[A\"\n    ? historyBackward()\n: key == \"\\x1b[B\"\n    ? historyForward()\n: key == \"\\x1b[C\"\n    ? right()\n: key == \"\\x1b[D\"\n    ? left()\n    : null;\n\nconst right = () => {\n  if (state.inputPosition == state.input.length) {\n    return\n  }\n  state.inputPosition++;\n  print(cli.control.cursor.move.right());\n};\n\nconst left = () => {\n  if (state.inputPosition == 0) {\n    return\n  }\n  state.inputPosition--;\n  print(cli.control.cursor.move.left());\n};\n\nconst historyBackward = () => {\n  if (state.historyPosition == state.history.length-1) {\n    return\n  } else if (state.historyPosition == undefined) {\n    if (state.input.length) {\n      state.history.unshift(state.input);\n      state.historyPosition = 1;\n    } else {\n      state.historyPosition = 0;\n    }\n  } else {\n    state.historyPosition++;\n  }\n  state.input = state.history[state.historyPosition];\n  print(\n    cli.control.line.erase() + cli.control.cursor.move.leftMost() + state.prompt + state.input.join(\"\")\n  );\n};\n\nconst historyForward = () => {\n  if (state.historyPosition == 0 || state.historyPosition == undefined) {\n    return\n  }\n  state.historyPosition--;\n  state.input = state.history[state.historyPosition];\n  print(\n    cli.control.line.erase() + cli.control.cursor.move.leftMost() + state.prompt + state.input.join(\"\")\n  );\n};\n\nprint(`Welcome to the ${cli.colorize(\"bold\", \"F\")}aux ${cli.colorize(\"bold\", \"SH\")}ell!` + \"\\n\\n\" + state.prompt);\n\n}());\n"
  })
);
// Javascript SHell
root.addInode(
  ["bin", "jsh"],
  new Inode({
    file: true,
    executable: true,
    raw: "(function () {\n'use strict';\n\n// Maybe(a) : Just(a) | Nothing\n\n\n\n// String -> a -> Maybe(b)\n\n\n// Result(a) : Ok(a) | Err(String)\nconst Ok = x => ({\n  // Ok(a) ~> (a -> b) -> Ok(b)\n  map: f => Ok(f(x)),\n  // Ok(a) ~> (a -> Result(b)) -> Result(b)\n  chain: f => f(x),\n  // Ok(a) ~> (a -> Result(b)) -> Result(b)\n  chainOk: f => f(x),\n  // Ok(a) ~> (a -> Result(b)) -> Ok(a)\n  chainErr: f => Ok(x),\n  // Ok(a) ~> (a -> e) -> (a -> r) -> r\n  fold: fail => pass => pass(x),\n  // Ok(a) ~> Void -> String\n  toString: () => `Ok(${x})`\n});\nconst Err = x => ({\n  // Err(a) ~> (a -> b) -> Err(a)\n  map: f => Err(x),\n  // Err(a) ~> (a -> Result(b)) -> Err(a)\n  chain: f => Err(x),\n  // Err(a) ~> (a -> Result(b)) -> Err(a)\n  chainOk: f => Err(x),\n  // Err(a) ~> (a -> Result(b)) -> Result(b)\n  chainErr: f => f(x),\n  // Err(a) ~> (a -> e) -> (a -> r) -> e\n  fold: fail => pass => fail(x),\n  // Err(a) ~> Void -> String\n  toString: () => `Err(${x})`\n});\n\n// String -> a -> Result(b)\n\n\n// Similar to Promise\n// prettier-ignore\n\n\nconst match = to => (...cases) => def => {\n  for (let i in cases) {\n    const c = cases[i];\n    for (let i in c[0]) {\n      if (c[0][i] == to) {\n        return c[1](c[0][i]);\n      }\n    }\n  }\n  return def(to);\n};\n\nconst type = value =>\n  Object.prototype.toString.call(value).match(/\\[object (.+)\\]/i)[1];\n\nconst serialize = (value, depth=0, maxDepth=5) =>\n  depth > maxDepth\n  ? \"[...]\"\n: value == null\n  ? \"null\"\n: value == undefined\n  ? \"undefined\"\n: type(value) == \"Object\"\n  ? (() => {\n      const ret = Object.keys(value)\n        .reduce((acc, key) =>\n          Object.assign({}, acc, { [key]: serialize(value[key], depth+1, maxDepth) })\n        , {});\n      return depth == 0\n        ? JSON.stringify(ret, null, 2)\n        : ret\n    })()\n: type(value) == \"Array\"\n  ? (() => {\n    const ret = value.map(x => serialize(x, depth+1, maxDepth));\n    return depth == 0\n      ? JSON.stringify(ret, null, 2)\n      : ret\n  })()\n: value.inspect\n  ? value.inpect()\n: value.toString\n  ? value.toString()\n: value.name\n  ? value.name\n: type(value);\n\nconst runSafe = jsCodeString => {\n  let result;\n  try {\n    result = Ok(self.eval(jsCodeString));\n  }\n  catch(e) {\n    result = Err(e);\n  }\n  return result;\n};\n\nvar evaluate = str =>\n  runSafe(str)\n    .map(serialize)\n    .fold(e => cli.colorize(\"red\",   e))\n         (r => cli.colorize(\"green\", r));\n\nclass ArgParser {\n  constructor(options) {\n    this.options = options || {};\n  }\n\n  parse(argv = process.argv) {}\n}\n\nconst esc = \"\\x1b\";\nconst beep = \"\\x07\";\n\nconst cursor = {\n  move: {\n    to: (x = 1, y = 1) => esc + \"[\" + x + \";\" + y + \"H\",\n    up: (n = 1) => esc + \"[\" + n + \"A\",\n    down: (n = 1) => esc + \"[\" + n + \"B\",\n    right: (n = 1) => esc + \"[\" + n + \"C\",\n    left: (n = 1) => esc + \"[\" + n + \"D\",\n    nextLine: () => esc + \"[E\",\n    prevLine: () => esc + \"[F\",\n    leftMost: () => esc + \"[G\"\n  },\n  hide: () => esc + \"[?25l\",\n  show: () => esc + \"[?25h\",\n  shape: {\n    block: () => esc + \"]50;CursorShape=0\" + beep,\n    bar: () => esc + \"]50;CursorShape=1\" + beep,\n    underscore: () => esc + \"50;CursorShape=2\" + beep\n  },\n  savePosition: () => esc + \"[s\",\n  restorePosition: () => esc + \"[u\"\n};\n\nconst line = {\n  eraseEnd: () => esc + \"[K\",\n  eraseStart: () => esc + \"[1K\",\n  erase: () => esc + \"[2K\"\n};\n\nconst screen = {\n  eraseDown: () => esc + \"[J\",\n  eraseUp: () => esc + \"[1J\",\n  erase: () => esc + \"[2J\",\n  clear: () => esc + \"c\",\n  scrollUp: (n = 1) => esc + \"[\" + n + \"S\",\n  scrollDown: (n = 1) => esc + \"[\" + n + \"T\"\n};\n\nconst misc = {\n  beep: () => beep,\n  setTitle: str => esc + \"]0;\" + str + beep,\n  link: (url, str) => esc + \"[8;;\" + url + beep + (str || url) + esc + \"[8;;\" + beep\n};\n\n\nvar control = Object.freeze({\n\tcursor: cursor,\n\tline: line,\n\tscreen: screen,\n\tmisc: misc\n});\n\nvar ansi = {\n  // Styles\n  reset: [0, 0],\n  bold: [1, 22],\n  dim: [2, 22],\n  italic: [3, 23],\n  underline: [4, 24],\n  inverse: [7, 27],\n  hidden: [8, 28],\n  strikethrough: [9, 29],\n\n  // Foreground base colors\n  black: [30, 39],\n  red: [31, 39],\n  green: [32, 39],\n  yellow: [33, 39],\n  blue: [34, 39],\n  magenta: [35, 39],\n  cyan: [36, 39],\n  white: [37, 39],\n\n  // Foreground bright colors\n  gray: [90, 39],\n  grey: [90, 39],\n  brightRed: [91, 39],\n  brightGreen: [92, 39],\n  brightYellow: [93, 39],\n  brightBlue: [94, 39],\n  brightMagenta: [95, 39],\n  brightCyan: [96, 39],\n  brightWhite: [97, 39],\n\n  // Background base colors\n  bgBlack: [40, 49],\n  bgRed: [41, 49],\n  bgGreen: [42, 49],\n  bgYellow: [43, 49],\n  bgBlue: [44, 49],\n  bgMagenta: [45, 49],\n  bgCyan: [46, 49],\n  bgWhite: [47, 49],\n\n  // Background bright colors\n  bgGray: [100, 49],\n  bgGrey: [100, 49],\n  bgBrightRed: [101, 49],\n  bgBrightGreen: [102, 49],\n  bgBrightYellow: [103, 49],\n  bgBrightBlue: [104, 49],\n  bgBrightMagenta: [105, 49],\n  bgBrightCyan: [106, 49],\n  bgBrightWhite: [107, 49]\n};\n\nfunction wrap(style, str) {\n  const [open, close] = ansi[style];\n  return `\\x1b[${open}m${str}\\x1b[${close}m`;\n}\n\nfunction colorize(styles, str) {\n  if (styles instanceof Array) {\n    for (let i in styles) {\n      str = wrap(styles[i], str);\n    }\n  } else if (typeof styles === \"string\") {\n    str = wrap(styles, str);\n  }\n  return str;\n}\n\n/*\n\nconst styles = [];\n\nObject.keys(ansi).forEach(style => {\n  if (style.match(\"(reset|hidden|grey|bgGrey)\")) {\n    return;\n  }\n\n  styles.push(colorize(style, style));\n});\n\nconsole.log(styles.join(\" \"));\n\n\"\u001b\\u001b[1mbold\\u001b[22m \\u001b[2mdim\\u001b[22m \\u001b[3mitalic\\u001b[23m \\u001b[4munderline\\u001b[24m \\u001b[7minverse\\u001b[27m \\u001b[9mstrikethrough\\u001b[29m \\u001b[30mblack\\u001b[39m \\u001b[31mred\\u001b[39m \\u001b[32mgreen\\u001b[39m \\u001b[33myellow\\u001b[39m \\u001b[34mblue\\u001b[39m \\u001b[35mmagenta\\u001b[39m \\u001b[36mcyan\\u001b[39m \\u001b[37mwhite\\u001b[39m \\u001b[90mgray\\u001b[39m \\u001b[91mredBright\\u001b[39m \\u001b[92mgreenBright\\u001b[39m \\u001b[93myellowBright\\u001b[39m \\u001b[94mblueBright\\u001b[39m \\u001b[95mmagentaBright\\u001b[39m \\u001b[96mcyanBright\\u001b[39m \\u001b[97mwhiteBright\\u001b[39m \\u001b[40mbgBlack\\u001b[49m \\u001b[41mbgRed\\u001b[49m \\u001b[42mbgGreen\\u001b[49m \\u001b[43mbgYellow\\u001b[49m \\u001b[44mbgBlue\\u001b[49m \\u001b[45mbgMagenta\\u001b[49m \\u001b[46mbgCyan\\u001b[49m \\u001b[47mbgWhite\\u001b[49m \\u001b[100mbgGray\\u001b[49m \\u001b[101mbgRedBright\\u001b[49m \\u001b[102mbgGreenBright\\u001b[49m \\u001b[103mbgYellowBright\\u001b[49m \\u001b[104mbgBlueBright\\u001b[49m \\u001b[105mbgMagentaBright\\u001b[49m \\u001b[106mbgCyanBright\\u001b[49m \\u001b[107mbgWhiteBright\\u001b[49m\"\n\n*/\n\nconst info = colorize(\"blue\", \"ℹ\");\nconst success = colorize(\"green\", \"✔\");\nconst warning = colorize(\"yellow\", \"⚠\");\nconst error = colorize(\"red\", \"✖\");\nconst star = colorize(\"brightYellow\", \"★\");\nconst radioOn = colorize(\"green\", \"◉\");\nconst radioOff = colorize(\"red\", \"◯\");\nconst checkboxOn = colorize(\"green\", \"☒\");\nconst checkboxOff = colorize(\"red\", \"☐\");\nconst arrowUp = \"↑\";\nconst arrowDown = \"↓\";\nconst arrowLeft = \"←\";\nconst arrowRight = \"→\";\nconst line$1 = \"─\";\nconst play = \"▶\";\nconst pointer = \"❯\";\nconst pointerSmall = \"›\";\nconst square = \"▇\";\nconst squareSmall = \"◼\";\nconst bullet = \"●\";\n\n\nvar symbols = Object.freeze({\n\tinfo: info,\n\tsuccess: success,\n\twarning: warning,\n\terror: error,\n\tstar: star,\n\tradioOn: radioOn,\n\tradioOff: radioOff,\n\tcheckboxOn: checkboxOn,\n\tcheckboxOff: checkboxOff,\n\tarrowUp: arrowUp,\n\tarrowDown: arrowDown,\n\tarrowLeft: arrowLeft,\n\tarrowRight: arrowRight,\n\tline: line$1,\n\tplay: play,\n\tpointer: pointer,\n\tpointerSmall: pointerSmall,\n\tsquare: square,\n\tsquareSmall: squareSmall,\n\tbullet: bullet\n});\n\nconst line$2 = {\n  fps: 8,\n  frames: [\"-\", \"\\\\\", \"|\", \"/\"]\n};\n\nconst dots = {\n  fps: 12.5,\n  frames: [\"⠋\", \"⠙\", \"⠹\", \"⠸\", \"⠼\", \"⠴\", \"⠦\", \"⠧\", \"⠇\", \"⠏\"]\n};\n\nconst scrolling = {\n  fps: 5,\n  frames: [\".  \", \".. \", \"...\", \" ..\", \"  .\", \"   \"]\n};\n\nconst scrolling2 = {\n  fps: 2.5,\n  frames: [\".  \", \".. \", \"...\", \"   \"]\n};\n\nconst star$1 = {\n  fps: 14,\n  frames: [\"✶\", \"✸\", \"✹\", \"✺\", \"✹\", \"✷\"]\n};\n\nconst ball = {\n  fps: 8,\n  frames: [\"⠁\", \"⠂\", \"⠄\", \"⠂\"]\n};\n\nconst triangle = {\n  fps: 15,\n  frames: [\"◢\", \"◣\", \"◤\", \"◥\"]\n};\n\nconst circle = {\n  fps: 15,\n  frames: [\"◐\", \"◓\", \"◑\", \"◒\"]\n};\n\nconst bounce = {\n  fps: 12.5,\n  frames: [\n    \"( ●    )\",\n    \"(  ●   )\",\n    \"(   ●  )\",\n    \"(    ● )\",\n    \"(     ●)\",\n    \"(    ● )\",\n    \"(   ●  )\",\n    \"(  ●   )\",\n    \"( ●    )\",\n    \"(●     )\"\n  ]\n};\n\nconst clock = {\n  fps: 10,\n  frames: [\n    \"🕐 \",\n    \"🕑 \",\n    \"🕒 \",\n    \"🕓 \",\n    \"🕔 \",\n    \"🕕 \",\n    \"🕖 \",\n    \"🕗 \",\n    \"🕘 \",\n    \"🕙 \",\n    \"🕚 \"\n  ]\n};\n\nconst pong = {\n  fps: 12.5,\n  frames: [\n    \"▐⠂       ▌\",\n    \"▐⠈       ▌\",\n    \"▐ ⠂      ▌\",\n    \"▐ ⠠      ▌\",\n    \"▐  ⡀     ▌\",\n    \"▐  ⠠     ▌\",\n    \"▐   ⠂    ▌\",\n    \"▐   ⠈    ▌\",\n    \"▐    ⠂   ▌\",\n    \"▐    ⠠   ▌\",\n    \"▐     ⡀  ▌\",\n    \"▐     ⠠  ▌\",\n    \"▐      ⠂ ▌\",\n    \"▐      ⠈ ▌\",\n    \"▐       ⠂▌\",\n    \"▐       ⠠▌\",\n    \"▐       ⡀▌\",\n    \"▐      ⠠ ▌\",\n    \"▐      ⠂ ▌\",\n    \"▐     ⠈  ▌\",\n    \"▐     ⠂  ▌\",\n    \"▐    ⠠   ▌\",\n    \"▐    ⡀   ▌\",\n    \"▐   ⠠    ▌\",\n    \"▐   ⠂    ▌\",\n    \"▐  ⠈     ▌\",\n    \"▐  ⠂     ▌\",\n    \"▐ ⠠      ▌\",\n    \"▐ ⡀      ▌\",\n    \"▐⠠       ▌\"\n  ]\n};\n\n\nvar spinners = Object.freeze({\n\tline: line$2,\n\tdots: dots,\n\tscrolling: scrolling,\n\tscrolling2: scrolling2,\n\tstar: star$1,\n\tball: ball,\n\ttriangle: triangle,\n\tcircle: circle,\n\tbounce: bounce,\n\tclock: clock,\n\tpong: pong\n});\n\nclass Spinner {\n  constructor(name = \"circle\") {\n    const spinner = spinners[name];\n    this.frames = spinner.frames;\n    this.index = 0;\n    this.interval = Math.round(1000 / spinner.fps);\n    this.setIntervalIndex = null;\n  }\n\n  next() {\n    this.index++;\n    const realIndex = (this.index - 1) % this.frames.length;\n    return this.frames[realIndex];\n  }\n\n  start(outputFunction) {\n    outputFunction = outputFunction || (str => process.stdout.write(str));\n    this.setIntervalIndex = setInterval(() => {\n      let frame = this.next();\n      let clearFrame = frame.replace(/./g, \"\\b\");\n      outputFunction(clearFrame);\n      outputFunction(frame);\n    }, this.interval);\n  }\n\n  stop() {\n    clearInterval(this.setIntervalIndex);\n  }\n}\n\nvar cli$1 = {\n  ArgParser,\n  control,\n  colorize,\n  symbols,\n  Spinner\n};\n\nconst state = {\n  prompt: cli$1.colorize(\"gray\", \"jsh> \"),\n  input: [],\n  inputPosition: 0,\n  history: [],\n  historyPosition: undefined\n};\n\naddEventListener(\"consoleInput\", ({ detail }) => handle(detail.key));\n\nconst handle = key =>\n  match (key) (\n    // Backspace\n    [[\"\\x7f\", \"\\b\"],\n      remove],\n    [[\"\\r\"],\n      enter],\n    // Arrow keys\n    [[\"\\x1b[A\", \"\\x1b[B\", \"\\x1b[C\", \"\\x1b[D\"],\n      arrow]\n  ) (insert);\n\nconst insert = key => {\n  state.input.splice(state.inputPosition, 0, key);\n  state.inputPosition++;\n  const trailing = state.input.slice(state.inputPosition);\n  print(\n    key + cli$1.control.cursor.savePosition() + trailing.join(\"\") + cli$1.control.cursor.restorePosition()\n  );\n};\n\nconst remove = _ => {\n  if (state.inputPosition == 0) {\n    return\n  }\n  state.inputPosition--;\n  state.input.splice(state.inputPosition, 1);\n  const trailing = state.input.slice(state.inputPosition);\n  print(\n    cli$1.control.cursor.move.left() + cli$1.control.cursor.savePosition() + cli$1.control.line.eraseEnd() + trailing.join(\"\") + cli$1.control.cursor.restorePosition()\n  );\n};\n\nconst enter = _ => {\n  const result = evaluate(state.input.join(\"\"));\n  if (JSON.stringify(state.input) != JSON.stringify(state.history[0])) {\n    state.history.unshift(state.input);\n  }\n  state.historyPosition = undefined;\n  state.input = [];\n  state.inputPosition = 0;\n  print(\"\\n\" + result + \"\\n\" + state.prompt);\n};\n\nconst arrow = key =>\n  key == \"\\x1b[A\"\n    ? historyBackward()\n: key == \"\\x1b[B\"\n    ? historyForward()\n: key == \"\\x1b[C\"\n    ? right()\n: key == \"\\x1b[D\"\n    ? left()\n    : null;\n\nconst right = () => {\n  if (state.inputPosition == state.input.length) {\n    return\n  }\n  state.inputPosition++;\n  print(cli$1.control.cursor.move.right());\n};\n\nconst left = () => {\n  if (state.inputPosition == 0) {\n    return\n  }\n  state.inputPosition--;\n  print(cli$1.control.cursor.move.left());\n};\n\nconst historyBackward = () => {\n  if (state.historyPosition == state.history.length-1) {\n    return\n  } else if (state.historyPosition == undefined) {\n    if (state.input.length) {\n      state.history.unshift(state.input);\n      state.historyPosition = 1;\n    } else {\n      state.historyPosition = 0;\n    }\n  } else {\n    state.historyPosition++;\n  }\n  state.input = state.history[state.historyPosition];\n  print(\n    cli$1.control.line.erase() + cli$1.control.cursor.move.leftMost() + state.prompt + state.input.join(\"\")\n  );\n};\n\nconst historyForward = () => {\n  if (state.historyPosition == 0 || state.historyPosition == undefined) {\n    return\n  }\n  state.historyPosition--;\n  state.input = state.history[state.historyPosition];\n  print(\n    cli$1.control.line.erase() + cli$1.control.cursor.move.leftMost() + state.prompt + state.input.join(\"\")\n  );\n};\n\nprint(`Welcome to Faux's ${cli$1.colorize(\"bold\", \"J\")}avascript ${cli$1.colorize(\"bold\", \"SH\")}ell!` + \"\\n\\n\" + state.prompt);\n\n}());\n"
  })
);
// ls
root.addInode(
  ["bin", "ls"],
  new Inode({
    file: true,
    executable: true,
    raw: "var ls = (function () {\n'use strict';\n\nconst ls$1 = ([name, ...args]) =>\n  sys\n    .open(args[0] || \"./\")\n    .then(fd => sys.readDirectory(fd))\n    .then(contents => contents.join(\" \"))\n    .then(println)\n    .catch(err => println(cli.colorize(\"red\", err.toString())));\n\nls$1(argv).then(() => sys.exit());\n\nreturn ls$1;\n\n}());\n"
  })
);

// Virtual Filesystem
const fs = new VFS(root);

// Mount file systems
fs.mount(new DOMFS(), "/dev/dom");
fs.mount(devices, "/dev");

// Example output: ["Browser", "xx.xx.xx"]
function browserInfo() {
  const ua = navigator.userAgent;
  const matches =
    ua.match(
      /(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d.]+)/i
    ) || [];
  if (/trident/i.test(matches[1])) {
    const tem = ua.match(/\brv[ :]+([\d.]+)/g) || "";
    return ["IE", tem[1]];
  }
  if (matches[1] === "Chrome") {
    const tem = ua.match(/\b(OPR|Edge)\/([\d.]+)/);
    if (tem) {
      return ["Opera", tem[1]];
    }
  }
  if (matches[2]) {
    return {
      name: matches[1],
      version: matches[2]
    };
  } else {
    return {
      name: navigator.appName,
      version: navigator.appVersion
    };
  }
}

var browser = browserInfo();

var index = {
  fs,
  sys,
  proc: processTable,
  utils,
  console: console$2,
  browser,
  history,
  version: "0.0.4"
};

return index;

})));
