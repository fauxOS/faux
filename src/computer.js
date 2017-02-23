class Computer {
  constructor(name) {
    this.name = name;
    this.fs = new VFS( new Disk );
  }
}

// Use this as the computer
window.box = new Computer("fauxOS");