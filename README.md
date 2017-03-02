# FauxOS - A virtual, completely in-browser, operating system

## Installation

Installing is very straight-forward, it's one script in your web page.

[raw git](https://rawgit.com/) provides a free cdn to you can use:

`<script src="https://cdn.rawgit.com/fauxOS/fauxOS/master/fauxOS.js"></script>`

### Dependencies

FauxOS has no runtime dependencies, just include it in your `<head>`.
If you don't want to build, simply copy from the pre-built [`/fauxOS.js`](https://raw.githubusercontent.com/fauxOS/fauxOS/master/fauxOS.js).

To build it yourself, you need to get [Gulp](http://gulpjs.com)

`sudo npm install -g gulp-cli`

### Building

+ Clone this repository : `git clone https://github.com/fauxOS/fauxOS.git`
+ Enter and build : `cd fauxOS; gulp`
+ Add the built file to your server : `cp /fauxOS.js ~/webserver/fauxOS.js`
+ Include the script : `<script src="/fauxOS.js"></script>`

## Testing (If you feel like it)

This uses [Intern](https://theintern.github.io) for testing

Start a server - `python -m SimpleHTTPServer 8000`, then go and open up on [localhost](http://localhost:8000)