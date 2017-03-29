// Eventually, this should be a complete
// lexer, but for now, it just does a whitespace split...

export default function lex(input="") {
  return input.split( /[\s]+/ig );
}
