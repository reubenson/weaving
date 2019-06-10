<template>
  <div class="woof" :class="type">
    <div class="woof-notes"
      :style="{
        gridTemplateColumns: 'repeat(' + (columnsLength) + ', 1fr)',
        width: (50 * width) + 'px'
        }">      
      <ui-select
        v-for="(note, i) in notes"
        class="woof-notes-select"
        label=""
        placeholder=""
        :key="i"
        :options="noteOptions"
        :value="note"
        @input="handleInput(i, $event)"
      ></ui-select>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Vue from 'vue';
import _ from 'lodash';
import { UiSelect } from 'keen-ui';
import scale from '../../lib/scale';
import midi from '../../lib/midi';

export default {
  name: 'woof',
  props: {
    length: Number,
    type: String,
    scale: String,
    active: Boolean,
    index: Number,
    activeNote: Number,
    tick: Number
  },
  data() {
    return {
      notes: new Array(this.length),
      channel: 0
    };
  },
  computed: {
    noteOptions() {
      const tonic = 'C';
      const octave = 0;
      return scale.noteSet(this.scale, tonic, octave, 1) || [];
    },
    columnsLength() {
      return this.type === 'warp' ? this.length: 1;
    },
  },
  methods: {
    handleInput(i, val) {
      Vue.set(this.notes, i, '' + val);
    }
  },
  watch: {
    active() {
      // console.log('this.active', this.active);
      // if (this.active) {
      //   // trigger note-on
      //   console.log('note on');
      //   this.activeNote = this.notes[this.index];
      //   midi.noteOn(2, this.activeNote, 127);
      //   // setTimeout(() => {
      //   //   midi.noteOff(1, note, 127);
      //   // }, 100);
      // } else {
      //   // trigger note-off
      //   console.log('note off');
      //   //  midi.noteOff(2, this.activeNote, 127);
      // }
    },
    index() {
      // console.log('this.index', this.index);
    },
    tick() {
      console.log('this.active', this.active);
      if (this.active) {
        // trigger note-on
        console.log('note on');
        this.activeNote = this.notes[this.index];
        midi.noteOn(this.channel, this.activeNote, 127);
        // setTimeout(() => {
        //   midi.noteOff(1, note, 127);
        // }, 100);
      } else {
        // trigger note-off
        console.log('note off');
         midi.noteOff(this.channel, this.activeNote, 127);
      }
    }
  },
  created() {
    console.log('this.notes here', this.notes);

    // Vue.set(this.notes, 0, '' + this.noteOptions[0]);
    // this.notes[0] = this.noteOptions[0];

    _.times(this.length, i => {
      // console.log('note', note);
      const value = _.random(0, this.noteOptions.length - 1);
      
      // console.log('index', index);
      Vue.set(this.notes, i, '' + this.noteOptions[value]);
      // return this.noteOptions[index];
    });
    // Vue.set(this.notes, 0, 100)
    // this.notes = _.times(this.length, ()=>({val: ''}));

    if (this.type === 'warp') {
      this.channel = 1;
    } else {
      this.channel = 2;
    }
    console.log('this.channel', this.channel);
  },
  components: {
    UiSelect,
  }
};
</script>

<style lang="scss">
  .woof {
    position: absolute;

    &-notes {
      display: grid;
    }

    &-notes-select {
      width: 60px;
    }
  }

  .woof.warp {
    margin-left: 80px;
  }

  .woof.weft {
    margin-top: 80px;
  }
</style>
