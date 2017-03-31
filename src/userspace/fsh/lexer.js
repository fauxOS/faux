// Eventually, this should be a complete
// lexer, but for now, it basically just does a whitespace split...

// Just deal with a single line
function tokenizeLine(line="") {
  // Split line but don't strip anything
  const tokens = line
            /* quoted strings *//*  "\" escape  */
    .match( /(["'])(?:\\|.)+\1|((?:[^\\\s]|\\.)*)/g )
    .filter(String);
  for (let i=0; i < tokens.length; i++) {
    let token = tokens[i];
    // Unescape all backlashes
    // 'escaped\ string\;' > 'escaped string;'
    tokens[i] = token.replace(/\\(?=.)/g, "");
    // Strip off wrapper double and single quotes
    // '"string"' > "string"
    if ( token.match(/^["'].+(\1)$/m) ) {
      tokens[i] = ( /^(["'])(.+)(\1)$/gm ).exec(token)[2];
    }
  }
  return tokens;
}

// Split by semicolons and then tokenize each line
export default function lex(input="") {
  const allTokens = [];
  // Split by unescaped semicolons
  const lines = input.match( /(\\;|[^;])+/g );
  for (let i=0; i < lines.length; i++) {
    let tokens = tokenizeLine( lines[i] );
    allTokens.push( tokens );
  }
  return allTokens;
}

/* Test with this

lex(`some\\ spaces\\ here should not "matter \\; 'at all'";
./command one; two | piped | over > here;
false || true && echo "anything\\"\\ "`);

*/