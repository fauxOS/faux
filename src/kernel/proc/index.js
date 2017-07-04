import Process from "./process.js";

class ProcessTable {
  constructor(init) {
    if (init === undefined) {
      throw new Error("Init process must be defined");
    }
    this.list = [null, init];
    this.nextPID = 2;
  }

  add(process) {
    this.nextPID = this.list.push(process);
    return this.nextPID - 1;
  }

  emit(name, payload, pids = []) {
    // Default empty array means all processes
    if (pids.length === 0) {
      for (let i = 1; i < this.list.length; i++) {
        // Post the message every process' webworker
        this.list[i].worker.postMessage({
          type: "event",
          name,
          payload
        });
      }
    } else {
      // Post the message to each process as specified by the pids array
      for (let i in pids) {
        this.list[pids[i]].worker.postMessage({
          type: "event",
          name,
          payload
        });
      }
    }
  }
}

export default new ProcessTable(new Process());
