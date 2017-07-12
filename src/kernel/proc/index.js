import Process from "./process.js";

class ProcessTable {
  constructor(init = new Process()) {
    if (!init instanceof Process) {
      throw new Error("Init process is invalid");
    }
    this.list = [init];
  }

  add(process) {
    return this.list.push(process) - 1;
  }

  emit(name, detail, pids = []) {
    // Default empty array means all processes
    if (pids.length === 0) {
      for (let i in this.list) {
        // Post the message every process' webworker
        this.list[i].worker.postMessage({
          type: "event",
          name,
          detail
        });
      }
    } else {
      // Post the message to each process as specified by the pids array
      for (let i in pids) {
        const pid = pids[i];
        this.list[pid].worker.postMessage({
          type: "event",
          name,
          detail
        });
      }
    }
  }
}

export default new ProcessTable();
