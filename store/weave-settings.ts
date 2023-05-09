import { defineStore } from 'pinia';
import _ from 'lodash';

export const useWeaveStore = defineStore('weave-settings', {
  state: () => {
    return {
      patternOptions: ['weave', 'euclidean'],
      patternType: 'weave',
      swatchWidth: 16,
      swatchDepth: 8,
      weaveX: 1,
      weaveY: 1,
      euclideanCount: 1
    }
  },
  getters: {
    chordOptions: state => {
      
    },
    
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    handleRandomize() {
      // to do: figure out what I'm actually doing with notes
    }
  },
});
