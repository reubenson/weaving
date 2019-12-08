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
import * as Chord from 'tonal-chord';
import { Interval } from 'tonal';
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
    tick: Number,
    note: Number,
    rangeMin: Number,
    rangeMax: Number,
    chord: String,
    mode: String,
  },
  data() {
    return {
      notes: new Array(this.length),
      channel: 0,
      activeNote: 0,
      chordIndex: 0,
      // chordOptions: Chord.names()
    };
  },
  computed: {
    noteOptions() {
      const tonic = 'C';
      const range = Math.max(this.rangeMax - this.rangeMin, 0);

      if (this.mode === 'stack') {
        if (this.type === 'warp') {
          return scale.noteSet(this.scale, tonic, this.rangeMin, range) || [];
        } else {
          // chord mode
          const intervals = Chord.intervals(this.chord);
          const semitones = intervals.map(interval => Interval.semitones(interval));
  
          console.log('semitones', semitones);
  
          console.log('intervals', intervals);
          return semitones;
        }

        return;
      }

      if (this.mode === 'single') {
        console.log('scale', scale);
        console.log('range', range);
        console.log('tonic', tonic);
        console.log('single', scale.noteSet(this.scale, tonic, this.rangeMin, range) );
        return scale.noteSet(this.scale, tonic, this.rangeMin, range) || [];
      }

      console.log('here?');
      
    },
    // intervalOptions() {
    //   return Chord.intervals(this.chord).map(interval => Chord.semitones(interval));
    // },
    columnsLength() {
      return this.type === 'warp' ? this.length: 1;
    },
  },
  methods: {
    getNextNoteInChord() {
      const intervals = Chord.intervals(this.chord);
      const semitones = intervals.map(interval => Interval.semitones(interval));
      const baseNote = parseInt(this.noteOptions[0]);

      console.log('baseNote', baseNote);

      const note = baseNote + semitones[this.chordIndex % semitones.length];

      console.log('note', note);

      this.chordIndex += 1;

      return note;
    },
    getInterval(index) {

      return this.type === 'weft' ? this.notes[index] : 0;
    },
    initNotes() {
      Vue.set(this, 'notes', []);

      if (this.mode === 'stack' && this.type === 'weft') {
        _.times (this.length, i => {
          const value = this.noteOptions[i % this.noteOptions.length];
          console.log('value', value);

          Vue.set(this.notes, i, '' + value);
        });

        return;
      }

      _.times(this.length, i => {
        const value = _.random(0, this.noteOptions.length - 1);
        
        // console.log('index', index);
        console.log('this.noteOptions', this.noteOptions);
        Vue.set(this.notes, i, '' + this.noteOptions[value]);

        // console.log('this.noteOptions', this.noteOptions);
        // if (this.type === 'weft') {
        //   this.intervals = Chord.intervals(this.chord).map(interval => Chord.semitones(interval));
        // }
        // return this.noteOptions[index];
      });
    },
    getNote(index) {
      return this.notes[index];
    },
    getBaseNote() {
      return this.notes[0];
    },
    handleInput(i, val) {
      Vue.set(this.notes, i, '' + val);
    },
    updateLength(val) {
      this.$emit('update-length', { type: this.type, length: val} );
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
    scale() {
      this.initNotes();
      // this.handleScaleChange();
    },
    chord() {
      this.initNotes();
    },
    index() {
      // console.log('this.index', this.index);
    },
    tick() {
      // not flexible enough
      return;
      const channel = this.index;

      // if (this.type === 'warp') {
      //   console.log('return early:', this.type);
      //   return;
      // }

      console.log('this.index', this.index);

      _.times(this.length, i => {
        console.log('i', i);
        midi.noteOff(i, this.activeNote, 127);
      })

      if (this.active) {
        // trigger note-on
        console.log('note on');
        this.activeNote = this.notes[this.index];

        if (this.note) {
          this.activeNote = this.note;
          console.log('this.activeNote', this.activeNote);
        }

        // midi.noteOn(this.channel, this.activeNote, 127);
        // midi.noteOn(channel, this.activeNote, 127);
        // setTimeout(() => {
        //   midi.noteOff(1, note, 127);
        // }, 100);
      } else {
        // trigger note-off
        console.log('note off');
         midi.noteOff(this.channel, this.activeNote, 127);
      }
    },
    length() {
      this.initNotes();
      console.log('this.length', this.length);
    },
    rangeMin() {
      this.initNotes();
    },
    rangeMax() {
      this.initNotes();
    }
  },
  mounted() {

    // Vue.set(this.notes, 0, '' + this.noteOptions[0]);
    // this.notes[0] = this.noteOptions[0];

    this.initNotes();
    // _.times(this.length, i => {
    //   // console.log('note', note);
    //   const value = _.random(0, this.noteOptions.length - 1);
      
    //   // console.log('index', index);
    //   Vue.set(this.notes, i, '' + this.noteOptions[value]);
    //   // return this.noteOptions[index];
    // });
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
