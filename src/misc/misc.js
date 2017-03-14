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

// Example output: ["Browser", "xx.xx.xx"]
faux.utils.browserInfo = function() {
  const ua = navigator.userAgent;
  const matches = ua.match( /(vivaldi|opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*([\d.]+)/i ) || [];
  if ( (/trident/i).test(matches[1]) ) {
    const tem = ua.match( /\brv[ :]+([\d.]+)/g ) || "";
    return [ "IE", tem[1] ];
  }
  if ( matches[1] === "Chrome" ) {
    const tem = ua.match( /\b(OPR|Edge)\/([\d.]+)/ );
    if (tem != null) {
      return [ "Opera", tem[1] ];
    }
  }
  if ( matches[2] ) {
    return [ matches[1], matches[2] ];
  }
  else {
    return [navigator.appName, navigator.appVersion];
  }
}