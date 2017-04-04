# Userspace

A userspace process, because it runs as a web worker, has no access to `window`, the DOM, or the kernel.
This isolation is required for the kernel because a misbehaving program should never be able to modify anything.
The only problem is that programs need access to kernel functions. This is solved with a system call interface.

Usually, there are a lot of extra details in working with raw system calls, and they are difficult to corridinate, especially because each one is made asynchronously.
This is why libraries, like glibc, are used. Faux uses `/lib/lib.js` the way unix uses the c standard library.

On build, each of these programs and libraries will each be compiled separately, then injected as strings
into their required inodes on the default disk.

# Library usage

`lib.js` massively simplifies working with the kernel. Any given program is just normal javascript, without DOM
access. An example of what an executable looks like, with the `open()` system call, is shown without library use
below.

```javascript
// open() without lib.js

self.postMessage({
  type: "syscall",
  name: "open",
  args: ["/home/.fshrc"],
  id: 1
});

self.onmessage = function(msg) {
  if (msg.data.id == 1) {
    var fd = msg.data.result;
    callback(fd);
  }
}

var callback = console.log;
```

## Promises

Writing any program like this would be outrageous, so the messaging system was abstracted away completely.
This library prefers promises, so that it is easy to chain operations and system calls. Below
is the same `open()`, but cleaned up and with error handling.

```javascript
// open() with lib.js

open("/home/.fshrc").then(console.log);

// Error handling is easy too, replace `console.warn`

open(null).then(console.log).catch(console.warn);
```

## Async / Await

Even promises can be a pain to deal with in some cases. Async/await is a new es7 feature that can
be used in these situations.

```javascript
async function foo() {
  const bar = await returnsSomePromise();
  const baz = thisLooksSynchronous(bar);
  return baz;
}
```

Read more about it [on MDN.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

# DOM Traversal through `/dev/dom`

One of the really neat features that UNIX introduced was the concept of "everything is a file".
This concept was borrowed by faux and applied to many of the I/O layers. The DOM being no exception,
you are free to traverse it with common utilities, view and edit element values, add and remove elements, etc.

Here is an example, you can quickly see the ease of use.

```javascript
// Each directory/file in the path is a css selector
// But, you can also use a number to get an element by its number
// The index begins at 1, so the path could be /dev/dom/1/title
open("/dev/dom/head/title").then(fd => {
  write(fd, "Everything is a file");
});
```
