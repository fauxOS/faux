function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

// Just an alias
blobToURI = URL.createObjectURL;

// Turn a string into a blob,
// then the blob to an addressable URI,
// and finally make a new web worker from that URI
function mkWorker(scriptStr) {
  const blob = new Blob(
    [scriptStr],
    {type: "application/javascript"}
  );
  const uri = blobToURI(blob);
  return new Worker(uri);
}

// Load a local file and return a Promise
// The Promise resolves to a file object
function loadLocalFile() {
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
function readLocalFile(blob, readAs="readAsText") {
  const reader = new FileReader();
  reader[readAs](blob);
  return new Promise(function(resolve, reject) {
    reader.onloadend = function() {
      resolve( reader.result );
    };
  });
}