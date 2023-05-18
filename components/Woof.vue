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
import { useStore } from '~/store/main';
import { useMusicStore } from '~/store/music-settings';
import { storeToRefs } from 'pinia';

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
  }
});

const columnsLength = computed({
  get: () => {
    return props.type === 'warp' ? props.length: 1;
  }
});

function initNotes() {
  store.initNotes();

  data.notes = store.notes;
}

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

// onMounted(() => {
//   initNotes();
// });
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
