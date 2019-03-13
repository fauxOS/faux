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
    const lib = "(function(){\"use strict\";function call(name,args=[]){const id=newID(5);return postMessage({type:\"syscall\",name,args,id}),new Promise((resolve,reject)=>{function listener(message){const msg=message.data;msg.id!==id||(removeEventListener(\"message\",listener),\"success\"===msg.status?resolve(msg.result):reject(msg.reason))}addEventListener(\"message\",listener)})}async function stat(path){return call(\"stat\",[path])}function assertString(str){if(\"string\"!=typeof str)throw new Error(\"Some argument is not a string\")}function normalize(path){if(!path)return\".\";let isAbsolute=!1;0===path.indexOf(\"/\")&&(isAbsolute=!0);const significant=(path.match(/[^/]+/g)||[]).filter(name=>\".\"!==name).reduce((pathArray,name)=>\"..\"===name&&pathArray.length&&\"..\"!==pathArray[pathArray.length-1]?pathArray.slice(0,-1):[...pathArray,name],[]);return isAbsolute?\"/\"+significant.join(\"/\"):significant.join(\"/\")}function parse(path=\"\"){assertString(path);const[,root,parent,base,extention]=normalize(path).match(splitPathRe);return{absolute:!!root,parent,base,extention,name:base.slice(0,base.length-extention.length)}}async function readFile$1(path,mode=\"r\"){const fd=await sys.open(path,mode),data=sys.readFile(fd);return sys.close(fd),data}async function writeFile$1(path,data=\"\",mode=\"w\"){const fd=await sys.open(path,mode);return sys.writeFile(fd,data),void sys.close(fd)}async function loadFile(path){const pathStat=await stat(path);if(pathStat.file)return self.eval((await readFile$1(path)));const pathJsStat=await stat(path+\".js\");if(pathJsStat.file)return self.eval((await readFile$1(path+\".js\")));const pathJsonStat=await stat(path+\".json\");if(pathJsonStat.file)return JSON.parse((await readFile$1(path+\".json\")));throw new Error(\"not found\")}function wrap(style,str){const[open,close]=ansi[style];return`\\x1b[${open}m${str}\\x1b[${close}m`}function colorize(styles,str){if(styles instanceof Array)for(let i in styles)str=wrap(styles[i],str);else\"string\"==typeof styles&&(str=wrap(styles,str));return str}var _Mathround=Math.round;const newID=length=>[...Array(length).keys()].map(()=>_Mathround(Math.random()*65536)).map(n=>String.fromCharCode(n)).join(\"\");var sys$1=Object.freeze({spawn:async function(image=\"\",argv=[]){return call(\"spawn\",[image,argv])},exec:async function(path,argv=[]){return call(\"exec\",[path,argv])},exit:async function(){return call(\"exit\",[])},exists:async function(path){return call(\"exists\",[path])},stat:stat,open:async function(path,mode=\"r\"){return call(\"open\",[path,mode])},close:async function(fd){return call(\"close\",[fd])},dup:async function(fd){return call(\"dup\",[fd])},dup2:async function(fd1,fd2){return call(\"dup2\",[fd1,fd2])},readFile:async function(fd){return call(\"readFile\",[fd])},readDirectory:async function(fd){return call(\"readDirectory\",[fd])},writeFile:async function(fd,data=\"\"){return call(\"writeFile\",[fd,data])},createDirectory:async function(path){return call(\"createDirectory\",[path])},remove:async function(path){return call(\"remove\",[path])},currentDirectory:async function(){return call(\"currentDirectory\",[])},changeDirectory:async function(path=\"/home\"){return call(\"changeDirectory\",[path])},getenv:async function(key){return call(\"getenv\",[key])},setenv:async function(key,value=\"\"){return call(\"setenv\",[key,value])}}),browser=function(){const ua=navigator.userAgent,matches=ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\\/))\\/?\\s*([\\d.]+)/i)||[];if(/trident/i.test(matches[1])){const tem=ua.match(/\\brv[ :]+([\\d.]+)/g)||\"\";return[\"IE\",tem[1]]}if(\"Chrome\"===matches[1]){const tem=ua.match(/\\b(OPR|Edge)\\/([\\d.]+)/);if(tem)return[\"Opera\",tem[1]]}return matches[2]?{name:matches[1],version:matches[2]}:{name:navigator.appName,version:navigator.appVersion}}();const Just=x=>({map:f=>Just(f(x)),chain:f=>f(x),fold:()=>pass=>pass(x),toString:()=>`Just(${x})`}),Nothing={map:()=>Nothing,chain:()=>Nothing,fold:fail=>()=>fail(),toString:()=>`Nothing`},Ok=x=>({map:f=>Ok(f(x)),chain:f=>f(x),chainOk:f=>f(x),chainErr:()=>Ok(x),fold:()=>pass=>pass(x),toString:()=>`Ok(${x})`}),Err=x=>({map:()=>Err(x),chain:()=>Err(x),chainOk:()=>Err(x),chainErr:f=>f(x),fold:fail=>()=>fail(x),toString:()=>`Err(${x})`}),Task=run=>({run,map:f=>Task(err=>res=>run(err)(x=>res(f(x)))),runMap:f=>Task(err=>res=>run(err)(x=>f(x).run(err)(res))),log:()=>run(console.error)(console.log)});var fp=Object.freeze({Just:Just,Nothing:Nothing,propM:name=>obj=>name in obj?Just(obj[name]):Nothing,Ok:Ok,Err:Err,propR:name=>obj=>name in obj?Ok(obj[name]):Err(`${name} not in ${JSON.stringify(obj)}`),Task:Task});const splitPathRe=/^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;var path=Object.freeze({normalize:normalize,parse:parse,parentname:function(path=\"\"){const parsed=parse(path);return parsed.absolute?\"/\"+parsed.parent:parsed.parent},basename:function(path=\"\",extension=\"\"){const basename=parse(path).base,indexOf=basename.indexOf(extension);return indexOf&&indexOf+extension.length===basename.length?basename.slice(0,indexOf):basename},chop:path=>normalize(path).match(/[^/]+/g)||[]});var fs=Object.freeze({readFile:readFile$1,writeFile:writeFile$1,appendFile:async function(path,data=\"\",mode=\"a\"){const fd=await sys.open(path,mode);return sys.write(fd,data),void sys.close(fd)}}),stdin=Object.freeze({read:async function(){return readFile$1(\"/dev/console\")}}),stdout=Object.freeze({write:async function(str){return writeFile$1(\"/dev/console\",str,\"r+\")}});var process$1={stdin,stdout,stderr:{}};const esc=\"\\x1B\",beep=\"\\x07\";var control=Object.freeze({cursor:{move:{to:(x=1,y=1)=>esc+\"[\"+x+\";\"+y+\"H\",up:(n=1)=>esc+\"[\"+n+\"A\",down:(n=1)=>esc+\"[\"+n+\"B\",right:(n=1)=>esc+\"[\"+n+\"C\",left:(n=1)=>esc+\"[\"+n+\"D\",nextLine:()=>esc+\"[E\",prevLine:()=>esc+\"[F\",leftMost:()=>esc+\"[G\"},hide:()=>esc+\"[?25l\",show:()=>esc+\"[?25h\",shape:{block:()=>esc+\"]50;CursorShape=0\"+beep,bar:()=>esc+\"]50;CursorShape=1\"+beep,underscore:()=>esc+\"50;CursorShape=2\"+beep},savePosition:()=>esc+\"[s\",restorePosition:()=>esc+\"[u\"},line:{eraseEnd:()=>esc+\"[K\",eraseStart:()=>esc+\"[1K\",erase:()=>esc+\"[2K\"},screen:{eraseDown:()=>esc+\"[J\",eraseUp:()=>esc+\"[1J\",erase:()=>esc+\"[2J\",clear:()=>esc+\"c\",scrollUp:(n=1)=>esc+\"[\"+n+\"S\",scrollDown:(n=1)=>esc+\"[\"+n+\"T\"},misc:{beep:()=>beep,setTitle:str=>esc+\"]0;\"+str+beep}}),ansi={reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],inverse:[7,27],hidden:[8,28],strikethrough:[9,29],black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],gray:[90,39],grey:[90,39],brightRed:[91,39],brightGreen:[92,39],brightYellow:[93,39],brightBlue:[94,39],brightMagenta:[95,39],brightCyan:[96,39],brightWhite:[97,39],bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgGray:[100,49],bgGrey:[100,49],bgBrightRed:[101,49],bgBrightGreen:[102,49],bgBrightYellow:[103,49],bgBrightBlue:[104,49],bgBrightMagenta:[105,49],bgBrightCyan:[106,49],bgBrightWhite:[107,49]};const info=colorize(\"blue\",\"\\u2139\"),success=colorize(\"green\",\"\\u2714\"),warning=colorize(\"yellow\",\"\\u26A0\"),error=colorize(\"red\",\"\\u2716\"),star=colorize(\"brightYellow\",\"\\u2605\"),radioOn=colorize(\"green\",\"\\u25C9\"),radioOff=colorize(\"red\",\"\\u25EF\"),checkboxOn=colorize(\"green\",\"\\u2612\"),checkboxOff=colorize(\"red\",\"\\u2610\");var symbols=Object.freeze({info:info,success:success,warning:warning,error:error,star:star,radioOn:radioOn,radioOff:radioOff,checkboxOn:checkboxOn,checkboxOff:checkboxOff,arrowUp:\"\\u2191\",arrowDown:\"\\u2193\",arrowLeft:\"\\u2190\",arrowRight:\"\\u2192\",line:\"\\u2500\",play:\"\\u25B6\",pointer:\"\\u276F\",pointerSmall:\"\\u203A\",square:\"\\u2587\",squareSmall:\"\\u25FC\",bullet:\"\\u25CF\"});var spinners=Object.freeze({line:{fps:8,frames:[\"-\",\"\\\\\",\"|\",\"/\"]},dots:{fps:12.5,frames:[\"\\u280B\",\"\\u2819\",\"\\u2839\",\"\\u2838\",\"\\u283C\",\"\\u2834\",\"\\u2826\",\"\\u2827\",\"\\u2807\",\"\\u280F\"]},scrolling:{fps:5,frames:[\".  \",\".. \",\"...\",\" ..\",\"  .\",\"   \"]},scrolling2:{fps:2.5,frames:[\".  \",\".. \",\"...\",\"   \"]},star:{fps:14,frames:[\"\\u2736\",\"\\u2738\",\"\\u2739\",\"\\u273A\",\"\\u2739\",\"\\u2737\"]},ball:{fps:8,frames:[\"\\u2801\",\"\\u2802\",\"\\u2804\",\"\\u2802\"]},triangle:{fps:15,frames:[\"\\u25E2\",\"\\u25E3\",\"\\u25E4\",\"\\u25E5\"]},circle:{fps:15,frames:[\"\\u25D0\",\"\\u25D3\",\"\\u25D1\",\"\\u25D2\"]},bounce:{fps:12.5,frames:[\"( \\u25CF    )\",\"(  \\u25CF   )\",\"(   \\u25CF  )\",\"(    \\u25CF )\",\"(     \\u25CF)\",\"(    \\u25CF )\",\"(   \\u25CF  )\",\"(  \\u25CF   )\",\"( \\u25CF    )\",\"(\\u25CF     )\"]},clock:{fps:10,frames:[\"\\uD83D\\uDD50 \",\"\\uD83D\\uDD51 \",\"\\uD83D\\uDD52 \",\"\\uD83D\\uDD53 \",\"\\uD83D\\uDD54 \",\"\\uD83D\\uDD55 \",\"\\uD83D\\uDD56 \",\"\\uD83D\\uDD57 \",\"\\uD83D\\uDD58 \",\"\\uD83D\\uDD59 \",\"\\uD83D\\uDD5A \"]},pong:{fps:12.5,frames:[\"\\u2590\\u2802       \\u258C\",\"\\u2590\\u2808       \\u258C\",\"\\u2590 \\u2802      \\u258C\",\"\\u2590 \\u2820      \\u258C\",\"\\u2590  \\u2840     \\u258C\",\"\\u2590  \\u2820     \\u258C\",\"\\u2590   \\u2802    \\u258C\",\"\\u2590   \\u2808    \\u258C\",\"\\u2590    \\u2802   \\u258C\",\"\\u2590    \\u2820   \\u258C\",\"\\u2590     \\u2840  \\u258C\",\"\\u2590     \\u2820  \\u258C\",\"\\u2590      \\u2802 \\u258C\",\"\\u2590      \\u2808 \\u258C\",\"\\u2590       \\u2802\\u258C\",\"\\u2590       \\u2820\\u258C\",\"\\u2590       \\u2840\\u258C\",\"\\u2590      \\u2820 \\u258C\",\"\\u2590      \\u2802 \\u258C\",\"\\u2590     \\u2808  \\u258C\",\"\\u2590     \\u2802  \\u258C\",\"\\u2590    \\u2820   \\u258C\",\"\\u2590    \\u2840   \\u258C\",\"\\u2590   \\u2820    \\u258C\",\"\\u2590   \\u2802    \\u258C\",\"\\u2590  \\u2808     \\u258C\",\"\\u2590  \\u2802     \\u258C\",\"\\u2590 \\u2820      \\u258C\",\"\\u2590 \\u2840      \\u258C\",\"\\u2590\\u2820       \\u258C\"]}});Object.assign(self,{sys:sys$1,browser,fp,path,http:(uri,method=\"GET\")=>Task(err=>res=>{const xhr=new XMLHttpRequest;xhr.open(method,uri,!0),xhr.onload=()=>300>xhr.status&&200<=xhr.status?res(xhr.response):err(xhr.status+\" \"+xhr.statusText),xhr.onerror=err,xhr.send()}),fs,process:process$1,require:requirePath=>loadFile(requirePath).catch(()=>loadFile(requirePath+\"/index\")),cli:{ArgParser:class{constructor(options){this.options=options||{}}parse(argv=process.argv){}},control,colorize,symbols,Spinner:class{constructor(name=\"circle\"){const spinner=spinners[name];this.frames=spinner.frames,this.index=0,this.interval=_Mathround(1e3/spinner.fps),this.setIntervalIndex=null}next(){this.index++;const realIndex=(this.index-1)%this.frames.length;return this.frames[realIndex]}start(outputFunction){outputFunction=outputFunction||(str=>process.stdout.write(str)),this.setIntervalIndex=setInterval(()=>{let frame=this.next(),clearFrame=frame.replace(/./g,\"\\b\");outputFunction(clearFrame),outputFunction(frame)},this.interval)}stop(){clearInterval(this.setIntervalIndex)}}}}),self.print=(...args)=>process$1.stdout.write(args.join(\" \")),self.println=(...args)=>process$1.stdout.write(args.join(\" \")+\"\\n\"),\"undefined\"==typeof CustomEvent&&(self.CustomEvent=class extends Event{constructor(name,obj){super(name),Object.assign(this,obj)}}),addEventListener(\"message\",message=>{const{type:type$1,name,detail}=message.data;if(\"event\"===type$1&&name){const event=new CustomEvent(name,{detail});dispatchEvent(event)}})})();";
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

