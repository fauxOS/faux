# FauxOS - A virtual, completely in-browser, operating system

<p align="center">
  <img src="https://raw.githubusercontent.com/fauxOS/fauxOS/master/faux.png" title="Faux" alt="Faux OS Logo">
</p>

## Installation

Installing is very straight-forward, there's just one script to load.
The browser is the target for this project, and you can freely
load faux into AMD and CommonJS environments too, try it out.

[raw git](https://rawgit.com/) provides a free cdn that you can use:

`<script src="https://cdn.rawgit.com/fauxOS/fauxOS/master/dist/fauxOS.js"></script>`

You can include this in any web project with `npm install --save faux`

### Dependencies

FauxOS has no runtime dependencies, just include it (preferably) in your `<head>`.
If you don't want to build, copy from the pre-built [`/dist/fauxOS.js`](https://raw.githubusercontent.com/fauxOS/fauxOS/master/dist/fauxOS.js).

To build it yourself, you need to get [node.js and npm](https://nodejs.org/en/download/)

### Building

+ Clone this repository : `git clone https://github.com/fauxOS/fauxOS.git`
+ Enter and get build dependencies : `cd fauxOS npm install`
+ Build it : `npm run build`
+ Add the built file to your server : `cp dist/fauxOS.js ~/webserver/fauxOS.js`
+ Include the script : `<script src="/fauxOS.js"></script>`

## System Call Reference

This is not completely implemented, yet. Most surrounding functionality is available.

Within the kernel, the `sys` object holds all the system call functions. Userspace
can make kernel requests via a [message](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/postMessage), or
by loading in the included `/lib` files.

+ File System
  - `mount()` - Mount a disk to the virtual file system
  - `umount()` - Unmount a disk
  - `mknod()` - Make an inode of given type
  - `link()` - Add an entry for an inode to a given directory
  - `unlink()` - Remove an inode from a directory listing
  - `symlink()` - Symbolically link an inode to a path
  - `readlink()` - Resolve a symbolic link to an inode
  - `create()` - Create an inode and automatically add it to the given directory
  - `rename()` - Rename a directory entry in-place
+ Files
  - `access()` - Return short access privilege rules
  - `stat()` - Return long file information
  - `chmod()` - Change the permissions mode of a file or directory
  - `opendir()` - Open a directory from path to directory file descriptor
  - `closedir()` - Remove a directory file descriptor
  - `open()` - Open a file and add a file descriptor
  - `close()` - Close a file descriptor
  - `dup()` - Duplicate a file descriptor to any other number
  - `read()` - Read data from a file descriptor
  - `write()` - Write data to a file descriptor
+ Pipes
  - `mkfifo()` - Make a named "First In, First Out" pipe file
  - `pipe()` - Make an anonymous pipe between two processes
+ Processes
  - `spawn()` - Like windows `CreateProcess()`, except not bloated
  - `load()` - Load a dynamic library and execute it
  - `exec()` - Replace the executing code of a process
  - `wait()` - Listen to a process and wait for a state change, like termination
  - `getpid()` - Get the Process ID of the calling process
  - `getcwd()` - Return the current working directory
  - `chdir()` - Change a process's working directory
  - `exit()` - Process terminates itself
+ Inter-Process Communication
  - `kill()` - Kill a process, do not confuse with linux's `kill` call
  - `signal()` - Send the given signal to a process
  - `assert()` - Wrapper around `signal()` just for the current process
  - `sighandle()` - Change a process's signal handler, like `sigaction()`
  - `rendezvous()` - Share private resources directly two between processes
+ System
  - `syslog()` - Append the current system state to the log file
  - `uname()` - Get system information