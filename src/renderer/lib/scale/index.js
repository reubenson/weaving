/* eslint-disable */
import { Scale, Note, Transpose } from 'tonal';
// import _ from 'lodash';
const tonics = ['Ab', 'A', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];

function noteSet(scaleName, tonic, octave) {
  const notes = Scale.notes(`${tonic} ${scaleName}`);
  // const notes = Scale(scaleName).map(Transpose('C2'));

  return notes.map(note => Note.midi( `${note}${octave}` ));
  // return notes;

  // return notes;
}

export default {
  names: Scale.names(),
  tonics,
  noteSet,
};