const init = new Process("(function(){\"use strict\";sys.exec(\"/bin/jsh\")})();");
var processTable = new ProcessTable(init);

class Node {
  constructor(data) {
    this.data = data;
    this.prev = null;
    this.next = null;
  }
}

class DoublyLinkedList {
  constructor() {
    this.first = null;
    this.last = null;
    this.length = 0;
  }

  // Add to the front
  unshift(data) {
    if (!this.first) {
      // First to add
      this.first = new Node(data);
      this.last = this.first;
    } else {
      const newFirst = new Node(data);
      newFirst.next = this.first;
      this.first.prev = newFirst;
      this.first = newFirst;
    }
    this.length++;
    return data;
  }

  // Add to the end
  push(data) {
    if (!this.last) {
      // First to add
      this.last = new Node(data);
      this.first = this.last;
    } else {
      const newLast = new Node(data);
      newLast.prev = this.last;
      this.last.next = newLast;
      this.last = newLast;
    }
    this.length++;
    return data;
  }

  // Add at index
  add(i, data) {
    if (i < 0 || i > this.length) {
      return null;
    }
    switch (i) {
      // First node
      case 0:
        return this.unshift(data);
        break;

      // Last node
      case this.length:
        return this.push(data);
        break;

      // Middle node
      default:
        const current = this.nodeAt(i);

        const beforeNodeToAdd = current.prev;
        const nodeToAdd = new Node(data);
        const afterNodeToAdd = current;

        nodeToAdd.next = afterNodeToAdd;
        nodeToAdd.prev = beforeNodeToAdd;

        beforeNodeToAdd.next = nodeToAdd;
        afterNodeToAdd.prev = nodeToAdd;

        this.length++;
        return data;
    }
  }

