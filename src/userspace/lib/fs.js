const fs = {};

fs.readFile = function(path = "/") {
  return open(path, "r").then(fd => {
    return read(fd);
  });
};

fs.writeFile = function(path = "/", data = "") {
  return open(path, "w").then(fd => {
    return write(fd, data);
  });
}

export default fs;