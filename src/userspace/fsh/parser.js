import lex from "./lexer.js";

export default function parse(input="") {
  const tokens = lex(input);
  const AST = {
    type: "script",
    commands: []
  };
  let line = 0;
  // Go through the tokens and add to AST
  for (let i=0; i < tokens.length; i++) {
    let token = tokens[i];
    
  }
  return AST;
}
