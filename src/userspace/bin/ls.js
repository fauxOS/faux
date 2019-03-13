export default ls;

const ls = ([name, ...args]) =>
  sys
    .open(args[0] || "./")
    .then(fd => sys.readDirectory(fd))
    .then(contents => contents.join(" "))
    .then(println)
    .catch(err => println(cli.colorize("red", err.toString())));

ls(argv).then(() => sys.exit());
