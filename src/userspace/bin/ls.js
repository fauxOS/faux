export default async function ls(path = "./") {
  const fd = await sys.open(path);
  const contents = await sys.readdir(fd);
  let formatted = contents.join("  ");
  await println(formatted);
  return contents;
}

// Don't implement switches, flags, and all that yet
try {
  ls(argv[0]);
} catch (err) {
  println(cli.colorize("red", err));
}
