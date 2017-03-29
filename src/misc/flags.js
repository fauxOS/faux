const flags = {};

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
    if (tem) {
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

const info = browserInfo();

flags.browser = info[0];
flags.version = info[1];

export default flags;