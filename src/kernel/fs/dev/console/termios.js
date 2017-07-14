import console from "./index.js";

export default class Termios {
  constructor(config = {}) {
    // This line buffer is used so that the user can edit
    // typing mistakes before the input is read by a program
    this.lineBuffer = [];
    // The string that will be returned on this.read()
    this.input = "";
    // Here is the termios configuration
    this.config = {
      // Whether termios should be active at all
      // If this is true, termios will relay
      // characters without buffering them
      raw: false,
      // When a user types, should they see their input?
      // Setting this false is useful for e.g. password input
      echo: true
    };
    Object.assign(this.config, config);
  }

  // Takes a KeyboardEvent and decides what to do
  handleEvent(e) {
    let { key } = e;
    if (key === "Backspace") {
      this.lineBuffer = this.lineBuffer.slice(0, -1);
      // Back one, overwrite with space, then back once more
      console.write("\b \b");
      this.push("\b");
    } else if (key === "Enter") {
      // Allow reading the current line
      const line = this.lineBuffer.join("") + "\r\n";
      this.input += line;
      this.push("\n");
      // Clear this.lineBuffer
      this.lineBuffer = [];
    } else if (key === "Shift") {
    } else if (key === "Control") {
    } else if (key === "Alt") {
    } else if (key === "Meta") {
    } else if (key === "ArrowUp") {
    } else if (key === "ArrowDown") {
    } else if (key === "ArrowLeft") {
    } else if (key === "ArrowRight") {
    } else {
      this.push(key);
    }
  }

  push(key) {
    if (this.config.echo) {
      console.write(key);
    }
    if (!this.config.raw) {
      this.lineBuffer.push(key);
    } else {
      // Raw mode just appends the key
      this.input += key;
    }
  }

  // Clear and return this.input
  read() {
    const ret = this.input;
    this.input = "";
    return ret;
  }
}
