<template>
  <transition>
    <section class="note-processor-settings" v-if="showConfigurationEdit">
      <h2>Note Processor Settings</h2>
      <div>
        Velocity Controller Assignment:
        <select class="map-list-item-select" name="" v-model="velocityController">
          <option v-for="controllerOpt in controllers" :key="controllerOpt" :value="controllerOpt" :selected="isSelectedController('velocityController', controllerOpt)">
            {{ controllerOpt }}
          </option>
        </select>
      </div>
      <div>
        Spin Controller Assignment:
        <select class="map-list-item-select" name="" v-model="spinController">
          <option v-for="controllerOpt in controllers" :key="controllerOpt" :value="controllerOpt" :selected="isSelectedController('spinController', controllerOpt)">
            {{ controllerOpt }}
          </option>
        </select>
      </div>
    </section>
  </transition>
</template>

<script>
  import _ from 'lodash';
  import store from '../../store';

  export default {
    name: 'note-processor-settings',
    components: { },
    store,
    data() {
      return {
        level: 0,
      };
    },
    computed: {
      showConfigurationEdit() {
        return this.$store.state.Config.showConfigurationEdit;
      },
      controllers() {
        return _.times(120, _.identity);
      },
      velocityController: {
        get() {
          return this.$store.state.Config.noteProcessorSettings.velocity;
        },
        set(velocity) {
          velocity = parseInt(velocity, 10);
          this.$store.commit('UPDATE_CONFIG', { noteProcessorSettings: { velocity } });
          this.$store.dispatch('saveConfig');
        },
      },
      spinController: {
        get() {
          return this.$store.state.Config.noteProcessorSettings.spin;
        },
        set(spin) {
          spin = parseInt(spin, 10);
          this.$store.commit('UPDATE_CONFIG', { noteProcessorSettings: { spin } });
          this.$store.dispatch('saveConfig');
        },
      },
    },
    // props: ['noteProcessors'],
    created() {
    },
    mounted() {
    },
    methods: {
      isSelectedController(field, val) {
        return this[field] === parseInt(val, 10);
      },
      showInfo({ target }) {
        target.classList.add('show');
      },
      hideInfo({ target }) {
        target.classList.remove('show');
      },
    },
  };
</script>

<style lang="scss" scoped>
.note-processor-settings {
}
</style>
