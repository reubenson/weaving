<template>
  <section class="drivers">
    <h2>MIDI Driver Configuration</h2>
    <div class="drivers-input">
      <h3>Select Input Port</h3>
      <select class="drivers-input-select" name="" @change="selectInput">
        <option v-for="port in inputPorts" :key="port" :value="port" :selected="isSelectedInput(port)">
          {{ port }}
        </option>
      </select>
    </div>
    <div class="drivers-output">
      <h3>Select Output Port</h3>
      <select class="drivers-output-select" name="" @change="selectOutput">
        <option v-for="port in outputPorts" :key="port" :value="port" :selected="isSelectedOutput(port)">
          {{ port }}
        </option>
      </select>
    </div>
  </section>
</template>

<script>
  function getPortNames() {
    return window.navigator.requestMIDIAccess()
      .then((access) => {
        const inputs = [];
        const outputs = [];

        access.inputs.forEach((entry) => {
          inputs.push(entry.name);
        });

        access.outputs.forEach((entry) => {
          outputs.push(entry.name);
        });

        return { inputs, outputs };
      });
  }

  export default {
    data() {
      return {
        inputPorts: [],
        outputPorts: [],
      };
    },
    computed: {
      inputPort() {
        return this.$store.state.Config.inputPort;
      },
      outputPort() {
        return this.$store.state.Config.outputPort;
      },
    },
    created() {
      getPortNames()
        .then(({ inputs, outputs }) => {
          this.inputPorts = inputs;
          this.outputPorts = outputs;
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
        this.$store.commit('SET_INPUT_PORT', e.target.value);
        this.$store.dispatch('saveConfig');
      },
      selectOutput(e) {
        this.$store.commit('SET_OUTPUT_PORT', e.target.value);
        this.$store.dispatch('saveConfig');
      },
    },
  };
</script>

<style scoped>
  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
</style>
