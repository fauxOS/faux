import evaluate from "./evaluate.js";
import init from "./init.js";

addEventListener("consoleInput", async function({ detail }) {
  if (detail.buffered) {
    const input = await process.stdin.read();
    evaluate(input);
  }
});

init();
