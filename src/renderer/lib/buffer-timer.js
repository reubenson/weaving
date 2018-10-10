import Nanotimer from 'nanotimer';
import _ from 'lodash';
import uuid from 'uuid/v1';

const levelSampleFrequency = 40; // per second
const levelBufferDuration = 5; // seconds
const levelBufferSize = levelBufferDuration * levelSampleFrequency;
const interval = `${1000 / levelSampleFrequency}m`;
const timer = new Nanotimer; // eslint-disable-line
const callbacks = {};

function BufferTimer() {
  this.timer = new Nanotimer;  // eslint-disable-line
  this.buffer = _.times(levelBufferSize, _.constant(0));
  this.id = uuid();
}

function setInterval(fn) {
  callbacks[this.id] = () => fn(this.buffer);
  // this.timer.setInterval(() => fn(this.buffer), '', interval);
}

function clearInterval() {
  delete callbacks[this.id];
  // this.timer.clearInterval();
}

function executeCallbacks() {
  _.forEach(callbacks, fn => fn());
}

function init() {
  timer.setInterval(executeCallbacks, '', interval);
}

init();

BufferTimer.prototype = {
  setInterval,
  clearInterval,
};

export default BufferTimer;
