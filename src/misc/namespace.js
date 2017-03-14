// The kernel object

const faux = {
  name: "faux",
  processTable: [],
  fileTable: [],
  sys: {},
  fs: undefined,
  flags: {},
  utils: {}
};

// Node export
if (typeof module !== "undefined") {
  module.exports = faux;
}