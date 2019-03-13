import Process from "./process.js";

class ProcessTable {
  constructor(init) {
    if (!init instanceof Process) {
      throw new Error("Init process is invalid");
    }
    this.list = [init];
  }

  add(process) {
    return this.list.push(process) - 1;
  }

  // Emit an event to each specified process
  emit(name, detail, pids = Object.keys(this.list)) {
    pids.map(pid =>
      this.list[pid].worker.postMessage({
        type: "event",
        name,
        detail
      })
    );
  }
}

const init = new Process("inject-init");
export default new ProcessTable(init);
