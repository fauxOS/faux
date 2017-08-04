var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define('faux', factory) :
            (global.faux = factory());
}(this, (function () {
    'use strict';
    class Inode {
        constructor(config = {}) {
            // Defaults
            this.links = 1;
            this.file = false;
            this.executable = false;
            this.dir = false;
            // Overwrite defaults
            Object.assign(this, config);
        }
        // Read file contents
        read() {
            if (this.file) {
                return this.contents;
            }
            else {
                throw new Error("Not a file");
            }
        }
        // Overwrite file contents
        write(contents) {
            if (this.file) {
                this.contents = contents;
                return;
            }
            else {
                throw new Error("Not a file");
            }
        }
        // Append file contents
        append(contents) {
            if (this.file) {
                this.contents += contents;
                return;
            }
            else {
                throw new Error("Not a file");
            }
        }
        // Truncate file contents
        truncate() {
            if (this.file) {
                this.contents = "";
                return;
            }
            else {
                throw new Error("Not a file");
            }
        }
        // Read a directory
        readdir() {
            if (this.dir) {
                return Object.keys(this.children);
            }
            else {
                throw new Error("Not a directory");
            }
        }
    }
    class OFS {
        constructor(inodes) {
            // Array of all inodes in this file system
            this.inodes = inodes || [
                new Inode({
                    dir: true,
                    children: {}
                })
            ];
        }
        // Resolve path to an inode, don't follow symbolic links
        resolve(pathArray) {
            const rootInode = this.inodes[0];
            // An array of inodes, maps 1:1 with the pathArray
            const inodeArray = [rootInode];
            // We iterate over each part of the path, filling up inodeArray
            for (let i in pathArray) {
                // We need the previous inode's directory contents
                const prevInode = inodeArray.slice(-1)[0];
                if (!prevInode.children) {
                    throw new Error("Path contains segement that isn't a directory");
                }
                // Get the next inode
                const name = pathArray[i];
                const nextInode = prevInode.children[name];
                if (!nextInode) {
                    throw new Error("Path contains non-existent entry");
                }
                inodeArray.push(nextInode);
            }
            // Return the last inode resolved
            return inodeArray.pop();
        }
        // Add an inode directly to a parent
        addInode(parentPathArray, name, inode) {
            if (name.match("/")) {
                throw new Error("Name can't contain forward slashes");
            }
            const parent = this.resolve(parentPathArray);
            // Check if parent is a directory
            if (parent.dir) {
                this.inodes.push(inode);
                parent.children[name] = inode;
            }
            else {
                throw new Error("Parent is not a directory");
            }
        }
        // Add a new file to the disk
        create(pathArray) {
            const parent = pathArray.slice(0, -1);
            const name = pathArray.slice(-1)[0];
            const inode = new Inode({ file: true, contents: "" });
            this.addInode(parent, name, inode);
            return inode;
        }
        // Add a new directory Inode to the disk
        mkdir(pathArray) {
            const parent = pathArray.slice(0, -1);
            const name = pathArray.slice(-1)[0];
            const inode = new Inode({ dir: true, children: {} });
            this.addInode(parent, name, inode);
            return inode;
        }
        // Make a hard link for an inode
        link(oldPathArray, newPathArray) {
            const oldInode = this.resolve(oldPathArray);
            const newParent = this.resolve(newPathArray.slice(0, -1));
            const newName = newPathArray.slice(-1)[0];
            if (newName.match("/")) {
                throw new Error("Name can't contain forward slashes");
            }
            // Check if new parent is a directory
            if (newParent.dir) {
                newParent.children[newName] = oldInode;
                oldInode.links++;
            }
            else {
                throw new Error("New parent is not a directory");
            }
        }
        // Remove by unlinking
        unlink(pathArray) {
            const parent = this.resolve(pathArray.slice(0, -1));
            const name = pathArray.slice(-1)[0];
            // Check if parent is a directory
            if (parent.dir) {
                delete parent.children[name];
                return;
            }
            else {
                throw new Error("Parent is not a directory");
            }
        }
    }
    class Inode$1 {
        constructor(config = {}) {
            // Defaults
            this.links = 1;
            this.file = true;
            this.executable = false;
            this.dir = true;
            // Overwrite defaults
            Object.assign(this, config);
        }
        get contents() {
            return this.raw.innerHTML;
        }
        set contents(contents) {
            return (this.raw.innerHTML = contents);
        }
        get children() {
            const dir = [];
            const children = this.raw.children;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                const name = child.localName;
                const id = child.id ? "#" + child.id : "";
                const classes = child.className
                    ? "." + child.className.replace(/\s+/g, ".")
                    : "";
                // Push a css selector for the child
                dir.push(name + id + classes);
                // Push a css :nth-child() selector number
                dir.push(i + 1);
            }
            return dir;
        }
        // Read file contents
        read() {
            return this.contents;
        }
        // Overwrite file contents
        write(contents) {
            this.contents = contents;
        }
        // Append file contents
        append(contents) {
            this.contents += contents;
        }
        // Truncate file contents
        truncate() {
            this.contents = "";
        }
        // Read a directory
        readdir() {
            return Object.keys(this.children);
        }
    }
    class DOMFS {
        constructor() {
            // In the DOM context, this alias makes sense
            this.mkdir = this.create;
        }
        resolve(pathArray) {
            let element;
            // Return root if pathArray is empty
            if (pathArray.length === 0) {
                // Return the document root element
                element = document.querySelector("*");
            }
            else {
                let selector = " " + pathArray.join(" > ");
                // For child selection by index
                // element.children[0] becomes /dev/dom/element/1
                selector = selector.replace(/ (\d)/g, " :nth-child($1)");
                element = document.querySelector(selector);
            }
            if (!element) {
                throw new Error("Failed to resolve");
            }
            // Return an inode that VFS can understand
            return new Inode$1({
                raw: element
            });
        }
        // Create a new element
        create(pathArray) {
            const parent = this.resolve(pathArray.slice(0, -1));
            // When creating an element, you are only allowed to use the element name
            // e.g. create("/dev/dom/body/#container/span")
            // You cannot create a class, index, or id
            const name = pathArray.slice(-1)[0];
            const element = document.createElement(name);
            // Access the DOM node in parent.raw
            parent.raw.appendChild(element);
            // Again, so that VFS understands
            return new Inode$1({
                raw: element
            });
        }
        // In the DOM, link and unlink make no sense
        link() { }
        unlink() { }
    }
    // Throws an error if argument is not a string
    function assertString(str) {
        if (typeof str !== "string") {
            throw new Error("Some argument is not a string");
        }
    }
    // normalize a crazy path
    // e.g. "/the///./../a/crazy/././path" => "/a/crazy/path"
    function normalize(path) {
        // Empty or no input
        if (!path) {
            return ".";
        }
        assertString(path);
        // An array to hold the significant path parts
        const significant = [];
        // Assume relative path,
        let isAbsolute = false;
        // but reassign if absolute
        if (path.indexOf("/") === 0) {
            isAbsolute = true;
        }
        // Split the path by "/", match() because it doesn't add empty strings
        const pathArray = path.match(/[^/]+/g);
        // Iterate each name in the path
        for (let i in pathArray) {
            const name = pathArray[i];
            const lastItem = significant[significant.length - 1];
            // We ignore all current directory dots
            if (name === ".") {
            }
            else if (name === "..") {
                // No parent of the root directory to care about
                if (isAbsolute) {
                    significant.pop();
                }
                else {
                    // Push if the array is empty or if there is nothing to pop
                    // (Don't pop a "..")
                    if (significant.length === 0 || lastItem === "..") {
                        significant.push("..");
                    }
                    else {
                        significant.pop();
                    }
                }
            }
            else {
                // Just push everything else
                significant.push(name);
            }
        }
        if (isAbsolute) {
            return "/" + significant.join("/");
        }
        else {
            return significant.join("/");
        }
    }
    // POSIX parse the path
    // Parent name, get the parent directory
    // "/directories/hold/files/like-this-one" => "/directories/hold/files"
    // Basename from the normal name
    // "/path/to/filename.txt" => "filename.txt"
    // You can also specify an extention
    // basename("filename.txt", ".txt") => "filename"
    // Get the final extention
    // Join all the arguments into one clean path
    // Chop a path into an array of names
    // "/paths/are/just/arrays" => ["paths", "are", "just", "arrays"]
    function chop(path) {
        const segments = normalize(path).match(/[^/]+/g);
        if (!segments) {
            return [];
        }
        else {
            return segments;
        }
    }
    class VFS {
        constructor(rootDrive = new OFS()) {
            this.mounts = {
                "/": rootDrive
            };
        }
        // Mount a filesystem
        mount(fs, mountPoint) {
            const normalized = normalize(mountPoint);
            const inode = this.resolve(normalized);
            if (inode && inode.dir) {
                this.mounts[normalized] = fs;
                return normalized;
            }
            else {
                throw new Error("No directory to mount to");
            }
        }
        // Unmount a filesystem by mount point
        unmount(mountPoint) {
            const normalized = normalize(mountPoint);
            this.mounts[normalized] = null;
        }
        // Resolve the path to the mounted filesystem
        // This is the first step to trace a path, before any data containers (inodes etc) are involved
        getMountPoint(path) {
            // Get the segments of a path like this : ["/", "/path", "/path/example"]
            const segments = (() => {
                const pathArray = chop(path);
                const segments = [];
                // Applies to any other path
                for (let i = 0; i <= pathArray.length; i++) {
                    let matchPath = pathArray.slice(0, i);
                    segments.push("/" + matchPath.join("/"));
                }
                return segments;
            })();
            // Array of resolved mounted disks
            const resolves = [];
            // Iterate all of the mount points
            const mountPoints = Object.keys(this.mounts).sort((a, b) => a.length - b.length);
            mountPoints.forEach(point => {
                for (let i in segments) {
                    if (segments[i] === point) {
                        resolves.push(point);
                    }
                }
            });
            // The most relevent mount point will be the last one resolved
            return resolves.pop();
        }
        // Resolve a path to its mounted filesystem, and get its absolute path
        // relative to its local file system's root
        getPathInfo(path) {
            const normalized = normalize(path);
            const mountPoint = this.getMountPoint(normalized);
            const localFsPath = normalized.substring(mountPoint.length) || "/";
            return {
                localFs: this.mounts[mountPoint],
                localFsPathArray: chop(localFsPath)
            };
        }
        // Resolve a path to the fs provided data container
        resolve(path) {
            const { localFs, localFsPathArray } = this.getPathInfo(path);
            return localFs.resolve(localFsPathArray);
        }
        // Make a new file
        create(path) {
            const { localFs, localFsPathArray } = this.getPathInfo(path);
            return localFs.create(localFsPathArray);
        }
        // Make a new directory
        mkdir(path) {
            const { localFs, localFsPathArray } = this.getPathInfo(path);
            return localFs.mkdir(localFsPathArray);
        }
        // Hard link newPath to the same inode as oldPath
        link(oldPath, newPath) { }
        // Unlink (remove) a file
        unlink(path) {
            const { localFs, localFsPathArray } = this.getPathInfo(path);
            localFs.unlink(localFsPathArray);
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
    class FileDescriptor {
        constructor(path, mode) {
            this.mode = getMode(mode);
            this.path = normalize(path);
            try {
                this.inode = fs.resolve(this.path);
            }
            catch (err) {
                // Create if non-existent?
                if (this.mode.create) {
                    fs.create(this.path);
                    // Try resolving a second time
                    this.inode = fs.resolve(this.path);
                    // Probably an error creating the file
                    if (!this.inode) {
                        throw new Error("Error on file creation");
                    }
                }
                else {
                    throw new Error("Does not exist");
                }
            }
            // Truncate if mode is set
            if (this.mode.truncate) {
                this.inode.truncate();
            }
        }
        // Return file contents
        read() {
            if (this.mode.read) {
                return this.inode.read();
            }
            else {
                throw new Error("Read mode unset");
            }
        }
        // Write file contents
        write(contents) {
            if (this.mode.write) {
                // Append if in append mode
                if (this.mode.append) {
                    return this.inode.append(contents);
                }
                else {
                    return this.inode.write(contents);
                }
            }
            else {
                throw new Error("Write mode unset");
            }
        }
        // Read directory contents
        readdir() {
            return this.inode.readdir();
        }
    }
    // Relative to absolute path based on a process
    function resolvePath(inputPath, process) {
        if (inputPath[0] === "/") {
            return inputPath;
        }
        else {
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
    function spawn(process, msgID, [image, argv]) {
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
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Spawn a new process from a file path
    function exec(process, msgID, [inputPath, argv]) {
        if (typeof inputPath !== "string") {
            return fail(process, msgID, "First argument - path - should be a string");
        }
        if (!argv instanceof Array) {
            return fail(process, msgID, "Second argument - argv - should be an array");
        }
        try {
            const safePath = resolvePath(inputPath, process);
            const image = fs.resolve(safePath).read();
            const newProcess = new Process(image, argv);
            const pid = processTable.add(newProcess);
            return pass(process, msgID, pid);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Check if a file exists
    function exists(process, msgID, [inputPath]) {
        if (typeof inputPath !== "string") {
            return fail(process, msgID, "First argument - path - should be a string");
        }
        try {
            const safePath = resolvePath(inputPath, process);
            const result = process.exists(safePath);
            return pass(process, msgID, result);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Get file/directory info
    function stat(process, msgID, [inputPath]) {
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
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Resolve a path into a file descriptor, and add it to the table
    function open(process, msgID, [inputPath, mode]) {
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
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Remove a file descriptor from the table
    function close(process, msgID, [fd]) {
        if (fd < 0) {
            return fail(process, msgID, "File Descriptor should be >= 0");
        }
        if (!process.fds[fd]) {
            return fail(process, msgID, "File Descriptor must exist");
        }
        try {
            const result = process.close(fd);
            return pass(process, msgID, result);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Duplicate a file descriptor
    function dup(process, msgID, [fd]) {
        if (fd < 0) {
            return fail(process, msgID, "File Descriptor should be >= 0");
        }
        if (!process.fds[fd]) {
            return fail(process, msgID, "File Descriptor must exist");
        }
        try {
            const newFd = process.dup(fd);
            return pass(process, msgID, newFd);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
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
        try {
            const newFd = process.dup2(fd1, fd2);
            return pass(process, msgID, newFd);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Read data from a file descriptor
    function read(process, msgID, [fd]) {
        if (fd < 0) {
            return fail(process, msgID, "File Descriptor should be >= 0");
        }
        try {
            const data = process.fds[fd].read();
            return pass(process, msgID, data);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Read directory children
    function readdir(process, msgID, [fd]) {
        if (fd < 0) {
            return fail(process, msgID, "File Descriptor should be >= 0");
        }
        try {
            const children = process.fds[fd].readdir();
            return pass(process, msgID, children);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Write data to a file descriptor
    function write(process, msgID, [fd, data]) {
        if (fd < 0) {
            return fail(process, msgID, "File Descriptor should be >= 0");
        }
        if (typeof data !== "string") {
            return fail(process, msgID, "Second argument - data - should be a string");
        }
        try {
            const result = process.fds[fd].write(data);
            return pass(process, msgID, result);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Create a new directory
    function mkdir(process, msgID, [inputPath]) {
        if (typeof inputPath !== "string") {
            return fail(process, msgID, "First argument - path - should be a string");
        }
        try {
            const safePath = resolvePath(inputPath, process);
            const result = fs.mkdir(safePath);
            return pass(process, msgID, result);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Remove a hard link, what rm does
    function unlink(process, msgID, [inputPath]) {
        if (typeof inputPath !== "string") {
            return fail(process, msgID, "First argument - path - should be a string");
        }
        try {
            const safePath = resolvePath(inputPath, process);
            const result = fs.unlink(safePath);
            return pass(process, msgID, result);
        }
        catch (err) {
            return fail(process, msgID, err);
        }
    }
    // Tell what directory we are in
    function pwd(process, msgID, args) {
        return pass(process, msgID, process.cwd);
    }
    // Change the current working directory
    function chdir(process, msgID, [inputPath]) {
        if (typeof inputPath !== "string") {
            return fail(process, msgID, "First argument - path - should be a string");
        }
        const safePath = resolvePath(inputPath, process);
        const result = (process.cwd = safePath);
        return pass(process, msgID, result);
    }
    // Get environment variable
    function getenv(process, msgID, [key]) {
        if (key) {
            if (typeof key !== "string") {
                return fail(process, msgID, "First argument - key - should be a string (or a falsey value)");
            }
            const value = process.env[key];
            return pass(process, msgID, value);
        }
        else {
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
        exists: exists,
        stat: stat,
        open: open,
        close: close,
        dup: dup,
        dup2: dup2,
        read: read,
        readdir: readdir,
        write: write,
        mkdir: mkdir,
        unlink: unlink,
        pwd: pwd,
        chdir: chdir,
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
            }
            else {
                // "y" is replaced with either 8, 9, a, or b
                return ((randInt & 3) | 8).toString(16);
            }
        });
    }
    function spawnWorker(script = "") {
        const blob = new Blob([script], { type: "application/javascript" });
        const uri = URL.createObjectURL(blob);
        return new Worker(uri);
    }
    function openLocalFile(readAs = "readAsText") {
        const input = document.createElement("input");
        input.type = "file";
        input.click();
        return new Promise(function (resolve, reject) {
            input.onchange = function () {
                const file = input.files[0];
                const reader = new FileReader();
                reader[readAs](file);
                reader.onloadend = function () {
                    resolve(reader.result);
                };
            };
        });
    }
    function http(uri, method = "GET") {
        return new Promise((resolve, reject) => {
            if (!uri instanceof String) {
                reject("URI invalid");
            }
            const xhr = new XMLHttpRequest();
            xhr.open(method, uri, true);
            xhr.onload = function () {
                if (xhr.status < 300 && xhr.status >= 200) {
                    resolve(xhr.response);
                }
                else {
                    reject(xhr.status + " " + xhr.statusText);
                }
            };
            xhr.onerror = function (err) {
                reject(err);
            };
            xhr.send();
        });
    }
    function type(value) {
        let ret = typeof value;
        if (ret === "object") {
            if (value === null) {
                ret = "null";
            }
            else {
                if (value instanceof Array) {
                    ret = "array";
                }
            }
        }
        return ret;
    }
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
            const lib = "var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator[\"throw\"](value))}catch(e){reject(e)}}function step(result){result.done?resolve(result.value):new P(function(resolve){resolve(result.value)}).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())})};(function(){\"use strict\";function newID(length=10){const chars=\"0123456789abcdefghiklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXTZ\".split(\"\");let id=\"\";for(let i=0;i<length;i++){const randomIndex=Math.floor(Math.random()*chars.length);id+=chars[randomIndex]}return id}function call(name=\"\",args=[]){const id=newID();return postMessage({type:\"syscall\",name,args,id}),new Promise((resolve,reject)=>{function listener(message){const msg=message.data;msg.id===id&&(\"success\"===msg.status?resolve(msg.result):reject(msg.reason),removeEventListener(\"message\",listener))}addEventListener(\"message\",listener)})}function stat(path){return __awaiter(this,void 0,void 0,function*(){return call(\"stat\",[path])})}function assertString(str){if(\"string\"!=typeof str)throw new Error(\"Some argument is not a string\")}function normalize(path){if(!path)return\".\";assertString(path);const significant=[];let isAbsolute=!1;0===path.indexOf(\"/\")&&(isAbsolute=!0);const pathArray=path.match(/[^/]+/g);for(let i in pathArray){const name=pathArray[i],lastItem=significant[significant.length-1];\".\"===name||(\"..\"===name?isAbsolute?significant.pop():0===significant.length||\"..\"===lastItem?significant.push(\"..\"):significant.pop():significant.push(name))}return isAbsolute?\"/\"+significant.join(\"/\"):significant.join(\"/\")}function parse(path=\"\"){assertString(path);const normalized=normalize(path),matches=normalized.match(splitPathRe);return{root:matches[1],dir:matches[2],base:matches[3],ext:matches[4],name:matches[3].slice(0,matches[3].length-matches[4].length)}}function readFile(path,mode=\"r\"){return __awaiter(this,void 0,void 0,function*(){const fd=yield sys.open(path,mode),data=sys.read(fd);return sys.close(fd),data})}function writeFile(path,data=\"\",mode=\"w\"){return __awaiter(this,void 0,void 0,function*(){const fd=yield sys.open(path,mode);return sys.write(fd,data),void sys.close(fd)})}function loadFile(path){return __awaiter(this,void 0,void 0,function*(){const pathStat=yield stat(path);if(pathStat.file)return self.eval((yield readFile(path)));const pathJsStat=yield stat(path+\".js\");if(pathJsStat.file)return self.eval((yield readFile(path+\".js\")));const pathJsonStat=yield stat(path+\".json\");if(pathJsonStat.file)return JSON.parse((yield readFile(path+\".json\")));throw new Error(\"not found\")})}function wrap(style,str){const[open,close]=ansi[style];return`\\x1b[${open}m${str}\\x1b[${close}m`}function colorize(styles,str){if(styles instanceof Array)for(let i in styles)str=wrap(styles[i],str);else\"string\"==typeof styles&&(str=wrap(styles,str));return str}var sys$1=Object.freeze({spawn:function(image=\"\",argv=[]){return __awaiter(this,void 0,void 0,function*(){return call(\"spawn\",[image,argv])})},exec:function(path,argv=[]){return __awaiter(this,void 0,void 0,function*(){return call(\"exec\",[path,argv])})},exists:function(path){return __awaiter(this,void 0,void 0,function*(){return call(\"exists\",[path])})},stat:stat,open:function(path,mode=\"r\"){return __awaiter(this,void 0,void 0,function*(){return call(\"open\",[path,mode])})},close:function(fd){return __awaiter(this,void 0,void 0,function*(){return call(\"close\",[fd])})},dup:function(fd){return __awaiter(this,void 0,void 0,function*(){return call(\"dup\",[fd])})},dup2:function(fd1,fd2){return __awaiter(this,void 0,void 0,function*(){return call(\"dup2\",[fd1,fd2])})},read:function(fd){return __awaiter(this,void 0,void 0,function*(){return call(\"read\",[fd])})},readdir:function(fd){return __awaiter(this,void 0,void 0,function*(){return call(\"readdir\",[fd])})},write:function(fd,data=\"\"){return __awaiter(this,void 0,void 0,function*(){return call(\"write\",[fd,data])})},mkdir:function(path){return __awaiter(this,void 0,void 0,function*(){return call(\"mkdir\",[path])})},unlink:function(path){return __awaiter(this,void 0,void 0,function*(){return call(\"unlink\",[path])})},pwd:function(){return __awaiter(this,void 0,void 0,function*(){return call(\"pwd\",[])})},chdir:function(path=\"/home\"){return __awaiter(this,void 0,void 0,function*(){return call(\"chdir\",[path])})},getenv:function(key){return __awaiter(this,void 0,void 0,function*(){return call(\"getenv\",[key])})},setenv:function(key,value=\"\"){return __awaiter(this,void 0,void 0,function*(){return call(\"setenv\",[key,value])})}}),browser=function(){const ua=navigator.userAgent,matches=ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\\/))\\/?\\s*([\\d.]+)/i)||[];if(/trident/i.test(matches[1])){const tem=ua.match(/\\brv[ :]+([\\d.]+)/g)||\"\";return[\"IE\",tem[1]]}if(\"Chrome\"===matches[1]){const tem=ua.match(/\\b(OPR|Edge)\\/([\\d.]+)/);if(tem)return[\"Opera\",tem[1]]}return matches[2]?{name:matches[1],version:matches[2]}:{name:navigator.appName,version:navigator.appVersion}}();const splitPathRe=/^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$/;var path=Object.freeze({normalize:normalize,parse:parse,dirname:function(path=\"\"){const parsed=parse(path);return parsed.root?\"/\"+parsed.dir:parsed.dir},basename:function(path=\"\",extension=\"\"){const basename=parse(path).base,indexOf=basename.indexOf(extension);return indexOf&&indexOf+extension.length===basename.length?basename.slice(0,indexOf):basename},extname:function(path){return parse(path).ext},join:function(){const paths=[];for(let i in arguments)assertString(arguments[i]),paths.push(arguments[i]);const joined=paths.join(\"/\");return normalize(joined)},chop:function(path){const segments=normalize(path).match(/[^/]+/g);return segments?segments:[]}}),fs=Object.freeze({readFile:readFile,writeFile:writeFile,appendFile:function(path,data=\"\",mode=\"a\"){return __awaiter(this,void 0,void 0,function*(){const fd=yield sys.open(path,mode);return sys.write(fd,data),void sys.close(fd)})}}),stdin=Object.freeze({read:function(){return __awaiter(this,void 0,void 0,function*(){return readFile(\"/dev/console\")})}}),stdout=Object.freeze({write:function(str){return __awaiter(this,void 0,void 0,function*(){return writeFile(\"/dev/console\",str,\"r+\")})}});var process$1={stdin,stdout,stderr:{}};const esc=\"\\x1B\",beep=\"\\x07\";var control=Object.freeze({cursor:{move:{to:(x=1,y=1)=>esc+\"[\"+x+\";\"+y+\"H\",up:(n=1)=>esc+\"[\"+n+\"A\",down:(n=1)=>esc+\"[\"+n+\"B\",right:(n=1)=>esc+\"[\"+n+\"C\",left:(n=1)=>esc+\"[\"+n+\"D\",nextLine:()=>esc+\"[E\",prevLine:()=>esc+\"[F\",leftMost:()=>esc+\"[G\"},hide:()=>esc+\"[?25l\",show:()=>esc+\"[?25h\",shape:{block:()=>esc+\"]50;CursorShape=0\"+beep,bar:()=>esc+\"]50;CursorShape=1\"+beep,underscore:()=>esc+\"50;CursorShape=2\"+beep},savePosition:()=>esc+\"[s\",restorePosition:()=>esc+\"[u\"},line:{eraseEnd:()=>esc+\"[K\",eraseStart:()=>esc+\"[1K\",erase:()=>esc+\"[2K\"},screen:{eraseDown:()=>esc+\"[J\",eraseUp:()=>esc+\"[1J\",erase:()=>esc+\"[2J\",clear:()=>esc+\"c\",scrollUp:(n=1)=>esc+\"[\"+n+\"S\",scrollDown:(n=1)=>esc+\"[\"+n+\"T\"},misc:{beep:()=>beep,setTitle:str=>esc+\"]0;\"+str+beep}}),ansi={reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],inverse:[7,27],hidden:[8,28],strikethrough:[9,29],black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],gray:[90,39],grey:[90,39],brightRed:[91,39],brightGreen:[92,39],brightYellow:[93,39],brightBlue:[94,39],brightMagenta:[95,39],brightCyan:[96,39],brightWhite:[97,39],bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49],bgGray:[100,49],bgGrey:[100,49],bgBrightRed:[101,49],bgBrightGreen:[102,49],bgBrightYellow:[103,49],bgBrightBlue:[104,49],bgBrightMagenta:[105,49],bgBrightCyan:[106,49],bgBrightWhite:[107,49]};const info=colorize(\"blue\",\"\\u2139\"),success=colorize(\"green\",\"\\u2714\"),warning=colorize(\"yellow\",\"\\u26A0\"),error=colorize(\"red\",\"\\u2716\"),star=colorize(\"brightYellow\",\"\\u2605\"),radioOn=colorize(\"green\",\"\\u25C9\"),radioOff=colorize(\"red\",\"\\u25EF\"),checkboxOn=colorize(\"green\",\"\\u2612\"),checkboxOff=colorize(\"red\",\"\\u2610\");var symbols=Object.freeze({info:info,success:success,warning:warning,error:error,star:star,radioOn:radioOn,radioOff:radioOff,checkboxOn:checkboxOn,checkboxOff:checkboxOff,arrowUp:\"\\u2191\",arrowDown:\"\\u2193\",arrowLeft:\"\\u2190\",arrowRight:\"\\u2192\",line:\"\\u2500\",play:\"\\u25B6\",pointer:\"\\u276F\",pointerSmall:\"\\u203A\",square:\"\\u2587\",squareSmall:\"\\u25FC\",bullet:\"\\u25CF\"});var spinners=Object.freeze({line:{fps:8,frames:[\"-\",\"\\\\\",\"|\",\"/\"]},dots:{fps:12.5,frames:[\"\\u280B\",\"\\u2819\",\"\\u2839\",\"\\u2838\",\"\\u283C\",\"\\u2834\",\"\\u2826\",\"\\u2827\",\"\\u2807\",\"\\u280F\"]},scrolling:{fps:5,frames:[\".  \",\".. \",\"...\",\" ..\",\"  .\",\"   \"]},scrolling2:{fps:2.5,frames:[\".  \",\".. \",\"...\",\"   \"]},star:{fps:14,frames:[\"\\u2736\",\"\\u2738\",\"\\u2739\",\"\\u273A\",\"\\u2739\",\"\\u2737\"]},ball:{fps:8,frames:[\"\\u2801\",\"\\u2802\",\"\\u2804\",\"\\u2802\"]},triangle:{fps:15,frames:[\"\\u25E2\",\"\\u25E3\",\"\\u25E4\",\"\\u25E5\"]},circle:{fps:15,frames:[\"\\u25D0\",\"\\u25D3\",\"\\u25D1\",\"\\u25D2\"]},bounce:{fps:12.5,frames:[\"( \\u25CF    )\",\"(  \\u25CF   )\",\"(   \\u25CF  )\",\"(    \\u25CF )\",\"(     \\u25CF)\",\"(    \\u25CF )\",\"(   \\u25CF  )\",\"(  \\u25CF   )\",\"( \\u25CF    )\",\"(\\u25CF     )\"]},clock:{fps:10,frames:[\"\\uD83D\\uDD50 \",\"\\uD83D\\uDD51 \",\"\\uD83D\\uDD52 \",\"\\uD83D\\uDD53 \",\"\\uD83D\\uDD54 \",\"\\uD83D\\uDD55 \",\"\\uD83D\\uDD56 \",\"\\uD83D\\uDD57 \",\"\\uD83D\\uDD58 \",\"\\uD83D\\uDD59 \",\"\\uD83D\\uDD5A \"]},pong:{fps:12.5,frames:[\"\\u2590\\u2802       \\u258C\",\"\\u2590\\u2808       \\u258C\",\"\\u2590 \\u2802      \\u258C\",\"\\u2590 \\u2820      \\u258C\",\"\\u2590  \\u2840     \\u258C\",\"\\u2590  \\u2820     \\u258C\",\"\\u2590   \\u2802    \\u258C\",\"\\u2590   \\u2808    \\u258C\",\"\\u2590    \\u2802   \\u258C\",\"\\u2590    \\u2820   \\u258C\",\"\\u2590     \\u2840  \\u258C\",\"\\u2590     \\u2820  \\u258C\",\"\\u2590      \\u2802 \\u258C\",\"\\u2590      \\u2808 \\u258C\",\"\\u2590       \\u2802\\u258C\",\"\\u2590       \\u2820\\u258C\",\"\\u2590       \\u2840\\u258C\",\"\\u2590      \\u2820 \\u258C\",\"\\u2590      \\u2802 \\u258C\",\"\\u2590     \\u2808  \\u258C\",\"\\u2590     \\u2802  \\u258C\",\"\\u2590    \\u2820   \\u258C\",\"\\u2590    \\u2840   \\u258C\",\"\\u2590   \\u2820    \\u258C\",\"\\u2590   \\u2802    \\u258C\",\"\\u2590  \\u2808     \\u258C\",\"\\u2590  \\u2802     \\u258C\",\"\\u2590 \\u2820      \\u258C\",\"\\u2590 \\u2840      \\u258C\",\"\\u2590\\u2820       \\u258C\"]}});Object.assign(self,{sys:sys$1,browser,path,http:function(uri,method=\"GET\"){return new Promise((resolve,reject)=>{!uri instanceof String&&reject(\"URI invalid\");const xhr=new XMLHttpRequest;xhr.open(method,uri,!0),xhr.onload=function(){300>xhr.status&&200<=xhr.status?resolve(xhr.response):reject(xhr.status+\" \"+xhr.statusText)},xhr.onerror=function(err){reject(err)},xhr.send()})},fs,process:process$1,require:function(requirePath=\"\"){return __awaiter(this,void 0,void 0,function*(){if(\"string\"!=typeof requirePath)throw new Error(\"argument is not a string\");try{return yield loadFile(requirePath)}catch(err){return loadFile(requirePath+\"/index\")}})},cli:{ArgParser:class{constructor(options){this.options=options||{}}parse(argv=process.argv){}},control,colorize,symbols,Spinner:class{constructor(name=\"circle\"){const spinner=spinners[name];this.frames=spinner.frames,this.index=0,this.interval=Math.round(1e3/spinner.fps),this.setIntervalIndex=null}next(){this.index++;const realIndex=(this.index-1)%this.frames.length;return this.frames[realIndex]}start(outputFunction){outputFunction=outputFunction||(str=>process.stdout.write(str)),this.setIntervalIndex=setInterval(()=>{let frame=this.next(),clearFrame=frame.replace(/./g,\"\\b\");outputFunction(clearFrame),outputFunction(frame)},this.interval)}stop(){clearInterval(this.setIntervalIndex)}}}}),self.print=(...args)=>process$1.stdout.write(args.join(\" \")),self.println=(...args)=>process$1.stdout.write(args.join(\" \")+\"\\n\"),\"undefined\"==typeof CustomEvent&&(self.CustomEvent=class extends Event{constructor(name,obj){super(name),Object.assign(this,obj)}}),addEventListener(\"message\",message=>{const msg=message.data;if(\"event\"===msg.type&&msg.name){const event=new CustomEvent(msg.name,{detail:msg.detail});dispatchEvent(event)}})})();";
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
            }
            else if (msg.type === "event" && msg.name && msg.detail) {
                // Fire the event natively
                const event = new CustomEvent(msg.name, { detail: msg.detail });
                dispatchEvent(event);
            }
            else {
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
            }
            else {
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
        emit(name, detail, pids = Object.keys(this.list)) {
            // Post the message to each process as specified by the pids array
            for (let i in pids) {
                const pid = pids[i];
                // Post the message every process' webworker
                this.list[pid].worker.postMessage({
                    type: "event",
                    name,
                    detail
                });
            }
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
            }
            else {
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
            }
            else {
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
                }
                else {
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
                }
                else {
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
            }
            else {
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
    class LineBuffer {
        constructor(write, emit) {
            // Write function to write raw data to the terminal
            this.write = write || function () {
                return __awaiter(this, void 0, void 0, function* () { });
            };
            // Emit function to emit input events
            this.emit = emit || function () { };
            // The current line's raw buffer is stored here.
            // This buffer allows line edition before the user
            // sends input to the program.
            this.buffer = new DoublyLinkedList();
            // Index of the cursor within the buffer
            this.cursorIndex = 0;
            // Input that hasn't been read yet, but is out of the buffer
            this.input = "";
        }
        // Return and clear the input buffer
        read() {
            const str = this.input;
            this.input = "";
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
            const backspaces = new Array(this.buffer.length - newCursorIndex + 1).join("\b");
            this.write(backspaces);
            this.cursorIndex = newCursorIndex;
        }
        // Discard last written character
        backSpace() {
            // We can only delete characters in the buffer
            if (this.buffer.length > 0) {
                this.buffer.remove(this.cursorIndex - 1);
                this.update(this.buffer.length + 1, this.cursorIndex - 1);
            }
            else {
                return;
            }
        }
        // Save the last line and start a new one
        enter(shiftKey) {
            this.buffer.add(this.cursorIndex, "\n");
            // Stringify and push the buffer for reading
            this.input += this.buffer.toString();
            // Emit event sending input, while clearing the buffer
            this.emit("consoleInput", { buffered: true });
            // Reset the buffer
            this.buffer = new DoublyLinkedList();
            // Write out a line feed
            this.write("\n");
            this.cursorIndex = 0;
        }
        // Handle direction changes
        arrow(key) {
            const detail = {};
            switch (key) {
                case "\x1b[A":// Up
                    detail.arrowUp = true;
                    break;
                case "\x1b[B":// Down
                    detail.arrowDown = true;
                    break;
                case "\x1b[C":// Right
                    detail.arrowRight = true;
                    if (!(this.cursorIndex === this.buffer.length)) {
                        this.cursorIndex++;
                        this.write(key);
                    }
                    break;
                case "\x1b[D":// Left
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
            this.lineBuffer = new LineBuffer(
            // Bind the functions before passing them to LineBuffer.
            this.write.bind(this), processTable.emit.bind(processTable));
            this.config = {
                // Whether this should be active at all.
                // If buffer is set false, line editing will be skipped
                buffer: true
            };
            Object.assign(this.config, config);
        }
        read() {
            return this.lineBuffer.read();
        }
        // Raw terminal write function that terminal emulators override
        writeRaw(str) {
            console.warn(`Unhandled console write: ${contents}`);
        }
        // Add a carriage-return to each line-feed, as terminal emulators require it
        write(contents) {
            return this.writeRaw(contents.replace(/\n/g, "\r\n"));
        }
        // Takes a key and decides what to do
        handle(key) {
            // Pass the key to the line buffer
            if (this.config.buffer) {
                this.lineBuffer.handle(key);
            }
            else {
                // Just emit a raw input event to userspace
                processTable.emit("consoleInput", { raw: true });
            }
        }
    }
    var console$2 = new Console();
    const inode = new Inode();
    // Reading not applicable
    inode.read = () => console$2.read();
    // Only writing is allowed
    inode.write = data => console$2.write(data);
    const devices = new OFS();
    devices.addInode([], "console", inode);
    // Root file system
    const root = new OFS();
    // Top level directories
    root.mkdir(["bin"]);
    root.mkdir(["dev"]);
    root.mkdir(["dev", "dom"]);
    root.mkdir(["home"]);
    root.mkdir(["log"]);
    root.mkdir(["tmp"]);
    // Faux SHell
    root.addInode(["bin"], "fsh", new Inode({
        file: true,
        executable: true,
        contents: "(function(){\"use strict\";function tokenizeLine(line=\"\"){const tokens=line.match(/([\"'])(?:\\\\|.)+\\1|((?:[^\\\\\\s]|\\\\.)*)/g).filter(String);for(let token,i=0;i<tokens.length;i++)token=tokens[i],tokens[i]=token.replace(/\\\\(?=.)/g,\"\"),token.match(/^[\"'].+(\\1)$/m)&&(tokens[i]=/^([\"'])(.+)(\\1)$/gm.exec(token)[2]);return tokens}function lex(input=\"\"){const allTokens=[],lines=input.match(/(\\\\;|[^;])+/g);for(let tokens,i=0;i<lines.length;i++)tokens=tokenizeLine(lines[i]),allTokens.push(tokens);return allTokens}function parseCommand(tokens){const command={type:\"simple\",argv:tokens,argc:tokens.length,name:tokens[0]};return command}(function(input=\"\"){const AST={type:\"script\",commands:[]},commands=lex(input);for(let parsed,i=0;i<commands.length;i++)parsed=parseCommand(commands[i]),AST.commands[i]=parsed;return AST})(\"echo hello, world\")})();"
    }));
    // Javascript SHell
    root.addInode(["bin"], "jsh", new Inode({
        file: true,
        executable: true,
        contents: "var __awaiter=this&&this.__awaiter||function(thisArg,_arguments,P,generator){return new(P||(P=Promise))(function(resolve,reject){function fulfilled(value){try{step(generator.next(value))}catch(e){reject(e)}}function rejected(value){try{step(generator[\"throw\"](value))}catch(e){reject(e)}}function step(result){result.done?resolve(result.value):new P(function(resolve){resolve(result.value)}).then(fulfilled,rejected)}step((generator=generator.apply(thisArg,_arguments||[])).next())})};(function(){\"use strict\";function prompt(str=\"jsh> \",color=\"gray\"){return __awaiter(this,void 0,void 0,function*(){const prompt=cli.colorize(color,str);return yield print(prompt)})}function type(value){let ret=typeof value;return\"object\"==ret&&(null===value?ret=\"null\":value instanceof Array&&(ret=\"array\")),ret}function serializeFunction(value,currentDepth=0){switch(currentDepth){case 0:return value+\"\";break;case 1:return value.name?`[Function: ${value.name}]`:\"[Function]\";break;case 2:default:return\"[Function]\";}}function serialize(value,depthLimit=5,currentDepth=0){if(currentDepth>=depthLimit)return\"[...]\";let ret;switch(type(value)){case\"object\":ret={},Object.keys(value).forEach(key=>{ret[key]=serialize(value[key],depthLimit,currentDepth+1)});break;case\"array\":for(let i in ret=[],value)ret[i]=serialize(value[i],depthLimit,currentDepth+1);break;case\"function\":return serializeFunction(value,currentDepth);break;case\"symbol\":return value.toString();break;default:return value+\"\";}return 0===currentDepth?JSON.stringify(ret,null,2):ret}function evaluate(str){return __awaiter(this,void 0,void 0,function*(){let formatted=\"\";try{const result=self.eval(str),serialized=serialize((yield result));formatted=`${cli.colorize(\"green\",serialized)}`,result instanceof Promise&&(formatted=`${cli.colorize(\"gray\",\"(Promise) ->\")} ${cli.colorize(\"green\",serialized)}`)}catch(err){formatted=cli.colorize(\"red\",err)}return yield println(formatted),yield prompt()})}addEventListener(\"consoleInput\",function({detail}){return __awaiter(this,void 0,void 0,function*(){if(detail.buffered){const input=yield process.stdin.read();evaluate(input)}})}),function(){return __awaiter(this,void 0,void 0,function*(){return yield println(`Welcome to Faux's ${cli.colorize(\"bold\",\"J\")}avascript ${cli.colorize(\"bold\",\"SH\")}ell!\\n`),yield prompt()})}()})();"
    }));
    // Virtual Filesystem Switch
    const fs = new VFS(root);
    // Mount other file systems
    fs.mount(new DOMFS(), "/dev/dom");
    fs.mount(devices, "/dev");
    // Example output: ["Browser", "xx.xx.xx"]
    function browserInfo() {
        const ua = navigator.userAgent;
        const matches = ua.match(/(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d.]+)/i) || [];
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
        }
        else {
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
        version: "0.0.4"
    };
    return index;
})));
