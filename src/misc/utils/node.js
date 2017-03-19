const node = {};

node.mkWorker = function(scriptStr) {
  throw new Error("Processes/Web Workers not supported");
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