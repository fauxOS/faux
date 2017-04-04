# Faux OS - A virtual, completely in-browser, operating system

<p align="center">
  <img src="https://raw.githubusercontent.com/fauxOS/faux/master/faux.png" title="Faux" alt="Faux OS Logo">
</p>

## Installation

Installing is very straight-forward, there's just one script to load.
The browser is the default target for this project, but you are free
to load faux into AMD and CommonJS environments too, try it out.

All distributed files are in the `/dist` directory.

```
dist
├── fauxOS.es6.js     => No transpilation done
├── fauxOS.js         => Transpiled
└── fauxOS.min.js     => Transpiled and minified
```

#### CDN's

+ `<script src="https://unpkg.com/faux/dist/fauxOS.min.js"></script>`
  - Very fast, recommended
+ `<script src="https://cdn.rawgit.com/fauxOS/faux/master/dist/fauxOS.min.js"></script>`
  - Gets the latest from github, use to retrieve an unreleased file

#### Node

You can include this in any web project with `npm install --save faux`

### Dependencies

Faux has no runtime dependencies, just include it (preferably) in your `<head>`.
If you don't want to build, copy from the pre-built [`/dist/fauxOS.min.js`](https://raw.githubusercontent.com/fauxOS/faux/master/dist/fauxOS.min.js).

To build it yourself, you need to get [node.js and npm](https://nodejs.org/en/download/)

### Building

+ Clone this repository : `git clone https://github.com/fauxOS/faux.git`
+ Enter and get build dependencies : `cd faux npm install`
+ Build it : `npm run build`
+ Add the built file to your server : `cp -R dist/ ~/webserver/faux/`
+ Include the script : `<script src="/faux/fauxOS.min.js"></script>`

## System Call Reference

This is not completely implemented, yet. Most surrounding functionality is available.

Within the kernel, the `sys` object holds all the system call functions. Userspace
can make kernel requests via a [message](https://developer.mozilla.org/en-US/docs/Web/API/DedicatedWorkerGlobalScope/postMessage), or
by loading in the included `/lib` files.