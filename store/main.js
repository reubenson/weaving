import { defineStore } from 'pinia';

export const useStore = defineStore('main', {
  state: () => {
    return { 
      count: 0,
      showConfigurationEdit: true
    }
  },
  // could also be defined as
  // state: () => ({ count: 0 })
  actions: {
    increment() {
      this.count++
    },
    updateConfig(config) {
      console.log('config', config);
    },
    stopEngine() {
      console.log('stopEngine');
    },
    startEngine() {
      console.log('startEngine');
    }
  },
});
