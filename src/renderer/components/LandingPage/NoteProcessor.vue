<template>
  <ul class="map-list">
    <li class="map-list-item" v-bind:class="{'is-on': isOn}">
      <div class="map-list-item-section">Listening on Note: {{ onNote }}
        <select class="map-list-item-select" name="" v-model="onNote" v-if="showConfigurationEdit">
          <option v-for="item in onNotes" :key="item.id" :value="item" :selected="isSelectedOnNote(item)">
            {{ item }} ({{ noteNames[item] }})
          </option>
        </select>
      </div>
      <div class="map-list-item-section">
        Output Channel: {{ channel }}
        <select class="map-list-item-select" name="" v-model="channel" v-if="showConfigurationEdit">
          <option v-for="channelOpt in channels" :key="channelOpt" :value="channelOpt" :selected="isSelectedChannel(channelOpt)">
            {{ channelOpt }}
          </option>
        </select>
      </div>
      <div class="map-list-item-section" @mouseenter="showInfo" @mouseleave="hideInfo">
        Velocity Limit:
        <p class="info">Set minimum velocity to trigger note</p>
        <input type="range" min="0" max="127" class="slider" v-model="velocityThreshold">
      </div>
      <div class="map-list-item-section">
        Velocity Level: {{ velocityLevel }}
        <p class="info">Note velocity averaged over time</p>
      </div>
      <div class="map-list-item-section" v-if="showConfigurationEdit">
        <select class="map-list-item-select" name="" @change="setTestController">
          <option v-for="(controllerOpt, key) in controllers" :key="controllerOpt" :value="controllerOpt" :selected="isSelected('testSignalController', controllerOpt)">
            {{ controllerOpt }} - {{ key }}
          </option>
        </select>
        <button class="btn" @click="sendTestSignal">Send MIDI test signal to {{ testSignalController }}</button>
      </div>
      <button @click="remove(channel)" class="btn btn-secondary remove">x</button>
    </li>
  </ul>
</template>

