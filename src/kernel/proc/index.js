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

  emit(name, detail, pids = Object.keys(this.list)) {
    // Post the message to each process as specified by the pids array
    for (let i in pids) {
      const pid = pids[i];
      // Post the message every process' webworker
      this.list[pid].worker.postMessage({
        type: "event",
        name,
        detail
      });
    }
  }
}

export default new ProcessTable();
