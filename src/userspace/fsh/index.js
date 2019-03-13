import evaluate from "./evaluate.js";
import prompt from "./prompt.js";

addEventListener(
  "consoleInput",
  ({ detail }) => (detail.buffered ? process.stdin.read().then(evaluate) : null)
);

prompt();
