<template>
  <div id="wrapper">
    <top-nav></top-nav>
    <main>
      <el-switch 
        v-model="useWebAudio"
        active-text="Use Web Audio to Play"
        inactive-text="Use External MIDI to Play"
      ></el-switch>
      <midi-drivers v-if="!useWebAudio"></midi-drivers>
      <clock></clock>
      <swatch></swatch>
    </main>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import MidiDrivers from './MidiDrivers';
  import TopNav from './TopNav';
  import Swatch from './Swatch';
  import Clock from './Clock';
  import { useStore } from '@/store/main';
  import { storeToRefs } from 'pinia';

  const store = useStore();
  const { useWebAudio } = storeToRefs(store);

  onMounted(() => {
    store.initializeWebAudioSynth();
  });
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
