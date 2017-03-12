// Raise an error
faux.sys.fail = function(process, msgID, args) {
  const error = {
    status: "error",
    reason: args[0],
    id: msgID
  };
  process.worker.postMessage(error);
}

// Throw a success result
faux.sys.pass = function(process, msgID, args) {
  const result = {
    status: "success",
    result: args[0],
    id: msgID
  };
  process.worker.postMessage(result);
}

// Spawn a new process from an executable image
faux.sys.spawn = function(process, msgID, args) {
  if (args.length !== 1) {
    faux.sys.fail(process, msgID, ["Should have only 1 argument"]);
  }
  else {
    const newProcess = new Process(args[0]);
    const pid = faux.processTable.length;
    faux.processTable.push( newProcess );
    faux.sys.pass(process, msgID, [pid]);
  }
}

// Resolve a path into a file descriptor, and add it to the table
faux.sys.open = function(process, msgID, args) {
  if (args.length !== 1) {
    faux.sys.fail(process, msgID, ["Should have only 1 argument"]);
  }
  else if (typeof args[0] !== "string") {
    faux.sys.fail(process, msgID, ["Argument should be a string"]);
  }
  else {
    const result = process.open(args[0]);
    faux.sys.pass(process, msgID, [result]);
  }
}

// Read data from a file descriptor
faux.sys.read = function(process, msgID, args) {
  if (args.length !== 1) {
    faux.sys.fail(process, msgID, ["Should have only 1 argument"]);
  }
  else if (args[0] < 0) {
    faux.sys.fail(process, msgID, ["File Descriptor should be postive"]);
  }
  else {
    const result = process.fds[ args[0] ].read();
    faux.sys.pass(process, msgID, [result]);
  }
}

// Write data to a file descriptor
faux.sys.write = function(process, msgID, args) {
  if (args.length !== 2) {
    faux.sys.fail(process, msgID, ["Should have 2 arguments"]);
  }
  else if (args[0] < 0) {
    faux.sys.fail(process, msgID, ["File Descriptor should be postive"]);
  }
  else {
    const result = process.fds[ args[0] ].write( args[1] );
    faux.sys.pass(process, msgID, [result]);
  }
}