faux.utils.genUUID = function() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

// Turn a string into a blob,
// then the blob to an addressable URI,
// and finally make a new web worker from that URI
faux.utils.mkWorker = function(scriptStr) {
  const blob = new Blob(
    [scriptStr],
    {type: "application/javascript"}
  );
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
}

// Load a local file and return a Promise
// The Promise resolves to a file object
faux.utils.loadLocalFile = function() {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return new Promise(function(resolve, reject) {
    input.onchange = function() {
      resolve( input.files[0] );
    };
  });
}

// Wrapper around FileReader, returns a Promise
// Promise by default resolves to a string
faux.utils.readLocalFile = function(blob, readAs="readAsText") {
  const reader = new FileReader();
  reader[readAs](blob);
  return new Promise(function(resolve, reject) {
    reader.onloadend = function() {
      resolve( reader.result );
    };
  });
}

// Wrapper to open a local file
// Example usage: openLocalFile().then(console.log);
faux.utils.openLocalFile = function() {
  return loadLocalFile().then(readLocalFile);
}

// Simple HTTP and HTTPS with promises
// Both browser and node, node is more free without CORS
// faux.utils.http("https://m.agar.io/info").then(JSON.parse).then(console.log);
// https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/
if (faux.flags.isNode) {
  faux.utils.http = function (uri, method="GET") {
    var request = require("request");
    return new Promise((resolve, reject) => {
      request(uri, (err, res, body) => {
        if (err) { reject(err) }
        if (res && body) { resolve(body) }
      });
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