<template>
  <div id="wrapper">
    <top-nav></top-nav>
    <main>
      <midi-drivers v-if="!useWebAudio" class="config-section"></midi-drivers>
      <settings-pane :title="'Clock Settings'">
        <p class="settings-description">Change the BPM (beats per minute) to modify how fast we advance through the sequence controlled in <em>Music Settings</em></p>
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
      </settings-pane>
      <settings-pane :title="'Music Settings'">
        <p class="settings-description">These settings modify the underlying sequence of notes played as we advance from left to right in the <em>Weaving Swatch</em> below.</p>
        <div>
          <p class="setting-title">Sequence Type</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Sequence Type"
              :width="200"
              trigger="click"
              content="select the type of music sequence: random is random, and 'sine' provides a waveform that produces a set of notes."
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <!-- <p class="setting-description" v-if="waveformType === 'random'">The sequence of notes is randomly picked from the chord specified below</p>
          <p class="setting-description" v-if="waveformType === 'sine'">The sequence of notes is picked based on the shape of this waveform</p> -->
          <client-only>
            <el-select
              v-model="sequenceType"
            >
              <el-option
                v-for="item in sequenceTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </client-only>
        </div>
        <div>
          <p class="setting-title">Chord Name</p>
          <client-only>

            <el-popover
              class="settings-info"
              placement="top-start"
              title="Chord Name"
              :width="200"
              trigger="click"
              content="The notes in the selected chord will be used to populate the note sequence"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <client-only>
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
          </client-only>
          <notation />
        </div>
        <div>
          <p class="setting-title">Filter chord by number of notes</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Chord Name"
              :width="200"
              trigger="click"
              content="Select lower values to filter the chord options with fewer notes"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <client-only>
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
        </div>
        <div>
          <p class="setting-title">Lower Register</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Lower Register"
              :width="200"
              trigger="click"
              content="Select lower values to filter the chord options with fewer notes"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <el-slider
            :min="0"
            :max="8"
            :step="1"
            show-stops
            v-model="rangeMin"
          ></el-slider>
        </div>
        <div>
          <p class="setting-title">Upper Register</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Upper Register"
              :width="200"
              trigger="click"
              content="Select the upper register for the note sequence"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <el-slider
            :min="0"
            :max="8"
            :step="1"
            show-stops
            v-model="rangeMax"
          ></el-slider>
        </div>
        <client-only>
          <p class="setting-title">Stack Type</p>
          <el-select
              label="Stack Type"
              v-model="stackType"
            >
              <el-option
                v-for="item in stackTypeOptions"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
        </client-only>
        <el-button
          class="border"
          v-if="musicStore.sequenceType === 'random'"
            @click="musicStore.handleRandomize"
          >Randomize note sequence</el-button>
        <div v-if="musicStore.sequenceType === 'sine'">
          <p>Change sine waveform</p>
          <p class="setting-description">This waveform is used to generate the note sequence. By adding negative or positive harmonics to a sine wave, this waveform can be transformed from a saw wave to a sine wave.</p>
          <el-slider
            :min="-8"
            :max="8"
            :step="0.1"
            v-model="sineHarmonics"
            ></el-slider>
          <client-only>
            <waveform></waveform>
          </client-only>
        </div>
      </settings-pane>
      <settings-pane :title="'Weave Settings'">
        <p class="settings-description">
          In weaving, <em>warp</em> refers to the vertical lines and <em>warp</em> refers to the horizontal lines, which are woven between the  weft. In the swatch below, the warp (vertical) lines represent notes in the note sequence generated by the <em>Music Settings</em>, and the weft (horizontal) lines represent individual voices that play the notes defined by the warp. To simplify the resulting tonality, the weft lines are handles as octaves, such that when more than one is played simultaneously, they alter the timbre of the voicing rather simply, as stacked octaves. This results in a translation of the weaving pattern that would be rather familiar to anyone who has previously used an MPC sequencer.
        </p>
        <div>
          <p class="setting-title">Warp Count</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Warp Count"
              :width="200"
              trigger="click"
              content="In weaving, a warp is thread hung vertically. In our sequencer, a warp represents a note in the note sequence"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <p class="setting-description"></p>
          <el-input-number 
            v-model="swatchWidth"
            :step="1"
            :min="2"/>
        </div>
        <div>
          <p class="setting-title">Weft Count</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Weft Count"
              :width="200"
              trigger="click"
              content="In weaving, a warp is thread hung vertically. In our sequencer, a warp represents a note in the note sequence"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <el-input-number 
            v-model="swatchDepth"
            :step="1"
            :min="2"/>
        </div>
        <div>
          <p class="setting-title">Pattern Type</p>
          <client-only>
            <el-popover
              class="settings-info"
              placement="top-start"
              title="Pattern Type"
              :width="200"
              trigger="click"
              content="Weave: apply traditional weaving patterns. Euclidean: apply a 'euclidean' algorithm, which will construct a pattern in which notes are evenly spaced across the sequence"
            >
              <template #reference>
                <el-button class="m-2">&#9432;</el-button>
              </template>
            </el-popover>
          </client-only>
          <client-only>
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
        </div>
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
  import MidiDrivers from './MidiDrivers';
  import TopNav from './TopNav';
  import Swatch from './Swatch';
  import SettingsPane from './SettingsPane';
  import Waveform from './Waveform';
  import Notation from './Notation';
  import { useStore } from '@/store/main';
  import { useMusicStore } from '@/store/music-settings';
  import { useWeaveStore } from '@/store/weave-settings';
  import { storeToRefs } from 'pinia';
  const { $event } = useNuxtApp();

  const store = useStore();
  const musicStore = useMusicStore();
  const weaveStore = useWeaveStore();
  const { useWebAudio, bpm, bpmInterval, isOn, notesAsNames } = storeToRefs(store);
  const { chordOptions, noteScale, chordSizeFilter, rangeMin, rangeMax, sequenceType, sequenceTypeOptions, sineHarmonics, stackType, stackTypeOptions } = storeToRefs(musicStore);
  const { swatchWidth, swatchDepth, patternOptions, patternType, weaveX, weaveY, euclideanCount } = storeToRefs(weaveStore);

  onMounted(() => {
    store.initializeWebAudioSynth();
  });

  watch(sequenceType, store.initNotes);
  watch(sineHarmonics, store.initNotes);

  // clock
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
    // padding-top: 80px;
    // margin-bottom: 40px;
    // padding: 80px 40px;
    // width: 100vw;
    // padding-bottom: 40px;
  }

  main {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin: 10px;
  }
  .config-section, .settings-pane {
    border: solid black 2px;
    flex-basis: 250px;
    flex-grow: 1;
    padding: 10px;
    margin: 10px;

    header {
      font-size: 20px;
      margin-bottom: 10px;
    }

    .settings-description {
      margin-bottom: 10px;
      text-align: justify;
    }

    .setting-title {
      display: inline-block;
    }

    .setting-description {
      font-size: .8em;
    }

    .el-button {
      background-color: transparent;
      border: none;
      padding: 5px;
    }

    .border {
      border: solid black 2px;
    }

    .el-slider {
      padding: 0 10px;
    }

    .el-input-number, .el-select {
      display: block;
    }
  }
</style>
