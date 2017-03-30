// Eventually, this should be a complete
// lexer, but for now, it basically just does a whitespace split...

function split(input="") {
  return input
    .split( /(?:[^\\])(;)/g );
}

function lex(line="") {
  const tokens = line
    .match( /(["'])([^\1\\])*?\1|((?:[^\\\s;]|\\.)*)/g )
    .filter(String);
  for (let i=0; i < tokens.length; i++) {
    let token = tokens[i];
    tokens[i] = token.replace(/\\(?=.)/g, "");
    if ( token.match(/^["'].+(\1)$/m) ) {
      tokens[i] = ( /^(["'])(.+)(\1)$/gm ).exec(token)[2];
    }
  }
  return tokens;
}

function parse(input="") {
  const allTokens = [];
  const lines = split(input);
  for (let i in lines) {
    let tokens = lex( lines[i] );
    allTokens.push( tokens );
  }
  return allTokens;
}

/* Test against this block

some\ spaces\ here should not "matter 'at all'";
./command one; two | piped | over > here;
false || true && echo "anything\"\ ";

*/
