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
      Output Channel: {{ channel }}
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


export default {
  name: 'note-model',
  props: ['id', 'index', 'receiveNoteOn'],
  data() {
    return {
      scaleNames: scale.names,
    };
  },
  computed: {
    name: {
      get() {
        return _.get(this.$store.getters.getNoteModel(this.id), 'name');
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
        this.$store.dispatch('saveConfig');
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
        this.$store.dispatch('saveConfig');
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
        this.$store.dispatch('saveConfig');
      },
    },
    // remove(id) {
    //   this.$store.commit('REMOVE_NOTE_MODEL', id);
    //   this.$store.dispatch('saveConfig');
    // },
    generatorOptions() {
      return Object.keys(generators);
    },
  },
  methods: {
    getNextNote() {
      let note = generators[this.generator]();

      note = Math.round(note * 127);
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
      console.log('this.note', this.note);
      if (this.note) {
        midi.noteOn(this.channel, this.note, velocity);
        midi.noteOn(this.channel, this.note - 15, velocity);
      }
      this.$store.commit('UNTRIGGER_NOTE_MODEL', this.id);
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
      this.$store.dispatch('saveConfig');
    },
  },
  watch: {
    receiveNoteOn(velocity) {
      if (this.receiveNoteOn) {
        this.sendNoteOn(velocity);
      }
    },
    receiveNoteOff() {
      if (this.receiveNoteOff) {
        console.log('noteOff', this.channel);
        this.sendNoteOff();
      }
    },
  },
  mounted() {
    this.receiveNoteOn = 0;
  },
};
</script>

<style>
.note-model {
  background-color: white;
}
</style>
