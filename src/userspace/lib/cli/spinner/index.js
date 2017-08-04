import * as spinners from "./spinners.js";

export default class Spinner {
  constructor(name = "circle") {
    const spinner = spinners[name];
    this.frames = spinner.frames;
    this.index = 0;
    this.interval = Math.round(1000 / spinner.fps);
    this.setIntervalIndex = null;
  }

  next() {
    this.index++;
    const realIndex = (this.index - 1) % this.frames.length;
    return this.frames[realIndex];
  }

  start(outputFunction) {
    outputFunction = outputFunction || (str => process.stdout.write(str));
    this.setIntervalIndex = setInterval(() => {
      let frame = this.next();
      let clearFrame = frame.replace(/./g, "\b");
      outputFunction(clearFrame);
      outputFunction(frame);
    }, this.interval);
  }

  stop() {
    clearInterval(this.setIntervalIndex);
  }
}
