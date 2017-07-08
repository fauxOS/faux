export async function readFile(path = "/") {
  const fd = await sys.open(path, "r");
  return sys.read(fd);
}

export async function writeFile(path = "/", data = "") {
  const fd = await sys.open(path, "w");
  return sys.write(fd, data);
}