  // Remove first
  shift() {
    const oldFirst = this.first;
    if (this.first) {
      if (this.last === this.first) {
        this.first = null;
        this.last = null;
      } else {
        this.first = this.first.next;
        this.first.prev = null;
      }
    }
    this.length--;
    return oldFirst.data;
  }

  // Remove last
  pop() {
    const oldLast = this.last;
    if (this.last) {
      if (this.last === this.first) {
        this.first = null;
        this.last = null;
      } else {
        this.last = this.last.prev;
        this.last.next = null;
      }
    }
    this.length--;
    return oldLast.data;
  }

  // Remove at index
  remove(i) {
    if (this.length === 0 || i < 0 || i > this.length - 1) {
      return null;
    }
    switch (i) {
      // First node
      case 0:
        return this.shift();
        break;

      // Last node
      case this.length - 1:
        return this.pop();
        break;

      // Middle node
      default:
        const current = this.nodeAt(i);

        const beforeNodeToDelete = current.prev;
        const nodeToDelete = current;
        const afterNodeToDelete = current.next;

        beforeNodeToDelete.next = afterNodeToDelete;
        afterNodeToDelete.prev = beforeNodeToDelete;

        this.length--;
        return nodeToDelete.data;
    }
  }

  nodeAt(i) {
    // Starting position based on length and index.
    // We choose what ever is closest to the node at `i`
    if (this.length / 2 - (i + 1) < 0) {
      let current = this.last;
      // Go down until we reach the node
      for (let count = 0; count < this.length - i - 1; count++) {
        current = current.prev;
      }
      return current;
    } else {
      let current = this.first;
      // Go up until we reach the node
      for (let count = 0; count < i; count++) {
        current = current.next;
      }
      return current;
    }
  }

