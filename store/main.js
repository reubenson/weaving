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
    
      return state.notes.map(item => {
        const colorIndex = item - 12 - (musicStore.rangeMin * 12);
        
        return colors[colorIndex];
      });
    },
    numberOfVoices: () => {
      const weave = useWeaveStore();

      return weave.swatchDepth;
    }
  },
  actions: {
    updateGridItemsKey() {
      this.gridItemsKey = Date.now();
    },
    initNotes() {
      const { sequenceType, noteOptions, waveformFn } = useMusicStore();
      const { swatchWidth } = useWeaveStore();

      if (sequenceType === 'random') {
        this.notes = _.times(swatchWidth, () => {
          const value = _.random(0, noteOptions.length - 1);

          return noteOptions[value];
        });
      } else if (sequenceType === 'sine') {
        this.notes = _.times(swatchWidth, i => {
          const waveformIndex = -2 * Math.PI * i / swatchWidth;

          // val ranges from -1 to 1, which needs to be mapped to the range of noteOptions
          const val = waveformFn(waveformIndex);

          const min = _.min(noteOptions);
          const max = _.max(noteOptions);
          const range = max - min;

          const normalizedVal = (val + 1) / 2; // normalize to range from 0 to 1
          const result = min + normalizedVal * range;
          const quantizedResult = _.reduce(noteOptions, (acc, noteOption) => {
            return Math.abs(result - noteOption) < Math.abs(result - acc) ?
              noteOption : acc;
          }, noteOptions[0]);
          
          return quantizedResult;
        });
      }

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
    },
    increment() {
      this.count++;
    },
    initializeWebAudioSynth() {
      this.webAudioSynth = new webAudio(this.numberOfVoices);
    },
    startSynth() {
      this.webAudioSynth?.start();
    }
  }
});
