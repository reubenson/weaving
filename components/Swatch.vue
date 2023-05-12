<template>
  <section class="swatch">
    <header>Weaving Swatch</header>
    <div class="swatch-display">
      <woof
        ref="warp"
        :length=swatchWidth
        :mode=readMode
        type="warp"
        :active="warpActive"
        :index="warpIndex"
        :tick="index"
        :note="warpNote"
        :chord="chord"
      ></woof>
      <woof
        ref="weft"
        :length=swatchDepth
        :mode=readMode
        type="weft"
        :active="weftActive"
        :index="weftIndex"
        :tick="index"
        :note="weftNote"
        :chord="chord"
      ></woof>
      <div class="swatch-grid" 
        :style="{
          gridTemplateColumns: 'repeat(' + (swatchWidth) + ', 1fr)'}"
        >
        <div 
          class="swatch-grid-note"
          v-for="(item, i) in gridItems"
          :class="{hide: !item, active: isActiveGridItem(i)}"
          :style="{'background-color': item ? swatchNoteColors[Math.floor(i / swatchWidth)][i % swatchWidth] : transparent}"
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
const { stackType } = storeToRefs(musicStore);

const warp = ref();
const weft = ref();

let readMode = ref('stack'),
  scaleOptions = ref(scale.names),
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
  handleUpdateLength();
});
watch(weaveX, () => {
  computeWeave();
});
watch(weaveY, () => {
  computeWeave();
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

    // console.log('store.noteGrid', store.noteGrid);
  });
}

function handleRandomize() {
  warp.value.initNotes();
}

function handleTick(source, value) {
  // could differentiate behavior based on source

  index.value++;

  if (source === 'external') {
    const warpIndex = index.value % swatchWidth.value; // make computed value
    // this.$refs.warp.updateNoteAtIndex(value, warpIndex);
    warp.updateNoteAtIndex(value, warpIndex);
  }

  advance();

  clearTimeout(resetTimer);

  resetTimer = setTimeout(() => {
    handleClockOff();
  }, RESET_TIMEOUT);
}
function handleUpdateLength() {
  computeWeave();
  index.value = 0;

  store.initializeWebAudioSynth();
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

  // console.log('store.noteGrid', store.noteGrid);
}
function sendNote(channel, note, velocity) {
  try {
    audio.playNote(channel, note, store.noteLength, useWebAudio.value && webAudioSynth.value );
  } catch (error) {
    store.isOn = false;
    errorMsg.value = error;
    console.error(error);
  }

      return;
      channel = 1;
      midi.noteOn(channel, note, velocity);
      console.log('channel', channel);
      console.log('note', note);

      if (noteLength) {
        // only send noteOff if noteLength > 0
        setTimeout(() => {
          midi.noteOff(channel, note, velocity);
        }, noteLength);
      }
    }

/**
 * todo: maybe a version of things that follows the weft winding line by line, left to right, right to left
 */
function advanceSingle() {
      // determine warp/weft coordinates
      let warpIndex = index.value % swatchWidth.value;
      let weftIndex = Math.floor(index.value / swatchWidth.value) % swatchDepth.value;

      // determine whether the warp or weft is to be triggered
      let isWarpActive = store.noteGrid[weftIndex][warpIndex];

      // send MIDI note on the active channel
      if (isWarpActive) {
        // get note corresponding to warpIndex
        warpActive = true;
        weftActive = false;
        warpIndex = warpIndex;

        // const noteValue = parseInt(this.$refs.warp.getNote(warpIndex));
        // const noteValue = parseInt(this.$refs.warp.getNextNoteInChord());
        const noteValue = parseInt(warp.getNextNoteInChord());
        console.log('1: noteValue', noteValue);
        sendNote(1, noteValue, 127);
      } 
      
      if (!isWarpActive) {
        // get note corresponding to weftIndex
        warpActive = false;
        weftActive = true;
        weftIndex = weftIndex;

        // const noteValue = parseInt(this.$refs.weft.getNote(weftIndex));
        // const noteValue = parseInt(this.$refs.weft.getNextNoteInChord());
        const noteValue = parseInt(weft.getNextNoteInChord());
        console.log('2: noteValue', noteValue);
        // temp comment out
        sendNote(2, noteValue, 127);
        sendNote(4, noteValue -5, 127);
      }

      // midi.noteOn(1, 15, 127);
      // setTimeout(() => {
      //   midi.noteOff(1, 15, 127);
      // }, 200);

      index.value = index.value % (swatchWidth.value * swatchDepth.value);
    }
function advanceStack() {
  let noteValue, chordInterval;
  // determine warp/weft coordinates
  let warpIndex = index.value % swatchWidth.value;
  // let weftIndex = Math.floor(index.value / swatchWidth.value) % swatchDepth.value;

  if (!warp) {
    console.log('warp not found');
    return;
  }

  
  const rows = swatchDepth.value;
  
  _.times(rows, row => {
    const channel = row + 1;
    const isActive = store.noteGrid[row][warpIndex];
    
    noteValue = parseInt(store.swatchNotes[row][warpIndex]);
    // apply interval from weft
    // chordInterval = parseInt(this.$refs.weft.getInterval(row)) || 0;
    // noteValue += chordInterval;
    
    if (stackType.value === 'octave') {
      noteValue += (12 * row);
    }
      
    if (isActive) {
      sendNote(row, noteValue, 127);
      // forget why this factor of 2 for MIDI
      // sendNote(2 * channel, noteValue, 127);
    } else {
      // sendNote(channel, noteValue, 127);
      // sendNote(2 * channel + 1, noteValue, 127);
    }

  });

  // send downbeat to channel 1
  // to do : reimplement midi
  // if (warpIndex === 0) {
  //   const middleC = 60;
  //   sendNote(1, 60, 127);
  // }

  return;

  // advance warpIndex with index
  warpIndex = index;
  weftIndex = 0; // temp

  warpActive = false;
  console.log('weftIndex', weftIndex);
  console.log('warpIndex', warpIndex);
  weftActive = noteGrid[weftIndex][warpIndex];
  console.log('weftActive', weftActive);
  index =  index % width;
  weftIndex = index;

  // console.log('this.$refs.hi', this.$refs.hi);
  weftNote = $refs.warp.getNote(index);
  warpNote = weftNote; // temp

  console.log('weftNote', weftNote);
}

function advance() {
  if (readMode.value === 'single') {
    advanceSingle();
  } else if (readMode.value === 'stack') {
    advanceStack();
  }
}
function isActiveGridItem(i) {
      if (readMode.value === 'single') {
        return index.value === i;
      } else if (readMode.value === 'stack') {
        return (index.value % swatchWidth.value) === (i % swatchWidth.value);
      }

      return false;
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
  handlePatternChange()
  $listen('tick', () => handleTick('internal'));
  $listen('clock-off', handleClockOff);
  $listen('trigger-in', ({noteValue, velocity}) => handleTick('external', noteValue / 127));
});
</script>

<style lang="scss">
.swatch {
  display: block;
  margin-top: 20px;
  position: relative;
  width: 100%;

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
    border: 1px solid black;
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
      border-inline: solid blue 4px;
    }
  }
}
</style>
