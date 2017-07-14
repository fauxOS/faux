import Termios from "./termios.js";

export default class Listener {
  constructor(termios = new Termios()) {
    this.termios = termios;
    // The element to listen to
    this.inputElement = null;
    // The function used to push events to the keyBuffer
    this.listener = e => this.termios.handleEvent(e);
  }

  // Attach to an element and listen to its keydown events
  attachTo(inputElement = document.querySelector("#terminal")) {
    if (!inputElement) {
      throw new Error("No element to attach to");
    }
    // Remove listener from previous inputElement
    if (this.inputElement) {
      this.inputElement.removeEventListener("keydown", this.listener);
    }
    // Add the event listener
    this.inputElement = inputElement;
    this.inputElement.addEventListener("keydown", this.listener);
  }
}
