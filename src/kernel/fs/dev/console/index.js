class Console {
  constructor() {
    // The element to listen to
    this.inputElement = null;
    // Stores keyCodes emitted by this.inputElement
    this.keyBuffer = [];
    // The function used to push events to the keyBuffer
    this.listener = e => this.keyBuffer.push(e.keyCode);
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

  // Return an array of KeyboardEvent.keyCodes stored in this.keyBuffer, then empty it
  read() {
    const ret = Object.assign([], this.keyBuffer);
    this.keyBuffer = [];
    return ret;
  }

  // Clients should override this
  write(contents) {
    console.log("Unhandled console write: " + contents);
  }
}

export default new Console();
