<template>
  <section class="swatch">
    <ui-select
      label="Scale Selection"
      placeholder="Select a Scale"
      :options="scaleOptions"
      v-model="scale"
    ></ui-select>
    <woof :length=width :scale=scale type="warp"
      :active="warpActive"
      :index="warpIndex"
      :tick="index"
    ></woof>
    <woof :length=depth :scale=scale type="weft"
      :active="weftActive"
      :index="weftIndex"
      :tick="index"
    ></woof>
    <div class="swatch-grid" 
      :style="{
        gridTemplateColumns: 'repeat(' + (width) + ', 1fr)',
        width: (50 * width) + 'px'
        }"
      >
      <div 
        class="swatch-grid-note"
        :class="{top: item, active: i === index}"
        v-for="(item, i) in gridItems"
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
import _ from 'lodash';
import { UiSelect } from 'keen-ui';
import Woof from './woof';
import patterns from '../../../services/weaving/patterns';
import scale from '../../lib/scale';
import eventBus from '../../lib/eventBus';
import midi from '../../lib/midi';

export default {
  name: 'swatch',
  data() {
    return {
      width: 4,
      depth: 4,
      noteLength: 50,
      noteGrid: [],
      scale: 'major',
      pattern: 'plain',
      readMode: 'single', // or 'stack'
      scaleOptions: scale.names,
      timer: {},
      index: -1,
      warpActive: false,
      warpIndex: -1,
      weftActive: false,
      weftIndex: -1
    };
  },
  computed: {
    swatchGridSize() {
      return (this.width + 1) * (this.depth + 1);
    },
  },
  methods: {
    computeWeave() {
      const pattern = patterns[this.pattern],
        length = pattern.reduce((acc, item) => acc += item);
      
      this.noteGrid = [];

      _.times(this.depth, (i) => {
        const row = [];

        _.times(this.width, (j) => {
          row.push( ( (i + j) % length) < pattern[0] ? true : false );
        });

        this.noteGrid.push(row);
      });

      console.log('this.noteGrid', this.noteGrid);

      // expand grid to include labels
      // this.gridItems = 
      this.gridItems = _.reduce(this.noteGrid, (acc, item) => _.concat(acc, item), []);
    },
    handleTick() {
      // console.log('val', val);
      this.advance();
    },
    advance() {
      //
      this.index++;

      // determine warp/weft coordinates
      let warpIndex = this.index % this.width;
      let weftIndex = Math.floor(this.index / this.width) % this.depth;

      // determine whether the warp or weft is to be triggered
      let isWarpActive = this.noteGrid[weftIndex][warpIndex];

      // console.log('this.noteGrid[weftIndex][warpIndex]', this.noteGrid[weftIndex][warpIndex]);

      // send MIDI note on the active channel
      if (isWarpActive) {
        // get note corresponding to warpIndex
        this.warpActive = true;
        this.weftActive = false;
        this.warpIndex = warpIndex;
      } 
      
      if (!isWarpActive) {
        // get note corresponding to weftIndex
        // this.warpActive = false;
        // this.weftActive = true;
        // this.weftIndex = weftIndex;
      }

      // midi.noteOn(1, 15, 127);
      // setTimeout(() => {
      //   midi.noteOff(1, 15, 127);
      // }, 200);

      this.index = this.index % (this.width * this.depth);
      //
    }
  },
  created() {
    this.computeWeave();
    console.log('this.noteGrid', this.noteGrid);

    eventBus.on('tick', this.handleTick);
  },
  components: {
    Woof,
    UiSelect,
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
