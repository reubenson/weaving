<template>
  <transition>
    <section class="drivers" v-if="showConfigurationEdit">
      <h2>Port Configuration</h2>
      <div class="drivers-wrapper">
        <div class="drivers-item input">
          <h4>Select Input Port</h4>
          <select class="drivers-input-select" name="" @change="selectInput">
            <option v-for="port in inputPorts" :key="port" :value="port" :selected="isSelectedInput(port)">
              {{ port }}
            </option>
          </select>
        </div>
        <div class="drivers-item output">
          <h4>Select Output Port</h4>
          <select class="drivers-output-select" name="" @change="selectOutput">
            <option v-for="port in outputPorts" :key="port" :value="port" :selected="isSelectedOutput(port)">
              {{ port }}
            </option>
          </select>
        </div>
      </div>
    </section>
  </transition>
</template>

<script>
  import midi from '../../lib/midi';

  export default {
    data() {
      return {
        inputPorts: [],
        outputPorts: [],
      };
    },
    computed: {
      showConfigurationEdit() {
        return this.$store.state.Config.showConfigurationEdit;
      },
      inputPort() {
        return this.$store.state.Config.inputPort;
      },
      outputPort() {
        return this.$store.state.Config.outputPort;
      },
    },
    mounted() {
      midi.getPortNames()
        .then(({ inputs, outputs }) => {
          this.inputPorts = inputs;
          this.outputPorts = outputs;

          if (this.inputPort) {
            midi.setInput(this.inputPort);
          }

          if (this.outputPort) {
            midi.setOutput(this.outputPort);
          }
        });
    },
    methods: {
      isSelectedInput(port) {
        return this.inputPort === port;
      },
      isSelectedOutput(port) {
        return this.outputPort === port;
      },
      selectInput(e) {
        const portName = e.target.value;
        midi.setInput(portName);
        this.$store.commit('SET_INPUT_PORT', portName);
        this.$store.dispatch('saveConfig');
      },
      selectOutput(e) {
        const portName = e.target.value;
        midi.setOutput(portName);
        this.$store.commit('SET_OUTPUT_PORT', portName);
        this.$store.dispatch('saveConfig');
      },
    },
  };
</script>

<style scoped lang="scss">
  .drivers-wrapper {
    display: flex;
  }

  .drivers {
    &-item {
      flex-basis: 250px;
    }
  }
</style>
