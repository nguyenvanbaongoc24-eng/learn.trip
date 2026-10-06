import alea from 'alea';

let _rng = alea('learntrip');

export function initRng(seed: number) {
  _rng = alea(String(seed));
}

export function rng() {
  return _rng();
}
