/* eslint-disable */
import { Scale, Note, Transpose } from 'tonal';
import _ from 'lodash';
const tonics = ['Ab', 'A', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];

function noteSet(scaleName, tonic, octave, range) {
  const notes = Scale.notes(`${tonic} ${scaleName}`);
  let noteSet = [];
  // const notes = Scale(scaleName).map(Transpose('C2'));

  range = Math.max(range, 0);

  if (range === 0) {
    const note =  Note.midi( `${notes[0]}${octave}` );

    return [ note ];
  }

  _.times(range, i => {
    const rangeSet = notes.map(note => Note.midi( `${note}${octave + i}` ));

    noteSet.push(rangeSet);
  });

  noteSet = _.flattenDeep(noteSet);

  noteSet.push(noteSet[0] + 12 * range); // include octave above;


  return noteSet;
}

/**
 * Quantize to nearest note in noteSet based on value
 * TODO: should be a logarthmic scale instead of linear?
 * @param {Array} noteSet
 * @param {Number} value [0-1]
 */
function determineNote(noteSet, value) {
  const firstNote = noteSet[0];
  const range = _.last(noteSet) - firstNote;
  const target = firstNote + value * range;
  const note = noteSet.reduce((acc, val) => {
    return Math.abs(val - target) < Math.abs(acc - target)
      ? val : acc;
  }, firstNote);

  console.log('noteSet', noteSet);
  console.log('target', target);
  console.log('note', note);
  return note;
}

export default {
  names: Scale.names(),
  tonics,
  noteSet,
  determineNote,
};