  each(func) {
    let current = this.first;
    while (current) {
      func(current.data);
      current = current.next;
    }
  }

  toString() {
    const array = [];
    this.each(val => array.push(val));
    return array.join("");
  }
}

class LineEditor {
  constructor(write, emit) {
    // Write function to write raw data to the terminal
    this.write = write || async function() {};
    // Emit function to emit input events
    this.emit = emit || function() {};
    // The current line's raw buffer is stored here.
    // This buffer allows line edition before the user
    // sends input to the program.
    this.buffer = new DoublyLinkedList();
    // History of buffers typed before
    this.history = [];
    this.historyIndex = 0;
    // Index of the cursor within the buffer
    this.cursorIndex = 0;
    // Input that hasn't been read yet, but is out of the buffer
    this.readable = "";
  }

  // Return and clear the readable buffer
  read() {
    const str = this.readable;
    this.readable = "";
    return str;
  }

  // If the character is special, handle it.
  // If it is normal, just push it to the lineBuffer
  handle(key) {
    switch (key) {
      // Handle the DELETE sequence `^?` and ascii backspace.
      case "\x7f":
      case "\b":
        this.backSpace();
        break;
      case "\r":
        this.enter();
        break;
      // Arrow keys
      case "\x1b[A":
      case "\x1b[B":
      case "\x1b[C":
      case "\x1b[D":
        this.arrow(key);
        break;
      default:
        // Just push every other character to the buffer
        this.buffer.add(this.cursorIndex, key);
        this.update(this.buffer.length - 1, this.cursorIndex + 1);
    }
  }

