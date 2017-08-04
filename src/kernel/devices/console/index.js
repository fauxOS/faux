import proc from "../../proc/index.js";
import LineBuffer from "../../../misc/linebuffer.js";

class Console {
  constructor(config = {}) {
    // This line buffer is used so that the user can edit
    // typing mistakes before the input is read by a program
    this.lineBuffer = new LineBuffer(
      // Bind the functions before passing them to LineBuffer.
      this.write.bind(this),
      proc.emit.bind(proc)
    );
    this.config = {
      // Whether this should be active at all.
      // If buffer is set false, line editing will be skipped
      buffer: true
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
  }
}

export default new Console();
