// The global kernel object

// Node compatability is limited to namespace only!
// Features required by the kernel and implemented in JavaScript
// itself may or may not work on systems that are not the browser.
if (typeof window === "undefined") {
  global.window = global;
}

window.faux = {
  name: "faux",
  processTable: [],
  fileTable: [],
  sys: {},
  fs: undefined
};