  saveBuffer() {
    // Add a copy of this buffer to the history
    const bufferCopy = Object.assign(new DoublyLinkedList(), this.buffer);
    this.history[this.historyIndex] = bufferCopy;
  }

  cursorToStart() {
    // Make a string of backspaces for each character from the start to current position
    const backspaces = new Array(this.cursorIndex + 1).join("\b");
    // Print the backspaces so the cursor goes to the start
    this.write(backspaces);
    this.cursorIndex = 0;
  }

  // Make the terminal display reflect the current state
  update(oldBufferLength, newCursorIndex) {
    this.cursorToStart();
    // Make a string of spaces for each character from the current position to last visible character
    const spaces = new Array(oldBufferLength + 1).join(" ");
    // Print the spaces so the cursor goes to the end
    this.write(spaces);
    // Print backspaces to get the cursor to the current cursorIndex
    this.write(spaces.replace(/ /g, "\b"));
    this.write(this.buffer.toString());
    // Get the cursor to the new position
    const backspaces = new Array(this.buffer.length - newCursorIndex + 1).join(
      "\b"
    );
    this.write(backspaces);
    this.cursorIndex = newCursorIndex;
  }

  // Discard last written character
  backSpace() {
    // We can only delete characters in the buffer
    if (this.cursorIndex > 0) {
      this.buffer.remove(this.cursorIndex - 1);
      this.update(this.buffer.length + 1, this.cursorIndex - 1);
    } else {
      return;
    }
  }

