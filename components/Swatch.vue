<template>
  <section class="swatch">
    <header>Weaving Swatch</header>
    <div class="swatch-display">
      <div class="swatch-grid" 
        :style="{
          gridTemplateColumns: 'repeat(' + (swatchWidth) + ', 1fr)'}"
        >
        <div 
          class="swatch-grid-note"
          v-for="(item, i) in gridItems"
          :class="{hide: !item, active: isActiveGridItem(i)}"
          :style="{'background-color': item ? swatchNoteColors[Math.floor(i / swatchWidth)][i % swatchWidth] : 'transparent'}"
          :key="`${gridItemsKey}_${i}`">
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import _ from 'lodash';
import * as Chord from 'tonal-chord';
import Woof from './woof';
// import patterns from '../../../services/weaving/patterns';
import scale from '../lib/scale';
import midi from '../lib/midi';
import euclidean from '../lib/euclidean';
const RESET_TIMEOUT = 10 * 1000; // reset grid if no ticks in 10 seconds
import audio from '../lib/audio';
import { useStore } from '@/store/main';
import { useWeaveStore } from '~/store/weave-settings';
import { useMusicStore } from '~/store/music-settings';
import { storeToRefs } from 'pinia';

const store = useStore();
const weaveStore = useWeaveStore();
const musicStore = useMusicStore();
const { useWebAudio, webAudioSynth, warpNoteColors, gridItems, gridItemsKey, errorMsg, swatchNoteColors } = storeToRefs(store);
const { swatchWidth, swatchDepth, patternType, weaveX, weaveY, euclideanCount } = storeToRefs(weaveStore);
const { stackType, noteScale, rangeMin, rangeMax } = storeToRefs(musicStore);

const warp = ref();
const weft = ref();

let scaleOptions = ref(scale.names),
  timer = ref({}),
  index = ref(-1),
  warpActive = ref(false),
  warpIndex = ref(-1),
  weftActive = ref(false),
  weftIndex = ref(-1),
  warpNote = ref(0),
  weftNote = ref(0),
  chord = ref('Maj7'),
  resetTimer = setTimeout(() => {}, 0);

const { $listen } = useNuxtApp();

watch(patternType, () => {
  handlePatternChange();
});
watch(euclideanCount, () => {
  handlePatternChange();
});
watch(swatchWidth, () => {
  handleUpdateLength();
});
watch(swatchDepth, () => {
  handleDepthChange();
});
watch(weaveX, () => {
  computeWeave();
});
watch(weaveY, () => {
  computeWeave();
});
watch(() => noteScale.value, () => {
  store.initNotes();
});
// watch(() => props.length, () => {
//   store.initNotes();
// });
watch(() => rangeMin.value, () => {
  store.initNotes();
});
watch(() => rangeMax.value, () => {
  store.initNotes();
});

function computeWeave() {
  const pattern = [weaveX.value, weaveY.value],
    length = pattern.reduce((acc, item) => acc += item);
  
  // to do: rename this, since it's more about the weave than the note
  store.noteGrid = [];
  _.times(swatchDepth.value, (i) => {
    const row = [];

    
    _.times(swatchWidth.value, (j) => {
      row.push( ( (i + swatchWidth.value - j) % length) < pattern[0] ? true : false );
    });

    store.noteGrid.push(row);
  });
}

function handleTick(source, value) {
  // could differentiate behavior based on source

  index.value++;

  if (source === 'external') {
    const warpIndex = index.value % swatchWidth.value; // make computed value
    // this.$refs.warp.updateNoteAtIndex(value, warpIndex);
    warp.updateNoteAtIndex(value, warpIndex);
  }

  advanceStack();

  clearTimeout(resetTimer);

  resetTimer = setTimeout(() => {
    handleClockOff();
  }, RESET_TIMEOUT);
}
function handleUpdateLength() {
  handlePatternChange();
  index.value = 0;

  store.initNotes();
  store.initializeWebAudioSynth();
  store.webAudioSynth.start();
}

function handleDepthChange() {
  handlePatternChange();
  store.initializeWebAudioSynth();
  store.webAudioSynth.start();
}

function handlePatternChange() {
  if (patternType.value === 'euclidean') {
    return handleEuclidean();
  }

  computeWeave();
}
function handleEuclidean() {
  let pattern = euclidean.generateEuclideanSequence(swatchWidth.value, euclideanCount.value);

  let shiftPattern = (pattern, x) => {
    let shift = _.clone(pattern);

    return shift.map((val, i) => {
      const index = (i + pattern.length - x) % pattern.length;
      return pattern[index];
    });
  };
  
  store.noteGrid = [];
  _.times(swatchDepth.value, (i) => {
    const shift = shiftPattern(pattern, i);

    store.noteGrid.push(shift);
  });
}
function sendNote(channel, note, velocity) {
  try {
    audio.playNote(channel, note, store.noteLength, useWebAudio.value && webAudioSynth.value );
  } catch (error) {
    store.isOn = false;
    errorMsg.value = error;
    console.error(error);
  }

  // return;
  // channel = 1;
  // midi.noteOn(channel, note, velocity);
  // console.log('channel', channel);
  // console.log('note', note);

  // if (noteLength) {
  //   // only send noteOff if noteLength > 0
  //   setTimeout(() => {
  //     midi.noteOff(channel, note, velocity);
  //   }, noteLength);
  // }
}

function advanceStack() {
  let noteValue, chordInterval;
  // determine warp/weft coordinates
  let warpIndex = index.value % swatchWidth.value;

  if (!warp) {
    console.log('warp not found');
    return;
  }
  
  const rows = swatchDepth.value;
  
  _.times(rows, row => {
    const channel = row + 1;
    const isActive = store.noteGrid[row][warpIndex];
    
    noteValue = parseInt(store.swatchNotes[row][warpIndex]);
    
    if (stackType.value === 'octave') {
      noteValue += (12 * row);
    }
      
    if (isActive) {
      sendNote(row, noteValue, 127);
    }
  });
}

function isActiveGridItem(i) {
  return (index.value % swatchWidth.value) === (i % swatchWidth.value);
}

function handleClockOff() {
  // reset
  index.value = -1;
  warpActive = false;
  warpIndex = -1;
  weftActive = false;
  weftIndex = -1;
}

onMounted(() => {
  store.initNotes();
  handlePatternChange();
  $listen('tick', () => handleTick('internal'));
  $listen('clock-off', handleClockOff);
  $listen('trigger-in', ({noteValue, velocity}) => handleTick('external', noteValue / 127));
});
</script>

<style lang="scss">
.swatch {
  display: block;
  margin-top: 20px;
  padding: 10px;
  position: relative;
  width: calc(100% - 20px);

  header {
    font-size: 24px;
  }
  
  &-settings {
    border: solid black 2px;
  }

  &-display {
    margin-top: 20px;
  }

  &-grid {
    // border: solid black 2px;
    display: grid;
    position: absolute;
    padding-bottom: 40px;
    width: 100%;
    // margin: 80px auto auto 80px;
    // grid-auto-rows: 1fr;
    // grid-template-columns: repeat(4, 1fr);
  }
  &-grid-row {
    // display: block;
    // width: 100%;
  }
  &-grid-note {
    // box-sizing: border-box;

    margin: 0;
    padding: 5px;
    border: 2px solid black;
    padding: 44%;
    // height: 50px;
    // width: 50px;

    &.top {
      background-color: black;
    }

    &.hide {
      // color: white !important;
    }

    &.active {
      border-inline: solid black 4px;
    }
  }
}
</style>
