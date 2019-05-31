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

export default {
  name: 'woof',
  props: {
    length: Number,
    type: String,
    scale: String,
  },
  data() {
    return {
      notes: new Array(this.length),
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
  created() {
    console.log('this.notes', this.notes);
    this.notes.forEach(note => {
      const index = _.random(0, this.noteOptions.length - 1);

      console.log('index', index);
      Vue.set(this.notes, index, this.noteOptions[index]);
      return this.noteOptions[index];
    });
    // Vue.set(this.notes, 0, 100)
    // this.notes = _.times(this.length, ()=>({val: ''}));
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