  // Save the last line and start a new one
  enter(shiftKey) {
    // Stringify and push the buffer for reading
    this.readable += this.buffer.toString() + "\n";
    this.emit("consoleInput", { buffered: true });
    this.saveBuffer();
    // Reset the buffer
    this.buffer = new DoublyLinkedList();

    // Write out a line feed
    this.write("\n");
    this.historyIndex++;
    this.cursorIndex = 0;
  }

  // Handle direction changes
  arrow(key) {
    const detail = {};
    switch (key) {
      case "\x1b[A": // Up
        detail.arrowUp = true;
        if (!(this.historyIndex === 0)) {
          const oldBufferLength = this.buffer.length;
          this.saveBuffer();
          this.historyIndex--;
          this.buffer = this.history[this.historyIndex];
          this.update(oldBufferLength, this.buffer.length);
        }
        break;
      case "\x1b[B": // Down
        detail.arrowDown = true;
        if (!(this.historyIndex === this.history.length - 1)) {
          const oldBufferLength = this.buffer.length;
          this.saveBuffer();
          this.historyIndex++;
          this.buffer = this.history[this.historyIndex];
          this.update(oldBufferLength, this.buffer.length);
        }
        break;
      case "\x1b[C": // Right
        detail.arrowRight = true;
        if (!(this.cursorIndex === this.buffer.length)) {
          this.cursorIndex++;
          this.write(key);
        }
        break;
      case "\x1b[D": // Left
        detail.arrowLeft = true;
        if (!(this.cursorIndex === 0)) {
          this.cursorIndex--;
          this.write(key);
        }
        break;
      default:
        return;
    }
    // Even with buffered input, programs can listen for arrow keys
    this.emit("consoleInput", detail);
  }
}

class Console {
  constructor(config = {}) {
    // This line buffer is used so that the user can edit
    // typing mistakes before the input is read by a program
    this.lineEditor = new LineEditor(
      // Bind the functions before passing them to the line editor.
      this.write.bind(this),
      processTable.emit.bind(processTable)
    );
    this.config = {
      // Whether this should be active at all.
      // If buffer is set false, line editing will be skipped
      buffer: true
    };
    Object.assign(this.config, config);
  }

  read() {
    return this.lineEditor.read();
  }

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
    // Pass the key to the line buffer
    if (this.config.buffer) {
      this.lineEditor.handle(key);
    } else {
      // Just emit a raw input event to userspace
      processTable.emit("consoleInput", { raw: true });
    }
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

  // Read file contents
  // Void -> Result(String)
  readFile() {
    return Ok(this.raw.read());
  }

  // Overwrite file contents
  // String -> Result(String)
  writeFile(contents) {
    return Ok(this.raw.write(contents));
  }

  // Append file contents
  // String -> Result(String)
  appendFile(contents) {
    return this.writeFile(contents);
  }

