# Userspace

A userspace process, because it runs as a web worker, has no access to `window`, the DOM, or the kernel.
This isolation is required for the kernel because a misbehaving program should never be able to modify anything.
The only problem is that programs need access to kernel functions. This is solved with a system call interface.

Usually, there are a lot of extra details in working with raw system calls, and they are difficult to corridinate.
This is why libraries, like glibc, are used. Faux uses `/lib/lib.js` the way unix uses the c standard library.

On build, each of these programs and libraries will each be compiled seperately, then injected as strings
into their required inodes on the default disk.
