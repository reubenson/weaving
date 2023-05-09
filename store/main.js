import { defineStore } from 'pinia';
import _ from 'lodash';
import colormap from 'colormap';
import { webAudio } from '~/lib/webAudio';

export const useStore = defineStore('main', {
  state: () => {
    return { 
      bpm: 400,
      count: 0,
      showConfigurationEdit: true,
      useWebAudio: true,
      swatchWidth: 16,
      swatchDepth: 2,
      webAudioSynth: null,
      rangeMin: 4,
      rangeMax: 6,
      warpNotes: [],
      noteGrid: [],
      gridItemsKey: Date.now()
    }
  },
  getters: {
    bpmInterval: state => {
      const bpmInt = parseInt(state.bpm, 10);

      return 60 * (1000 / bpmInt);
    },
    noteLength: state => state.bpmInterval * .95,
    gridItems: state => {
      const { noteGrid } = state;

      return _.reduce(noteGrid, (acc, item) => _.concat(acc, item), []);
    },
    warpNoteColors: state => {
      const length = (state.rangeMax - state.rangeMin) * 12. + 1;
      const colors = colormap({
        colormap: 'jet',
        nshades: length,
        format: 'hex',
        alpha: 1
      });
    
      return state.warpNotes.map(item => {
        const colorIndex = item - 12 - (state.rangeMin * 12);
        
        return colors[colorIndex];
      });
    },
    numberOfVoices: state => state.swatchDepth
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    updateGridItemsKey() {
      this.gridItemsKey = Date.now();
    },
    increment() {
      this.count++;
    },
    updateConfig(config) {
      console.log('config', config);
    },
    stopEngine() {
      console.log('stopEngine');
    },
    startEngine() {
      console.log('startEngine');
    },
    initializeWebAudioSynth() {
      this.webAudioSynth = new webAudio(this.numberOfVoices);
    }
  },
});
