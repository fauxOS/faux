const ansi = {
  reset: [0, 0],
  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],

  gray: [90, 39],
  grey: [90, 39],
  redBright: [91, 39],
  greenBright: [92, 39],
  yellowBright: [93, 39],
  blueBright: [94, 39],
  magentaBright: [95, 39],
  cyanBright: [96, 39],
  whiteBright: [97, 39],

  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],

  bgGray: [100, 49],
  bgGrey: [100, 49],
  bgRedBright: [101, 49],
  bgGreenBright: [102, 49],
  bgYellowBright: [103, 49],
  bgBlueBright: [104, 49],
  bgMagentaBright: [105, 49],
  bgCyanBright: [106, 49],
  bgWhiteBright: [107, 49]
};

function wrap(style, str) {
  return (
    "\u001b[" + ansi[style][0] + "m" + str + "\u001b[" + ansi[style][1] + "m"
  );
}

export default function dye(styles, str) {
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

  styles.push(dye(style, style));
});

console.log(styles.join(" "));

"\u001b[1mbold\u001b[22m \u001b[2mdim\u001b[22m \u001b[3mitalic\u001b[23m \u001b[4munderline\u001b[24m \u001b[7minverse\u001b[27m \u001b[9mstrikethrough\u001b[29m \u001b[30mblack\u001b[39m \u001b[31mred\u001b[39m \u001b[32mgreen\u001b[39m \u001b[33myellow\u001b[39m \u001b[34mblue\u001b[39m \u001b[35mmagenta\u001b[39m \u001b[36mcyan\u001b[39m \u001b[37mwhite\u001b[39m \u001b[90mgray\u001b[39m \u001b[91mredBright\u001b[39m \u001b[92mgreenBright\u001b[39m \u001b[93myellowBright\u001b[39m \u001b[94mblueBright\u001b[39m \u001b[95mmagentaBright\u001b[39m \u001b[96mcyanBright\u001b[39m \u001b[97mwhiteBright\u001b[39m \u001b[40mbgBlack\u001b[49m \u001b[41mbgRed\u001b[49m \u001b[42mbgGreen\u001b[49m \u001b[43mbgYellow\u001b[49m \u001b[44mbgBlue\u001b[49m \u001b[45mbgMagenta\u001b[49m \u001b[46mbgCyan\u001b[49m \u001b[47mbgWhite\u001b[49m \u001b[100mbgGray\u001b[49m \u001b[101mbgRedBright\u001b[49m \u001b[102mbgGreenBright\u001b[49m \u001b[103mbgYellowBright\u001b[49m \u001b[104mbgBlueBright\u001b[49m \u001b[105mbgMagentaBright\u001b[49m \u001b[106mbgCyanBright\u001b[49m \u001b[107mbgWhiteBright\u001b[49m"

*/
