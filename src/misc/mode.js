export default function getMode(mode = "r") {
  const map = {
    r: {
      read: true,
      write: false,
      truncate: false,
      create: false,
      append: false
    },
    "r+": {
      read: true,
      write: true,
      truncate: false,
      create: false,
      append: false
    },
    w: {
      read: false,
      write: true,
      truncate: true,
      create: true,
      append: false
    },
    "w+": {
      read: true,
      write: true,
      truncate: true,
      create: true,
      append: false
    },
    a: {
      read: false,
      write: true,
      truncate: false,
      create: true,
      append: true
    },
    "a+": {
      read: true,
      write: true,
      truncate: false,
      create: true,
      append: true
    }
  };
  return map[mode];
}
