import console from "./index.js";
import normalize from "./normalize.js";

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
    const key = normalize(e);
    if (this.config.raw) {
      // Raw mode just appends the key
      this.input += key;
    } else if (key === "\b") {
      this.lineBuffer = this.lineBuffer.slice(0, -1);
      // Back one, overwrite with space, then back once more
      console.write("\b \b");
    } else if (key === "\n") {
      this.lineBuffer.push("\n");
      // Allow reading the current line
      const line = this.lineBuffer.join("");
      this.input += line;
      // Clear this.lineBuffer
      this.lineBuffer = [];
      // Carriage return and line feed
      console.write("\r\n");
    } else {
      // All other printable keys
      if (this.config.echo) {
        console.write(key);
      }
      this.lineBuffer.push(key);
    }
  }

  // Clear and return this.input
  read() {
    const ret = this.input;
    this.input = "";
    return ret;
  }
}
