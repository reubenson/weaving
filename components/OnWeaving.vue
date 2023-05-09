<template>
  <div id="wrapper">
    <top-nav></top-nav>
    <main>
      <midi-drivers v-if="!useWebAudio" class="config-section"></midi-drivers>
      <clock class="config-section"></clock>
      <settings-pane :title="'Music Settings'">
        <client-only>
          <p>Chord Name</p>
          <el-select
            v-model="noteScale"
          >
            <el-option
              v-for="item in chordOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <p>Filter chord by number of notes in chord</p>
          <el-select
            label="Filter chord selector by number of notes"
            v-model="chordSizeFilter"
          >
            <el-option
              v-for="item in [3, 4, 5, 6, 7]"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </client-only>
        <p>Octave Range</p>
        <el-slider
          :min="0"
          :max="8"
          :step="1"
          show-stops
          v-model="rangeMin"
        ></el-slider>
        <el-slider
          :min="0"
          :max="8"
          :step="1"
          show-stops
          v-model="rangeMax"
        ></el-slider>
        <!-- <el-button
          @click="musicStore.handleRandomize"
        >Randomize note sequence</el-button> -->
      </settings-pane>
      <settings-pane :title="'Weave Settings'">
        <p>Weft Length</p>
        <client-only>
          <el-select v-model="swatchWidth">
            <el-option
              v-for="item in [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <p>Warp Length</p>
          <el-select v-model="swatchDepth">
            <el-option
              v-for="item in [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </client-only>
        <client-only>
          <p>Pattern Type</p>
          <el-select
            v-model="patternType"
          >
            <el-option
              v-for="item in patternOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </client-only>
        <div v-if="patternType === 'weave'">
          <p>Weave X</p>
          <el-slider
          v-model="weaveX"
          :min="1"
          :max="8"
          :step="1"
        ></el-slider>
        <p>Weave Y</p>
        <el-slider
          v-if="patternType === 'weave'"
          v-model="weaveY"
          :min="1"
          :max="8"
          :step="1"
        ></el-slider>
        </div>
        <div v-if="patternType === 'euclidean'">
          <p>Euclidean Sequence Density</p>
          <el-slider
            v-model="euclideanCount"
            :min="1"
            :max="swatchWidth"
            :step="1"
          ></el-slider>
        </div>
      </settings-pane>
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
  import SettingsPane from './SettingsPane'
  import { useStore } from '@/store/main';
  import { useMusicStore } from '@/store/music-settings';
  import { useWeaveStore } from '@/store/weave-settings';
  import { storeToRefs } from 'pinia';

  const store = useStore();
  const musicStore = useMusicStore();
  const weaveStore = useWeaveStore();
  const { useWebAudio } = storeToRefs(store);
  const { chordOptions, noteScale, chordSizeFilter, rangeMin, rangeMax } = storeToRefs(musicStore);
  const { swatchWidth, swatchDepth, patternOptions, patternType, weaveX, weaveY, euclideanCount } = storeToRefs(weaveStore);

  onMounted(() => {
    store.initializeWebAudioSynth();
  });
</script>

<style lang="scss">

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

  section {
    margin-bottom: 40px;
  }
  
  #wrapper {
    font-family: Helvetica, sans-serif;
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

  main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .config-section, .settings-pane {
    border: solid black 2px;
    flex-basis: 240px;
    flex-grow: 1;
    padding: 10px;
    margin: 10px;

    header {
      font-size: 20px;
      margin-bottom: 10px;
    }

    .el-slider {
      padding: 0 10px;
    }
  }
</style>
