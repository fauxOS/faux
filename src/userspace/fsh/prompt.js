export default (str, color = "gray") =>
  sys
    .currentDirectory()
    .then(cwd => cli.colorize(color, str || `faux:${cwd} # `))
    .then(print);
