const esc = "\u001b[";

export default {
  cursor: {
    move: {
      to: (x = 1, y = 1) => esc + x + ";" + y + "H",
      up: (n = 1) => esc + n + "A",
      down: (n = 1) => esc + n + "B",
      right: (n = 1) => esc + n + "C",
      left: (n = 1) => esc + n + "D",
      nextLine: () => esc + "E",
      prevLine: () => esc + "F",
      leftMost: () => esc + "G"
    },
    hide: () => esc + "?25l",
    show: () => esc + "?25h",
    savePosition: () => esc + "s",
    restorePosition: () => esc + "u"
  },
  line: {
    eraseEnd: () => esc + "K",
    eraseStart: () => esc + "1K",
    erase: () => esc + "2K"
  },
  screen: {
    eraseDown: () => esc + "J",
    eraseUp: () => esc + "1J",
    erase: () => esc + "2J",
    clear: () => "\u001bc",
    scrollUp: (n = 1) => esc + n + "S",
    scrollDown: (n = 1) => esc + n + "T"
  },
  beep: () => "\u0007"
};
