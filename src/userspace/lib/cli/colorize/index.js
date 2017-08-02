import ansi from "./ansi.js";

function wrap(style, str) {
  const [open, close] = ansi[style];
  return `\x1b[${open}m${str}\x1b[${close}m`;
}

export default function colorize(styles, str) {
  if (styles instanceof Array) {
    for (let i in styles) {
      str = wrap(styles[i], str);
    }
  } else if (typeof styles === "string") {
    str = wrap(styles, str);
  }
  return str;
}

/*

const styles = [];

Object.keys(ansi).forEach(style => {
  if (style.match("(reset|hidden|grey|bgGrey)")) {
    return;
  }

  styles.push(colorize(style, style));
});

console.log(styles.join(" "));

"\u001b[1mbold\u001b[22m \u001b[2mdim\u001b[22m \u001b[3mitalic\u001b[23m \u001b[4munderline\u001b[24m \u001b[7minverse\u001b[27m \u001b[9mstrikethrough\u001b[29m \u001b[30mblack\u001b[39m \u001b[31mred\u001b[39m \u001b[32mgreen\u001b[39m \u001b[33myellow\u001b[39m \u001b[34mblue\u001b[39m \u001b[35mmagenta\u001b[39m \u001b[36mcyan\u001b[39m \u001b[37mwhite\u001b[39m \u001b[90mgray\u001b[39m \u001b[91mredBright\u001b[39m \u001b[92mgreenBright\u001b[39m \u001b[93myellowBright\u001b[39m \u001b[94mblueBright\u001b[39m \u001b[95mmagentaBright\u001b[39m \u001b[96mcyanBright\u001b[39m \u001b[97mwhiteBright\u001b[39m \u001b[40mbgBlack\u001b[49m \u001b[41mbgRed\u001b[49m \u001b[42mbgGreen\u001b[49m \u001b[43mbgYellow\u001b[49m \u001b[44mbgBlue\u001b[49m \u001b[45mbgMagenta\u001b[49m \u001b[46mbgCyan\u001b[49m \u001b[47mbgWhite\u001b[49m \u001b[100mbgGray\u001b[49m \u001b[101mbgRedBright\u001b[49m \u001b[102mbgGreenBright\u001b[49m \u001b[103mbgYellowBright\u001b[49m \u001b[104mbgBlueBright\u001b[49m \u001b[105mbgMagentaBright\u001b[49m \u001b[106mbgCyanBright\u001b[49m \u001b[107mbgWhiteBright\u001b[49m"

*/
