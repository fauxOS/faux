(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('faux', factory) :
	(global.faux = factory());
}(this, (function () { 'use strict';

/*
 * Path name manipulations
 * p = new Pathname("/some///./../some/strange/././path")
 * p.clean() => "/some/strange/path"
 */
class Pathname {
  constructor(input) {
    this.input = input;
  }

  // clean up a crazy path
  // e.g. "/some///./../some/strange/././path" => "/some/strange/path"
  get clean() {
    let clean = [];
    // Split the path by "/", match() because it doesn't add empty strings
    const pathArray = this.input.match(/[^/]+/g);
    // Iterate each name in the path
    for (let i in pathArray) {
      const name = pathArray[i];
      // If it's the current directory, don't do anything
      if (name === ".") {
      } else if (name === "..") {
        // If it's the previous directory, remove the last added entry
        clean.pop();
      } else {
        // Anything else, we add to the array plainly
        clean.push(name);
      }
    }
    // Array to path
    return "/" + clean.join("/");
  }

  // Chop a path into an array of names
  // "/paths/are/like/arrays" => ["paths", "are", "like", "arrays"]
  get chop() {
    const segments = this.clean.match(/[^/]+/g);
    if (segments === null) {
      return ["/"];
    } else {
      return segments;
    }
  }

  // Just the name of the file/directory the path leads to
  get name() {
    return this.chop[this.chop.length - 1];
  }

  // Basename from the normal name
  // "filename.txt" => "filename"
  get basename() {
    const name = this.name;
    if (name === "") {
      return name;
    } else {
      const base = name.match(/^[^\.]+/);
      if (base !== null) {
        return base[0];
      } else {
        return "";
      }
    }
  }

  // Parent name, get the directory holding this
  // "/directories/hold/files/like-this-one" => "/directories/hold/files"
  get parent() {
    if (this.name === "/") {
      return null;
    } else {
      // Get the length of the path without the name in it
      const parentLen = this.clean.length - this.name.length;
      // Slice the name out of the path
      return this.clean.slice(0, parentLen);
    }
  }

  // Extentions array from the name
  // "archive.tar.gz" => [".tar", ".gz"]
  get extentions() {
    return this.name.match(/\.[^\.]+/g);
  }

  // get the segments of a path like this : ["/", "/path", "/path/example"]
  get segment() {
    const pathArray = this.chop;
    let segments = [];
    // If its a root path, skip segments
    if (this.name === "/") {
      segments = ["/"];
    } else {
      // Else, any other path
      for (let i = 0; i <= pathArray.length; i++) {
        let matchPath = pathArray.slice(0, i);
        segments.push("/" + matchPath.join("/"));
      }
    }
    return segments;
  }
}

class OFS_Inode {
  constructor(config = {}) {
    this.links = 0;
    this.exec = false;
    Object.assign(this, config);
  }
}

class OFS {
  constructor() {
    this.drive = arguments[0] || [
      new OFS_Inode({
        links: 1,
        id: 0,
        type: "d",
        files: {
          ".": 0,
          "..": 0
        }
      })
    ];
  }

  // Resolve path to an inode, don't follow symbolic links
  resolveHard(path) {
    let inode = 0;
    const trace = [inode];
    if (path === "/" || path === "") {
      return this.drive[inode];
    }
    const pathArray = new Pathname(path).chop;
    for (let i = 0; i < pathArray.length; i++) {
      const name = pathArray[i];
      const inodeObj = this.drive[inode];
      if (inodeObj.files === undefined) {
        // Could not resolve path to inodes completely
        return -1;
      }
      inode = inodeObj.files[name];
      if (inode === undefined) {
        // Could not find end inode, failed at segment name
        return -1;
      }
      trace.push(inode);
    }
    return this.drive[trace.pop()];
  }

  // Resolve and return the inode, follow symbolic links
  resolve(path, redirectCount = 0) {
    // Don't follow if we get to 50 symbolic link redirects
    if (redirectCount >= 50) {
      // Max symbolic link redirect count reached (50)
      return -1;
    }
    const inode = this.resolveHard(path);
    if (inode < 0) {
      // Error on hard resolve
      return -1;
    }
    if (inode.type === "sl") {
      redirectCount++;
      return this.resolve(inode.redirect, redirectCount);
    }
    return inode;
  }

  // Add a new inode to the disk
  // Defaults to just adding an inode, but if you pass a parent directory inode in,
  // it will add `name` as an entry in `parentInode`
  addInode(type, name = null, parentInode = null) {
    // Reject if name contains a "/"
    if (name.match("/")) {
      return -1;
    }
    const id = this.drive.length;
    this.drive[id] = new OFS_Inode({
      links: 1,
      type: type,
      id: id
    });
    // Check parent if inode and directory
    if (parentInode instanceof OFS_Inode && parentInode.type === "d") {
      parentInode.files[name] = id;
    }
    return this.drive[id];
  }

  // Add a new file to the disk
  touch(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const inode = this.addInode("f", pathname.name, parentInode);
    if (inode < 0) {
      return -1;
    }
    inode.data = "";
    return inode;
  }

  // Add a new directory Inode to the disk
  mkDir(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    const inode = this.addInode("d", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    inode.files = {
      ".": inode.id,
      "..": parentInode.id
    };
    return inode;
  }

  // Make a hard link for an inode
  mkLink(inode, path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    // Same as in addInode, not very DRY I know...
    if (name.match("/")) {
      return -1;
    }
    parentInode.files[name] = inode.id;
    return inode;
  }

  // Make a symbolic link inode
  mkSymLink(refPath, linkPath) {
    const pathname = new Pathname(linkPath);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    const inode = this.addInode("sl", name, parentInode);
    if (inode < 0) {
      return -1;
    }
    const path = new Pathname(refPath).clean;
    inode.redirect = path;
    return inode;
  }

  // Remove by unlinking
  rm(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    if (parentInode < 0) {
      return -1;
    }
    return delete parentInode.files[name];
  }
}

class DOMFS {
  constructor(selectorBase = "") {
    this.base = selectorBase;
  }

  resolve(path) {
    const pathname = new Pathname(path);
    // If we are at the DOM root, i.e. /dev/dom/
    if (pathname.chop[0] === "/") {
      return document.querySelector("*");
    } else {
      let selector = " " + pathname.chop.join(" > ");
      // For child selection by index
      // element.children[0] becomes /dev/dom/element/1
      selector = selector.replace(/ (\d)/g, " :nth-child($1)");
      return document.querySelector(selector);
    }
  }

  touch(path) {
    const pathname = new Pathname(path);
    const parent = this.resolve(pathname.parent);
    if (!parent) {
      return -1;
    }
    // When creating an element, you are only allowed to use the element name
    // e.g. touch("/dev/dom/body/#container/span")
    // You cannot touch a class, index, or id
    const el = document.createElement(pathname.name);
    return parent.appendChild(el);
  }
}

class VNode {
  constructor(container) {
    this.container = container;
    this.type = this.findType();
    this.exec = this.isExecutable();
  }

  findType() {
    if (this.container instanceof OFS_Inode) {
      return "inode";
    } else if (this.container instanceof HTMLElement) {
      return "element";
    } else {
      return "unknown";
    }
  }

  isExecutable() {
    if (this.type === "inode") {
      return this.container.exec;
    } else {
      return false;
    }
  }

  get data() {
    if (this.type === "inode") {
      const data = this.container.data;
      // Directory or other
      if (data === undefined) {
        return -2;
      }
      return data;
    } else if (this.type === "element") {
      return this.container.innerHTML;
    } else {
      return -1;
    }
  }

  set data(data) {
    if (this.type === "inode") {
      this.container.data = data;
      return data;
    } else if (this.type === "element") {
      this.container.innerHTML = data;
      return data;
    } else {
      return -1;
    }
  }

  get files() {
    if (this.type === "inode") {
      if (this.container.type === "d") {
        return Object.keys(this.container.files);
      } else {
        return null;
      }
    } else if (this.type === "element") {
      if (this.container.hasChildNodes()) {
        const children = this.container.children;
        const elements = [];
        for (let i = 0; i < children.length; i++) {
          let el = children[i].localName;
          let id = children[i].id;
          let classes = children[i].className.split(" ").join(".");
          elements.push(el + id + classes);
          // Child by index
          elements.push(i + 1);
        }
        return elements;
      } else {
        return null;
      }
    } else {
      return -1;
    }
  }
}

class VFS {
  constructor() {
    this.mounts = {
      "/": arguments[0] || new OFS()
    };
  }

  // Mount a filesystem
  mount(fs, mountPoint) {
    this.mounts[mountPoint] = fs;
    return mountPoint;
  }

  // Unmount a filesystem by mount point
  unmount(mountPoint) {
    return delete this.mounts[mountPoint];
  }

  // Resolve the path to the mounted filesystem
  // This is the first step to trace a path, before any data containers (inodes etc) are involved
  mountPoint(path) {
    const pathname = new Pathname(path);
    const segments = pathname.segment;
    // All the mount points
    const mounts = Object.keys(this.mounts);
    // Array of resolved mounted disks
    const resolves = [];
    for (let i = 0; i < mounts.length; i++) {
      let mount = new Pathname(mounts[i]).clean;
      for (let i2 in segments) {
        if (segments[i2] === mount) {
          resolves.push(mount);
        }
      }
    }
    // The most relevent mount point will be the last one resolved
    return resolves.pop();
  }

  // Resolve a path to the fs provided data container
  resolve(path) {
    const pathname = new Pathname(path);
    const cleanName = pathname.clean;
    const mountPoint = this.mountPoint(cleanName);
    const fs = this.mounts[mountPoint];
    // This strips off the mountpoint path from the given path,
    // so that we can resolve relative to the filesystem's root.
    // Example: given path is "/dev/dom/head/title"
    // We find that the mountpoint is "/dev/dom".
    // "/dev/dom/head/title" - "/dev/dom" = "/head/title"
    // Pass "/head/title" to the local filesystem for it to resolve
    const fsLocalPath = cleanName.substring(mountPoint.length);
    const container = fs.resolve(fsLocalPath);
    if (container < 0) {
      return -1;
    }
    return new VNode(container);
  }

  touch(path) {
    const pathname = new Pathname(path);
    const mountPoint = this.mountPoint(path);
    const fs = this.mounts[mountPoint];
    const fsLocalPath = pathname.clean.substring(mountPoint.length);
    const touched = fs.touch(fsLocalPath);
    if (touched < 0) {
      return -1;
    }
    return touched;
  }
}

const fs = new VFS(
  new OFS([
    new OFS_Inode({
      links: 1,
      id: 0,
      type: "d",
      files: {
        ".": 0,
        "..": 0,
        bin: 1,
        dev: 2,
        etc: 3,
        home: 4,
        lib: 5,
        log: 6,
        mnt: 7,
        tmp: 8,
        usr: 9
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 1,
      files: {
        ".": 1,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 2,
      files: {
        ".": 2,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 3,
      files: {
        ".": 3,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 4,
      files: {
        ".": 4,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 5,
      files: {
        ".": 5,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 6,
      files: {
        ".": 6,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 7,
      files: {
        ".": 7,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 8,
      files: {
        ".": 8,
        "..": 0
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "d",
      id: 9,
      files: {
        ".": 9,
        "..": 0
      }
    })
  ])
);

// Mount /lib
fs.mount(
  new OFS([
    new OFS_Inode({
      links: 1,
      id: 0,
      type: "d",
      files: {
        ".": 0,
        "..": 0,
        lib: 1
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "f",
      exec: true,
      id: 1,
      /* lib */ data: "class Pathname{constructor(input){this.input=input}get clean(){let clean=[];const pathArray=this.input.match(/[^/]+/g);for(let i in pathArray){const name=pathArray[i];\".\"===name||(\"..\"===name?clean.pop():clean.push(name))}return\"/\"+clean.join(\"/\")}get chop(){const segments=this.clean.match(/[^/]+/g);return null===segments?[\"/\"]:segments}get name(){return this.chop[this.chop.length-1]}get basename(){const name=this.name;if(\"\"===name)return name;const base=name.match(/^[^\\.]+/);return null===base?\"\":base[0]}get parent(){if(\"/\"===this.name)return null;const parentLen=this.clean.length-this.name.length;return this.clean.slice(0,parentLen)}get extentions(){return this.name.match(/\\.[^\\.]+/g)}get segment(){const pathArray=this.chop;let segments=[];if(\"/\"===this.name)segments=[\"/\"];else for(let matchPath,i=0;i<=pathArray.length;i++)matchPath=pathArray.slice(0,i),segments.push(\"/\"+matchPath.join(\"/\"));return segments}}const fs={readFile:function(path=\"/\"){return open(path,\"r\").then(fd=>{return read(fd)})},writeFile:function(path=\"/\",data=\"\"){return open(path,\"w\").then(fd=>{return write(fd,data)})}},ansi={reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],inverse:[7,27],hidden:[8,28],strikethrough:[9,29],black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],gray:[90,39],grey:[90,39],redBright:[91,39],greenBright:[92,39],yellowBright:[93,39],blueBright:[94,39],magentaBright:[95,39],cyanBright:[96,39],whiteBright:[97,39],bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgGray:[100,49],bgGrey:[100,49],bgRedBright:[101,49],bgGreenBright:[102,49],bgYellowBright:[103,49],bgBlueBright:[104,49],bgMagentaBright:[105,49],bgCyanBright:[106,49],bgWhiteBright:[107,49]};function wrap(style,str){return\"\\x1B[\"+ansi[style][0]+\"m\"+str+\"\\x1B[\"+ansi[style][1]+\"m\"}function dye(styles,str){if(styles instanceof Array)for(let i in styles)str=wrap(styles[i],str);else\"string\"==typeof styles&&(str=wrap(styles,str));return str}var symbols={info:dye(\"blue\",\"\\u2139\"),success:dye(\"green\",\"\\u2714\"),warning:dye(\"yellow\",\"\\u26A0\"),error:dye(\"red\",\"\\u2716\")},cli={dye,symbols};self.Pathname=Pathname,self.fs=fs,self.cli=cli;"/* end */
    })
  ]),
  "/lib"
);

// Mount /bin
fs.mount(
  new OFS([
    new OFS_Inode({
      links: 1,
      id: 0,
      type: "d",
      files: {
        ".": 0,
        "..": 0,
        fsh: 1
      }
    }),

    new OFS_Inode({
      links: 1,
      type: "f",
      exec: true,
      id: 1,
      /* fsh */ data: "function tokenizeLine(line=\"\"){const tokens=line.match(/([\"'])(?:\\\\|.)+\\1|((?:[^\\\\\\s]|\\\\.)*)/g).filter(String);for(let token,i=0;i<tokens.length;i++)token=tokens[i],tokens[i]=token.replace(/\\\\(?=.)/g,\"\"),token.match(/^[\"'].+(\\1)$/m)&&(tokens[i]=/^([\"'])(.+)(\\1)$/gm.exec(token)[2]);return tokens}function lex(input=\"\"){const allTokens=[],lines=input.match(/(\\\\;|[^;])+/g);for(let tokens,i=0;i<lines.length;i++)tokens=tokenizeLine(lines[i]),allTokens.push(tokens);return allTokens}function parseCommand(tokens){const command={type:\"simple\",argv:tokens,argc:tokens.length,name:tokens[0]};return command}function parse(input=\"\"){const AST={type:\"script\",commands:[]},commands=lex(input);for(let parsed,i=0;i<commands.length;i++)parsed=parseCommand(commands[i]),AST.commands[i]=parsed;return AST}parse(\"echo hello, world\");"/* end */
    })
  ]),
  "/bin"
);

fs.mount(new DOMFS(), "/dev/dom");

function getMode(modeStr = "r") {
  // prettier-ignore
  //             read,    write,  truncate,   create,   append
  const map = {
    "r":        [true,    false,  false,      false,    false],
    "r+":       [true,    true,   false,      false,    false],
    "w":        [false,   true,   true,       true,     false],
    "w+":       [true,    true,   true,       true,     false],
    "a":        [false,   true,   false,      true,     true],
    "a+":       [true,    true,   false,      true,     true]
  };
  return map[modeStr];
}

class FileDescriptor {
  constructor(path, mode) {
    this.mode = getMode(mode);
    this.path = new Pathname(path).clean;
    this.vnode = fs.resolve(this.path);
    // Create if non-existent?
    if (!this.vnode.container) {
      if (!this.mode[3]) {
        throw new Error("Path Unresolved");
      } else {
        fs.touch(this.path);
        this.vnode = fs.resolve(this.path);
        // Probably an error creating the file
        if (this.vnode < 0) {
          throw new Error("Error on file creation or resolve");
        }
      }
    }
    // If truncate in mode
    if (this.mode[2]) {
      this.truncate();
    }
    this.type = this.vnode.type;
  }

  truncate() {
    this.vnode.data = "";
  }

  // Return read data
  read() {
    // Read mode set?
    if (!this.mode[0]) {
      return -1;
    }
    return this.vnode.data;
  }

  // Write data out
  write(data) {
    return (this.vnode.data = data);
  }

  // View "directory" contents or return null
  readdir() {
    return this.vnode.files;
  }
}

const sys = {};

// Raise an error
sys.fail = function(process, msgID, args) {
  const error = {
    status: "error",
    reason: args[0],
    id: msgID
  };
  process.worker.postMessage(error);
};

// Throw a success result
sys.pass = function(process, msgID, args) {
  const result = {
    status: "success",
    result: args[0],
    id: msgID
  };
  process.worker.postMessage(result);
};

// Send a dynamic library straight to the process
sys.load = function(process, msgID, args) {
  const data = process.load(args[0]);
  sys.pass(process, msgID, [data]);
};

// Spawn a new process from an executable image
sys.spawn = function(process, msgID, args) {
  if (!args[1] instanceof Array) {
    sys.fail(process, msgID, ["Second argument should be the array argv"]);
    return -1;
  }
  const newProcess = new Process(args[0], args[1]);
  const pid = proc.add(newProcess);
  sys.pass(process, msgID, [pid]);
};

// Check file access
sys.access = function(process, msgID, args) {
  if (typeof args[0] !== "string") {
    sys.fail(process, msgID, ["Argument should be a string"]);
    return -1;
  }
  let path = "";
  // If the first character is a "/", then working dir does not matter
  if (args[0][0] === "/") {
    path = args[0];
  } else {
    path = process.cwd + "/" + args[0];
  }
  const result = process.access(path);
  sys.pass(process, msgID, [result]);
};

// Resolve a path into a file descriptor, and add it to the table
sys.open = function(process, msgID, args) {
  if (typeof args[0] !== "string" && typeof args[1] !== "string") {
    sys.fail(process, msgID, ["Arguments 1 and 2 should be a strings"]);
    return -1;
  }
  let path = "";
  // If the first character is a "/", then working dir does not matter
  if (args[0][0] === "/") {
    path = args[0];
  } else {
    path = process.cwd + "/" + args[0];
  }
  const result = process.open(path, args[1]);
  sys.pass(process, msgID, [result]);
};

// Read data from a file descriptor
sys.read = function(process, msgID, args) {
  if (args.length !== 1) {
    sys.fail(process, msgID, ["Should have only 1 argument"]);
    return -1;
  }
  if (args[0] < 0) {
    sys.fail(process, msgID, [
      "File Descriptor should be postive, check file name"
    ]);
    return -1;
  }
  const result = process.fds[args[0]].read();
  sys.pass(process, msgID, [result]);
};

// Write data to a file descriptor
sys.write = function(process, msgID, args) {
  if (args.length !== 2) {
    sys.fail(process, msgID, ["Should have 2 arguments"]);
    return -1;
  }
  if (args[0] < 0) {
    sys.fail(process, msgID, [
      "File Descriptor should be postive, check file name"
    ]);
    return -1;
  }
  const result = process.fds[args[0]].write(args[1]);
  sys.pass(process, msgID, [result]);
};

// Tell what directory we are in
sys.pwd = function(process, msgID, args) {
  sys.pass(process, msgID, [process.cwd]);
};

// Change the current working directory
sys.chdir = function(process, msgID, args) {
  if (!args[0] instanceof String) {
    sys.fail(process, msgID, ["Argument should be a string"]);
    return -1;
  }
  process.cwd = args[0];
  sys.pass(process, msgID, [process.cwd]);
};

// Get environment variable
sys.getenv = function(process, msgID, args) {
  if (!args[0] instanceof String) {
    sys.fail(process, msgID, ["Variable name should be a string"]);
    return -1;
  }
  const value = process.env[args[0]];
  sys.pass(process, msgID, [value]);
};

// Set environment variable
sys.setenv = function(process, msgID, args) {
  if (!args[0] instanceof String) {
    sys.fail(process, msgID, ["Variable name should be a string"]);
    return -1;
  }
  if (!args[1] instanceof String) {
    sys.fail(process, msgID, ["Variable value should be a string"]);
    return -1;
  }
  const value = (process.env[args[0]] = args[1]);
  sys.pass(process, msgID, [value]);
};

const utils = {};

utils.genUUID = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(
    char
  ) {
    let r = (Math.random() * 16) | 0,
      v = char === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

utils.mkWorker = function(scriptStr) {
  const blob = new Blob([scriptStr], { type: "application/javascript" });
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
};

utils.openLocalFile = function(readAs = "readAsText") {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return new Promise(function(resolve, reject) {
    input.onchange = function() {
      const file = input.files[0];
      const reader = new FileReader();
      reader[readAs](file);
      reader.onloadend = function() {
        resolve(reader.result);
      };
    };
  });
};

utils.http = function(uri, method = "GET") {
  return new Promise((resolve, reject) => {
    if (!uri instanceof String) {
      reject("URI invalid");
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, uri, true);
    xhr.onload = function() {
      if (xhr.status < 300 && xhr.status >= 200) {
        resolve(xhr.response);
      } else {
        reject(xhr.status + " " + xhr.statusText);
      }
    };
    xhr.onerror = function(err) {
      reject(err);
    };
    xhr.send();
  });
};

const flags = {};

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
    return [matches[1], matches[2]];
  } else {
    return [navigator.appName, navigator.appVersion];
  }
}

const info = browserInfo();

flags.browser = info[0];
flags.version = info[1];

class Process {
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
    // We auto-load the /lib/lib dynamic library
    const lib = this.load("/lib/lib");
    // The worker is where the process is actually executed
    this.worker = utils.mkWorker(
      /* syscalls */ "function newID(length=8){const chars=\"0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz\";let id=\"\";for(let i=0;i<length;i++){const randNum=Math.floor(Math.random()*chars.length);id+=chars.substring(randNum,randNum+1)}return id}function call(name,args){const id=newID();return postMessage({type:\"syscall\",name:name,args:args,id:id}),new Promise(function(resolve,reject){self.addEventListener(\"message\",msg=>{msg.data.id===id&&(\"success\"===msg.data.status?resolve(msg.data.result):reject(msg.data.reason))})})}async function load(path){const data=await call(\"load\",[path]);if(-2===data)return new Error(\"No data returned, possibly a directory\");return 0>data?new Error(\"Could not get data\"):self.eval(data)}function spawn(image,argv=[]){return call(\"spawn\",[image,argv])}function exec(path,argv){return call(\"exec\",[path,argv])}function access(path){return call(\"access\",[path])}async function open(path,mode=\"r\"){const fd=await call(\"open\",[path,mode]);return 0>fd?new Error(\"Could not open file\"):fd}async function read(fd){const data=await call(\"read\",[fd]);if(-2===data)return new Error(\"No data returned, possibly a directory\");return 0>data?new Error(\"Could not get data\"):data}async function write(fd,data){const ret=await call(\"write\",[fd,data]);return 0>ret?new Error(\"Could not write data\"):data}function pwd(){return call(\"pwd\",[])}function chdir(path){return call(\"chdir\",[path])}function getenv(varName){return call(\"getenv\",[varName])}function setenv(varName){return call(\"setenv\",[varName])}" /* end */ + lib + "\n\n" + image
    );
    // This event listener intercepts worker messages and then
    // passes to the message handler, which decides what next
    this.worker.addEventListener("message", msg => {
      this.messageHandler(msg);
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

class ProcessTable {
  constructor(init) {
    if (init === undefined) {
      throw new Error("Init process must be defined");
    }
    this.list = [null, init];
    this.nextPID = 2;
  }

  add(process) {
    this.nextPID = this.list.push(process);
    return this.nextPID - 1;
  }
}

var proc = new ProcessTable(new Process());

var index = {
  fs,
  sys,
  proc,
  flags,
  utils,
  name: "faux",
  version: "0.0.3"
};

return index;

})));
