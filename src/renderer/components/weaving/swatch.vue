<template>
  <section class="swatch">
    <ui-button
      @click="handleRandomize"
    >Randomize</ui-button>
    <div>
      <h4>Octave Range</h4>
      <ui-slider
        label="clock"
        :min="-1"
        :max="5"
        :step="1"
        :snapToSteps=true
        v-model="rangeMin"
      ></ui-slider>
      <ui-slider
        label="clock"
        :min="-1"
        :max="5"
        :step="1"
        :snapToSteps=true
        v-model="rangeMax"
      ></ui-slider>
    </div>
    <ui-select
      label="Note Trigger Length"
      :options="noteLengthOptions"
      v-model="noteLength"
    ></ui-select>
    <ui-select
      label="Pattern Selection"
      placeholder="Select a Pattern"
      :options="patternOptions"
      v-model="pattern"
    ></ui-select>
    <ui-slider
      v-if="pattern === 'weave'"
      v-model="weaveX"
      :min="1"
      :max="8"
      :step="1"
      :snapToStems=true
    ></ui-slider>
    <ui-slider
      v-if="pattern === 'weave'"
      v-model="weaveY"
      :min="1"
      :max="8"
      :step="1"
      :snapToStems=true
    ></ui-slider>
    <ui-slider
      v-if="pattern === 'euclidean'"
      label="Euclidean Sequence Density"
      v-model="euclideanCount"
      :min="1"
      :max="width"
      :step="1"
      :snapToSteps=true
    ></ui-slider>
    <ui-select
      label="Scale Selection"
      placeholder="Select a Scale"
      :options="scaleOptions"
      v-model="scale"
    ></ui-select>
    <ui-select
      label="Chord Selection"
      :options="chordOptions"
      v-model="chord"
    ></ui-select>
    <ui-select
      label="warp length"
      :options="lengthOptions"
      v-model="width"
    ></ui-select>
    <ui-select
      label="weft length"
      :options="lengthOptions"
      v-model="depth"
    ></ui-select>
    <woof
      ref="warp"
      :length=width
      :scale=scale
      :mode=readMode
      type="warp"
      :active="warpActive"
      :index="warpIndex"
      :tick="index"
      :note="warpNote"
      :rangeMin="rangeMin"
      :rangeMax="rangeMax"
      :chord="chord"
    ></woof>
    <woof
      ref="weft"
      :length=depth
      :scale=scale
      :mode=readMode
      type="weft"
      :active="weftActive"
      :index="weftIndex"
      :tick="index"
      :note="weftNote"
      :rangeMin="rangeMin"
      :rangeMax="rangeMax"
      :chord="chord"
    ></woof>
    <div class="swatch-grid" 
      :style="{
        gridTemplateColumns: 'repeat(' + (width) + ', 1fr)',
        width: (50 * width) + 'px'
        }"
      >
      <div 
        class="swatch-grid-note"
        v-for="(item, i) in gridItems"
        :class="{top: item, active: isActiveGridItem(i)}"
        :key="i">
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
  </section>
</template>

<script>
/* eslint-disable */
import Vue from 'vue';
import _ from 'lodash';
import { UiSelect, UiSlider, UiButton } from 'keen-ui';
import * as Chord from 'tonal-chord';
import Woof from './woof';
import patterns from '../../../services/weaving/patterns';
import scale from '../../lib/scale';
import eventBus from '../../lib/eventBus';
import midi from '../../lib/midi';
import euclidean from '../../lib/euclidean';
import { mapState } from 'vuex';
const RESET_TIMEOUT = 10 * 1000; // reset grid if no ticks in 10 seconds

