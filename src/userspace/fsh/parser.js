// For now, all commands are simple
// No pipes/redirection/anything else

import lex from "./lexer.js";

function parseCommand(tokens) {
  const command = {
    type: "simple"
  };
  command.argv = tokens;
  command.argc = tokens.length;
  command.name = tokens[0];
  return command;
}

export default function parse(input = "") {
  const AST = {
    type: "script",
    commands: []
  };
  const commands = lex(input);
  // Parse the tokenized commands
  for (let i = 0; i < commands.length; i++) {
    let parsed = parseCommand(commands[i]);
    AST.commands[i] = parsed;
  }
  return AST;
}
