import * as sys from "./syscalls.js";

import browser from "../../misc/browser.js";

import * as path from "../../misc/path.js";
import { http } from "../../misc/utils.js";
import * as fs from "./fs/index.js";
import process from "./process/index.js";
import require from "./require.js";

import cli from "./cli/index.js";

// Copy all these imports to the global scope
Object.assign(self, {
  sys,

  browser,

  path,
  http,
  fs,
  process,
  require,

  cli
});

// Convenience globals
self.print = (...args) => process.stdout.write(args.join(" "));
self.println = (...args) => process.stdout.write(args.join(" ") + "\n");

// This transforms message events into native js events
addEventListener("message", message => {
  const msg = message.data;
  if (msg.type === "event" && msg.name && msg.detail) {
    // Fire the event natively
    const event = new CustomEvent(msg.name, { detail: msg.detail });
    dispatchEvent(event);
  }
});
