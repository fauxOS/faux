/*
 * From https://www.quora.com/What-is-the-equivalent-of-Node-js-util-inspect-for-front-end-JavaScript/answer/Rob-Brown-13?srid=heZdR
 */

function stripComma(ret) {
  let i = ret.length - 1;
  let count = 0;
  while (ret.charAt(i) == "\n") {
    i--;
    count++;
  }
  if (ret.charAt(i) == ",") {
    ret = ret.substring(0, i);
  }
  for (i = 0; i < count; i++) {
    ret += "\n";
  }
  return ret;
}

export default function serialize(o, stack = [], compact = 0, limit = 5) {
  // If the input is not an object or array
  if (!(typeof o === "object")) {
    // Coerce to string
    return o + "";
  }
  let count = 0;
  let lf = "\n";
  let space = " ";
  // Indentation increases based on stack size
  let indentString = "  ";
  for (let i in stack) {
    indentString += "  ";
  }
  if (compact === 1) {
    lf = space = " ";
  } else if (compact >= 1) {
    lf = space = "";
  }
  const isArray = o instanceof Array;
  let leadBrace, trailingBrace;
  if (isArray) {
    leadBrace = space + "[";
    trailingBrace = "]";
  } else {
    leadBrace = space + "{";
    trailingBrace = "}";
  }
  // The returned string
  let ret = leadBrace + lf;
  for (let key in o) {
    if (o.hasOwnProperty(key)) {
      let objName = "";
      if (isArray) {
        objName = "";
      } else {
        if (key.indexOf(" ") == -1) {
          objName = key + space + ":" + space;
        } else {
          objName = '"' + key + '"' + space + ":" + space;
        }
      }
      const subObj = o[key];
      switch (typeof subObj) {
        case "function":
          ret += indentString + objName + subObj + "," + lf;
          break;
        case "object":
          if (stack.length > limit)
            ret += indentString + objName + '"(too deeply nested)",' + lf;
          else if (subObj == null) {
            ret += indentString + objName + "null,\n";
          } else {
            let found = false;
            for (let m in stack) {
              if (o == stack[m]) {
                ret += indentString + objName + '"(object is in stack)",' + lf;
                found = true;
                break;
              }
            }
            if (found == false) {
              stack.push(o);
              ret +=
                indentString +
                objName +
                // Recursive
                serialize(subObj, stack, compact, limit) +
                "," +
                lf;
              stack.pop();
            }
          }
          break;
        case "string":
          {
            const map = {
              "\b": "\\b",
              "\t": "\\t",
              "\n": "\\n",
              "\f": "\\f",
              "\r": "\\r",
              '"': '\\"',
              "\\": "\\\\"
            };
            ret += indentString + objName + '"';
            for (let i in subObj) {
              const char = subObj.charAt(i);
              if (map[char]) {
                ret += map[char];
              } else ret += char;
            }
            ret += '",' + lf;
          }
          break;
        default:
          ret += indentString + objName + subObj + "," + lf;
      }
    }
  }
  return stripComma(ret) + indentString + trailingBrace;
}
