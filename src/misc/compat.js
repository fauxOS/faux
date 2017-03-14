// Check environment for feature compatability,
// then set the appropriate flags
// TODO: better dynamic require("pkg")-ing

// Example output: ["Browser", "xx.xx.xx"]
function browserInfo() {
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

// Check if var is defined
function loaded(obj) {
  return eval("typeof " + obj + " !== 'undefined'");
}

faux.flags.env = {};

if ( loaded("navigator") ) {
  faux.flags.isBrowser = true;
  const info = browserInfo();
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