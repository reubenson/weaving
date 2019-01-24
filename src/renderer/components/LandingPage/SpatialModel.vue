<template>
  <div class="spatial-model">
    <p>Name:
      <span v-if="!showConfigurationEdit">{{ name }}</span>
      <input v-model="name" v-if="showConfigurationEdit">
    </p>
    <div>
      Output Controller: {{ controller }}
        <span v-if="!showConfigurationEdit">{{ controller }}</span>
        <select class="map-list-item-select" name="" v-model="controller">
          <option v-for="item in controllers" :key="item" :value="item" :selected="isSelected('controller', item)">
            {{ item }}
          </option>
        </select>
    </div>
    <div>
      Output Channel: {{ channel }}
      <span v-if="!showConfigurationEdit">{{ channel }}</span>
      <select class="map-list-item-select" name="" v-model="channel" v-if="showConfigurationEdit">
        <option v-for="channelOpt in channels" :key="channelOpt" :value="channelOpt" :selected="isSelectedChannel(channelOpt)">
          {{ channelOpt }}
        </option>
      </select>
    </div>
    <button class="btn" @click="sendTestSignal">
      Send MIDI test signal to {{ controller }} controller on channel {{ channel }}
    </button>
    <button @click="remove(id)" class="btn btn-secondary remove">x</button>
  </div>
</template>

<script>
import _ from 'lodash';
import midi from '../../lib/midi';

export default {
  name: 'spatial-model',
  props: ['id'],
  data() {
    return {};
  },
  computed: {
    controllers() {
      return _.times(120, _.identity);
    },
    controller: {
      get() {
        return this.$store.state.Config.spatialModels[this.id].controller;
      },
      set(controller) {
        this.$store.commit('UPDATE_SPATIAL_MODEL', {
          id: this.id,
          controller,
        });
      },
    },
    name: {
      get() {
        return this.$store.state.Config.spatialModels[this.id].name;
      },
      set(val) {
        this.$store.commit('UPDATE_SPATIAL_MODEL', {
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

      return allChannels;
      // const taken = this.$store.getters.channels
      //   .filter(item => item !== this.channel);

      // return _.pullAllBy(allChannels, taken);
    },
    channel: {
      get() {
        return this.$store.state.Config.spatialModels[this.id].channel;
      },
      set(val) {
        this.$store.commit('UPDATE_SPATIAL_MODEL', {
          id: this.id,
          channel: parseInt(val, 10),
        });
      },
    },
  },
  methods: {
    isSelected(field, value) {
      return this[field] === value;
    },
    isSelectedChannel(channel) {
      return this.channel === parseInt(channel, 10);
    },
    // sendNoteOn(velocity) {
    //   this.getNextNote();
    //   if (this.note) {
    //     midi.noteOn(this.channel, this.note, velocity);
    //     midi.noteOn(this.channel, this.note - 15, velocity);
    //   }
    // },
    // sendNoteOff() {
    //   // TODO: this.note may not correlated to the correct note
    //   if (this.note) {
    //     midi.noteOff(this.channel, this.note);
    //     midi.noteOff(this.channel, this.note - 15);
    //   }
    //   this.$store.commit('RESET_NOTE_MODEL', this.id);
    // },
    remove(id) {
      this.$store.commit('REMOVE_NOTE_MODEL', id);
    },
    // handleTrigger(triggerOn) {
    //   const handleOn = this.sendNoteOn;
    //   const handleOff = this.sendNoteOff;
    //   const handler = triggerOn ? handleOn : handleOff;

    //   return (id, velocity) => {
    //     if (id === this.id) {
    //       handler(velocity);
    //     }
    //   };
    // },
    sendTestSignal() {
      midi.sendControlChange(this.channel, this.controller, 69);
    },
  },
  mounted() {
    // this.$eventBus.on('note-model:trigger-on', this.handleTrigger(true));
    // this.$eventBus.on('note-model:trigger-off', this.handleTrigger(false));
  },
};
</script>

<style>
.note-model {
  background-color: white;
}
</style>
