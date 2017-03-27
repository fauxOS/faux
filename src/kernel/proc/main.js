import Process from "./process.js";

class ProcessTable {
  constructor(init) {
    if (init === undefined) {
      throw new Error("Init process must be defined");
    }
    this.list = [ null, init ];
    this.nextPID = 2;
  }

  add(process) {
    this.nextPID = this.list.push(process);
    return this.nextPID - 1;
  }
}

export default new ProcessTable( new Process() );