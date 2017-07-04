export default class Spinner {
  constructor(name) {
    const spinners = {
      line: {
        fps: 8,
        frames: ["-", "\\", "|", "/"]
      },
      dots: {
        fps: 12.5,
        frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
      },
      scrolling: {
        fps: 5,
        frames: [".  ", ".. ", "...", " ..", "  .", "   "]
      },
      scrolling2: {
        fps: 2.5,
        frames: [".  ", ".. ", "...", "   "]
      },
      star: {
        fps: 14,
        frames: ["✶", "✸", "✹", "✺", "✹", "✷"]
      },
      bounceyBall: {
        fps: 8,
        frames: ["⠁", "⠂", "⠄", "⠂"]
      },
      triangle: {
        fps: 15,
        frames: ["◢", "◣", "◤", "◥"]
      },
      circle: {
        fps: 15,
        frames: ["◐", "◓", "◑", "◒"]
      },
      bounce: {
        fps: 12.5,
        frames: [
          "( ●    )",
          "(  ●   )",
          "(   ●  )",
          "(    ● )",
          "(     ●)",
          "(    ● )",
          "(   ●  )",
          "(  ●   )",
          "( ●    )",
          "(●     )"
        ]
      },
      clock: {
        fps: 10,
        frames: [
          "🕐 ",
          "🕑 ",
          "🕒 ",
          "🕓 ",
          "🕔 ",
          "🕕 ",
          "🕖 ",
          "🕗 ",
          "🕘 ",
          "🕙 ",
          "🕚 "
        ]
      },
      pong: {
        fps: 12.5,
        frames: [
          "▐⠂       ▌",
          "▐⠈       ▌",
          "▐ ⠂      ▌",
          "▐ ⠠      ▌",
          "▐  ⡀     ▌",
          "▐  ⠠     ▌",
          "▐   ⠂    ▌",
          "▐   ⠈    ▌",
          "▐    ⠂   ▌",
          "▐    ⠠   ▌",
          "▐     ⡀  ▌",
          "▐     ⠠  ▌",
          "▐      ⠂ ▌",
          "▐      ⠈ ▌",
          "▐       ⠂▌",
          "▐       ⠠▌",
          "▐       ⡀▌",
          "▐      ⠠ ▌",
          "▐      ⠂ ▌",
          "▐     ⠈  ▌",
          "▐     ⠂  ▌",
          "▐    ⠠   ▌",
          "▐    ⡀   ▌",
          "▐   ⠠    ▌",
          "▐   ⠂    ▌",
          "▐  ⠈     ▌",
          "▐  ⠂     ▌",
          "▐ ⠠      ▌",
          "▐ ⡀      ▌",
          "▐⠠       ▌"
        ]
      }
    };

    const spinner = spinners[name];
    this.frames = spinner.frames;
    this.index = 0;
    this.interval = Math.round(1000 / spinner.fps);
    this.setIntervalIndex = null;
  }

  next() {
    this.index++;
    const realIndex = (this.index - 1) % this.frames.length;
    return this.frames[realIndex];
  }

  start(outputFunction) {
    outputFunction = outputFunction || (str => process.stdout.write(str));
    this.setIntervalIndex = setInterval(() => {
      let frame = this.next();
      let clearFrame = frame.replace(/./g, "\b");
      outputFunction(clearFrame);
      outputFunction(frame);
    }, this.interval);
  }

  stop() {
    clearInterval(this.setIntervalIndex);
  }
}
