import evaluate from "./evaluate.js";
import cli from "../lib/cli/index.js"
import { match } from "../../misc/fp.js";

const state = {
  //get prompt() {
  //  return sys.currentDirectory()
  //    .then(cwd => cli.colorize("gray", `faux:${cwd} # `))
  //},
  prompt: cli.colorize("gray", `faux # `),
  input: [],
  inputPosition: 0,
  history: [],
  historyPosition: undefined
}

addEventListener("consoleInput", ({ detail }) => handle(detail.key))

const handle = key =>
  match (key) (
    // Backspace
    [["\x7f", "\b"],
      remove],
    [["\r"],
      enter],
    // Arrow keys
    [["\x1b[A", "\x1b[B", "\x1b[C", "\x1b[D"],
      arrow]
  ) (insert)

const insert = key => {
  state.input.splice(state.inputPosition, 0, key)
  state.inputPosition++
  const trailing = state.input.slice(state.inputPosition)
  print(
    key + cli.control.cursor.savePosition() + trailing.join("") + cli.control.cursor.restorePosition()
  )
}

const remove = _ => {
  if (state.inputPosition == 0) {
    return
  }
  state.inputPosition--
  state.input.splice(state.inputPosition, 1)
  const trailing = state.input.slice(state.inputPosition)
  print(
    cli.control.cursor.move.left() + cli.control.cursor.savePosition() + cli.control.line.eraseEnd() + trailing.join("") + cli.control.cursor.restorePosition()
  )
}

const enter = _ => {
  evaluate(state.input.join(""))
    .then(result => print("\n" + result + "\n" + state.prompt))
  if (JSON.stringify(state.input) != JSON.stringify(state.history[0])) {
    state.history.unshift(state.input)
  }
  state.historyPosition = undefined
  state.input = []
  state.inputPosition = 0
}

const arrow = key =>
  key == "\x1b[A"
    ? historyBackward()
: key == "\x1b[B"
    ? historyForward()
: key == "\x1b[C"
    ? right()
: key == "\x1b[D"
    ? left()
    : null

const right = () => {
  if (state.inputPosition == state.input.length) {
    return
  }
  state.inputPosition++
  print(cli.control.cursor.move.right())
}

const left = () => {
  if (state.inputPosition == 0) {
    return
  }
  state.inputPosition--
  print(cli.control.cursor.move.left())
}

const historyBackward = () => {
  if (state.historyPosition == state.history.length-1) {
    return
  } else if (state.historyPosition == undefined) {
    if (state.input.length) {
      state.history.unshift(state.input)
      state.historyPosition = 1
    } else {
      state.historyPosition = 0
    }
  } else {
    state.historyPosition++
  }
  state.input = state.history[state.historyPosition]
  print(
    cli.control.line.erase() + cli.control.cursor.move.leftMost() + state.prompt + state.input.join("")
  )
}

const historyForward = () => {
  if (state.historyPosition == 0 || state.historyPosition == undefined) {
    return
  }
  state.historyPosition--
  state.input = state.history[state.historyPosition]
  print(
    cli.control.line.erase() + cli.control.cursor.move.leftMost() + state.prompt + state.input.join("")
  )
}

print(`Welcome to the ${cli.colorize("bold", "F")}aux ${cli.colorize("bold", "SH")}ell!` + "\n\n" + state.prompt)
