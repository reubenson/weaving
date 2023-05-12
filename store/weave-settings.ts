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
      weaveY: 4,
      euclideanCount: 4
    }
  },
  getters: {},

  actions: {}
});
