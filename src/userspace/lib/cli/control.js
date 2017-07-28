const esc = "\x1b";
const beep = "\x07";

export const cursor = {
  move: {
    to: (x = 1, y = 1) => esc + "[" + x + ";" + y + "H",
    up: (n = 1) => esc + "[" + n + "A",
    down: (n = 1) => esc + "[" + n + "B",
    right: (n = 1) => esc + "[" + n + "C",
    left: (n = 1) => esc + "[" + n + "D",
    nextLine: () => esc + "[E",
    prevLine: () => esc + "[F",
    leftMost: () => esc + "[G"
  },
  hide: () => esc + "[?25l",
  show: () => esc + "[?25h",
  shape: {
    block: () => esc + "]50;CursorShape=0" + beep,
    bar: () => esc + "]50;CursorShape=1" + beep,
    underscore: () => esc + "50;CursorShape=2" + beep
  },
  savePosition: () => esc + "[s",
  restorePosition: () => esc + "[u"
};

export const line = {
  eraseEnd: () => esc + "[K",
  eraseStart: () => esc + "[1K",
  erase: () => esc + "[2K"
};

export const screen = {
  eraseDown: () => esc + "[J",
  eraseUp: () => esc + "[1J",
  erase: () => esc + "[2J",
  clear: () => esc + "c",
  scrollUp: (n = 1) => esc + "[" + n + "S",
  scrollDown: (n = 1) => esc + "[" + n + "T"
};

export const misc = {
  beep: () => beep,
  setTitle: str => esc + "]0;" + str + beep
};
