<template>
  <section class="swatch">
    <div class="swatch-settings">
      <client-only>
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
      </client-only>
      <div>
        <h2>Weave settings</h2>
        <header>Warp Length</header>
        <client-only>
          <el-select v-model="width">
            <el-option
              v-for="item in lengthOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
          <header>Warp Length</header>
          <el-select v-model="depth">
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
          :max="width"
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
            v-model="scale"
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
            v-for="item in ['3','4','5','6','7']"
            :key="item"
            :label="item"
            :value="item"
          />
          </el-select>
        </client-only>
        <header>Octave Range</header>
        <el-slider
          :min="-1"
          :max="5"
          :step="1"
          show-stops
          v-model="rangeMin"
        ></el-slider>
        <el-slider
          :min="-1"
          :max="5"
          :step="1"
          show-stops
          v-model="rangeMax"
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
    </div>
  </section>
</template>

<script>
/* eslint-disable */
import _ from 'lodash';
// import { UiSelect, UiSlider, UiButton } from 'keen-ui';
import * as Chord from 'tonal-chord';
import Woof from './woof';
// import patterns from '../../../services/weaving/patterns';
import scale from '../lib/scale';
// import eventBus from '../lib/eventBus';
import midi from '../lib/midi';
import euclidean from '../lib/euclidean';
const RESET_TIMEOUT = 10 * 1000; // reset grid if no ticks in 10 seconds

export default {
  name: 'swatch',
  data() {
    return {
      width: 16,
      depth: 2,
      noteLength: 100,
      noteGrid: [],
      scale: 'maj7',
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
      rangeMin: 2,
      rangeMax: 4,
      weaveX: 1,
      weaveY: 1,
      noteLengthOptions: _.times(11, i => i * 10),
      // chordOptions: Chord.names(),
      chord: 'Maj7',
      chordSizeFilter: "4",
      generator: '', // ['', 'lfo']
      resetTimer: setTimeout(() => {}, 0),
    };
  },
  computed: {
    swatchGridSize() {
      return (this.width + 1) * (this.depth + 1);
    },
    chordOptions() {
      const names = Chord.names();

      return names.filter(name => {
        return Chord.notes(`C4${name}`).length === +this.chordSizeFilter;
      });
    }
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
    }
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
        // Vue.set(this, 'noteGrid', this.noteGrid);
        this.noteGrid = this.noteGrid;
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
      });

      // expand grid to include labels
      // this.gridItems = 
      this.gridItems = _.reduce(this.noteGrid, (acc, item) => _.concat(acc, item), []);
    },
    sendNote(channel, note, velocity) {
      channel = 1;
      midi.noteOn(channel, note, velocity);
      console.log('channel', channel);
      console.log('note', note);

      if (this.noteLength) {
        // only send noteOff if noteLength > 0
        setTimeout(() => {
          midi.noteOff(channel, note, velocity);
        }, this.noteLength);
      }
    },
    advanceSingle() {
      // determine warp/weft coordinates
      let warpIndex = this.index % this.width;
      let weftIndex = Math.floor(this.index / this.width) % this.depth;

      // determine whether the warp or weft is to be triggered
      let isWarpActive = this.noteGrid[weftIndex][warpIndex];

      // send MIDI note on the active channel
      if (isWarpActive) {
        // get note corresponding to warpIndex
        this.warpActive = true;
        this.weftActive = false;
        this.warpIndex = warpIndex;

        // const noteValue = parseInt(this.$refs.warp.getNote(warpIndex));
        const noteValue = parseInt(this.$refs.warp.getNextNoteInChord());
        console.log('1: noteValue', noteValue);
        this.sendNote(1, noteValue, 127);
      } 
      
      if (!isWarpActive) {
        // get note corresponding to weftIndex
        this.warpActive = false;
        this.weftActive = true;
        this.weftIndex = weftIndex;

        // const noteValue = parseInt(this.$refs.weft.getNote(weftIndex));
        const noteValue = parseInt(this.$refs.weft.getNextNoteInChord());
        console.log('2: noteValue', noteValue);
        // temp comment out
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

    // eventBus.on('tick', () => this.handleTick('internal'));
    // eventBus.on('clock-off', this.handleClockOff);
    // eventBus.on('trigger-in', ({noteValue, velocity}) => this.handleTick('external', noteValue / 127));
    
  },
  mounted() {
    this.$bus.$on('tick', () => this.handleTick('internal'));
    this.$bus.$on('clock-off', this.handleClockOff);
    this.$bus.$on('trigger-in', ({noteValue, velocity}) => this.handleTick('external', noteValue / 127));
  },
  components: {
    Woof,
    // UiSelect, UiSlider, UiButton,
  },
};
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

    &.active {
      border: solid blue 4px;
    }
    // display: inline;
  }
}
</style>
