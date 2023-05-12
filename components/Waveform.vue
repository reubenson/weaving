<template>
  <div class="waveform">
    <!-- <canvas id="waves" ref="root"></canvas> -->
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
  // import SineWaves from 'sine-waves';
  // import uPlot from 'uplot';
  // import UplotVue from 'uplot-vue';
  import { useMusicStore } from '~/store/music-settings';

  const musicStore = useMusicStore();
  const { waveformFn } = storeToRefs(musicStore);
  // const root = ref(null);
  // let data = [
  //   [1546300800, 1546387200],    // x-values (timestamps)
  //   [        35,         71],    // y-values (series 1)
  //   // [        90,         15],    // y-values (series 2)
  // ];

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
          ticks = [0, 1, 3, 4 ,5]
          console.log('ticks', ticks);
          return ticks.map(val => '')
        }
      },
      {
        values: [],
        grid: { show: false}
      },
      // {
      //   label: 'test',
      //   scale: '%'
      // }
    ]
  };

  const data = computed({
    get: () => {
      const timesteps = _.range(0, 2 * Math.PI, .05);
      const values = _.times(timesteps.length).map(i => {
        // console.log('t', t);
        return waveformFn.value(timesteps[i]);
      });

      // console.log('timesteps', timesteps);
      // console.log('waveformFn.value', waveformFn.value);

      return [
        timesteps,
        values
      ]
    }
  });

  // onMounted({
    
  // }
    // const Chart = createApp({components: {uplotvue: UplotVue}});

  //   const waves = new SineWaves.SineWaves({
  //     el: root.value,
  //     speed: 0.1,
  //     rotate: 0,
  //     ease: 'Linear',
  //     waveWidth: '100%',
  //     waves: [
  //       {
  //         timeModifier: 10,
  //         lineWidth: 2,
  //         amplitude: 40,
  //         segmentLenth: 1,
  //         wavelength: 1,
  //         type: musicStore.waveformFn
  //       }
  //     ],
  
  //     // Called on window resize
  //     resizeEvent: function() {
  //       var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
  //       gradient.addColorStop(0,"rgba(23, 0, 0, 0.2)");
  //       // gradient.addColorStop(0.5,"rgba(255, 255, 255, 0.5)");
  //       gradient.addColorStop(1,"rgba(23, 0, 0, 0.2)");
        
  //       var index = -1;
  //       var length = this.waves.length;
  //       while(++index < length){
  //         this.waves[index].strokeStyle = gradient;
  //       }
        
  //       // Clean Up
  //       index = void 0;
  //       length = void 0;
  //       gradient = void 0;
  //     }
    // });
  // });
</script>

<style scoped lang="scss">
  div {
    width: 100%;
  }

  .u-legend, .u-axis {
    display: none;
  }
</style>
