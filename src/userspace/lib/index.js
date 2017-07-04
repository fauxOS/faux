import sys from "./syscalls.js";

import Pathname from "../../misc/pathname.js";
import fs from "./fs/index.js";
import process from "./process/index.js";

import cli from "./cli/index.js";

// Copy all these imports to the global scope
Object.assign(self, {
  sys,

  Pathname,
  fs,
  process,

  cli
});

// This transforms message events into native js events
addEventListener("message", message => {
  const msg = message.data;
  if (msg.type === "event" && msg.name && msg.payload) {
    // Fire the event natively
    const event = new CustomEvent(msg.name, msg.payload);
    dispatchEvent(event);
  }
});
