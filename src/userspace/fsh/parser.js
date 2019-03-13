// For now, all commands are simple
// No pipes/redirection/anything else

import lex from "./lexer.js";

function parseCommand(tokens) {
  return {
    type: "simple",
    argv: tokens,
    name: tokens[0]
  };
}

export default function parse(input = "") {
  const AST = {
    type: "script",
    commands: []
  };
  const commands = lex(input);
  // Parse the tokenized commands
  for (let i in commands) {
    const parsed = parseCommand(commands[i]);
    AST.commands[i] = parsed;
  }
  return AST;
}
