import { defineStore } from 'pinia';
import _ from 'lodash';
import * as Chord from 'tonal-chord';

export const useMusicStore = defineStore('music-settings', {
  state: () => {
    return {
      noteScale: 'maj7',
      chordSizeFilter: 4,
      rangeMin: 4,
      rangeMax: 6
    }
  },
  getters: {
    chordOptions: state => {
      const names = Chord.names();

      return names.filter(name => {
        return Chord.notes(`C4${name}`).length === state.chordSizeFilter;
      });
    }
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    handleRandomize() {
      // to do: figure out what I'm actually doing with notes
    }
  },
});
