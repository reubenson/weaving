import _ from 'lodash';
import generators from '../renderer/lib/generators';
import scale from '../renderer/lib/scale';

function noteDistance(a, b) {
  // const A0 = { midi: 21, freq: 27.5 };
  return Math.abs(b - a);
}

// MIDI note retrieval from noteArr
function getNearestNote(noteArr, note) {
  return _.reduce(noteArr, (acc, item) => {
    if (acc === null) {
      return item;
    }

    return noteDistance(item, note) < noteDistance(acc, note) ? item : acc;
  }, null);
}

function noteModel(props) {
  _.assign(this, props);
}

noteModel.prototype = {
  getNextNote() {
    let note = generators[this.generator]();

    // TODO normalize generator to note range
    note = Math.round(note * 127);
    note = getNearestNote(this.noteSet(), note);
    // TODO: normalize to scale and range

    return note;
  },
  noteSet() {
    return scale.noteSet(this.scale, this.tonic, this.octave);
  },
};

export default noteModel;
