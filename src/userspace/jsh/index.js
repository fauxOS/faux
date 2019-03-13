import evaluate from "./evaluate.js";
import prompt from "./prompt.js";

addEventListener(
  "consoleInput",
  ({ detail }) => (detail.buffered ? process.stdin.read().then(evaluate) : null)
);

// prettier-ignore
println(`Welcome to Faux's ${cli.colorize("bold", "J")}avascript ${cli.colorize("bold", "SH")}ell!\n`)
  .then(() => prompt());
