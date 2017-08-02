/*
 * From https://www.quora.com/What-is-the-equivalent-of-Node-js-util-inspect-for-front-end-JavaScript/answer/Rob-Brown-13?srid=heZdR
 */

function functionToString(f) {
  var s = f.toString();
  var i1 = s.indexOf("{");
  var description = "...";
  var sub = s.substring(i1 + 1);
  if (sub.indexOf(" //") == 0) {
    var i3 = sub.indexOf("\n");
    if (i3 != -1) {
      description = sub.substring(3, i3).trim();
    }
  }
  var i2 = s.lastIndexOf("}");
  return s.substring(0, i1 + 1) + " /* " + description + " */ " + "}";
}
// returns true if it is a DOM node
function isNode(o) {
  return typeof o.nodeName === "string";
}
// returns true if it is a DOM element
function isElement(o) {
  return typeof o.tagName === "string";
}

function stripComma(s) {
  var i = s.length - 1,
    count = 0;
  while (s.charAt(i) == "\n") {
    i--;
    count++;
  }
  if (s.charAt(i) == ",") s = s.substring(0, i);
  for (i = 0; i < count; i++) s += "\n";
  return s;
}

export default function serialize(o, stack = [], compact, limit = 5) {
  var lf, sp;
  var s;
  var count = 0,
    i;
  var indentString = "";
  if (!compact) {
    lf = "\n";
    sp = " ";
    for (i = 0; i < stack.length; i++) {
      indentString += "  ";
    }
  } else if (compact == 1) {
    lf = sp = " ";
  } else {
    lf = sp = "";
  }
  var isArray = true;
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      if (parseInt(i) != count) {
        isArray = false;
        break;
      }
      count++;
    }
  }
  if (isArray && (!o || o.length == null || o.length != count)) isArray = false;
  var leadBrace, trailingBrace;
  if (isArray) {
    leadBrace = sp + "[";
    trailingBrace = "]";
  } else {
    leadBrace = sp + "{";
    trailingBrace = "}";
  }
  s = leadBrace + lf;
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      objName = isArray
        ? ""
        : i.indexOf(" ") == -1
          ? i + sp + ":" + sp
          : '"' + i + '"' + sp + ":" + sp;
      switch (typeof o[i]) {
        case "function":
          s += indentString + objName + functionToString(o[i]) + "," + lf;
          break;
        case "object":
          if (stack.length > limit)
            s += indentString + objName + '"(too deeply nested)",' + lf;
          else if (o[i] == null) s += indentString + objName + "null,\n";
          else if (isNode(o[i])) {
            if (isElement(o[i])) {
              s +=
                indentString +
                objName +
                '"(' +
                o[i].tagName +
                " element" +
                (o[i].className ? ", " + o[i].className : "") +
                ')",' +
                lf;
            } else if (o[i].nodeType == 8) {
              s +=
                indentString +
                objName +
                '"(HTML Comment, value {' +
                JSON.stringify(o[i].nodeValue) +
                '} )",' +
                lf;
            } else if (o[i].nodeType == 3) {
              var origLen = o[i].nodeValue.length;
              var trimmed = o[i].nodeValue.trim();
              var trimmedLen = trimmed.length;
              if (trimmedLen > 30) trimmed = trimmed.substring(0, 27) + "...";
              if (trimmedLen == 0) {
                s +=
                  indentString +
                  objName +
                  '"(Text Node, whitespace, length ' +
                  o[i].nodeValue.length +
                  ')",' +
                  lf;
              } else {
                s +=
                  indentString +
                  objName +
                  '"(Text Node, length ' +
                  o[i].nodeValue.length +
                  " {" +
                  JSON.stringify(trimmed) +
                  '})",' +
                  lf;
              }
            } else {
              s +=
                indentString +
                objName +
                '"(DOM Node, type ' +
                o[i].nodeType +
                ')",' +
                lf;
            }
          } else {
            var found = false;
            for (var m = 0; m < stack.length; m++) {
              if (o == stack[m]) {
                s += indentString + objName + '"(object is in stack)",' + lf;
                found = true;
                break;
              }
            }
            if (found == false) {
              stack.push(o);
              s +=
                indentString +
                objName +
                objectToString(o[i], stack, compact, limit) +
                "," +
                lf;
              stack.pop();
            }
          }
          break;
        case "string":
          {
            var string = o[i];
            var m = {
              "\b": "\\b",
              "\t": "\\t",
              "\n": "\\n",
              "\f": "\\f",
              "\r": "\\r",
              '"': '\\"',
              "\\": "\\\\"
            };
            s += indentString + objName + '"';
            var len = string.length;
            for (var i = 0; i < len; i++) {
              var c = string.charAt(i);
              if (m[c]) s += m[c];
              else s += c;
            }
            s += '",' + lf;
          }
          break;
        default:
          s += indentString + objName + o[i] + "," + lf;
      }
    }
  }
  s = stripComma(s) + indentString + trailingBrace;
  return s;
}
