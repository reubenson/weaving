<template>
  <div class="timer">
    <!-- BPM: {{ bpm }} -->
    <ui-textbox
      floating-label
      label="BPM"
      placeholder="Enter your name"
      v-model="bpm"
    ></ui-textbox>
    <ui-switch
      label="start / stop"
      v-model="isOn"
    ></ui-switch>
  </div>
</template>

<script>
  import Nanotimer from 'nanotimer';
  import { UiSwitch, UiTextbox } from 'keen-ui';
//   import MidiDrivers from './LandingPage/MidiDrivers';
//   import TopNav from './LandingPage/TopNav';
//   import Swatch from './weaving/swatch';
//   import store from '../store';
  import eventBus from '../lib/eventBus';

// clock does not need to know what is connected to it
// anything that needs a clock will listen to emitter?

  export default {
    name: 'timer',
    props: ['length', 'bpm'],
    data() {
      return {
        bpmString: '',
        timer: {},
        isOn: false,
      };
    },
    computed: {
      interval() {
        const bpmInt = parseInt(this.bpm, 10);

        return 60 * (1000 / bpmInt);
      },
    },
    components: {
      UiSwitch, UiTextbox,
      // MidiDrivers, TopNav, Swatch,
    },
    methods: {
      tick() {
        eventBus.emit('tick', 'clock.id');
      },
    },
    watch: {
      isOn() {
        this.timer.clearInterval();
        if (this.isOn) {
          this.timer.setInterval(this.tick, '', this.intervalString);
        } else {
          eventBus.emit('clock-off');
        }
      },
      bpm() {
        this.timer.clearInterval();
        this.intervalString = `${this.interval}m`;
        // todo: run timer server-side?
        // this.timer.setInterval(this.tick, '', this.intervalString);
      },
      bpmString(input) {
        this.bpm = parseInt(input, 10);
      },
    },
    created() {
      this.timer = new Nanotimer;  // eslint-disable-line
      this.intervalString = `${this.interval}m`;
      // todo: run timer server-side?
      // this.timer.setInterval(this.tick, '', this.intervalString);
      // set up listener, if the clock listens to incoming midi events (or listens to other clocks?)
      // this.$eventBus = eventBus;
      // this.$store.dispatch('retrieveConfig');
      // console.log('store.state.Weaving', store.state.Weaving);
    },
  };
</script>

<style>

</style>
