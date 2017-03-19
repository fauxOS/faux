const flags = {};
flags.env = {};

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

if ( typeof navigator !== "undefined" ) {
  flags.isBrowser = true;
  const info = browserInfo();
  flags.env.name = info[0];
  flags.env.version = info[1];
}
else if ( typeof process !== "undefined" ) {
  flags.isNode = true;
  flags.env.name = "Node.JS";
  flags.env.version = process.version;
}
else {
  console.warn("FauxOS : environment not detected and/or not supported");
}

if ( typeof Worker !== "undefined" ) {
  flags.Worker = true;
}
else {
  if (flags.isNode) {
    console.warn("FauxOS : Processes not yet implemented on Node");
  }
  else {
    flags.Worker = false;
    console.warn("FauxOS : Worker not supported");
  }
}

export default flags;