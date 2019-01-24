/*
 * Generators are functions that produce values between 0 and 1
 */

function random() {
  return Math.random();
}

function lfo() {
  const freq = 1.5; // Hz
  // phase = 0,
  const t = Date.now() / 1000; // in seconds
  const pi = Math.PI;

  return 0.5 + (0.5 * Math.sin((2 * pi * (t * freq))));
}

export default {
  random,
  lfo,
};
