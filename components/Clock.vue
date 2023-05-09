<template>
  <div class="clock">
    <header>Clock Settings</header>
    <el-input v-model="store.bpm" placeholder="BPM">
      <template #prepend>BPM</template>
    </el-input>
    <el-slider
        label="clock"
        :min="50"
        :max="1000"
        :step="10"
        v-model="store.bpm"
      ></el-slider>
    <!-- <el-switch
      active-text="start"
      inactive-text="stop"
      v-model="isOn"
    ></el-switch> -->
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

// let bpm = ref(200),
let timer = null;
  // isOn = ref(false);
    //   };
    // },
    // computed: {
// const interval = computed({
//   get: () => {
//     const bpmInt = parseInt(store.bpm, 10);

//     return 60 * (1000 / bpmInt);
//   }
// });
const intervalString = computed({
  get: () => {
    return '' + interval.value;
  }
});

function handleTimer() {
  // todo: https://incolumitas.com/2021/12/18/on-high-precision-javascript-timers/
  clearInterval(timer);
  if (isOn.value) {
    console.log('bpmInterval.value', bpmInterval.value);
    timer = setInterval(tick, bpmInterval.value);
  }
}

function tick() {
  // eventBus.emit('tick', 'clock.id');
  $event('tick', 'clock.id');
}
    // },
    // watch: {
watch(isOn, val => {
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
// watch(bpmString, (input) => {
//         bpm = parseInt(input, 10);
//       });
  //   }
  // };
</script>

<style>
  .clock {
    border: solid black 2px;
    margin-top: 20px;
    padding: 20px;
    /* max-width: 300px; */
  }
</style>
