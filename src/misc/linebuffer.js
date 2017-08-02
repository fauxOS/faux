export default class LineBuffer {
  constructor(write, emit) {
    // Write function to write raw data to the terminal
    this.write = write || async function() {};
    // Emit function to emit input events
    this.emit = emit || function() {};
    // The current line's raw buffer is stored here.
    // This buffer allows line edition before the user
    // sends input to the program.
    this.buffer = [];
  }

  // Return and clear the input buffer
  read() {
    const str = this.buffer.join("");
    this.buffer = [];
    return str;
  }

  // If the character is special, handle it.
  // If it is normal, just push it to the lineBuffer
  handle(key) {
    switch (key) {
      // Handle the DELETE sequence `^?` rather than standard backspace.
      // For whatever reason, this method is actually more common
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
        // Just push every other character to the buffer
        this.buffer.push(key);
    }
  }

  // Discard last written character
  backSpace() {
    // We can only delete characters in the buffer
    if (this.buffer.length > 0) {
      this.buffer.pop();
      // Back one, overwrite with space, then back once more
      this.write("\b \b");
    } else {
      return;
    }
  }

  // Save the last line and start a new one
  enter(shiftKey) {
    this.buffer.push("\n");

    // Stringify and push the buffer for reading
    this.input += this.buffer.join("");
    // Emit event sending input, while clearing the buffer
    this.emit("consoleInput", { buffered: true });
    // Reset the buffer
    this.buffer = [];

    // Write out a line feed
    this.write("\n");
  }

  // Handle direction changes
  arrow(key) {
    const detail = {};
    switch (key) {
      case "\x1b[A": // Up
        detail.arrowUp = true;
        break;
      case "\x1b[B": // Down
        detail.arrowDown = true;
        break;
      case "\x1b[C": // Right
        detail.arrowRight = true;
        break;
      case "\x1b[D": // Left
        detail.arrowLeft = true;
        break;
      default:
        return;
    }
    // Even with buffered input, programs can listen for arrow keys
    this.emit("consoleInput", detail);
  }
}