  // Truncate file contents
  // Void -> Result(String)
  truncateFile() {
    return Ok("");
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
    raw: "(function(){\"use strict\";function tokenizeLine(line=\"\"){const tokens=line.match(/([\"'])(?:\\\\|.)+\\1|((?:[^\\\\\\s]|\\\\.)*)/g).filter(String);for(let token,i=0;i<tokens.length;i++)token=tokens[i],tokens[i]=token.replace(/\\\\(?=.)/g,\"\"),token.match(/^[\"'].+(\\1)$/m)&&(tokens[i]=/^([\"'])(.+)(\\1)$/gm.exec(token)[2]);return tokens}function lex(input=\"\"){const allTokens=[],lines=input.match(/(\\\\;|[^;])+/g);for(let tokens,i=0;i<lines.length;i++)tokens=tokenizeLine(lines[i]),allTokens.push(tokens);return allTokens}function parseCommand(tokens){return{type:\"simple\",argv:tokens,name:tokens[0]}}function parse(input=\"\"){const AST={type:\"script\",commands:[]},commands=lex(input);for(let i in commands){const parsed=parseCommand(commands[i]);AST.commands[i]=parsed}return AST}async function which(name){const toCheck=await sys.getenv(\"PATH\").then(PATH=>PATH.split(\":\").map(path=>path+\"/\"+name));for(let i in toCheck){const path=toCheck[i];try{const{file,executable}=await sys.stat(path);if(file&&executable)return path}catch(e){}}}var prompt=(str,color=\"gray\")=>sys.currentDirectory().then(cwd=>cli.colorize(color,str||`faux:${cwd} # `)).then(print),evaluate=str=>parse(str).commands.map(command=>which(command.name).then(execPath=>sys.exec(execPath,command.argv)).then(()=>prompt()).catch(console.warn));addEventListener(\"consoleInput\",({detail})=>detail.buffered?process.stdin.read().then(evaluate):null),prompt()})();"
  })
);
// Javascript SHell
root.addInode(
  ["bin", "jsh"],
  new Inode({
    file: true,
    executable: true,
    raw: "(function(){\"use strict\";async function prompt(str=\"jsh> \",color=\"gray\"){const prompt=cli.colorize(color,str);return await print(prompt)}function serializeFunction(value,currentDepth=0){switch(currentDepth){case 0:return value+\"\";break;case 1:return value.name?`[Function: ${value.name}]`:\"[Function]\";break;case 2:default:return\"[Function]\";}}function serialize(value,depthLimit=5,currentDepth=0){if(currentDepth>=depthLimit)return\"[...]\";let ret;switch(type(value)){case\"Object\":ret={},Object.keys(value).forEach(key=>{ret[key]=serialize(value[key],depthLimit,currentDepth+1)});break;case\"Array\":for(let i in ret=[],value)ret[i]=serialize(value[i],depthLimit,currentDepth+1);break;case\"Function\":return serializeFunction(value,currentDepth);break;case\"Symbol\":return value.toString();break;default:return value.toString();}return 0===currentDepth?JSON.stringify(ret,null,2):ret}async function evaluate(str){let formatted=\"\";try{const result=self.eval(str),serialized=serialize((await result));formatted=`${cli.colorize(\"green\",serialized)}`,result instanceof Promise&&(formatted=`${cli.colorize(\"gray\",\"(Promise) ->\")} ${cli.colorize(\"green\",serialized)}`)}catch(err){formatted=cli.colorize(\"red\",err)}return await println(formatted),await prompt()}const type=value=>Object.prototype.toString.call(value).match(/\\[object (.+)\\]/i)[1];addEventListener(\"consoleInput\",({detail})=>detail.buffered?process.stdin.read().then(evaluate):null),println(`Welcome to Faux's ${cli.colorize(\"bold\",\"J\")}avascript ${cli.colorize(\"bold\",\"SH\")}ell!\\n`).then(()=>prompt())})();"
  })
);
// ls
root.addInode(
  ["bin", "ls"],
  new Inode({
    file: true,
    executable: true,
    raw: "var ls=function(){\"use strict\";const ls$1=([name,...args])=>sys.open(args[0]||\"./\").then(fd=>sys.readDirectory(fd)).then(contents=>contents.join(\" \")).then(println).catch(err=>println(cli.colorize(\"red\",err.toString())));return ls$1(argv).then(()=>sys.exit()),ls$1}();"
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