export default {
  name: 'swatch',
  data() {
    return {
      width: 16,
      depth: 4,
      noteLength: 100,
      noteGrid: [],
      scale: 'major',
      pattern: 'weave',
      // readMode: 'single', // or 'stack'
      readMode: 'stack',
      scaleOptions: scale.names,
      patternOptions: ['weave', 'euclidean'],
      timer: {},
      index: -1,
      warpActive: false,
      warpIndex: -1,
      weftActive: false,
      weftIndex: -1,
      lengthOptions: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
      warpNote: 0,
      weftNote: 0,
      euclideanCount: 1,
      rangeMin: 3,
      rangeMax: 4,
      weaveX: 1,
      weaveY: 1,
      noteLengthOptions: _.times(11, i => i * 10),
      chordOptions: Chord.names(),
      chord: 'maj7',
      generator: '', // ['', 'lfo']
      resetTimer: setTimeout(() => {}, 0),
    };
  },
  computed: {
    swatchGridSize() {
      return (this.width + 1) * (this.depth + 1);
    },
  },
  watch: {
    pattern() {
      this.handlePatternChange();
    },
    euclideanCount() {
      this.handlePatternChange();
    },
    width() {
      this.handleUpdateLength();
    },
    depth() {
      this.handleUpdateLength();
    },
    weaveX() {
      this.computeWeave();
    },
    weaveY() {
      this.computeWeave();
    },
  },
  methods: {
    computeWeave() {
      // const pattern = patterns[this.pattern],
      const pattern = [this.weaveX, this.weaveY],
        length = pattern.reduce((acc, item) => acc += item);
      
      this.noteGrid = [];

      _.times(this.depth, (i) => {
        const row = [];

        _.times(this.width, (j) => {
          row.push( ( (i + this.width - j) % length) < pattern[0] ? true : false );
        });

        this.noteGrid.push(row);
        Vue.set(this, 'noteGrid', this.noteGrid);
      });

      console.log('this.noteGrid', this.noteGrid);

      // expand grid to include labels
      // this.gridItems = 
      this.gridItems = _.reduce(this.noteGrid, (acc, item) => _.concat(acc, item), []);
    },
    handleRandomize() {
      this.$refs.warp.initNotes();
    },
    handleTick(source, value) {
      // could differentiate behavior based on source

      this.index++;

      if (source === 'external') {
        const warpIndex = this.index % this.width; // make computed value
        this.$refs.warp.updateNoteAtIndex(value, warpIndex);
      }

      this.advance();

      clearTimeout(this.resetTimer);

      this.resetTimer = setTimeout(() => {
        this.handleClockOff();
      }, RESET_TIMEOUT);
    },
    handleUpdateLength() {
      // if (type === 'woof') {
      //   this.width = length;
      // } else {
      //   this.height = length;
      // }

      this.computeWeave();
      this.index = 0;
    },
    handlePatternChange() {
      if (this.pattern === 'euclidean') {
        return this.handleEuclidean();
      }

      this.computeWeave();
    },
    handleEuclidean() {
      let pattern = euclidean.generateEuclideanSequence(this.width, this.euclideanCount);
      const shiftPattern = (pattern, x) => {
        let shift = _.clone(pattern);

        return shift.map((val, i) => {
          const index = (i + pattern.length - x) % pattern.length;
          return pattern[index];
        });
      };
      
      this.noteGrid = [];
      _.times(this.depth, (i) => {
        const shift = shiftPattern(pattern, i);
        this.noteGrid.push(shift);
        Vue.set(this, 'noteGrid', this.noteGrid);
      });

      // expand grid to include labels
      // this.gridItems = 
      this.gridItems = _.reduce(this.noteGrid, (acc, item) => _.concat(acc, item), []);
    },
    sendNote(channel, note, velocity) {
      midi.noteOn(channel, note, velocity);

      if (this.noteLength) {
        // only send noteOff if noteLength > 0
        setTimeout(() => {
          midi.noteOff(channel, note, velocity);
        }, this.noteLength);
      }
    },
    advanceSingle() {
      const organHack = false;

      // determine warp/weft coordinates
      let warpIndex = this.index % this.width;
      let weftIndex = Math.floor(this.index / this.width) % this.depth;

      // determine whether the warp or weft is to be triggered
      let isWarpActive = this.noteGrid[weftIndex][warpIndex];

      // console.log('this.noteGrid[weftIndex][warpIndex]', this.noteGrid[weftIndex][warpIndex]);

      // send MIDI note on the active channel
      if (isWarpActive || organHack) {
        // get note corresponding to warpIndex
        this.warpActive = true;
        this.weftActive = false;
        this.warpIndex = warpIndex;

        // const noteValue = parseInt(this.$refs.warp.getNote(warpIndex));
        const noteValue = parseInt(this.$refs.warp.getNextNoteInChord());
        console.log('1: noteValue', noteValue);
        this.sendNote(1, noteValue, 127);

        if (organHack) {
          this.sendNote(2, noteValue + 7, 127);
          this.sendNote(3, noteValue - 5, 127);
          this.sendNote(4, noteValue + 12, 1276)
        }
      } 
      
      if (!isWarpActive && !organHack) {
        // get note corresponding to weftIndex
        this.warpActive = false;
        this.weftActive = true;
        this.weftIndex = weftIndex;

        // const noteValue = parseInt(this.$refs.weft.getNote(weftIndex));
        const noteValue = parseInt(this.$refs.weft.getNextNoteInChord());
        console.log('2: noteValue', noteValue);
        this.sendNote(2, noteValue, 127);
        this.sendNote(4, noteValue -5, 127);
      }

      // midi.noteOn(1, 15, 127);
      // setTimeout(() => {
      //   midi.noteOff(1, 15, 127);
      // }, 200);

      this.index = this.index % (this.width * this.depth);
    },
    advanceStack() {
      let noteValue, chordInterval;
      // determine warp/weft coordinates
      let warpIndex = this.index % this.width;
      let weftIndex = Math.floor(this.index / this.width) % this.depth;
      if (!this.$refs.warp) {
        console.log('warp not found');
        return;
      }

      // read from randomize
      noteValue = parseInt(this.$refs.warp.getNote(warpIndex));
      // read from LFO generator
      // noteValue = 

      // apply interval from weft

      const rows = this.depth;

      _.times(rows, row => {
        const channel = row + 1;
        const isActive = this.noteGrid[row][warpIndex];

        // apply interval from weft
        // chordInterval = parseInt(this.$refs.weft.getInterval(row)) || 0;
        // noteValue += chordInterval;

        if (isActive) {
          this.sendNote(2 * channel, noteValue, 127);
        } else {
          this.sendNote(2 * channel + 1, noteValue, 127);
        }

      });

      // send downbeat to channel 1
      if (warpIndex === 0) {
        const middleC = 60;
        this.sendNote(1, 60, 127);
      }

      return;

      // advance warpIndex with index
      this.warpIndex = this.index;
      this.weftIndex = 0; // temp

      this.warpActive = false;
      console.log('this.weftIndex', this.weftIndex);
      console.log('this.warpIndex', this.warpIndex);
      this.weftActive = this.noteGrid[this.weftIndex][this.warpIndex];
      console.log('this.weftActive', this.weftActive);
      this.index =  this.index % this.width;
      this.weftIndex = this.index;

      // console.log('this.$refs.hi', this.$refs.hi);
      this.weftNote = this.$refs.warp.getNote(this.index);
      this.warpNote = this.weftNote; // temp

      console.log('this.weftNote', this.weftNote);


    },
    advance() {
        if (this.readMode === 'single') {
        this.advanceSingle();
      } else if (this.readMode === 'stack') {
        this.advanceStack();
      }
      // // determine warp/weft coordinates
      // let warpIndex = this.index % this.width;
      // let weftIndex = Math.floor(this.index / this.width) % this.depth;

      // // determine whether the warp or weft is to be triggered
      // let isWarpActive = this.noteGrid[weftIndex][warpIndex];

      // // console.log('this.noteGrid[weftIndex][warpIndex]', this.noteGrid[weftIndex][warpIndex]);

      // // send MIDI note on the active channel
      // if (isWarpActive) {
      //   // get note corresponding to warpIndex
      //   this.warpActive = true;
      //   this.weftActive = false;
      //   this.warpIndex = warpIndex;
      // } 
      
      // if (!isWarpActive) {
      //   // get note corresponding to weftIndex
      //   this.warpActive = false;
      //   this.weftActive = true;
      //   this.weftIndex = weftIndex;
      // }

      // // midi.noteOn(1, 15, 127);
      // // setTimeout(() => {
      // //   midi.noteOff(1, 15, 127);
      // // }, 200);

      // this.index = this.index % (this.width * this.depth);
      //
    },
    isActiveGridItem(i) {
      if (this.readMode === 'single') {
        return this.index === i;
      } else if (this.readMode === 'stack') {
        return (this.index % this.width) === (i % this.width);
      }

      return false;
    },
    handleClockOff() {
      // reset
      this.index = -1;
      this.warpActive = false;
      this.warpIndex = -1;
      this.weftActive = false;
      this.weftIndex = -1;
    },
  },
  created() {
    this.computeWeave();
    console.log('this.noteGrid', this.noteGrid);

    eventBus.on('tick', () => this.handleTick('internal'));
    eventBus.on('clock-off', this.handleClockOff);
    eventBus.on('trigger-in', (data) => this.handleTick('external', data / 127));
  },
  components: {
    Woof,
    UiSelect, UiSlider, UiButton,
  },
};
</script>

<style lang="scss">
.swatch {
  position: relative;

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

    &.active {
      border: solid blue 4px;
    }

    // display: inline;
  }
}

// .swatch-grid {
//   display: grid;
// }
</style>
