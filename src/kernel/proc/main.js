import Process from "./process.js";
import flags from "../../misc/flags.js";

class ProcessTable {
  constructor(init) {
    if (init == null) {
      throw new Error("Init process must be defined");
    }
    this.list = [ init ];
    this.nextPID = 1;
  }

  add(process) {
    return this.nextPID = this.list.push(process);
  }
}

export default new ProcessTable((function() {
if (flags.isBrowser) {
  return new Process();
}
else {
  return -1;
}
}));