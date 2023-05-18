import { defineStore } from 'pinia';
import _ from 'lodash';
import { Midi } from 'tonal';
import midi from '~/lib/midi';
import colormap from 'colormap';
import { webAudio } from '~/lib/webAudio';
import { useMusicStore } from './music-settings';
import { useWeaveStore } from './weave-settings';

const presets = {
  1: {
    isOn: true,
    bpm: 120,
    noteHoldCount: 4,
    sequenceType: 'random',
    noteScale: 'maj7',
    stackType: 'canon',
    rangeMin: 4,
    rangeMax: 6,
    patternType: 'weave',
    swatchDepth: 8,
    swatchWidth: 16,
    weaveX: 2,
    weaveY: 4,
  },
  2: {
    isOn: true,
    bpm: 630,
    noteHoldCount: 1,
    sequenceType: 'sine',
    sineHarmonics: 4.9,
    noteScale: 'madd4',
    stackType: 'octave',
    rangeMin: 2,
    rangeMax: 3,
    patternType: 'euclidean',
    swatchDepth: 8,
    swatchWidth: 32,
    euclideanCount: 17
  },
  3: {
    isOn: true,
    bpm: 550,
    noteHoldCount: 4,
    sequenceType: 'sine',
    sineHarmonics: 3.3,
    noteScale: 'madd4',
    stackType: 'canon',
    rangeMin: 8,
    rangeMax: 9,
    patternType: 'weave',
    swatchDepth: 4,
    swatchWidth: 16,
    weaveX: 4,
    weaveY: 4
  }
}

export const useStore = defineStore('main', {
  state: () => {
    return {
      useWebAudio: true,
      midiInputPort: null,
      midiOutputPort: null,
      midiInputPorts: [],
      midiOutputPorts: [],
      isOn: false,
      bpm: 400,
      noteHoldCount: 1,
      count: 0,
      showConfigurationEdit: true,
      webAudioSynth: null,
      warpNotes: [],
      notes: [],
      swatchWeave: [],
      gridItemsKey: Date.now(),
      errorMsg: ''
    }
  },
  getters: {
    bpmInterval: state => {
      const bpmInt = parseInt(state.bpm, 10);

      return 60 * (1000 / bpmInt);
    },
    noteLength: state => Math.max(10, state.noteHoldCount * state.bpmInterval * .95),
    gridItems: state => {
      const { swatchWeave } = state;

      return _.reduce(swatchWeave, (acc, item) => _.concat(acc, item), []);
    },
    noteMin: state => {
      return state.swatchNotes.reduce((acc, row) => {
        return _.min([acc, _.min(row)]);
      }, Infinity) || 0;
      
    },
    noteMax: state => {
      // console.log('state.swatchNotes', state.swatchNotes);
      return state.swatchNotes.reduce((acc, row) => {
        return _.max([acc, _.max(row)]);
      }, -Infinity) || 0;
    },
    noteColors: state => {
      // needs to be at least 2 for colormap
      const length = Math.max(2, state.noteMax - state.noteMin + 1);
      
      return colormap({
        // https://github.com/bpostlethwaite/colormap
        colormap: 'bluered',
        nshades: length,
        format: 'hex',
        alpha: 1
      });
    },

    // array of arrays, building on notes
    swatchNotes: state => {
      const { swatchDepth } = useWeaveStore();
      const { stackType, rangeMin, rangeMax } = useMusicStore();

      /**
       * rotate array by one item
       * (first item is moved to second slot, etc)
       * @param {array} arr
       */
      function rotateArray(arr) {
        const item = arr.pop();

        arr.unshift(item);
        return arr;
      }

      function applyOctave(arr) {
        return arr.map(item => {
          return item + 12;
        });
      }

      return _.times(swatchDepth).map((i) => {
        let row = _.clone(state.notes);

        if (stackType === 'canon') {
          for (let index = 0; index < i; index++) {
            row = rotateArray(row);
          }
        } else if (stackType === 'octave') {
          for (let index = 0; index < i; index++) {
            row = applyOctave(row);
          }
        }
        return row;
      });
    },

    swatchNoteColors: state => {
      const { rangeMin } = useMusicStore();

      const noteColors = state.swatchNotes.map(row => {
        return row.map(note => {
          const colorIndex = note - (rangeMin * 12);

          return state.noteColors[colorIndex];
        });
      });

      return noteColors;
    },

    warpNoteColors: state => {
      const musicStore = useMusicStore();
      // const length = (musicStore.rangeMax - musicStore.rangeMin) * 12. + 1;
      // const colors = colormap({
      //   colormap: 'bluered',
      //   nshades: length,
      //   format: 'hex',
      //   alpha: 1
      // });
      // console.log('state.notesColors', state.notesColors);
    
      return state.notes.map(item => {
        const colorIndex = item - 12 - (musicStore.rangeMin * 12);

        return state.noteColors[colorIndex];
      });
    },
    numberOfVoices: () => {
      const weave = useWeaveStore();

      return weave.swatchDepth;
    },
    notesAsNames: state => {
      return state.notes
        .map(note => Midi.midiToNoteName(note));
    }
  },
  actions: {
    applyPreset(presetId) {
      const preset = presets[presetId],
        musicStore = useMusicStore(),
        weaveStore = useWeaveStore();
      
      _.forEach(preset, (value, key) => {
        if (this[key]) {
          this[key] = value;
        } else if (musicStore[key]) {
          musicStore[key] = value;
        } else if (weaveStore[key]) {
          weaveStore[key] = value;
        }
      });
    },
    getMidiOutputs() {
      midi.getPortNames()
        .then(({ inputs, outputs }) => {
          this.midiInputPorts = inputs;
          this.midiOutputPorts = outputs;
          const [defaultInput] = inputs;
          const [defaultOutput] = outputs;

          // if (this.inputPort) {
          // this.inputPort = defaultInput;
          // midi.setInput(defaultInput);
          // }

          if (defaultOutput) {
            this.midiOutputPort = defaultOutput;
          }
          // midi.setOutput(defaultOutput);
          // }
        });
    },
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
        const steps = _.range(0, 2 * Math.PI, 0.1);
        const waveformData = _.times(steps.length).map(i => waveformFn(i));
        const waveformMax = Math.max(...waveformData);
        const normalizationFactor = 1 / waveformMax;

        this.notes = _.times(swatchWidth, i => {
          const waveformIndex = 2 * Math.PI * i / swatchWidth;

          // val ranges from -1 to 1, which needs to be mapped to the range of noteOptions
          // val may not exactly range from -1 to 1, and should be renormalized
          const val = waveformFn(waveformIndex) * normalizationFactor;

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
    relalculateNotes() {

    },
    increment() {
      this.count++;
    },
    initializeWebAudioSynth() {
      this.webAudioSynth = new webAudio(this.numberOfVoices);
    },
    startSynth() {
      console.log('starting', this.webAudioSynth);
      this.webAudioSynth?.start();
    }
  }
});
