<template>
  <transition>
    <section class="midi-drivers">
      <header>MIDI Settings</header>
      <div class="drivers-wrapper">
        <!-- <div class="drivers-item input">
          <h4>Select Input Port</h4>
          <select class="drivers-input-select" name="" @change="selectInput">
            <option v-for="port in inputPorts" :key="port" :value="port" :selected="isSelectedInput(port)">
              {{ port }}
            </option>
          </select>
        </div> -->
        <div class="drivers-item output">
          <h4>Select Output Port</h4>
          <client-only>
          <el-select v-model="midiOutputPort">
            <el-option
              v-for="item in outputPorts"
            />
          </el-select>
        </client-only>
          <!-- <select class="drivers-output-select" name="" @change="selectOutput">
            <option v-for="port in outputPorts" :key="port" :value="port" :selected="isSelectedOutput(port)">
              {{ port }}
            </option>
          </select> -->
        </div>
      </div>
    </section>
  </transition>
</template>

<script setup>
  import midi from '../lib/midi';
  import { useStore } from '@/store/main';
  import { storeToRefs } from 'pinia';

  const store = useStore();
  const { midiInputPort, midiOutputPort} = storeToRefs(store);
  let inputPorts = [],
    outputPorts = [];

  watch(midiOutputPort, (val) => {
    midi.setOutput(val);
  });

  onMounted(() => {
    midi.getPortNames()
      .then(({ inputs, outputs }) => {
        inputPorts = inputs;
        outputPorts = outputs;
        const [defaultInput] = inputs;
        const [defaultOutput] = outputs;

        // if (this.inputPort) {
        // this.inputPort = defaultInput;
        // midi.setInput(defaultInput);
        // }

        // if (this.outputPort) {
        midiOutputPort.value = defaultOutput;
        // midi.setOutput(defaultOutput);
        // }
      });
  });
  // export default {
  //   data() {
  //     return {
  //       inputPorts: [],
  //       outputPorts: [],
  //     };
  //   },
  //   computed: {
  //     showConfigurationEdit() {
  //       return true;
  //       // return this.$store.state.Config.showConfigurationEdit;
  //     },
  //     inputPort() {
  //       // return this.$store.state.Config.inputPort;
  //     },
  //     outputPort() {
  //       // return this.$store.state.Config.outputPort;
  //     },
  //   },
  //   mounted() {
  //     midi.getPortNames()
  //       .then(({ inputs, outputs }) => {
  //         this.inputPorts = inputs;
  //         this.outputPorts = outputs;
  //         // const [defaultInput] = inputs;
  //         const [defaultOutput] = outputs;

  //         console.log('inputs', inputs);
  //         console.log('outputs', outputs);

  //         // if (this.inputPort) {
  //         // this.inputPort = defaultInput;
  //         // midi.setInput(defaultInput);
  //         // }

  //         // if (this.outputPort) {
  //         this.outputPort = defaultOutput;
  //         midi.setOutput(defaultOutput);
  //         // }
  //       });
  //   },
  //   methods: {
  //     isSelectedInput(port) {
  //       return this.inputPort === port;
  //     },
  //     isSelectedOutput(port) {
  //       return this.outputPort === port;
  //     },
  //     selectInput(e) {
  //       const portName = e.target.value;
  //       midi.setInput(portName);
  //       // this.$store.commit('SET_INPUT_PORT', portName);
  //       // this.$store.dispatch('saveConfig');
  //     },
  //     selectOutput(e) {
  //       const portName = e.target.value;
  //       midi.setOutput(portName);
  //       // this.$store.commit('SET_OUTPUT_PORT', portName);
  //       // this.$store.dispatch('saveConfig');
  //     },
  //   },
  // };
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
