/* eslint-disable */
import { Scale, Note } from 'tonal';
import * as Chord from 'tonal-chord';
import _ from 'lodash';
const tonics = ['Ab', 'A', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];

/**
 * Generate set of notes based on chord name, tonic, and register(s)
 * @param {string} chordName 
 * @param {string} tonic 
 * @param {number} octave 
 * @param {number} range 
 */
function noteSet(chordName, tonic, octave, range) {
  // const notes = getChordNotes(chordName, tonic);
  // const notes = Scale.notes(`${tonic} ${chordName}`);
  let notes = Chord.notes(`${tonic}${chordName}`);

  // if (notes.length === 0) {
  //   // try loading from customChord definitions
  //   notes = customChords[chordName];
  //   console.log('notes here', notes);
  // }

  // console.log('notes', notes);
  if (!notes.length) throw new Error('no notes defined for selected chord');


  let noteSet = [];
  // const notes = Scale(chordName).map(Transpose('C2'));

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

  // noteSet.push(noteSet[0] + 12 * range); // include octave above;


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
  // const range = _.last(noteSet) - firstNote;
  const range = _.max(noteSet) - _.min(noteSet);
  const target = firstNote + value * range;
  const note = noteSet.reduce((acc, val) => {
    return Math.abs(val - target) < Math.abs(acc - target)
      ? val : acc;
  }, firstNote);

  return note;
}

export default {
  names: Scale.names(),
  tonics,
  noteSet,
  determineNote,
};
