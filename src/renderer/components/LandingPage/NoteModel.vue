<template>
  <div class="note-model">
    <p>Name:
      <span v-if="!showConfigurationEdit">{{ name }}</span>
      <input v-model="name" v-if="showConfigurationEdit">
    </p>
    <div>
      <p>Scale: 
        <span v-if="!showConfigurationEdit">{{ scale }}</span>
        <select v-model="scale" v-if="showConfigurationEdit">
          <option v-for="item in scaleNames" :key="item" :value="item" :selected="isSelected('scale', item)">
            {{ item }}
          </option>
        </select>
      </p>
    </div>
    <div>
      <p>Tonic: 
        <span v-if="!showConfigurationEdit">{{ tonic }}</span>
        <select v-model="tonic" v-if="showConfigurationEdit">
          <option v-for="item in tonics" :key="item" :value="item" :selected="isSelected('tonic', item)">
            {{ item }}
          </option>
        </select>
      </p>
    </div>
    <div>
      <p>Octave:
        <span v-if="!showConfigurationEdit">{{ octave }}</span>
        <select v-model="octave" v-if="showConfigurationEdit">
          <option v-for="item in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]" 
            :key="item" :value="item" :selected="isSelected('octave', item)">
            {{ item }}
          </option>
        </select>
      </p>
    </div>
    <div>
      <p>Generator: 
        <span v-if="!showConfigurationEdit">{{ generator }}</span>
        <select v-model="generator" v-if="showConfigurationEdit">
          <option v-for="item in generatorOptions" :key="item" :value="item" :selected="isSelected('generator', item)">
            {{ item }}
          </option>
        </select>
      </p>
    </div>
    <div>
      Output Channel:
      <span v-if="!showConfigurationEdit">{{ channel }}</span>
      <select class="map-list-item-select" name="" v-model="channel" v-if="showConfigurationEdit">
        <option v-for="channelOpt in channels" :key="channelOpt" :value="channelOpt" :selected="isSelectedChannel(channelOpt)">
          {{ channelOpt }}
        </option>
      </select>
    </div>
    <button @click="remove(id)" class="btn btn-secondary remove">x</button>
  </div>
</template>

<script>
import _ from 'lodash';
import midi from '../../lib/midi';
import generators from '../../lib/generators';
import scale from '../../lib/scale';

function noteDistance(a, b) {
  // const A0 = { midi: 21, freq: 27.5 };
  return Math.abs(b - a);
}

// MIDI note retrieval from noteArr
function getNearestNote(noteArr, note) {
  return _.reduce(noteArr, (acc, item) => {
    const distances = [noteDistance(item, note), noteDistance(acc, note)];

    return distances[0] < distances[1] ? item : acc;
  }, null);
}

export default {
  name: 'note-model',
  props: ['id', 'index'],
  data() {
    return {
      scaleNames: scale.names,
      tonics: scale.tonics,
    };
  },
  computed: {
    name: {
      get() {
        return this.$store.state.Config.noteModels[this.id].name;
      },
      set(val) {
        this.$store.commit('UPDATE_NOTE_MODEL', {
          id: this.id,
          name: val.trim(),
        });
      },
    },
    showConfigurationEdit() {
      return this.$store.getters.showConfigurationEdit;
    },
    channels() {
      const allChannels = _.times(16, i => i + 1);
      const taken = this.$store.getters.channels
        .filter(item => item !== this.channel);

      return _.pullAllBy(allChannels, taken);
    },
    channel: {
      get() {
        return this.$store.getters.getNoteModel(this.id).channel;
      },
      set(val) {
        this.$store.commit('UPDATE_NOTE_MODEL', {
          id: this.id,
          channel: parseInt(val, 10),
        });
      },
    },
    generator: {
      get() {
        return _.get(this.$store.getters.getNoteModel(this.id), 'generator');
      },
      set(val) {
        this.$store.commit('UPDATE_NOTE_MODEL', {
          id: this.id,
          generator: val,
        });
      },
    },
    scale: {
      get() {
        return _.get(this.$store.getters.getNoteModel(this.id), 'scale');
      },
      set(val) {
        this.$store.commit('UPDATE_NOTE_MODEL', {
          id: this.id,
          scale: val,
        });
      },
    },
    tonic: {
      get() {
        return _.get(this.$store.getters.getNoteModel(this.id), 'tonic');
      },
      set(val) {
        this.$store.commit('UPDATE_NOTE_MODEL', {
          id: this.id,
          tonic: val,
        });
      },
    },
    octave: {
      get() {
        return _.get(this.$store.getters.getNoteModel(this.id), 'octave');
      },
      set(val) {
        this.$store.commit('UPDATE_NOTE_MODEL', {
          id: this.id,
          octave: val,
        });
      },
    },
    noteSet() {
      return scale.noteSet(this.scale, this.tonic, this.octave);
    },
    generatorOptions() {
      return Object.keys(generators);
    },
  },
  methods: {
    getNextNote() {
      let note = generators[this.generator]();

      // TODO normalize generator to note range
      note = Math.round(note * 127);
      note = getNearestNote(this.noteSet, note);
      // TODO: normalize to scale and range

      this.note = note;
    },
    isSelected(field, value) {
      return this[field] === value;
    },
    isSelectedChannel(channel) {
      return this.channel === parseInt(channel, 10);
    },
    sendNoteOn(velocity) {
      this.getNextNote();
      if (this.note) {
        midi.noteOn(this.channel, this.note, velocity);
        midi.noteOn(this.channel, this.note - 15, velocity);
      }
    },
    sendNoteOff() {
      // TODO: this.note may not correlated to the correct note
      if (this.note) {
        midi.noteOff(this.channel, this.note);
        midi.noteOff(this.channel, this.note - 15);
      }
      this.$store.commit('RESET_NOTE_MODEL', this.id);
    },
    remove(id) {
      this.$store.commit('REMOVE_NOTE_MODEL', id);
    },
    handleTrigger(triggerOn) {
      const handleOn = this.sendNoteOn;
      const handleOff = this.sendNoteOff;
      const handler = triggerOn ? handleOn : handleOff;

      return (id, velocity) => {
        if (id === this.id) {
          handler(velocity);
        }
      };
    },
  },
  mounted() {
    this.$eventBus.on('note-model:trigger-on', this.handleTrigger(true));
    this.$eventBus.on('note-model:trigger-off', this.handleTrigger(false));
  },
};
</script>

<style>
.note-model {
  background-color: white;
}
</style>
