// open()
faux.sys.open = function(process, msgID, args) {
  if (args.length !== 1) {
    const error = {
      status: "error",
      reason: "Should have only 1 argument",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else if (typeof args[0] !== "string") {
    const error = {
      status: "error",
      reason: "Argument should be a string",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else {
    const result = {
      status: "success",
      result: process.open(args[0]),
      id: msgID
    }
    process.worker.postMessage(result);
  }
}

// read()
faux.sys.read = function(process, msgID, args) {
  if (args.length !== 1) {
    const error = {
      status: "error",
      reason: "Should have only 1 argument",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else if (args[0] < 0) {
    const error = {
      status: "error",
      reason: "File Descriptor should be postive",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else {
    const result = {
      status: "success",
      result: process.fds[ args[0] ].read(),
      id: msgID
    }
    process.worker.postMessage(result);
  }
}

// write()
faux.sys.read = function(process, msgID, args) {
  if (args.length !== 2) {
    const error = {
      status: "error",
      reason: "Should have 2 arguments",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else if (args[0] < 0) {
    const error = {
      status: "error",
      reason: "File Descriptor should be postive",
      id: msgID
    };
    process.worker.postMessage(error);
  }
  else {
    const result = {
      status: "success",
      result: process.fds[ args[0] ].write( args[1] ),
      id: msgID
    }
    process.worker.postMessage(result);
  }
}
