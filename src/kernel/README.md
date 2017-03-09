# Kernel

The faux kernel is isolated from userspace, and controls it by manipulating processes.
When a process makes a system call, it really is just a formatted message from a web worker.
This kernel will listen for the calls, and decide how to process their requests, by either
sending an error message, manipulating kernel space, and/or working with the DOM.