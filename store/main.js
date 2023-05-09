import { defineStore } from 'pinia';
import _ from 'lodash';
import colormap from 'colormap';
import { webAudio } from '~/lib/webAudio';
import { useMusicStore } from './music-settings';
import { useWeaveStore } from './weave-settings';

export const useStore = defineStore('main', {
  state: () => {
    return {
      useWebAudio: true,
      midiInputPort: null,
      midiOutputPort: null,
      isOn: false,
      bpm: 400,
      count: 0,
      showConfigurationEdit: true,
      webAudioSynth: null,
      // rangeMin: 4,
      // rangeMax: 6,
      warpNotes: [],
      notes: [],
      noteGrid: [],
      gridItemsKey: Date.now(),
      errorMsg: ''
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
      const musicStore = useMusicStore();
      const length = (musicStore.rangeMax - musicStore.rangeMin) * 12. + 1;
      const colors = colormap({
        colormap: 'jet',
        nshades: length,
        format: 'hex',
        alpha: 1
      });
    
      return state.warpNotes.map(item => {
        const colorIndex = item - 12 - (musicStore.rangeMin * 12);
        
        return colors[colorIndex];
      });
    },
    numberOfVoices: () => {
      const weave = useWeaveStore();

      return weave.swatchDepth;
    }
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    updateGridItemsKey() {
      this.gridItemsKey = Date.now();
    },
    // initNotes() {
    //   this.notes = [];

    //   if (props.mode === 'stack' && props.type === 'weft') {
    //     _.times (props.length, i => {
    //       const value = noteOptions.value[i % noteOptions.value.length];
    
    //       this.notes[i] = value;
    //     });
    
    //     return;
    //   }
    
    //   _.times(props.length, i => {
    //     // get random note
    //     const value = _.random(0, noteOptions.value.length - 1);
    
    //     this.notes[i] = noteOptions.value[value];
    //   }
    // },
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
