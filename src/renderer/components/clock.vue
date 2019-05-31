<template>
  <div class="timer">

  </div>
</template>

<script>
  import Nanotimer from 'nanotimer';
//   import MidiDrivers from './LandingPage/MidiDrivers';
//   import TopNav from './LandingPage/TopNav';
//   import Swatch from './weaving/swatch';
//   import store from '../store';
  import eventBus from '../lib/eventBus';

// clock does not need to know what is connected to it
// anything that needs a clock will listen to emitter?

  export default {
    name: 'timer',
    props: ['length'],
    data() {
      return {
        timer: {},
      };
    },
    components: {
      // MidiDrivers, TopNav, Swatch,
    },
    methods: {
      tick() {
        eventBus.emit('tick', 'clock.id');
      },
    },
    created() {
      this.timer = new Nanotimer;  // eslint-disable-line
      this.interval = `${this.length}m`;
      // todo: run timer server-side?
      this.timer.setInterval(this.tick, '', this.interval);
      // set up listener, if the clock listens to incoming midi events (or listens to other clocks?)
      // this.$eventBus = eventBus;
      // this.$store.dispatch('retrieveConfig');
      // console.log('store.state.Weaving', store.state.Weaving);
    },
  };
</script>

<style>

</style>
