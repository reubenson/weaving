<template>
  <div class="woof" :class="type">
    <div class="woof-notes"
      :style="{
        gridTemplateColumns: 'repeat(' + (columnsLength) + ', 1fr)',
        width: (50 * length) + 'px'
        }">
      <client-only>
        <el-select
          v-for="(note, i) in data.notes"
          class="woof-notes-select"
          :key="i"
          v-model="data.notes[i]"
        >
          <el-option
            v-for="item in noteOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </client-only>
    </div>
  </div>
</template>

<script setup>
/* eslint-disable */

import * as Chord from 'tonal-chord';
import { Interval } from 'tonal';
import _ from 'lodash';
import scale from '../lib/scale';
import midi from '../lib/midi';
import { useStore } from '~/store/main';
import { useMusicStore } from '~/store/music-settings';
import { storeToRefs } from 'pinia';

const { $event } = useNuxtApp();
const store = useStore();
const musicStore = useMusicStore();
const { noteScale, rangeMin, rangeMax } = storeToRefs(musicStore);

// export default {
  // name: 'woof',
  // props: {
const props = defineProps({
  length: Number,
  type: String,
  // scale: String,
  active: Boolean,
  index: Number,
  tick: Number,
  note: Number,
  // rangeMin: Number,
  // rangeMax: Number,
  chord: String,
  mode: String,
})
  // },
  // data() {
    // return {
// let notes = ref(new Array(props.length)),
//   channel = ref(0),
//   activeNote = ref(0),
let chordIndex = ref(0);

const data = reactive({
  notes: []
});
      // chordOptions: Chord.names()
  //   };
  // },
  // computed: {
const noteOptions = computed({
  get: () => {
      const tonic = 'C';
      const range = Math.max(rangeMax.value - rangeMin.value, 0);

      if (props.mode === 'stack') {
        if (props.type === 'warp') {
          return (scale.noteSet(noteScale.value, tonic, rangeMin.value, range) || []).map(num => `${num}`);
        } else {
          // chord mode
          const intervals = Chord.intervals(props.chord);
          const semitones = intervals.map(interval => Interval.semitones(interval));
  
          return semitones.map(num => `${num}`);
        }

        return;
      }

      if (props.mode === 'single') {
        console.log('scale', scale);
        console.log('range', range);
        console.log('tonic', tonic);
        console.log('single', scale.noteSet(noteScale.value, tonic, rangeMin.value, range) );
        return (scale.noteSet(noteScale.value, tonic, rangeMin.value, range) || [])
          .map(num => `${num}`);
      }
    }
  });
    // intervalOptions() {
    //   return Chord.intervals(this.chord).map(interval => Chord.semitones(interval));
    // },
const columnsLength = computed({
  get: () => {
      return props.type === 'warp' ? props.length: 1;
    }
  });
  // },
  // methods: {
function getNextNoteInChord() {
      const intervals = Chord.intervals(props.chord);
      const semitones = intervals.map(interval => Interval.semitones(interval));
      const baseNote = parseInt(noteOptions.value[0]);

      console.log('baseNote', baseNote);

      const note = baseNote + semitones[chordIndex % semitones.length];

      console.log('note', note);

      chordIndex += 1;

      return note;
    }
function getInterval(index) {

      return props.type === 'weft' ? data.notes[index] : 0;
    }
function initNotes() {
  store.initNotes();

  data.notes = store.notes;

  return;

  data.notes = [];

  if (props.mode === 'stack' && props.type === 'weft') {
    _.times (props.length, i => {
      const value = noteOptions.value[i % noteOptions.value.length];

      data.notes[i] = value;
    });

    return;
  }

  _.times(props.length, i => {
    data.notes = store.notes;
    // get random note
    // const value = _.random(0, noteOptions.value.length - 1);

  // const note = baseNote + semitones[chordIndex % semitones.length];
  // console.log('note', note);
    // const value = this.noteOptions[i % (this.noteOptions.length - 1)];
    // console.log('value', value);
    // console.log('index', index);
    
    // console.log('index', index);
    // console.log('this.noteOptions', this.noteOptions);
    // Vue.set(this.notes, i, '' + this.noteOptions[value]);
    // data.notes[i] = noteOptions.value[value];
    // Vue.set(this.notes, i, '' + note);

    // console.log('this.noteOptions', this.noteOptions);
    // if (this.type === 'weft') {
    //   this.intervals = Chord.intervals(this.chord).map(interval => Chord.semitones(interval));
    // }
    // return this.noteOptions[index];

  });

  // $event('notes-set', data.notes);
  store.updateGridItemsKey();
  if (props.type === 'warp') {
    store.warpNotes = data.notes;
  }
}
function getNote(index) {
  return data.notes[index];
}

function getNotes() {
  return data.notes;
}

function getBaseNote() {
      return data.notes[0];
    }
function handleInput(i, val) {
  data.notes[i] = val;
}
function updateLength(val) {
      this.$bus.$emit('update-length', { type: this.type, length: val} );
    }
function updateNoteAtIndex(value, index) {
      const note = scale.determineNote(noteOptions.value.map(x => parseInt(x)), value);

      handleInput(index, note);
    }
  // },
  // watch: {
  // active() {
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
    // },
watch(() => noteScale.value, (xx) => {
  initNotes();
  // this.handleScaleChange();
});
watch(() => props.chord, (val) => {
  console.log('vall', val);
  initNotes();
});
watch(props.index, () => {
      // console.log('this.index', this.index);
    });
watch(props.tick, () => {
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
    });
watch(() => props.length, () => {
  initNotes();
  console.log('props.length', props.length);
});
watch(() => rangeMin.value, () => {
  initNotes();
});
watch(() => rangeMax.value, () => {
  initNotes();
});
  // },
onMounted(() => {

    // Vue.set(this.notes, 0, '' + this.noteOptions[0]);
    // this.notes[0] = this.noteOptions[0];

    initNotes();
    // _.times(this.length, i => {
    //   // console.log('note', note);
    //   const value = _.random(0, this.noteOptions.length - 1);
      
    //   // console.log('index', index);
    //   Vue.set(this.notes, i, '' + this.noteOptions[value]);
    //   // return this.noteOptions[index];
    // });
    // Vue.set(this.notes, 0, 100)
    // this.notes = _.times(this.length, ()=>({val: ''}));

    // probably not needed below?
    // if (props.type === 'warp') {
    //   props.channel = 1;
    // } else {
    //   props.channel = 2;
    // }
    // console.log('props.channel', props.channel);
  });

// probably a better way to set this up
defineExpose({
  initNotes,
  updateNoteAtIndex,
  getNextNoteInChord,
  getNotes,
  getNote
});
</script>

<style lang="scss">
  .woof {
    position: absolute;
    display: none;

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
