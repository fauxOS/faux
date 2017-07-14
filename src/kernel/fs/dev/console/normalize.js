export default function(e) {
  const { key } = e;
  if (key === "Backspace") {
    return "\b";
  } else if (key === "Enter") {
    return "\n";
  } else if (key === "Shift") {
    return "";
  } else if (key === "Control") {
    return "";
  } else if (key === "Alt") {
    return "";
  } else if (key === "Meta") {
    return "";
  } else if (key === "ArrowUp") {
    return "";
  } else if (key === "ArrowDown") {
    return "";
  } else if (key === "ArrowLeft") {
    return "";
  } else if (key === "ArrowRight") {
    return "";
  } else {
    return key;
  }
}
