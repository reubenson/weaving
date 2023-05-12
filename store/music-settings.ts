import { defineStore } from 'pinia';
import _ from 'lodash';
import * as Chord from 'tonal-chord';
import scale from '~/lib/scale';
import { useStore } from '~/store/main';

export const useMusicStore = defineStore('music-settings', {
  state: () => {
    return {
      noteScale: 'maj7',
      chordSizeFilter: 4,
      rangeMin: 4,
      rangeMax: 6,
      sequenceType: 'random',
      sequenceTypeOptions: ['random', 'sine'],
      sineHarmonics: 1,
      stackTypeOptions: ['octave', 'hocket'],
      stackType: 'octave'
    }
  },
  getters: {
    chordOptions: state => {
      const names = Chord.names();

      return names.filter(name => {
        return Chord.notes(`C4${name}`).length === state.chordSizeFilter;
      });
    },
    noteOptions: state => {
      const tonic = 'C';
      const range = Math.max(state.rangeMax - state.rangeMin, 0);

      // if (props.mode === 'stack') {
        // if (props.type === 'warp') {
      return (scale.noteSet(state.noteScale, tonic, state.rangeMin, range) || []);
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

      store.initNotes();
    }
  },
});
