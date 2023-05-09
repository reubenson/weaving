<template>
  <section class="swatch">
    <div class="swatch-settings">
      <!-- <client-only>
        <p>Note Trigger Length</p>
        <el-select
          v-model="noteLength"
        >
          <el-option
            v-for="item in noteLengthOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </client-only> -->
      <div>
        <h2>Weave settings</h2>
        <header>Warp Length</header>
        <client-only>
          <el-select v-model="store.swatchWidth">
            <el-option
              v-for="item in lengthOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <header>Warp Length</header>
          <el-select v-model="store.swatchDepth">
            <el-option
              v-for="item in lengthOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </client-only>
        <client-only>
          <p>Pattern Type</p>
          <el-select
            v-model="pattern"
          >
            <el-option
              v-for="item in patternOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </client-only>
        <div v-if="pattern === 'weave'">
          <header>Weave X</header>
          <el-slider
          v-model="weaveX"
          :min="1"
          :max="8"
          :step="1"
        ></el-slider>
        <header>Weave Y</header>
        <el-slider
          v-if="pattern === 'weave'"
          v-model="weaveY"
          :min="1"
          :max="8"
          :step="1"
        ></el-slider>
        </div>
        <div v-if="pattern === 'euclidean'">
          <header>Euclidean Sequence Density</header>
        </div>
        <el-slider
          v-model="euclideanCount"
          :min="1"
          :max="store.swatchWidth"
          :step="1"
        ></el-slider>
      </div>
      <div>
        <header>Music Settings</header>
        <h3>Musical Scale</h3>
        <client-only>
          <header>Chord Name</header>
          <el-select
            label="Note Set Selection"
            placeholder="Select a Chord"
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
        <client-only>
          <header>Filter chord by number of notes in chord</header>
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
        <header>Octave Range</header>
        <el-slider
          :min="0"
          :max="8"
          :step="1"
          show-stops
          v-model="store.rangeMin"
        ></el-slider>
        <el-slider
          :min="0"
          :max="8"
          :step="1"
          show-stops
          v-model="store.rangeMax"
        ></el-slider>
        <el-button
          @click="handleRandomize"
        >Randomize note sequence</el-button>
        <!-- deprecate chord selection -->
        <!-- <ui-select
          label="Chord Selection"
          :options="chordOptions"
          v-model="chord"
        ></ui-select> -->
      </div>
    </div>
    <div class="swatch-display">
      <woof
        ref="warp"
        :length=store.swatchWidth
        :scale=noteScale
        :mode=readMode
        type="warp"
        :active="warpActive"
        :index="warpIndex"
        :tick="index"
        :note="warpNote"
        :rangeMin="store.rangeMin"
        :rangeMax="store.rangeMax"
        :chord="chord"
      ></woof>
      <woof
        ref="weft"
        :length=store.swatchDepth
        :scale=noteScale
        :mode=readMode
        type="weft"
        :active="weftActive"
        :index="weftIndex"
        :tick="index"
        :note="weftNote"
        :rangeMin="store.rangeMin"
        :rangeMax="store.rangeMax"
        :chord="chord"
      ></woof>
      <div class="swatch-grid" 
        :style="{
          gridTemplateColumns: 'repeat(' + (store.swatchWidth) + ', 1fr)',
          width: (50 * store.swatchWidth) + 'px'
          }"
        >
        <div 
          class="swatch-grid-note"
          v-for="(item, i) in gridItems"
          :class="{hide: !item, active: isActiveGridItem(i)}"
          :style="{'background-color': warpNoteColors[i % store.swatchWidth]}"
          :key="`${gridItemsKey}_${i}`">
        </div>
        <!-- <div v-for="n in width + 1" class="swatch-grid-label"></div> -->
        <!-- <div class="swatch-grid-row"> -->
          <!-- <div v-for="i in (width + 1)" class="swatch-grid-label"></div> -->
        <!-- </div> -->
        <!-- <div v-for="row in noteGrid" class="swatch-grid-row"> -->
          <!-- <div class="swatch-grid-label"></div> -->
          <!-- <div v-for="note in row" class="swatch-grid-note" :class="{top: note}"></div> -->
        <!-- </div> -->
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';

