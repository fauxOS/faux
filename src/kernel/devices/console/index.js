function isEchoable(key) {
  switch (key) {
    // Arrow keys
    case "\x1b[A":
    case "\x1b[B":
    case "\x1b[C":
    case "\x1b[D":
      return false;
      break;
    default:
      return true;
  }
}

class Console {
  constructor(config = {}) {
    // This line buffer is used so that the user can edit
    // typing mistakes before the input is read by a program
    this.lineBuffer = [];
    // The string that will be returned on this.read()
    this.input = "";
    this.config = {
      // Whether this should be active at all.
      // If buffer is set false, line editing will be skipped
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

  // Clients should override this
  write(contents) {
    console.warn("Unhandled console write: " + contents);
  }

  // Takes the key pressed and decides what to do
  send(key, e) {
    // Handle input normally
    if (this.config.buffer) {
      this.handle(key);
    } else {
      // Without buffering, this is just a simple relay
      this.input += key;
    }
    // Echo input to the terminal so the user sees
    // what is being typed
    if (this.config.echo) {
      // Only echo if the key is echoable
      if (isEchoable(key)) {
        this.write(key);
      }
    }
  }

  // If the character is special, handle it.
  // If it is normal, just push it to the lineBuffer
  handle(key) {
    switch (key) {
      // Handle the DELETE sequence `^?` rather than backspace
      case "\x7f":
        this.backSpace();
        break;
      case "\r":
        this.enter();
        break;
      // Arrow keys
      case "\x1b[A":
      case "\x1b[B":
      case "\x1b[C":
      case "\x1b[D":
        this.arrow(key);
        break;
      default:
        // Normal character, just push it to the lineBuffer
        this.lineBuffer.push(key);
    }
  }

  // Discard last written character
  backSpace() {
    this.lineBuffer.pop();
    // Back one, overwrite with space, then back once more
    this.write("\b \b");
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
    this.write("\r\n");
  }

  // Handle direction changes
  arrow(key) {
    // Unimplemented
  }
}

export default new Console();
