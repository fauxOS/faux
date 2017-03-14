// Check environment for feature compatability,
// then set the appropriate flags
// TODO: better dynamic require("pkg")-ing

// Check if var is defined
function loaded(obj) {
  return eval("typeof " + obj + " !== 'undefined'");
}

faux.flags.env = {};

if ( loaded("navigator") ) {
  faux.flags.isBrowser = true;
  const info = faux.utils.browserInfo();
  faux.flags.env.name = info[0];
  faux.flags.env.version = info[1];
}
else if ( loaded("process") && loaded("module") && loaded("require") ) {
  faux.flags.isNode = true;
  faux.flags.env.name = "Node.JS";
  faux.flags.env.version = process.version;
}
else {
  console.warn("FauxOS : environment not detected and/or not supported");
}

if ( loaded("Worker") ) {
  faux.flags.Worker = true;
}
else {
  if (faux.flags.isNode) {
    global.Worker = require("webworker-threads").Worker;
  }
  else {
    faux.flags.Worker = false;
    console.warn("FauxOS : Worker not supported");
  }
}

// Simple HTTP and HTTPS with promises
// Both browser and node
// https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
if (faux.flags.isNode) {
  faux.utils.http = function(uri, method="GET") {
    return new Promise((resolve, reject) => {
      const lib = uri.startsWith("https") ? require("https") : require("http");
      const parsed = (require("url")).parse(uri);
      const options = {
        host: parsed.hostname,
        port: parsed.port,
        path: parsed.path,
        method: method,
        headers: {
          "User-Agent": "FauxOS | git.io/faux"
        }
      };
      const request = lib.request(options, (response) => {
        if (response.statusCode < 200 || response.statusCode > 299) {
          reject(new Error("Failed with response code : " + response.statusCode));
        }
        const body = [];
        response.on("data", (chunk) => body.push(chunk));
        response.on("end", () => resolve(body.join("")));
      });
      request.on("error", (err) => reject(err))
    });
  };
}
else if (faux.flags.isBrowser) {
  faux.utils.http = function (uri, method = "GET") {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, uri, true);
      xhr.onload = function() {
        if (xhr.status < 300 && xhr.status >= 200) {
          resolve(xhr.response);
        }
        else {
          reject(xhr.status + " " + xhr.statusText);
        }
      };
      xhr.onerror = function(err) {
        reject(err);
      }
      xhr.send();
    });
  };
}
else {
  faux.flags.http = false;
  console.warn("FauxOS : HTTP not supported");
}