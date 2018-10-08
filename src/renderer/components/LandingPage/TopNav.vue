<template>
  <nav class="top-nav">
    <h1>MIDI Manager</h1>
    <button class="btn btn-secondary" @click="toggleConfigurationMode" >
      {{ configurationEditText }}
    </button>
  </nav>
</template>

<script>
  export default {
    data() {
      return {
        configurationAction: '',
      };
    },
    computed: {
      showConfigurationEdit() {
        return this.$store.state.Config.showConfigurationEdit;
      },
      configurationEditText() {
        return this.showConfigurationEdit ? 'Hide Configuration Settings' : 'Show ConfigurationSettings';
      },
    },
    mounted() {
    },
    methods: {
      toggleConfigurationMode() {
        const showConfigurationEdit = !this.showConfigurationEdit;

        this.$store.commit('UPDATE_CONFIG', { showConfigurationEdit });
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
