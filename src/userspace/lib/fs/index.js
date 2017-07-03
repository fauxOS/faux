export default {
  readFile(path = "/") {
    return sys.open(path, "r").then(fd => {
      return sys.read(fd);
    });
  },

  writeFile(path = "/", data = "") {
    return sys.open(path, "w").then(fd => {
      return sys.write(fd, data);
    });
  }
};
