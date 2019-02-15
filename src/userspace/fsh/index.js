import evaluate from "./evaluate.js";
import prompt from "./prompt.js";

addEventListener("consoleInput", async function({ detail }) {
  if (detail.buffered) {
    const input = await process.stdin.read();
    evaluate(input);
  }
});

prompt();
