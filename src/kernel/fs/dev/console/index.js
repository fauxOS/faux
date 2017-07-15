import Termios from "./termios.js";

class Console {
  constructor() {
    this.termios = new Termios();
  }

  // Relay reads through termios
  read() {
    return this.termios.read();
  }

  // Clients should override this
  write(contents) {
    console.log("Unhandled console write: " + contents);
  }
}

export default new Console();
