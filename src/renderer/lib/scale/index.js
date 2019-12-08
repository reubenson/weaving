/* eslint-disable */
import { Scale, Note, Transpose } from 'tonal';
import _ from 'lodash';
const tonics = ['Ab', 'A', 'Bb', 'B', 'C', 'C#', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'];

function noteSet(scaleName, tonic, octave, range) {
  const notes = Scale.notes(`${tonic} ${scaleName}`);
  let noteSet = [];
  // const notes = Scale(scaleName).map(Transpose('C2'));

  range = Math.max(range, 1);

  _.times(range, i => {
    const rangeSet = notes.map(note => Note.midi( `${note}${octave + i}` ));

    // console.log('rangeSet', rangeSet);
    noteSet.push(rangeSet);
    // _.merge(noteSet, rangeSet);
  });

  console.log('noteSet', noteSet);

  noteSet = _.flattenDeep(noteSet);

  noteSet.push(noteSet[0] + 12 * range); // include octave above;


  return noteSet;
}

export default {
  names: Scale.names(),
  tonics,
  noteSet,
};
