# FauxOS - A virtual, completely in-browser, operating system

## Installation

Installing is very straight-forward, it's one script in your web page.

### Dependencies

FauxOS has no runtime dependencies, just include it in your `<head>`.
If you don't want to build, simply copy from the pre-built `/fauxOS.js`.

To build it yourself, you need to get [Gulp](http://gulpjs.com)

`sudo npm install -g gulp-cli`

### Building

+ Clone this repository : `git clone https://github.com/wlib/fauxOS`
+ Enter and build : `cd fauxOS; ./build`
+ Add the built file to your server : `cp /fauxOS.js ~/webserver/fauxOS.js`
+ Include the script : `<script src="/fauxOS.js"></script>`

## Testing (If you feel like it)

This uses [Intern](https://theintern.github.io) for testing

To run from the command line, go to this repo's root, and run
`./intern-client --config=tests/intern`

Running from the browser is also possible.
Start a server - `python -m SimpleHTTPServer 8000`, then go and open up on [localhost](http://localhost:8000)

## Basic Info

+ The default computer is global, found in `window.box`
  - In node, it just uses `global.box`
+ As a computer, `box` uses disks to store its files
  - Disks are made on the fly with a simple `new Disk()`
  - You can mount a disk to the computer with `box.fs.mount()`
  - Try it out with `const myDisk = box.fs.mount(new Disk(), "/mnt")`
+ There is a virtual file system that we use to resolve paths to an inode
  - To resolve the disk a path references, use `box.fs.getDisk("/mnt/diskFoo").disk`
  - The disk isn't usually important, we want the inode, try `box.fs.resolve("/some/path")`
  - If you don't want to follow symbolic links, replace `resolve()` with `resolveHard()`