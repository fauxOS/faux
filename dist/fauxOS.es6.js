(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.faux = factory());
}(this, (function () { 'use strict';

class OFS_Inode {
  constructor(config = {}) {
    this.links = 0;
    this.perms = [true, true, false];
    Object.assign(this, config);
  }
}

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
    if (path === "") {
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
  mkFile(path) {
    const pathname = new Pathname(path);
    const parentInode = this.resolve(pathname.parent);
    const name = pathname.name;
    const inode = this.addInode("f", name, parentInode);
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
    this.resolveHard = this.resolve;
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
}

class VNode {
  constructor(container) {
    this.container = container;
    this.type = this.findType();
    this.perms = this.findPerms();
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

  findPerms() {
    if (this.type === "inode") {
      return this.container.perms;
    } else {
      return [true, true, false];
    }
  }

  get data() {
    // Check read permission
    if (!this.perms[0]) {
      return -1;
    }
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
    // Check write permission
    if (!this.perms[1]) {
      return -1;
    }
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
    // Check read permission
    if (!this.perms[0]) {
      return -1;
    }
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
      for (let i in segments) {
        if (segments[i] === mount) {
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
    const fsLocalPath = cleanName.substring(mountPoint.length);
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
      perms: [true, true, true],
      id: 1,
      /* lib */ data: "/*\r\n * Path name manipulations\r\n * p = new Pathname(\"/some///./../some/strange/././path\")\r\n * p.clean() => \"/some/strange/path\"\r\n */\r\nclass Pathname {\r\n  constructor(input) {\r\n    this.input = input;\r\n  }\r\n\r\n  // clean up a crazy path\r\n  // e.g. \"/some///./../some/strange/././path\" => \"/some/strange/path\"\r\n  get clean() {\r\n    let clean = [];\r\n    // Split the path by \"/\", match() because it doesn't add empty strings\r\n    const pathArray = this.input.match(/[^/]+/g);\r\n    // Iterate each name in the path\r\n    for (let i in pathArray) {\r\n      const name = pathArray[i];\r\n      // If it's the current directory, don't do anything\r\n      if (name === \".\") {\r\n      } else if (name === \"..\") {\r\n        // If it's the previous directory, remove the last added entry\r\n        clean.pop();\r\n      } else {\r\n        // Anything else, we add to the array plainly\r\n        clean.push(name);\r\n      }\r\n    }\r\n    // Array to path\r\n    return \"/\" + clean.join(\"/\");\r\n  }\r\n\r\n  // Chop a path into an array of names\r\n  // \"/paths/are/like/arrays\" => [\"paths\", \"are\", \"like\", \"arrays\"]\r\n  get chop() {\r\n    const segments = this.clean.match(/[^/]+/g);\r\n    if (segments === null) {\r\n      return [\"/\"];\r\n    } else {\r\n      return segments;\r\n    }\r\n  }\r\n\r\n  // Just the name of the file/directory the path leads to\r\n  get name() {\r\n    return this.chop[this.chop.length - 1];\r\n  }\r\n\r\n  // Basename from the normal name\r\n  // \"filename.txt\" => \"filename\"\r\n  get basename() {\r\n    const name = this.name;\r\n    if (name === \"\") {\r\n      return name;\r\n    } else {\r\n      const base = name.match(/^[^\\.]+/);\r\n      if (base !== null) {\r\n        return base[0];\r\n      } else {\r\n        return \"\";\r\n      }\r\n    }\r\n  }\r\n\r\n  // Parent name, get the directory holding this\r\n  // \"/directories/hold/files/like-this-one\" => \"/directories/hold/files\"\r\n  get parent() {\r\n    if (this.name === \"/\") {\r\n      return null;\r\n    } else {\r\n      // Get the length of the path without the name in it\r\n      const parentLen = this.clean.length - this.name.length;\r\n      // Slice the name out of the path\r\n      return this.clean.slice(0, parentLen);\r\n    }\r\n  }\r\n\r\n  // Extentions array from the name\r\n  // \"archive.tar.gz\" => [\".tar\", \".gz\"]\r\n  get extentions() {\r\n    return this.name.match(/\\.[^\\.]+/g);\r\n  }\r\n\r\n  // get the segments of a path like this : [\"/\", \"/path\", \"/path/example\"]\r\n  get segment() {\r\n    const pathArray = this.chop;\r\n    let segments = [];\r\n    // If its a root path, skip segments\r\n    if (this.name === \"/\") {\r\n      segments = [\"/\"];\r\n    } else {\r\n      // Else, any other path\r\n      for (let i = 0; i <= pathArray.length; i++) {\r\n        let matchPath = pathArray.slice(0, i);\r\n        segments.push(\"/\" + matchPath.join(\"/\"));\r\n      }\r\n    }\r\n    return segments;\r\n  }\r\n}\n\nconst fs = {};\n\nfs.readFile = function(path = \"/\") {\n  return open(path, \"r\").then(fd => {\n    return read(fd);\n  });\n};\n\nfs.writeFile = function(path = \"/\", data = \"\") {\n  return open(path, \"w\").then(fd => {\n    return write(fd, data);\n  });\n};\n\nself.Pathname = Pathname;\nself.fs = fs;\n"/* end */
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
      perms: [true, false, true],
      id: 1,
      /* fsh */ data: "function tokenizeLine(){for(var line=arguments.length>0&&void 0!==arguments[0]?arguments[0]:\"\",tokens=line.match(/([\"'])(?:\\\\|.)+\\1|((?:[^\\\\\\s]|\\\\.)*)/g).filter(String),i=0;i<tokens.length;i++){var token=tokens[i];tokens[i]=token.replace(/\\\\(?=.)/g,\"\"),token.match(/^[\"'].+(\\1)$/m)&&(tokens[i]=/^([\"'])(.+)(\\1)$/gm.exec(token)[2])}return tokens}function lex(){for(var input=arguments.length>0&&void 0!==arguments[0]?arguments[0]:\"\",allTokens=[],lines=input.match(/(\\\\;|[^;])+/g),i=0;i<lines.length;i++){var tokens=tokenizeLine(lines[i]);allTokens.push(tokens)}return allTokens}function parseCommand(tokens){var command={type:\"simple\"};return command.argv=tokens,command.argc=tokens.length,command.name=tokens[0],command}function parse(){for(var input=arguments.length>0&&void 0!==arguments[0]?arguments[0]:\"\",AST={type:\"script\",commands:[]},commands=lex(input),i=0;i<commands.length;i++){var parsed=parseCommand(commands[i]);AST.commands[i]=parsed}return AST}parse(\"echo hello, world\");"/* end */
    })
  ]),
  "/bin"
);

fs.mount(new DOMFS(), "/dev/dom");

function getMode(modeStr = "r") {
  // prettier-ignore
  //    read, write, truncate, create, append
  const map = {
    "r": [true, false, false, false, false],
    "r+": [true, true, false, false, false],
    "w": [false, true, true, true, false],
    "w+": [true, true, true, true, false],
    "a": [false, true, false, true, true],
    "a+": [true, true, false, true, true]
  };
  return map[modeStr];
}

class FileDescriptor {
  constructor(path, mode) {
    this.mode = getMode(mode);
    this.path = new Pathname(path).clean;
    this.vnode = fs.resolve(this.path);
    // Create if non-existent?
    if (this.vnode < 0) {
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

const utils = {};

utils.genUUID = function() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function(char) {
      let r = Math.random() * 16 | 0, v = char === "x" ? r : r & 0x3 | 0x8;
      return v.toString(16);
    }
  );
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
  const matches = ua.match(
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
      /* syscalls */ "\"use strict\";function newID(){for(var length=arguments.length>0&&void 0!==arguments[0]?arguments[0]:8,chars=\"0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz\",id=\"\",i=0;i<length;i++){var randNum=Math.floor(Math.random()*chars.length);id+=chars.substring(randNum,randNum+1)}return id}function call(name,args){var id=newID();return postMessage({type:\"syscall\",name:name,args:args,id:id}),new Promise(function(resolve,reject){self.addEventListener(\"message\",function(msg){msg.data.id===id&&(\"success\"===msg.data.status?resolve(msg.data.result):reject(msg.data.reason))})})}function load(path){var data=call(\"load\",[path]);return data.then(eval)}function spawn(image){return call(\"spawn\",[image,arguments.length>1&&void 0!==arguments[1]?arguments[1]:[]])}function exec(path,argv){return call(\"exec\",[path,argv])}function access(path){return call(\"access\",[path])}function open(path){return call(\"open\",[path,arguments.length>1&&void 0!==arguments[1]?arguments[1]:\"r\"])}function read(fd){return call(\"read\",[fd])}function write(fd,data){return call(\"write\",[fd,data])}function pwd(){return call(\"pwd\",[])}function chdir(path){return call(\"chdir\",[path])}function getenv(varName){return call(\"getenv\",[varName])}function setenv(varName){return call(\"setenv\",[varName])}" /* end */ + lib + "\n\n" + image
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

var main = {
  fs: fs,
  sys: sys,
  proc: proc,
  name: "faux",
  flags: flags,
  utils: utils,
  version: "0.0.1"
};

return main;

})));
