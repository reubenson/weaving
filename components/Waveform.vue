<template>
  <div class="waveform">
    <canvas id="waves" ref="root"></canvas>
  </div>
</template>

<script setup>
  import { SineWaves } from 'sine-waves';
  import { useMusicStore } from '~/store/music-settings';

  const musicStore = useMusicStore();
  const root = ref(null);

  onMounted(() => {
    const waves = new SineWaves({
      el: root.value,
      speed: 0,
      rotate: 0,
      ease: 'Linear',
      waveWidth: '1%',
      waves: [
        {
          timeModifier: 10,
          lineWidth: 2,
          amplitude: 50,
          segmentLenth: 1,
          wavelength: 25,
          type: musicStore.waveformFn
        }
      ],
  
      // Called on window resize
      resizeEvent: function() {
        var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
        gradient.addColorStop(0,"rgba(23, 0, 0, 0.2)");
        // gradient.addColorStop(0.5,"rgba(255, 255, 255, 0.5)");
        gradient.addColorStop(1,"rgba(23, 0, 0, 0.2)");
        
        var index = -1;
        var length = this.waves.length;
        while(++index < length){
          this.waves[index].strokeStyle = gradient;
        }
        
        // Clean Up
        index = void 0;
        length = void 0;
        gradient = void 0;
      }
    });
  })
</script>

<style scoped lang="scss">
  canvas {
    width: 100%;
  }
</style>
