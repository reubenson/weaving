<template>
  <div class="waveform">
    <client-only>
      <UplotVue :data="data" :options="options"/>
    </client-only>
  </div>
</template>

<script setup>
  import _ from 'lodash';
  import uPlot from 'uplot';
  import UplotVue from 'uplot-vue';
  import 'uplot/dist/uPlot.min.css';
  import { storeToRefs } from 'pinia';
  import { useMusicStore } from '~/store/music-settings';

  const musicStore = useMusicStore();
  const { waveformFn } = storeToRefs(musicStore);

  let options = {
    title: 'Waveform', width: 300, height: 200,
    series: [
      {
        label: 'x',
        show: false
      }, 
      {
        label: 'first',
        // points: {show: false},
        stroke: 'blue',
      },                 
    ],
    scales: {
      x: {
        time: false,
      }
    },
    axes: [
      {
        grid: { show: true },
        values: (self, ticks) => {
          return ticks.map(val => '')
        }
      },
      {
        values: [],
        grid: { show: false}
      }
    ]
  };

  const data = computed({
    get: () => {
      const timesteps = _.range(0, 2 * Math.PI, .05);
      const values = _.times(timesteps.length).map(i => {
        return waveformFn.value(timesteps[i]);
      });

      return [
        timesteps,
        values
      ]
    }
  });
</script>

<style lang="scss">
  .waveform {
    width: 100%;
  }

  .uplot {
    margin: auto;
  }

  .u-legend, .u-axis, .u-live {
    display: none;
  }
</style>
