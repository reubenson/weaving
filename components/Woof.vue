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

const props = defineProps({
  length: Number,
  type: String,
  active: Boolean,
  index: Number,
  tick: Number,
  note: Number,
  chord: String,
});

let chordIndex = ref(0);

const data = reactive({
  notes: []
});

const noteOptions = computed({
  get: () => {
    const tonic = 'C';
    const range = Math.max(rangeMax.value - rangeMin.value, 0);

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
});

const columnsLength = computed({
  get: () => {
    return props.type === 'warp' ? props.length: 1;
  }
});

// function getNextNoteInChord() {
//   const intervals = Chord.intervals(props.chord);
//   const semitones = intervals.map(interval => Interval.semitones(interval));
//   const baseNote = parseInt(noteOptions.value[0]);

//   console.log('baseNote', baseNote);

//   const note = baseNote + semitones[chordIndex % semitones.length];

//   console.log('note', note);

//   chordIndex += 1;

//   return note;
// }
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

  store.updateGridItemsKey();
  if (props.type === 'warp') {
    store.warpNotes = data.notes;
  }
}
// function getNote(index) {
//   return data.notes[index];
// }

// function getNotes() {
//   return data.notes;
// }

// function getBaseNote() {
//   return data.notes[0];
// }
// function handleInput(i, val) {
//   data.notes[i] = val;
// }
// function updateLength(val) {
//   this.$bus.$emit('update-length', { type: this.type, length: val} );
// }
watch(() => noteScale.value, (xx) => {
  initNotes();
});
watch(() => props.length, () => {
  initNotes();
});
watch(() => rangeMin.value, () => {
  initNotes();
});
watch(() => rangeMax.value, () => {
  initNotes();
});
  // },
onMounted(() => {
  initNotes();
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
