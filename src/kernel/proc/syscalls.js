import proc from "./main.js";
import Process from "./process.js";

const sys = {};

// Raise an error
sys.fail = function(process, msgID, args) {
  const error = {
    status: "error",
    reason: args[0],
    id: msgID
  };
  process.worker.postMessage(error);
}

// Throw a success result
sys.pass = function(process, msgID, args) {
  const result = {
    status: "success",
    result: args[0],
    id: msgID
  };
  process.worker.postMessage(result);
}

// Send a dynamic library straight to the process
sys.loadLib = function(process, msgID, args) {
  const data = process.loadLib( args[0] );
  sys.pass(process, msgID, [data]);
}


// Spawn a new process from an executable image
sys.spawn = function(process, msgID, args) {
  if (args.length !== 1) {
    sys.fail(process, msgID, ["Should have only 1 argument"]);
  }
  else {
    const newProcess = new Process(args[0]);
    const pid = proc.add( newProcess );
    sys.pass(process, msgID, [pid]);
  }
}

// Resolve a path into a file descriptor, and add it to the table
sys.open = function(process, msgID, args) {
  if (args.length !== 1) {
    sys.fail(process, msgID, ["Should have only 1 argument"]);
  }
  if (typeof args[0] !== "string") {
    sys.fail(process, msgID, ["Argument should be a string"]);
  }
  let path = "";
  // If the first character is a "/", then working dir does not matter
  if (args[0][0] === "/") {
    path = args[0];
  }
  else {
    path = process.cwd + "/" + args[0];
  }
  const result = process.open(path);
  sys.pass(process, msgID, [result]);
}

// Read data from a file descriptor
sys.read = function(process, msgID, args) {
  if (args.length !== 1) {
    sys.fail(process, msgID, ["Should have only 1 argument"]);
  }
  if (args[0] < 0) {
    sys.fail(process, msgID, ["File Descriptor should be postive"]);
  }
  const result = process.fds[ args[0] ].read();
  sys.pass(process, msgID, [result]);
}

// Write data to a file descriptor
sys.write = function(process, msgID, args) {
  if (args.length !== 2) {
    sys.fail(process, msgID, ["Should have 2 arguments"]);
  }
  if (args[0] < 0) {
    sys.fail(process, msgID, ["File Descriptor should be postive"]);
  }
  const result = process.fds[ args[0] ].write( args[1] );
  sys.pass(process, msgID, [result]);
}

// Change the current working directory
sys.chdir = function(process, msgID, args) {
  if (! args[0] instanceof String) {
    sys.fail(process, msgID, ["Argument should be a string"]);
  }
  process.cwd = args[0];
  sys.pass(process, msgID, [ process.cwd ]);
}

// Get environment variable
sys.getenv = function(process, msgID, args) {
  if (! args[0] instanceof String) {
    sys.fail(process, msgID, ["Variable name should be a string"]);
  }
  const value = process.env[ args[0] ];
  sys.pass(process, msgID, [ value ]);
}

// Set environment variable
sys.setenv = function(process, msgID, args) {
  if (! args[0] instanceof String) {
    sys.fail(process, msgID, ["Variable name should be a string"]);
  }
  if (! args[1] instanceof String) {
    sys.fail(process, msgID, ["Variable value should be a string"]);
  }
  const value = process.env[ args[0] ] = args[1];
  sys.pass(process, msgID, [ value ]);
}

export default sys;
