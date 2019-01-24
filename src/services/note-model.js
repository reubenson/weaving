import _ from 'lodash';
import Nanotimer from 'nanotimer';
import generators from '../renderer/lib/generators';
import scale from '../renderer/lib/scale';
import midi from '../main/lib/midi';
import BufferTimer from '../renderer/lib/buffer-timer';
import Cell from '../renderer/lib/cell';

const sceneName = 'sceneB';
const showConfig = {
  sceneA: {
    1: { debounce: 3000 },
    2: { debounce: 3000 },
    3: { debounce: 2000 },
    4: { debounce: 2000 },
  },
  sceneB: {
    1: { debounce: 15000 },
    2: { debounce: 15000 },
    3: { debounce: 15000 },
    4: { debounce: 15000 },
  },
};

const trackers = {
  velocity: {
    start() {
      this.velocityTracker = new BufferTimer();
      this.velocityTracker.setInterval((buffer) => {
        const val = this.velocity;

        buffer.pop();
        buffer.unshift(val);
        this.velocityLevel = Math.round(_.mean(buffer));
        midi.sendControlChange(this.channel, this.velocityController, this.velocityLevel);
      });
    },
    stop() {
      this.velocityTracker.clearInterval();
    },
  },
};

function noteDistance(a, b) {
  // const A0 = { midi: 21, freq: 27.5 };
  return Math.abs(b - a);
}

// MIDI note retrieval from noteArr
// note is a value between 0 and 1
function getNearestNote(noteArr, note) {
  const minNote = _.min(noteArr);
  const maxNote = _.max(noteArr);
  const noteNormalized = minNote + (note * (maxNote - minNote));

  // console.log('note', note);
  // console.log('noteNormalized', noteNormalized);

  return _.reduce(noteArr, (acc, item) => {
    if (acc === null) {
      return item;
    }

    return noteDistance(item, noteNormalized) < noteDistance(acc, noteNormalized) ? item : acc;
  }, null);
}

function noteModel(props, { noteListenerSettings }) {
  _.assign(this, props);
  this.velocityController = noteListenerSettings.velocity;

  this.timestamp = 0;
  this.debounce = 10;

  // const sceneName = 'sceneA';
  const sceneSelection = showConfig[sceneName];

  if (this.channel === 1) { // snare
    this.debounce = _.get(sceneSelection, '1.debounce');
    console.log('this.debounce', this.debounce);
  }
  if (this.channel === 2) { // bass
    this.debounce = _.get(sceneSelection, '2.debounce');
    console.log('this.debounce', this.debounce);
  }
  if (this.channel === 3) { // hi tom
    this.debounce = _.get(sceneSelection, '3.debounce');
    console.log('this.debounce', this.debounce);
  }
  if (this.channel === 4) { // low tom
    this.debounce = _.get(sceneSelection, '4.debounce');
    console.log('this.debounce', this.debounce);
  }

  this.cell = new Cell(3);
  // this.startCell();
}

noteModel.prototype = {
  shouldGetNextNote() {
    return Date.now() - this.timestamp > this.debounce;
  },
  update({ isOn, velocity }) {
    this.isOn = isOn;

    this.velocity = isOn ? velocity : 0;
    if (isOn && this.shouldGetNextNote()) {
      this.note = this.getNextNote();
      console.log('this.channel', this.channel);
    } else {
      this.hasNewNote = false;
    }
  },
  getNote() {
    return this.hasNewNote ?
      this.note : null;
  },
  getNextNote() {
    let note = generators[this.generator]();

    note = getNearestNote(this.noteSet(), note);
    // TODO: normalize to scale and range

    this.timestamp = Date.now();
    this.hasNewNote = true;

    return note;
  },
  noteSet() {
    return scale.noteSet(this.scale, this.tonic, this.octave, 2);
  },
  start() {
    _.forEach(trackers, tracker => tracker.start.call(this));
  },
  stop() {
    _.forEach(trackers, tracker => tracker.stop.call(this));
  },
  startCell() {
    const period = 250; // ms
    const interval = `${period}m`;
    this.cellTimer = this.cellTimer || new Nanotimer; //eslint-disable-line
    this.cellTimer.setInterval(() => {
      let val = this.cell.get();

      console.log('val first', val);

      val = getNearestNote(this.noteSet(), val);

      console.log('val second', val);
      midi.sendNoteOn(this.channel, val, 127);
      this.cellTimer.setTimeout(() => {
        midi.sendNoteOff(this.channel, val, 127);
      }, '', '100m');

      this.cell.step();
    }, '', interval);
  },
  strumCell() {
    const strumChannel = 6 + this.channel;

    this.cellTimer = this.cellTimer || new Nanotimer //eslint-disable-line
    _.times(this.cell.length, (i) => {
      const delay = (i * 150) * Math.random();

      this.cellTimer.setTimeout(() => {
        let val = this.cell.get();

        val = getNearestNote(this.noteSet(), val);

        midi.sendNoteOn(strumChannel, val, 127);
        this.cellTimer.setTimeout(() => {
          midi.sendNoteOff(strumChannel, val, 127);
        }, '', '200m');

        this.cell.step();
      }, '', `${delay}m`);
    });
  },
};

export default noteModel;