/* eslint-disable */
import _ from 'lodash';
// import colormap from 'colormap';
import * as Chord from 'tonal-chord';
import Woof from './woof';
// import patterns from '../../../services/weaving/patterns';
import scale from '../lib/scale';
import midi from '../lib/midi';
import euclidean from '../lib/euclidean';
const RESET_TIMEOUT = 10 * 1000; // reset grid if no ticks in 10 seconds
import audio from '../lib/audio';
import { useStore } from '@/store/main';
import { storeToRefs } from 'pinia';

const store = useStore();
const { useWebAudio, webAudioSynth, gridItems, gridItemsKey, warpNoteColors } = storeToRefs(store);

const warp = ref();
const weft = ref();

// let width = ref(16);
// let depth = ref();
let noteLength = ref(100);
// let noteGrid = ref([]);
let noteScale = ref('maj7');
let pattern = ref('euclidean');
      // readMode: 'single', // or 'stack'
let readMode = ref('stack'),
  scaleOptions = ref(scale.names),
  patternOptions = ref(['weave', 'euclidean']),
  timer = ref({}),
  index = ref(-1),
  warpActive = ref(false),
  warpIndex = ref(-1),
  weftActive = ref(false),
  weftIndex = ref(-1),
  lengthOptions = ref([2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]),
  warpNote = ref(0),
  weftNote = ref(0),
  euclideanCount = ref(1),
  weaveX = ref(1),
  weaveY = ref(1),
  // noteLengthOptions = ref(_.times(11, i => i * 10)),
  // chordOptions: Chord.names(),
  chord = ref('Maj7'),
  chordSizeFilter = ref(4),
  generator = ref(''), // ['', 'lfo']
  resetTimer = setTimeout(() => {}, 0),
  warpNotes = ref([]);

const { $listen } = useNuxtApp();

// const gridItems_x = computed({
//   get: () => {
//     const allItems = _.reduce(noteGrid, (acc, item) => _.concat(acc, item))
//       .map(item => {
//         return {
//           status: item
//         }
//       }),
//       allNotes = 
//     // gridItems = _.reduce(noteGrid, (acc, item) => _.concat(acc, item), []);

//   }
// });

const swatchGridSize = computed({
  get: () => {
    return (store.swatchWidth + 1) * (store.swatchDepth + 1);
  }
});

const chordOptions = computed({
  get: () => {
    const names = Chord.names();

    return names.filter(name => {
      return Chord.notes(`C4${name}`).length === chordSizeFilter.value;
    });
  }
});

  // watch: {    
watch(pattern, () => {
  handlePatternChange();
});
watch(euclideanCount, () => {
  handlePatternChange();
});
watch(store.swatchWidth, () => {
      handleUpdateLength();
    });
