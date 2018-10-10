<template>
  <section class="aggregate-processor">
    <h2>Aggregate Processor</h2>
    <div>
      Output Channel:
      <select class="map-list-item-select" name="" @change="selectLevelOutputChannel">
        <option v-for="channelOpt in channels" :key="channelOpt" :value="channelOpt" :selected="isSelectedChannel(channelOpt)">
          {{ channelOpt }}
        </option>
      </select>
    </div>
    <div>
      Output Controller Number:
      <select class="map-list-item-select" name="" @change="selectLevelOutputController">
        <option v-for="controllerOpt in controllers" :key="controllerOpt" :value="controllerOpt" :selected="isSelectedController(controllerOpt)">
          {{ controllerOpt }}
        </option>
      </select>
    </div>
    <div>    
      Output Controller Value: {{ level }}
    </div>
    <div>
      <button class="btn" @click="sendTestSignal(outputLevelChannel, outputLevelController)">Send MIDI test signal</button>
    </div>
  </section>
</template>

<script>
  import _ from 'lodash';
  import BufferTimer from '../../lib/buffer-timer';
  import store from '../../store';
  import midi from '../../lib/midi';

  export default {
    name: 'aggregate-proceessor',
    components: { },
    store,
    data() {
      return {
        level: 0,
      };
    },
    computed: {
      channels() {
        return _.times(16, i => i + 1);
      },
      controllers() {
        return _.times(120, _.identity);
      },
      maxLevel() {
        return this.$store.getters.maxLevel;
      },
      outputLevelChannel() {
        return this.$store.state.Config.outputLevelChannel;
      },
      outputLevelController() {
        return this.$store.state.Config.outputLevelController;
      },
    },
    // props: ['noteProcessors'],
    created() {
    },
    mounted() {
      const bt = new BufferTimer();

      bt.setInterval((buffer) => {
        buffer.pop();
        buffer.unshift(this.maxLevel);
        this.level = Math.round(_.mean(buffer));
        // midi.sendControlChange(this.outputLevelChannel, this.outputLevelController, this.level);
      });
    },
    methods: {
      isSelectedChannel(channel) {
        return this.outputLevelChannel === parseInt(channel, 10);
      },
      isSelectedController(val) {
        return this.outputLevelController === parseInt(val, 10);
      },
      selectLevelOutputChannel(e) {
        const channel = parseInt(e.target.value, 10);

        this.$store.commit('UPDATE_CONFIG', {
          outputLevelChannel: channel,
        });
        this.$store.dispatch('saveConfig');
      },
      selectLevelOutputController(e) {
        const controller = parseInt(e.target.value, 10);

        this.$store.commit('UPDATE_CONFIG', {
          outputLevelController: controller,
        });
        this.$store.dispatch('saveConfig');
      },
      showInfo({ target }) {
        target.classList.add('show');
      },
      hideInfo({ target }) {
        target.classList.remove('show');
      },
      sendTestSignal(channel, controller) {
        const testValue = 111;

        midi.sendControlChange(channel, controller, testValue);
      },
    },
  };
</script>

<style lang="scss" scoped>
.note-processors {
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
      position: absolute;
      top: 5px;
      right: 5px;
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
