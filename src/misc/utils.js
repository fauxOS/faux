import { Task } from "./fp.js";

export function genUUID() {
  const base = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  return base.replace(/[xy]/g, char => {
    // Random integer between 0 and 16
    const randFloat = Math.random() * 16;
    const randInt = parseInt(randFloat);
    if (char === "x") {
      // "x" is replaced with any hex number
      return randInt.toString(16);
    } else {
      // "y" is replaced with either 8, 9, a, or b
      return ((randInt & 3) | 8).toString(16);
    }
  });
}

export const spawnWorker = script => {
  const blob = new Blob([script], { type: "application/javascript" });
  const uri = URL.createObjectURL(blob);
  return new Worker(uri);
};

export const openLocalFile = (readAs = "readAsText") => {
  const input = document.createElement("input");
  input.type = "file";
  input.click();
  return Task(err => res => {
    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader[readAs](file);
      reader.onloadend = () => res(reader.result);
    };
  });
};

export const http = (uri, method = "GET") =>
  Task(err => res => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, uri, true);
    xhr.onload = () =>
      xhr.status < 300 && xhr.status >= 200
        ? res(xhr.response)
        : err(xhr.status + " " + xhr.statusText);
    xhr.onerror = err;
    xhr.send();
  });

export const type = value =>
  Object.prototype.toString.call(value).match(/\[object (.+)\]/i)[1];
