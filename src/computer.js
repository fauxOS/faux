// The global kernel object
window.faux = {
  name: "faux",
  fs: new VFS( new Disk ),
  processTable: {},
  fileTable: {},
  sys: {}
};