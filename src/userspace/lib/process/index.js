const stdin = {};

const stdout = {
  write(str) {
    console.log(str);
  }
};

const stderr = {};

export default {
  argv: [],
  argc: 0,
  get env() {
    return sys.getenv();
  },
  stdin,
  stdout,
  stderr
};