watch(store.swatchDepth, () => {
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
  
  store.noteGrid = [];
  _.times(store.swatchDepth, (i) => {
    const row = [];

    
    _.times(store.swatchWidth, (j) => {
      row.push( ( (i + store.swatchWidth - j) % length) < pattern[0] ? true : false );
    });

    store.noteGrid.push(row);

    console.log('store.noteGrid', store.noteGrid);
  });

  // expand grid to include labels
  // data.gridItems = _.reduce(store.noteGrid, (acc, item) => _.concat(acc, item), []);
  // console.log('data.gridItems', data.gridItems);
}

function handleRandomize() {
  warp.value.initNotes();
}

function handleTick(source, value) {
  // console.log('value', value);
  // could differentiate behavior based on source

  index.value++;

  if (source === 'external') {
    const warpIndex = index.value % store.swatchWidth; // make computed value
    // this.$refs.warp.updateNoteAtIndex(value, warpIndex);
    warp.updateNoteAtIndex(value, warpIndex);
    console.log('value', value);
  }

  advance();

  clearTimeout(resetTimer);

  resetTimer = setTimeout(() => {
    handleClockOff();
  }, RESET_TIMEOUT);
}
function handleUpdateLength() {
      // if (type === 'woof') {
      //   this.width = length;
      // } else {
      //   this.height = length;
      // }

      computeWeave();
      index.value = 0;
    }
function handlePatternChange() {
  if (pattern.value === 'euclidean') {
    return handleEuclidean();
  }

  computeWeave();
}
function handleEuclidean() {
  let pattern = euclidean.generateEuclideanSequence(store.swatchWidth, euclideanCount.value);

  console.log('pattern', pattern);
  let shiftPattern = (pattern, x) => {
    let shift = _.clone(pattern);

    return shift.map((val, i) => {
      const index = (i + pattern.length - x) % pattern.length;
      return pattern[index];
    });
  };
  
  store.noteGrid = [];
  _.times(store.swatchDepth, (i) => {
    const shift = shiftPattern(pattern, i);

    console.log('shift', shift);
    store.noteGrid.push(shift);
  });

  console.log('store.noteGrid', store.noteGrid);

  // expand grid to include labels
  // this.gridItems = 
  // data.gridItems = _.reduce(store.noteGrid, (acc, item) => _.concat(acc, item), []);
}
function sendNote(channel, note, velocity) {
      // send note to web audio synth OR midi
      audio.playNote(channel, note, store.noteLength, useWebAudio.value && webAudioSynth.value );
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
function advanceSingle() {
      // determine warp/weft coordinates
      let warpIndex = index.value % store.swatchWidth;
      let weftIndex = Math.floor(index.value / store.swatchWidth) % store.swatchDepth;

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

      index.value = index.value % (store.swatchWidth * store.swatchDepth);
    }
function advanceStack() {
  let noteValue, chordInterval;
  // determine warp/weft coordinates
  let warpIndex = index.value % store.swatchWidth;
  let weftIndex = Math.floor(index.value / store.swatchWidth) % store.swatchDepth;

  // if (!this.$refs.warp) {
  if (!warp) {
    console.log('warp not found');
    return;
  }

  // read from randomize
  // noteValue = parseInt(this.$refs.warp.getNote(warpIndex));
  noteValue = parseInt(warp.value.getNote(warpIndex));
  // read from LFO generator
  // noteValue = 

  // apply interval from weft

  const rows = store.swatchDepth;

  _.times(rows, row => {
    const channel = row + 1;
    const isActive = store.noteGrid[row][warpIndex];

    // apply interval from weft
    // chordInterval = parseInt(this.$refs.weft.getInterval(row)) || 0;
    // noteValue += chordInterval;

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
        return (index.value % store.swatchWidth) === (i % store.swatchWidth);
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

// created() {
    computeWeave();

    // eventBus.on('tick', () => this.handleTick('internal'));
    // eventBus.on('clock-off', this.handleClockOff);
    // eventBus.on('trigger-in', ({noteValue, velocity}) => this.handleTick('external', noteValue / 127));
    
  // },
  onMounted(() => {
    $listen('tick', () => handleTick('internal'));
    $listen('clock-off', handleClockOff);
    $listen('trigger-in', ({noteValue, velocity}) => handleTick('external', noteValue / 127));
    // $listen('notes-set', handleWoofNotesSet)
  });
</script>

<style lang="scss">
.swatch {
  margin-top: 20px;
  position: relative;
  
  &-settings {
    border: solid black 2px;
    padding: 20px;
  }

  &-display {
    margin-top: 20px;
  }

  &-grid {
    display: grid;
    position: absolute;
    margin: 80px auto auto 80px;
    // grid-auto-rows: 1fr;
    // grid-template-columns: repeat(4, 1fr);
  }
  &-grid-row {
    // display: block;
    // width: 100%;
  }
  &-grid-note {
    // box-sizing: border-box;

    margin: 5px;
    padding: 5px;
    border: 1px solid black;
    height: 50px;
    width: 50px;

    &.top {
      background-color: black;
    }

    &.hide {
      opacity: 0;
    }

    &.active {
      border: solid blue 4px;
    }
    // display: inline;
  }
}
</style>