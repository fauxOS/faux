<h1 align="center">
  Faux OS - A virtual, webpage operating system
  <hr style="opacity: 0; height: 25px">
  <img src="./faux.png" title="Faux" alt="Faux OS Logo">
</h1>


## Installation

Installing is very straight-forward, there's just one script to load.
The browser is the default target for this project, but you are free
to load faux into AMD and CommonJS environments too, try it out.

All production files are in the `/dist` directory.
These are written in ES6+ javascript, and are in UMD format.

```
dist
├── fauxOS.js         => Readable
└── fauxOS.min.js     => Minified
```

#### CDN's

+ `<script src="https://unpkg.com/faux"></script>`
  - Very fast, recommended
+ `<script src="https://cdn.rawgit.com/fauxOS/faux/master/dist/fauxOS.min.js"></script>`
  - Gets the latest from github, use to retrieve an unreleased file

#### Node

It is prefered to use yarn over npm as a package manager, due to performace,
friendliness, and overall ease of use.

You can include this in any web project with `yarn add faux`

### Dependencies

Faux has no runtime dependencies, just include it (preferably) in your `<head>`.
If you don't want to build, copy from the pre-built
[`/dist/fauxOS.min.js`](https://raw.githubusercontent.com/fauxOS/faux/master/dist/fauxOS.min.js).

To build it yourself, you need to get:
+ [node.js](https://nodejs.org/en/download/)
+ [yarn](https://www.npmjs.com/package/yarn)

### Building

+ Clone this repository : `git clone https://github.com/fauxOS/faux.git`
+ Enter and get build dependencies : `cd faux && yarn`
+ Build it : `yarn build`
+ Add the built file to your server : `cp -R dist/ ~/webserver/faux/`
+ Include the script : `<script src="/faux/fauxOS.min.js"></script>`
