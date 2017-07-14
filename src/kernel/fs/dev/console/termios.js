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
    const code = e.which;
    if (this.config.echo) {
      console.write(code);
    }
    if (this.config.raw) {
      // Enter key pressed
      if (this.code === 13) {
        const line = this.lineBuffer.join("") + "\r\n";
        this.input += line;
        return;
      }
      this.lineBuffer.push(code);
    } else {
      this.input += code;
    }
  }

  // Clear and return this.input
  read() {
    const ret = this.input;
    this.input = "";
    return ret;
  }
}
