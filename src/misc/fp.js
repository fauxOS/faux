// Maybe(a) : Just(a) | Nothing
export const Just = x => ({
  // Just(a) ~> (a -> b) -> Just(b)
  map: f => Just(f(x)),
  // Just(a) ~> (a -> Maybe(b)) -> Maybe(b)
  chain: f => f(x),
  // Just(a) ~> (Void -> e) -> (a -> r) -> r
  fold: fail => pass => pass(x),
  // Just(a) ~> Void -> String
  toString: () => `Just(${x})`
});
export const Nothing = {
  // Nothing ~> (a -> b) -> Nothing
  map: f => Nothing,
  // Nothing ~> (a -> Maybe(b)) -> Maybe(b)
  chain: f => Nothing,
  // Nothing ~> (Void -> e) -> (a -> r) -> e
  fold: fail => pass => fail(),
  // Nothing ~> Void -> String
  toString: () => `Nothing`
};

// String -> a -> Maybe(b)
export const propM = name => obj => (name in obj ? Just(obj[name]) : Nothing);

// Result(a) : Ok(a) | Err(String)
export const Ok = x => ({
  // Ok(a) ~> (a -> b) -> Ok(b)
  map: f => Ok(f(x)),
  // Ok(a) ~> (a -> Result(b)) -> Result(b)
  chain: f => f(x),
  // Ok(a) ~> (a -> Result(b)) -> Result(b)
  chainOk: f => f(x),
  // Ok(a) ~> (a -> Result(b)) -> Ok(a)
  chainErr: f => Ok(x),
  // Ok(a) ~> (a -> e) -> (a -> r) -> r
  fold: fail => pass => pass(x),
  // Ok(a) ~> Void -> String
  toString: () => `Ok(${x})`
});
export const Err = x => ({
  // Err(a) ~> (a -> b) -> Err(a)
  map: f => Err(x),
  // Err(a) ~> (a -> Result(b)) -> Err(a)
  chain: f => Err(x),
  // Err(a) ~> (a -> Result(b)) -> Err(a)
  chainOk: f => Err(x),
  // Err(a) ~> (a -> Result(b)) -> Result(b)
  chainErr: f => f(x),
  // Err(a) ~> (a -> e) -> (a -> r) -> e
  fold: fail => pass => fail(x),
  // Err(a) ~> Void -> String
  toString: () => `Err(${x})`
});

// String -> a -> Result(b)
export const propR = name => obj =>
  name in obj ? Ok(obj[name]) : Err(`${name} not in ${JSON.stringify(obj)}`);

// Similar to Promise
// prettier-ignore
export const Task = run => ({
  // (a -> e) -> (a -> r) -> Task(a)
  run,

  // Task(a) ~> (a -> b) -> Task(b)
  map: f => Task(err => res =>
    run(err)
       (x => res(f(x))) ),

  // Task(a) ~> (a -> Task(b)) -> Task(b)
  runMap: f => Task(err => res =>
    run(err)
       (x => f(x).run(err)
                     (res) )),

  // Task(a) ~> Void -> Void
  log: () =>
    run(console.error)
       (console.log)
});

export const match = to => (...cases) => def => {
  for (let i in cases) {
    const c = cases[i];
    for (let i in c[0]) {
      if (c[0][i] == to) {
        return c[1](c[0][i]);
      }
    }
  }
  return def(to);
}