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
      // Whether termios should be active at all.
      // If this is set false, termios won't buffer and allow line editing
      buffer: true,
      // When a user types, should they see their input?
      // Setting this false is useful for e.g. password input
      echo: true
    };
    Object.assign(this.config, config);
  }

  // Clear and return this.input
  read() {
    const ret = this.input;
    this.input = "";
    return ret;
  }

  // Takes a KeyboardEvent and decides what to do
  send(e) {
    const { which } = e;
    const char = String.fromCharCode(which);
    // Handle input normally
    if (this.config.buffer) {
      this.handle(char);
    } else {
      // Without buffering, this is just a simple relay
      this.input += char;
    }
    // Echo input to the terminal so the user sees
    // what is being typed
    if (this.config.echo) {
      console.write(char);
    }
  }

  // If the character is special, handle it.
  // If it is normal, just push it to the lineBuffer
  handle(char) {
    if (char === "\b") {
      this.backSpace();
    } else if (char === "\r") {
      this.enter();
    } else {
      // Normal character, just push it to the lineBuffer
      this.lineBuffer.push(char);
    }
  }

  // Discard last written character
  backSpace() {
    this.lineBuffer.pop();
    // Back one, overwrite with space, then back once more
    console.write("\b \b");
  }

  // Save the last line and start a new one
  enter(shiftKey) {
    this.lineBuffer.push("\n");

    // Push the lineBuffer away
    const line = this.lineBuffer.join("");
    this.input += line;
    // Clear the lineBuffer
    this.lineBuffer = [];

    // Carriage return and line feed
    console.write("\r\n");
  }
}
