<template>
  <transition>
    <section class="midi-drivers" v-if="showConfigurationEdit">
      <h2>MIDI Port Configuration</h2>
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
  import midi from '../lib/midi';

  export default {
    data() {
      return {
        inputPorts: [],
        outputPorts: [],
      };
    },
    computed: {
      showConfigurationEdit() {
        return true;
        // return this.$store.state.Config.showConfigurationEdit;
      },
      inputPort() {
        // return this.$store.state.Config.inputPort;
      },
      outputPort() {
        // return this.$store.state.Config.outputPort;
      },
    },
    mounted() {
      console.log('mounting midi drivers');
      midi.getPortNames()
        .then(({ inputs, outputs }) => {
          this.inputPorts = inputs;
          this.outputPorts = outputs;
          // const [defaultInput] = inputs;
          const [defaultOutput] = outputs;

          console.log('inputs', inputs);
          console.log('outputs', outputs);

          // if (this.inputPort) {
          // this.inputPort = defaultInput;
          // midi.setInput(defaultInput);
          // }

          // if (this.outputPort) {
          this.outputPort = defaultOutput;
          midi.setOutput(defaultOutput);
          // }
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
        // this.$store.commit('SET_INPUT_PORT', portName);
        // this.$store.dispatch('saveConfig');
      },
      selectOutput(e) {
        const portName = e.target.value;
        midi.setOutput(portName);
        // this.$store.commit('SET_OUTPUT_PORT', portName);
        // this.$store.dispatch('saveConfig');
      },
    },
  };
</script>

<style scoped lang="scss">
  .drivers-wrapper {
    display: flex;
  }

  .midi-drivers {
    border: solid black 2px;
    padding: 20px;

    &-item {
      flex-basis: 250px;
    }
  }
</style>
