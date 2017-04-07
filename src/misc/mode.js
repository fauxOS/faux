export default function getMode(modeStr = "r") {
  // prettier-ignore
  //    read, write, truncate, create, append
  const map = {
    "r": [true, false, false, false, false],
    "r+": [true, true, false, false, false],
    "w": [false, true, true, true, false],
    "w+": [true, true, true, true, false],
    "a": [false, true, false, true, true],
    "a+": [true, true, false, true, true]
  };
  return map[modeStr];
}
