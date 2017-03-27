const node = {};

node.mkWorker = function(scriptStr) {
  console.warn("Processes/Web Workers not supported");
  return -1;
}

node.openLocalFile = function(readAs="readAsText") {

}

node.http = function (uri, method="GET") {
  const request = require("request");
  return new Promise((resolve, reject) => {
    if (! uri instanceof String) {
      reject("URI invalid");
    }
    request(uri, (err, res, body) => {
      if (err) { reject(err) }
      if (res && body) { resolve(body) }
    });
  });
}

export default node;