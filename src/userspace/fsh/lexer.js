// Eventually, this should be a complete
// lexer, but for now, it basically just does a whitespace split...

// Just deal with a single line
function tokenizeLine(line = "") {
  // Split line but don't strip anything
  const tokens = line
    .match(/(["'])(?:\\|.)+\1|((?:[^\\\s]|\\.)*)/g)
    .filter(String);
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    // Unescape all backlashes
    // 'escaped\ string\;' > 'escaped string;'
    tokens[i] = token.replace(/\\(?=.)/g, "");
    // Strip off wrapper double and single quotes
    // '"string"' > "string"
    if (token.match(/^["'].+(\1)$/m)) {
      tokens[i] = /^(["'])(.+)(\1)$/gm.exec(token)[2];
    }
  }
  return tokens;
}

// Split by semicolons and then tokenize each line
export default function lex(input = "") {
  // Split by unescaped semicolons
  return input.match(/(\\;|[^;])+/g)
    .map(tokenizeLine)
}

/* Test with this

lex(`some\\ spaces\\ here should not "matter \\; 'at all'";
./command one; two | piped | over > here;
false || true && echo "anything\\"\\ "`);

*/
