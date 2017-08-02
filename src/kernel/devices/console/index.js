import proc from "../../proc/index.js";
import LineBuffer from "../../../misc/linebuffer.js";

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
    // Bind the functions before passing them to LineBuffer
    this.write.bind(this);
    proc.emit.bind(proc);
    // This line buffer is used so that the user can edit
    // typing mistakes before the input is read by a program
    this.lineBuffer = new LineBuffer(this.write, proc.emit);
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

  read() {
    return this.lineBuffer.read();
  }

  // Raw terminal write function that terminal emulators override
  writeRaw(str) {
    console.warn(`Unhandled console write: ${contents}`);
  }

  // Add a carriage-return to each line-feed, as terminal emulators require it
  write(contents) {
    return this.writeRaw(contents.replace(/\n/g, "\r\n"));
  }

  // Takes a key and decides what to do
  handle(key) {
    // Pass the key to the line buffer
    if (this.config.buffer) {
      this.lineBuffer.handle(key);
    } else {
      // Just emit a raw input event to userspace
      proc.emit("consoleInput", { raw: true });
    }
    // Echo input to the terminal so the user sees
    // what is being typed
    if (this.config.echo) {
      // Only echo if the key is echoable
      if (isEchoable(key)) {
        this.writeRaw(key);
      }
    }
  }
}

export default new Console();
