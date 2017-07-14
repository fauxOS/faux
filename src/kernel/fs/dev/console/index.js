import Listener from "./listener.js";
import Termios from "./termios.js";

class Console {
  constructor() {
    this.termios = new Termios();
    this.listener = new Listener(this.termios);
    // Relay reads through termios
    this.read = this.termios.read;
  }

  // Clients should override this
  write(contents) {
    console.log("Unhandled console write: " + contents);
  }
}

export default new Console();
