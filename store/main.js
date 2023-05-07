import { defineStore } from 'pinia';
import { webAudio } from '~/lib/webAudio';

export const useStore = defineStore('main', {
  state: () => {
    return { 
      count: 0,
      showConfigurationEdit: true,
      useWebAudio: true,
      numberOfVoices: 2,
      webAudioSynth: null
    }
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
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
      
      console.log('this.webAudioSynth', this.webAudioSynth);
    }
  },
});
