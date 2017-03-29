var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (global, factory) {
  (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.faux = factory();
})(this, function () {
  'use strict';

  var OFS_Inode = function OFS_Inode() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, OFS_Inode);

    this.links = 0;
    this.perms = [true, true, false];
    Object.assign(this, config);
  };

  /*
   * Path name manipulations
   * p = new Pathname("/some///./../some/strange/././path")
   * p.clean() => "/some/strange/path"
   */


  var Pathname = function () {
    function Pathname(input) {
      _classCallCheck(this, Pathname);

      this.input = input;
    }

    // clean up a crazy path
    // e.g. "/some///./../some/strange/././path" => "/some/strange/path"


    _createClass(Pathname, [{
      key: 'clean',
      get: function get() {
        var clean = [];
        // Split the path by "/", match() because it doesn't add empty strings
        var pathArray = this.input.match(/[^/]+/g);
        // Iterate each name in the path
        for (var i in pathArray) {
          var name = pathArray[i];
          // If it's the current directory, don't do anything
          if (name === ".") {}
          // If it's the previous directory, remove the last added entry
          else if (name === "..") {
              clean.pop();
            }
            // Anything else, we add to the array plainly
            else {
                clean.push(name);
              }
        }
        // Array to path
        return "/" + clean.join("/");
      }

      // Chop a path into an array of names
      // "/paths/are/like/arrays" => ["paths", "are", "like", "arrays"]

    }, {
      key: 'chop',
      get: function get() {
        var segments = this.clean.match(/[^/]+/g);
        if (segments === null) {
          return ["/"];
        } else {
          return segments;
        }
      }

      // Just the name of the file/directory the path leads to

    }, {
      key: 'name',
      get: function get() {
        return this.chop[this.chop.length - 1];
      }

      // Basename from the normal name
      // "filename.txt" => "filename"

    }, {
      key: 'basename',
      get: function get() {
        var name = this.name;
        if (name === "") {
          return name;
        } else {
          var base = name.match(/^[^\.]+/);
          if (base !== null) {
            return base[0];
          } else {
            return "";
          }
        }
      }

      // Parent name, get the directory holding this
      // "/directories/hold/files/like-this-one" => "/directories/hold/files"

    }, {
      key: 'parent',
      get: function get() {
        if (this.name === "/") {
          return null;
        } else {
          // Get the length of the path without the name in it
          var parentLen = this.clean.length - this.name.length;
          // Slice the name out of the path
          return this.clean.slice(0, parentLen);
        }
      }

      // Extentions array from the name
      // "archive.tar.gz" => [".tar", ".gz"]

    }, {
      key: 'extentions',
      get: function get() {
        return this.name.match(/\.[^\.]+/g);
      }

      // get the segments of a path like this : ["/", "/path", "/path/example"]

    }, {
      key: 'segment',
      get: function get() {
        var pathArray = this.chop;
        var segments = [];
        // If its a root path, skip segments
        if (this.name === "/") {
          segments = ["/"];
        }
        // Else, any other path
        else {
            for (var i = 0; i <= pathArray.length; i++) {
              var matchPath = pathArray.slice(0, i);
              segments.push("/" + matchPath.join("/"));
            }
          }
        return segments;
      }
    }]);

    return Pathname;
  }();

  var OFS = function () {
    function OFS() {
      _classCallCheck(this, OFS);

      this.drive = arguments[0] || [new OFS_Inode({
        links: 1,
        id: 0,
        type: "d",
        files: {
          ".": 0,
          "..": 0
        }
      })];
    }

    // Resolve path to an inode, don't follow symbolic links


    _createClass(OFS, [{
      key: 'resolveHard',
      value: function resolveHard(path) {
        var inode = 0;
        var trace = [inode];
        if (path === "") {
          return this.drive[inode];
        }
        var pathArray = new Pathname(path).chop;
        for (var i = 0; i < pathArray.length; i++) {
          var name = pathArray[i];
          var inodeObj = this.drive[inode];
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

    }, {
      key: 'resolve',
      value: function resolve(path) {
        var redirectCount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        // Don't follow if we get to 50 symbolic link redirects
        if (redirectCount >= 50) {
          // Max symbolic link redirect count reached (50)
          return -1;
        }
        var inode = this.resolveHard(path);
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

    }, {
      key: 'addInode',
      value: function addInode(type) {
        var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var parentInode = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        // Reject if name contains a "/"
        if (name.match("/")) {
          return -1;
        }
        var id = this.drive.length;
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

    }, {
      key: 'mkFile',
      value: function mkFile(path) {
        var pathname = new Pathname(path);
        var parentInode = this.resolve(pathname.parent);
        var name = pathname.name;
        var inode = this.addInode("f", name, parentInode);
        if (inode < 0) {
          return -1;
        }
        inode.data = "";
        return inode;
      }

      // Add a new directory Inode to the disk

    }, {
      key: 'mkDir',
      value: function mkDir(path) {
        var pathname = new Pathname(path);
        var parentInode = this.resolve(pathname.parent);
        var name = pathname.name;
        var inode = this.addInode("d", name, parentInode);
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

    }, {
      key: 'mkLink',
      value: function mkLink(inode, path) {
        var pathname = new Pathname(path);
        var parentInode = this.resolve(pathname.parent);
        var name = pathname.name;
        // Same as in addInode, not very DRY I know...
        if (name.match("/")) {
          return -1;
        }
        parentInode.files[name] = inode.id;
        return inode;
      }

      // Make a symbolic link inode

    }, {
      key: 'mkSymLink',
      value: function mkSymLink(refPath, linkPath) {
        var pathname = new Pathname(linkPath);
        var parentInode = this.resolve(pathname.parent);
        var name = pathname.name;
        var inode = this.addInode("sl", name, parentInode);
        if (inode < 0) {
          return -1;
        }
        var path = new Pathname(refPath).clean;
        inode.redirect = path;
        return inode;
      }

      // Remove by unlinking

    }, {
      key: 'rm',
      value: function rm(path) {
        var pathname = new Pathname(path);
        var parentInode = this.resolve(pathname.parent);
        var name = pathname.name;
        if (parentInode < 0) {
          return -1;
        }
        return delete parentInode.files[name];
      }
    }]);

    return OFS;
  }();

  var DOMFS = function () {
    function DOMFS() {
      var selectorBase = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

      _classCallCheck(this, DOMFS);

      this.base = selectorBase;
      this.resolveHard = this.resolve;
    }

    _createClass(DOMFS, [{
      key: 'resolve',
      value: function resolve(path) {
        var pathname = new Pathname(path);
        // If we are at the DOM root, i.e. /dev/dom/
        if (pathname.chop[0] === "/") {
          return document.querySelector("*");
        } else {
          var selector = " " + pathname.chop.join(" > ");
          // For child selection by index
          // element.children[0] becomes /dev/dom/element/1
          selector = selector.replace(/ (\d)/g, " :nth-child($1)");
          return document.querySelector(selector);
        }
      }
    }]);

    return DOMFS;
  }();

  var VFS = function () {
    function VFS() {
      _classCallCheck(this, VFS);

      this.mounts = {
        "/": arguments[0] || new OFS()
      };
    }

    // Mount a filesystem


    _createClass(VFS, [{
      key: 'mount',
      value: function mount(fs, mountPoint) {
        this.mounts[mountPoint] = fs;
        return mountPoint;
      }

      // Unmount a filesystem by mount point

    }, {
      key: 'unmount',
      value: function unmount(mountPoint) {
        return delete this.mounts[mountPoint];
      }

      // Resolve the path to the mounted filesystem
      // This is the first step to trace a path, before any data containers (inodes etc) are involved

    }, {
      key: 'mountPoint',
      value: function mountPoint(path) {
        var pathname = new Pathname(path);
        var segments = pathname.segment;
        // All the mount points
        var mounts = Object.keys(this.mounts);
        // Array of resolved mounted disks
        var resolves = [];
        for (var i = 0; i < mounts.length; i++) {
          var mount = new Pathname(mounts[i]).clean;
          for (var _i in segments) {
            if (segments[_i] === mount) {
              resolves.push(mount);
            }
          }
        }
        var mountPoint = resolves.pop();
        return mountPoint;
      }

      // Resolve a path to the fs provided data container
      // resolveHard decides if following symbolic links and the like
      // should or should not happen, default is to follow

    }, {
      key: 'resolve',
      value: function resolve(path) {
        var resolveHard = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

        var pathname = new Pathname(path);
        var mountPoint = this.mountPoint(pathname.clean);
        var fs = this.mounts[mountPoint];
        var fsLocalPath = pathname.clean.substring(mountPoint.length);
        if (resolveHard) {
          return fs.resolveHard(fsLocalPath);
        } else {
          return fs.resolve(fsLocalPath);
        }
      }

      // Return data type of a file, could be "inode" for example

    }, {
      key: 'type',
      value: function type(path) {
        var container = this.resolve(path);
        if (container instanceof OFS_Inode) {
          return "inode";
        } else if (container instanceof HTMLElement) {
          return "element";
        } else {
          return "unknown";
        }
      }

      // Get permissions

    }, {
      key: 'perms',
      value: function perms(path) {
        var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.type(path);

        if (type === "inode") {
          return this.resolve(path).perms;
        }
        // Read and write only for HTML elements
        else if (type === "element") {
            return [true, true, false];
          }
          // RW for anything unset
          else {
              return [true, true, false];
            }
      }

      // Remove a path

    }, {
      key: 'rm',
      value: function rm(path) {
        var pathname = new Pathname(path);
        var mountPoint = this.mountPoint(pathname.clean);
        var fs = this.mounts[mountPoint];
        return fs.rm(pathname.clean);
      }

      // Make a path, and add it as a file or directory
      // We won't check if the path already exists, we don't care
      // For hard or symbolic links, target should be the path to redirect to

    }, {
      key: 'mkPath',
      value: function mkPath(type, path) {
        var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        var pathname = new Pathname(path);
        var mountPoint = this.mountPoint(pathname.clean);
        var fs = this.mounts[mountPoint];
        // Assume failure until success
        var addedObj = -1;
        if (type === "f") {
          addedObj = fs.mkFile(pathname.clean);
        } else if (type === "d") {
          addedObj = fs.mkDir(pathname.clean);
        } else if (type === "l" && target !== null) {
          var targetObj = this.resolve(target);
          if (targetObj < 0) {
            // Target data container to hard link not resolved
            return -1;
          }
          addedObj = fs.mkLink(targetObj, pathname.clean);
        } else if (type === "sl" && target !== null) {
          addedObj = fs.mkSymLink(target, pathname.clean);
        } else {
          // Unknown type
          return -1;
        }
        return addedObj;
      }

      // mkPath() wrappers

      // Create a file

    }, {
      key: 'touch',
      value: function touch(path) {
        return this.mkPath("f", path);
      }

      // Create a directory

    }, {
      key: 'mkdir',
      value: function mkdir(path) {
        return this.mkPath("d", path);
      }

      // Hard link

    }, {
      key: 'ln',
      value: function ln(refPath, linkPath) {
        return this.mkPath("l", linkPath, refPath);
      }

      // Sybolic link

    }, {
      key: 'lns',
      value: function lns(refPath, linkPath) {
        return this.mkPath("sl", linkPath, refPath);
      }
    }]);

    return VFS;
  }();

  var fs = new VFS(new OFS([new OFS_Inode({
    links: 1,
    id: 0,
    type: "d",
    files: {
      ".": 0,
      "..": 0,
      "bin": 1,
      "dev": 2,
      "etc": 3,
      "home": 4,
      "lib": 5,
      "log": 6,
      "mnt": 7,
      "tmp": 8,
      "usr": 9
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 1,
    files: {
      ".": 1,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 2,
    files: {
      ".": 2,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 3,
    files: {
      ".": 3,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 4,
    files: {
      ".": 4,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 5,
    files: {
      ".": 5,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 6,
    files: {
      ".": 6,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 7,
    files: {
      ".": 7,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 8,
    files: {
      ".": 8,
      "..": 0
    }
  }), new OFS_Inode({
    links: 1,
    type: "d",
    id: 9,
    files: {
      ".": 9,
      "..": 0
    }
  })]));

  fs.mount(new OFS([new OFS_Inode({
    links: 1,
    id: 0,
    type: "d",
    files: {
      ".": 0,
      "..": 0,
      "lib.js": 1
    }
  }), new OFS_Inode({
    links: 1,
    type: "f",
    perms: [true, true, true],
    id: 1,
    /* lib.js */data: '"use strict";function newID(){for(var length=arguments.length>0&&void 0!==arguments[0]?arguments[0]:8,chars="0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz",id="",i=0;i<length;i++){var randNum=Math.floor(Math.random()*chars.length);id+=chars.substring(randNum,randNum+1)}return id}function call(name,args){var id=newID();return postMessage({type:"syscall",name:name,args:args,id:id}),new Promise(function(resolve,reject){self.addEventListener("message",function(msg){msg.data.id===id&&("success"===msg.data.status?resolve(msg.data.result):reject(msg.data.reason))})})}function load(path){var data=call("load",[path]);return data.then(eval)}function spawn(image){return call("spawn",[image])}function open(path){return call("open",[path])}function read(fd){return call("read",[fd])}function write(fd,data){return call("write",[fd,data])}'
  })]), "/lib");

  fs.mount(new DOMFS(), "/dev/dom");

  var FileDescriptor = function () {
    function FileDescriptor(path) {
      _classCallCheck(this, FileDescriptor);

      this.path = new Pathname(path).clean;
      this.type = fs.type(this.path);
      this.container = fs.resolve(this.path);
      if (this.container < 0) {
        throw new Error("Path Unresolved");
      }
      this.perms = fs.perms(this.path);
      // No permissions
      if (this.perms === [false, false, false]) {
        throw new Error("All permissions set to false");
      }
    }

    // Return read data


    _createClass(FileDescriptor, [{
      key: 'read',
      value: function read() {
        // Check read permission
        if (!this.perms[0]) {
          return -1;
        }
        if (this.type === "inode") {
          var data = this.container.data;
          // Directory or other
          if (data === undefined) {
            return -1;
          }
          return data;
        } else if (this.type === "element") {
          return this.container.innerHTML;
        } else {
          return -1;
        }
      }

      // Write data out

    }, {
      key: 'write',
      value: function write(data) {
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

      // View "directory" contents or return null

    }, {
      key: 'dir',
      value: function dir() {
        // Check read permission
        if (!this.perms[0]) {
          return -1;
        }
        if (this.type === "inode") {
          if (this.container.type === "f") {
            return Object.keys(this.container.files);
          } else {
            return null;
          }
        } else if (this.type === "element") {
          if (this.container.hasChildNodes()) {
            var children = this.container.children;
            var elements = [];
            for (var i = 0; i < children.length; i++) {
              var el = children[i].localName;
              var id = children[i].id;
              var classes = children[i].className.split(" ").join(".");
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
    }]);

    return FileDescriptor;
  }();

  var utils = {};

  utils.genUUID = function () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (char) {
      var r = Math.random() * 16 | 0,
          v = char === "x" ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  };

  utils.mkWorker = function (scriptStr) {
    var blob = new Blob([scriptStr], { type: "application/javascript" });
    var uri = URL.createObjectURL(blob);
    return new Worker(uri);
  };

  utils.openLocalFile = function () {
    var readAs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "readAsText";

    var input = document.createElement("input");
    input.type = "file";
    input.click();
    return new Promise(function (resolve, reject) {
      input.onchange = function () {
        var file = input.files[0];
        var reader = new FileReader();
        reader[readAs](file);
        reader.onloadend = function () {
          resolve(reader.result);
        };
      };
    });
  };

  utils.http = function (uri) {
    var method = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "GET";

    return new Promise(function (resolve, reject) {
      if (!uri instanceof String) {
        reject("URI invalid");
      }
      var xhr = new XMLHttpRequest();
      xhr.open(method, uri, true);
      xhr.onload = function () {
        if (xhr.status < 300 && xhr.status >= 200) {
          resolve(xhr.response);
        } else {
          reject(xhr.status + " " + xhr.statusText);
        }
      };
      xhr.onerror = function (err) {
        reject(err);
      };
      xhr.send();
    });
  };

  var flags = {};

  // Example output: ["Browser", "xx.xx.xx"]
  function browserInfo() {
    var ua = navigator.userAgent;
    var matches = ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d.]+)/i) || [];
    if (/trident/i.test(matches[1])) {
      var tem = ua.match(/\brv[ :]+([\d.]+)/g) || "";
      return ["IE", tem[1]];
    }
    if (matches[1] === "Chrome") {
      var _tem = ua.match(/\b(OPR|Edge)\/([\d.]+)/);
      if (_tem) {
        return ["Opera", _tem[1]];
      }
    }
    if (matches[2]) {
      return [matches[1], matches[2]];
    } else {
      return [navigator.appName, navigator.appVersion];
    }
  }

  var info = browserInfo();

  flags.browser = info[0];
  flags.version = info[1];

  var Process = function () {
    function Process(image) {
      var _this = this;

      _classCallCheck(this, Process);

      this.fds = [];
      this.libs = [];
      this.cwd = "/";
      this.env = {
        "SHELL": "fsh",
        "PATH": ["/sbin", "/bin", "/usr/sbin", "/usr/bin"],
        "HOME": "/home"
      };
      this.image = image;
      // The worker is where the process is actually executed
      // We auto-load the /lib/lib.js dynamic library
      var libjs = this.load("/lib/lib.js");
      this.worker = utils.mkWorker(libjs + image);
      // This event listener intercepts worker messages and then
      // passes to the message handler, which decides what next
      this.worker.addEventListener("message", function (msg) {
        _this.messageHandler(msg);
      });
    }

    // Handle messages coming from the worker


    _createClass(Process, [{
      key: 'messageHandler',
      value: function messageHandler(msg) {
        var obj = msg.data;
        // This does some quick message format validation, but,
        // all value validation must be handled by the system call function itself
        if (obj.type === "syscall" && obj.name in sys) {
          // Execute a system call with given arguments
          // Argument validation is not handled here
          // But, we do validate the message format
          if (obj.id !== undefined && obj.args instanceof Array) {
            sys[obj.name](this, obj.id, obj.args);
          }
        }
        // The message is not valid because of the type or name
        else {
            var error = {
              status: "error",
              reason: "Invalid request type and/or name",
              id: obj.id
            };
            this.worker.postMessage(error);
          }
      }

      // Where open() actually runs
      // Return a file descriptor

    }, {
      key: 'open',
      value: function open(path) {
        var fd = new FileDescriptor(path);
        this.fds.push(fd);
        return this.fds.length - 1;
      }

      // Like opening a file, execept we add it to the library list

    }, {
      key: 'load',
      value: function load(path) {
        var fd = new FileDescriptor(path);
        this.libs.push(fd);
        return fd.read();
      }
    }]);

    return Process;
  }();

  var ProcessTable = function () {
    function ProcessTable(init) {
      _classCallCheck(this, ProcessTable);

      if (init === undefined) {
        throw new Error("Init process must be defined");
      }
      this.list = [null, init];
      this.nextPID = 2;
    }

    _createClass(ProcessTable, [{
      key: 'add',
      value: function add(process) {
        this.nextPID = this.list.push(process);
        return this.nextPID - 1;
      }
    }]);

    return ProcessTable;
  }();

  var proc = new ProcessTable(new Process());

  var sys = {};

  // Raise an error
  sys.fail = function (process, msgID, args) {
    var error = {
      status: "error",
      reason: args[0],
      id: msgID
    };
    process.worker.postMessage(error);
  };

  // Throw a success result
  sys.pass = function (process, msgID, args) {
    var result = {
      status: "success",
      result: args[0],
      id: msgID
    };
    process.worker.postMessage(result);
  };

  // Send a dynamic library straight to the process
  sys.load = function (process, msgID, args) {
    var data = process.load(args[0]);
    sys.pass(process, msgID, [data]);
  };

  // Spawn a new process from an executable image
  sys.spawn = function (process, msgID, args) {
    if (args.length !== 1) {
      sys.fail(process, msgID, ["Should have only 1 argument"]);
    } else {
      var newProcess = new Process(args[0]);
      var pid = proc.add(newProcess);
      sys.pass(process, msgID, [pid]);
    }
  };

  // Resolve a path into a file descriptor, and add it to the table
  sys.open = function (process, msgID, args) {
    if (args.length !== 1) {
      sys.fail(process, msgID, ["Should have only 1 argument"]);
    }
    if (typeof args[0] !== "string") {
      sys.fail(process, msgID, ["Argument should be a string"]);
    }
    var path = "";
    // If the first character is a "/", then working dir does not matter
    if (args[0][0] === "/") {
      path = args[0];
    } else {
      path = process.cwd + "/" + args[0];
    }
    var result = process.open(path);
    sys.pass(process, msgID, [result]);
  };

  // Read data from a file descriptor
  sys.read = function (process, msgID, args) {
    if (args.length !== 1) {
      sys.fail(process, msgID, ["Should have only 1 argument"]);
    }
    if (args[0] < 0) {
      sys.fail(process, msgID, ["File Descriptor should be postive"]);
    }
    var result = process.fds[args[0]].read();
    sys.pass(process, msgID, [result]);
  };

  // Write data to a file descriptor
  sys.write = function (process, msgID, args) {
    if (args.length !== 2) {
      sys.fail(process, msgID, ["Should have 2 arguments"]);
    }
    if (args[0] < 0) {
      sys.fail(process, msgID, ["File Descriptor should be postive"]);
    }
    var result = process.fds[args[0]].write(args[1]);
    sys.pass(process, msgID, [result]);
  };

  // Change the current working directory
  sys.chdir = function (process, msgID, args) {
    if (!args[0] instanceof String) {
      sys.fail(process, msgID, ["Argument should be a string"]);
    }
    process.cwd = args[0];
    sys.pass(process, msgID, [process.cwd]);
  };

  // Get environment variable
  sys.getenv = function (process, msgID, args) {
    if (!args[0] instanceof String) {
      sys.fail(process, msgID, ["Variable name should be a string"]);
    }
    var value = process.env[args[0]];
    sys.pass(process, msgID, [value]);
  };

  // Set environment variable
  sys.setenv = function (process, msgID, args) {
    if (!args[0] instanceof String) {
      sys.fail(process, msgID, ["Variable name should be a string"]);
    }
    if (!args[1] instanceof String) {
      sys.fail(process, msgID, ["Variable value should be a string"]);
    }
    var value = process.env[args[0]] = args[1];
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
});
//# sourceMappingURL=kernel.js.map