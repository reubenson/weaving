<template>
  <div class="clock">
    <h4>Clock</h4>
    <el-input v-model="bpm" placeholder="BPM">
      <template #prepend>BPM</template>
    </el-input>
    <el-slider
        label="clock"
        :min="50"
        :max="1000"
        :step="10"
        v-model="bpm"
      ></el-slider>
    <el-switch
      active-text="start / stop"
      v-model="isOn"
    ></el-switch>
  </div>
</template>

<script>
// clock does not need to know what is connected to it
// anything that needs a clock will listen to emitter?

  export default {
    name: 'timer',
    data() {
      return {
        bpm: 250,
        timer: null,
        isOn: false,
      };
    },
    computed: {
      interval() {
        const bpmInt = parseInt(this.bpm, 10);

        return 60 * (1000 / bpmInt);
      },
      intervalString() {
        return '' + this.interval;
      }
    },
    components: {},
    methods: {
      handleTimer() {
        // todo: https://incolumitas.com/2021/12/18/on-high-precision-javascript-timers/
        clearInterval(this.timer);
        if (this.isOn) {
          this.timer = setInterval(this.tick, this.intervalString);;
        }
      },
      tick() {
        // eventBus.emit('tick', 'clock.id');
        this.$bus.$emit('tick', 'clock.id');
      },
    },
    watch: {
      isOn() {
        this.handleTimer();
        if (this.isOn) {
          // this.timer = setInterval(this.tick, this.intervalString);
        } else {
          // eventBus.emit('clock-off');
          this.$bus.$emit('clock-off');
        }
      },
      bpm() {
        this.handleTimer();
      },
      bpmString(input) {
        this.bpm = parseInt(input, 10);
      },
    }
  };
</script>

<style>
  .clock {
    border: solid black 2px;
    margin-top: 20px;
    padding: 20px;
    max-width: 500px;
  }
</style>
