import { DoublyLinkedList } from "./lists.js";

export default class LineBuffer {
  constructor(write, emit) {
    // Write function to write raw data to the terminal
    this.write = write || async function() {};
    // Emit function to emit input events
    this.emit = emit || function() {};
    // The current line's raw buffer is stored here.
    // This buffer allows line edition before the user
    // sends input to the program.
    this.buffer = new DoublyLinkedList();
    // Index of the cursor within the buffer
    this.cursorIndex = 0;
    // Input that hasn't been read yet, but is out of the buffer
    this.input = "";
  }

  // Return and clear the input buffer
  read() {
    const str = this.input;
    this.input = "";
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
        this.buffer.add(this.cursorIndex, key);
        this.cursorIndex++;
    }
  }

  cursorToStart() {
    // Make a string of backspaces for each character from the start to current position
    const backspaces = new Array(this.cursorIndex + 2).join("\b");
    // Print the backspaces so the cursor goes to the start
    this.write(backspaces);
    // Set cursor index to start
    this.cursorIndex = 0;
  }

  eraseToEnd() {
    // Make a string of spaces for each character from the current position to end
    const spaces = new Array(this.buffer.length - this.cursorIndex + 2).join(
      " "
    );
    // Print the spaces so the cursor goes to the end
    this.write(spaces);
    // Print backspaces to keep the cursor where it started
    this.write(spaces.replace(/ /g, "\b"));
  }

  // Replaces the visible line
  replaceTerminalLine(line) {
    this.cursorToStart();
    this.eraseToEnd();
    this.write(line);
    this.cursorIndex = line.length;
  }

  // Discard last written character
  backSpace() {
    // We can only delete characters in the buffer
    if (this.buffer.length > 0) {
      this.buffer.remove(this.cursorIndex - 1);
      this.cursorIndex--;
      this.replaceTerminalLine(this.buffer.toString());
    } else {
      return;
    }
  }

  // Save the last line and start a new one
  enter(shiftKey) {
    this.buffer.add(this.cursorIndex, "\n");

    // Stringify and push the buffer for reading
    this.input += this.buffer.toString();
    // Emit event sending input, while clearing the buffer
    this.emit("consoleInput", { buffered: true });
    // Reset the buffer
    this.buffer = new DoublyLinkedList();

    // Write out a line feed
    this.write("\n");
    this.cursorIndex = 0;
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
        if (!(this.cursorIndex === this.buffer.length)) {
          this.cursorIndex++;
          this.write(key);
        }
        break;
      case "\x1b[D": // Left
        detail.arrowLeft = true;
        if (!(this.cursorIndex === 0)) {
          this.cursorIndex--;
          this.write(key);
        }
        break;
      default:
        return;
    }
    // Even with buffered input, programs can listen for arrow keys
    this.emit("consoleInput", detail);
  }
}
