import Nanotimer from 'nanotimer';
import _ from 'lodash';

const levelSampleFrequency = 1; // per second
const levelBufferDuration = 5; // seconds
const levelBufferSize = levelBufferDuration * levelSampleFrequency;
const interval = `${1000 / levelSampleFrequency}m`;

function BufferTimer() {
  this.timer = new Nanotimer;  // eslint-disable-line
  this.buffer = _.times(levelBufferSize, _.constant(0));
}

function setInterval(fn) {
  this.timer.setInterval(() => fn(this.buffer), '', interval);
}

function clearInterval() {
  this.timer.clearInterval();
}

BufferTimer.prototype = {
  setInterval,
  clearInterval,
};

export default BufferTimer;
