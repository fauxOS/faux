# FauxOS - A virtual, completely in-browser, operating system

## Installation

Installing is very straight-forward, it's one script in your web page.

[raw git](https://rawgit.com/) provides a free cdn to you can use:

`<script src="https://cdn.rawgit.com/fauxOS/fauxOS/master/dist/fauxOS.js"></script>`

### Dependencies

FauxOS has no runtime dependencies, just include it in your `<head>`.
If you don't want to build, simply copy from the pre-built
[`/dist/fauxOS.js`](https://raw.githubusercontent.com/fauxOS/fauxOS/master/dist/fauxOS.js).

To build it yourself, you need to get [Gulp](http://gulpjs.com)

`sudo npm install -g gulp-cli`

### Building

+ Clone this repository : `git clone https://github.com/fauxOS/fauxOS.git`
+ Enter and build : `cd fauxOS; gulp`
+ Add the built file to your server : `cp dist/fauxOS.js ~/webserver/fauxOS.js`
+ Include the script : `<script src="/fauxOS.js"></script>`

## Testing (If you feel like it)

This uses [Intern](https://theintern.github.io) for testing

Start a server - `python -m SimpleHTTPServer 8000`, then go and open up on [localhost](http://localhost:8000)

## System Call Overview

Within the kernel, the `sys` object holds all the system call functions.

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
  - `rfork()` - Resource fork, similar to linux's `clone()`
  - `exec()` - Replace the executing code of a process
  - `wait()` - Listen to a process and wait for a state change, like termination
  - `getpid()` - Get the Process ID of the calling process
  - `getcwd()` - Return the current working directory
  - `chdir()` - Change a process's working directory
+ Inter-Process Communication
  - `kill()` - Kill a process, do not confuse with linux's `kill` call
  - `signal()` - Send the given signal to a process
  - `assert()` - Wrapper around `signal()` just for the current process
  - `sighandle()` - Change a process's signal handler, like `sigaction()`
  - `request()` - Request a process for arbitrary data
  - `reply()` - Set a reply for handled `request()` calls
+ System
  - `syslog()` - Append the current system state to the log file
  - `uname()` - Get system information