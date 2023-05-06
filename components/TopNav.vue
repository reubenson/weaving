<template>
  <nav class="top-nav">
    <h1>Weaving Music</h1>
    <button class="btn btn-secondary" @click="toggleConfigurationMode" >
      {{ configurationEditText }}
    </button>
  </nav>
</template>

<script>
  import { useStore } from '@/store/main';

  // const config = useStore();

  export default {
    data() {
      return {
        configurationAction: '',
      };
    },
    computed: {
      showConfigurationEdit() {
        return false;
        // return this.$store.state.Config.showConfigurationEdit;
        // return config.showConfigurationEdit;
      },
      configurationEditText() {
        return this.showConfigurationEdit ? 'Hide Configuration Settings' : 'Show ConfigurationSettings';
      },
    },
    methods: {
      toggleConfigurationMode() {
        const showConfigurationEdit = !this.showConfigurationEdit;

        // this.$store.commit('UPDATE_CONFIG', { showConfigurationEdit });
        config.updateConfig({showConfigurationEdit});

        if (showConfigurationEdit) {
          // this.$store.dispatch('stopEngine');
          // config.startEngine();
        } else {
          // this.$store.dispatch('startEngine');
          // config.stopEngine();
        }
      },
    },
  };
</script>

<style scoped lang="scss">
  .top-nav {
    background-color: white;
    border-bottom: solid black 1px;
    position: fixed;
    height: 60px;
    left: 0;
    padding: 10px;
    top: 0;
    width: 100vw;
    z-index: 1;

    h1 {
      line-height: 1em;
      position: absolute;
      left: 20px;
    }

    .btn {
      position: absolute; 
      right: 20px;
    }
  }
</style>
