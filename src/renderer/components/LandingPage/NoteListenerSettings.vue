<template>
  <transition>
    <section class="note-listener-settings" v-if="showConfigurationEdit">
      <h2>Note Listener Settings</h2>
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
    name: 'note-listener-settings',
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
          return this.$store.state.Config.noteListenerSettings.velocity;
        },
        set(velocity) {
          velocity = parseInt(velocity, 10);
          this.$store.commit('UPDATE_CONFIG', { noteListenerSettings: { velocity } });
        },
      },
      spinController: {
        get() {
          return this.$store.state.Config.noteListenerSettings.spin;
        },
        set(spin) {
          spin = parseInt(spin, 10);
          this.$store.commit('UPDATE_CONFIG', { noteListenerSettings: { spin } });
        },
      },
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
.note-listener-settings {
}
</style>
