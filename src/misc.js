function genUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

function mkWorker(scriptStr) {
  const blob = new Blob(
    [scriptStr],
    {type: "application/javascript"}
  );
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
}

function loadFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return new Promise(function(resolve, reject) {
    input.onchange = function() {
      resolve( input.files[0] );
    };
  });
}

function readFile(blob, readAs="readAsText") {
  const reader = new FileReader();
  reader[readAs](blob);
  return new Promise(function(resolve, reject) {
    reader.onloadend = function() {
      resolve( reader.result );
    };
  });
}