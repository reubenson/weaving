<template>
  <div class="clock">
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from '~/store/main';
import { storeToRefs } from 'pinia';

// clock does not need to know what is connected to it
// anything that needs a clock will listen to emitter?
const { $event } = useNuxtApp();
const store = useStore();
const { isOn, bpm, bpmInterval } = storeToRefs(store);

let timer = null;

function handleTimer() {
  // todo: https://incolumitas.com/2021/12/18/on-high-precision-javascript-timers/
  clearInterval(timer);
  if (isOn.value) {
    console.log('bpmInterval.value', bpmInterval.value);
    timer = setInterval(tick, bpmInterval.value);
  }
}

function tick() {
  $event('tick', 'clock.id');
}

watch(isOn, val => {
  store.startSynth(); 

  handleTimer();
  if (val) {
    // this.timer = setInterval(this.tick, this.intervalString);
  } else {
    clearInterval(timer);
    // eventBus.emit('clock-off');
    $event('clock-off');
  }
});
watch(bpm, () => {
  handleTimer();
});
</script>

<style>
  .clock {
    border: solid black 2px;
    margin-top: 20px;
    padding: 20px;
  }
</style>
