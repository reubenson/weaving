<template>
  <div id="wrapper">
    <top-nav></top-nav>
    <main>
      <midi-drivers></midi-drivers>
      <div class="clocks">
        <clock v-for="clock in clocks" :bpm=clock.bpm></clock>
      </div>
      <h4>Clock</h4>
      <ui-slider
        label="clock"
        :min="100"
        :max="2000"
        :step="25"
        snapToSteps=true
        v-model="mainClock"
      ></ui-slider>
      <swatch></swatch>
    </main>
  </div>
</template>

<script>
  import Vue from 'vue';
  import { UiSlider } from 'keen-ui';
  import MidiDrivers from './LandingPage/MidiDrivers';
  import TopNav from './LandingPage/TopNav';
  import Swatch from './weaving/swatch';
  import Clock from './clock';
  import store from '../store';
  import eventBus from '../lib/eventBus';

  export default {
    name: 'landing-page',
    components: {
      MidiDrivers, TopNav, Swatch, Clock, UiSlider,
    },
    data() {
      return {
        clocks: [],
        mainClock: 250,
      };
    },
    store,
    created() {
      this.$eventBus = eventBus;
      this.$store.dispatch('retrieveConfig');
      console.log('store.state.Config', store.state.Config);

      // temp init
      // this.clocks = store.state.Weaving.clocks;
      this.clocks = [{ bpm: this.mainClock }];
    },
    watch: {
      mainClock() {
        console.log('this.mainClock', this.mainClock);
        Vue.set(this, 'clocks', [{
          bpm: this.mainClock,
        }]);
      },
    },
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  *,
  *::before,
  *::after {
      box-sizing: border-box;
  }

  html {
      font-size: 100%;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  section {
    margin-bottom: 40px;
  }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top center,
        rgba(250, 250, 250, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    overflow-y: scroll;
    padding: 80px 40px;
    width: 100vw;
  }
</style>
