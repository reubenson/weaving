/* eslint-disable */
import { Scale, Note, Transpose } from 'tonal';
import _ from 'lodash';
const tonics = ['Ab', 'A', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];

function noteSet(scaleName, tonic, octave, range) {
  const notes = Scale.notes(`${tonic} ${scaleName}`);
  let noteSet = [];
  // const notes = Scale(scaleName).map(Transpose('C2'));

  noteSet = notes.map(note => Note.midi( `${note}${octave}` ));

  // todo
  if (range) {
    noteSet = _.merge(noteSet, notes.map(note => Note.midi( `${note}${octave+1}` )));
    noteSet = _.merge(noteSet, notes.map(note => Note.midi( `${note}${octave+2}` )));
  }
  // return notes;

  return noteSet;
}

export default {
  names: Scale.names(),
  tonics,
  noteSet,
};
