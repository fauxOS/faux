# Userspace

A userspace process has no access to the `window` global, the DOM, or the faux kernel.
This is good for the kernel because it expects to not be modified by a misbehaving program.
But still, programs need access to kernel functions. This is solved with a system call interface.

Due to their targeted nature, there are a lot of extra details in working with raw system calls, so
we need libraries, like glibc on linux. The FauxOS equivalent is called, quite
plainly, [`lib.js`](https://raw.githubusercontent.com/fauxOS/fauxOS/master/build/userspace/lib.js).


On build, each of these programs and libraries will each be compiled seperately, then injected as strings into their required inodes on the default disk.