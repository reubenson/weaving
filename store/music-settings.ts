import { defineStore } from 'pinia';
import _ from 'lodash';
import * as Chord from 'tonal-chord';
import scale from '~/lib/scale';
import { useStore } from '~/store/main';
import { useWeaveStore } from './weave-settings';
import { Note } from 'tonal';

export const useMusicStore = defineStore('music-settings', {
  state: () => {
    return {
      rootNote: 'C',
      noteScale: 'Maj7',
      chordSizeFilter: 4,
      rangeMin: 1,
      rangeMax: 3,
      sequenceType: 'random',
      sequenceTypeOptions: ['random', 'sine'],
      sineHarmonics: 1,
      stackTypeOptions: ['octave', 'canon'],
      stackType: 'octave'
    }
  },
  getters: {
    chordOptions: state => {
      const names = Chord.names();

      return names;

      // return names.filter(name => {
      //   return Chord.notes(`C4${name}`).length === state.chordSizeFilter;
      // });
    },
    tonicOptions: () => {
      return Note.names([]);
    },
    noteOptions: state => {
      const tonic = state.rootNote;
      const range = Math.max(state.rangeMax - state.rangeMin, 0);

      // if (props.mode === 'stack') {
        // if (props.type === 'warp') {
      const offset = -1; // offset to include 0-12 as lowest range of MIDI values
      return (scale.noteSet(state.noteScale, tonic, state.rangeMin + offset, range) || []);
      // .map(num => `${num}`);
        // } else {
        //   // chord mode
        //   const intervals = Chord.intervals(props.chord);
        //   const semitones = intervals.map(interval => Interval.semitones(interval));
  
        //   return semitones.map(num => `${num}`);
        // }

        // return;
      // }
    },
    upperRegisterMax: state => {
      const { swatchDepth } = useWeaveStore();

      if (state.stackType === 'canon') {
        return 10;
      } else if (state.stackType === 'octave') {
        return 10 - swatchDepth + 1;
      }
    },
    waveformFn: state => {
      return (x: number) => {
        let sum = 0;

        _.range(-8, 9).forEach(index => {
          let factor = 1 / (1 + Math.abs(index - state.sineHarmonics));
          const power = 2;

          // factor = Math.floor(factor);
          // let factor = index === state.sineHarmonics ? 1 : 0;

          // console.log('factor', factor);
          // console.log('state.sineHarmonics', state.sineHarmonics);

          // console.log('state.sineHarmonics', state.sineHarmonics);

          // if (state.sineHarmonics > 1) {
            sum += Math.pow(factor, power) * Math.sin((index) * x);
          // } else {
            // sum -= Math.pow(factor, power) * Math.sin((index) * x);
          // }
        });

        return sum;
      };
    }
  },
  actions: {
    handleRandomize() {
      const store = useStore();

      store.generateRandomSequence(true);
      store.calculateRandomNotes();
    }
  },
});