<script>
  import _ from 'lodash';
  import BufferTimer from '../../lib/buffer-timer';
  import store from '../../store';
  import midi from '../../lib/midi';
  import noteModel from '../../lib/note-model';
  const noteNames = require('../../lib/noteNames');
  const trackers = {
    velocity: {
      start() {
        const propName = 'velocity';
        this.velocityTracker = new BufferTimer();
        this.velocityTracker.setInterval((buffer) => {
          const velocityController = store.state.Config.noteProcessorSettings.velocity;
          const val = this.isOn ? this.velocity : 0;

          buffer.pop();
          buffer.unshift(val);
          this.velocityLevel = Math.round(_.mean(buffer));
          noteModel.sendControlChange(this.channel, velocityController, this.velocityLevel, propName);
        });
      },
      stop() {
        this.velocityTracker.clearInterval();
      },
    },
    spin: {
      start() {
        const lfoSpeed = 1; // Hz
        const period = 1000 / lfoSpeed; // ms
        const phaseOffset = period * (this.index / this.$store.getters.processorsCount);

        this.spinTracker = new BufferTimer();
        // console.log('this.index', this.index);
        // console.log('this.$store.getters.processorsCount', this.$store.getters.processorsCount);
        // console.log('phaseOffset', phaseOffset);

        this.spinTracker.setInterval(() => {
          const now = Date.now();
          const spinController = store.state.Config.noteProcessorSettings.spin;
          // let val = 0.5 + (0.5 * Math.sin((2 * Math.PI * (now / period)) + phaseOffset));
          let val = ((now + phaseOffset) % period) / period;

          // console.log('phaseOffset', phaseOffset);

          // const test = 0.5 + (0.5 * Math.sin((2 * Math.PI * (now / period))));
          // console.log('test', test);

          // normalize to MIDI range
          val = Math.round(val * 127);
          // val = 127;
          midi.sendControlChange(this.channel, spinController, val);
          // console.log('val', val);
        });
      },
      stop() {
        this.spinTracker.clearInterval();
      },
    },
  };

  function getTrackers(names) {
    return _.filter(trackers, (val, key) => names.includes(key));
  }

  function startTrackers(names = []) {
    getTrackers(names).forEach(tracker => tracker.start.call(this));
  }

  function stopTrackers(names = []) {
    getTrackers(names).forEach(tracker => tracker.stop.call(this));
  }

  export default {
    name: 'note-processor',
    data() {
      return {
        noteNames,
        velocityLevel: 0,
        testSignalController: '',
      };
    },
    computed: {
      showConfigurationEdit() {
        return this.$store.getters.showConfigurationEdit;
      },
      isOn() {
        return this.$store.getters.getNoteProcessor(this.id).isOn;
      },
      velocity() {
        return this.$store.getters.getNoteProcessor(this.id).velocity;
      },
      channels() {
        const allChannels = _.times(16, i => i + 1);
        const taken = this.$store.getters.channels
          .filter(item => item !== this.channel);

        return _.pullAllBy(allChannels, taken);
      },
      onNotes() {
        const taken = this.$store.getters.onNotes
          .filter(item => item !== this.onNote)
          .map(item => item.toString());

        return _.pullAllBy(Object.keys(noteNames), taken);
      },
      noteName() {
        return noteNames[this.onNote];
      },
      channel: {
        get() {
          return this.$store.getters.getNoteProcessor(this.id).channel;
        },
        set(val) {
          this.$store.commit('UPDATE_NOTE_PROCESSOR', {
            id: this.id,
            channel: parseInt(val, 10),
          });
          this.$store.dispatch('saveConfig');
        },
      },
      onNote: {
        get() {
          return this.$store.getters.getNoteProcessor(this.id).onNote;
        },
        set(val) {
          this.$store.commit('UPDATE_NOTE_PROCESSOR', {
            id: this.id,
            onNote: parseInt(val, 10),
          });
          this.$store.dispatch('saveConfig');
        },
      },
      velocityThreshold: {
        get() {
          return this.$store.getters.getNoteProcessor(this.id).velocityThreshold;
        },
        set(val) {
          this.$store.commit('UPDATE_NOTE_PROCESSOR', {
            id: this.id,
            velocityThreshold: parseInt(val, 10),
          });
          this.$store.dispatch('saveConfig');
        },
      },
      controllers() {
        return this.$store.getters.noteProcessorSettings;
      },
    },
    props: ['id', 'index'],
    created() {
    },
    methods: {
      sendTestSignal() {
        midi.sendControlChange(this.channel, this.testSignalController, 69);
      },
      setTestController(e) {
        this.testSignalController = parseInt(e.target.value, 10);
      },
      isSelectedOnNote(onNote) {
        return this.onNote === parseInt(onNote, 10);
      },
      isSelectedChannel(channel) {
        return this.channel === parseInt(channel, 10);
      },
      isSelected(field, val) {
        return this[field] === parseInt(val, 10);
      },
      setVelocityThreshold(e) {
        const val = parseInt(e.target.value, 10);

        this.$store.commit('UPDATE_NOTE_PROCESSOR', {
          id: this.id,
          velocityThreshold: val,
        });
        this.$store.dispatch('saveConfig');
      },
      remove(channel) {
        this.$store.commit('REMOVE_NOTE_PROCESSOR', channel);
        this.$store.dispatch('saveConfig');
      },
      showInfo({ target }) {
        target.classList.add('show');
      },
      hideInfo({ target }) {
        target.classList.remove('show');
      },
    },
    mounted() {
      const trackerTypes = ['velocity', 'spin'];
      const testSignalField = Object.keys(this.controllers)[0];
      this.testSignalController = this.controllers[testSignalField];
      startTrackers.call(this, trackerTypes);
      this.$store.watch(() => this.showConfigurationEdit, (val) => {
        if (val) {
          console.log('val', val);
          stopTrackers.call(this, trackerTypes);
        } else {
          startTrackers.call(this, trackerTypes);
        }
      });
    },
  };
</script>

<style lang="scss" scoped>
.map-list {
  justify-content: space-between;
  margin: 10px;

  &-item {
    background-color: #fff;
    border-radius: 10px;
    list-style: none;
    padding: 5px;
    position: relative;
    transition: background-color 0.25s;

    &.is-on {
      background-color: #D3D3D3;
    }

    .btn.remove {
      background: transparent;
      border-radius: 10px;
      color: #000;
      height: 20px;
      padding: 0 17px 26px 10px;
      position: absolute;
      right: 5px;
      top: 5px;
      width: 20px;
    }
  }

  &-item-section {
    margin-bottom: 10px;

    .info {
      background-color: #fff;
      border-radius: 5px;
      display: none;
      padding: 10px;
      position: absolute;
    }

    &.show {
      .info {
        display: block;
      }
    }
  }
}
</style>
