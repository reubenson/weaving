<template>
  <section class="note-processors">
    <h3>Note Listeners</h3>
    <div class="note-processors-items">
      <note-listener 
        v-for="(item) in noteListeners" :key="item.id" :id="item.id">
      </note-listener>
    </div>
    <button @click="addNoteListener" class="btn btn-primary" v-if="showConfigurationEdit">Add Note Listener</button>
    <h3>Note Models</h3>
    <div class="note-models">
      <note-model
        v-for="(item) in noteModels" :key="item.id" :id="item.id">
      </note-model>
    </div>
    <button @click="addNoteModel" class="btn btn-primary" v-if="showConfigurationEdit">Add Note Model</button>
    <h3>Spatial Models</h3>
    <div class="spatial-models">
      <spatial-model
        v-for="(item) in spatialModels" :key="item.id" :id="item.id">
      </spatial-model>
    </div>
    <button @click="addSpatialModel" class="btn btn-primary" v-if="showConfigurationEdit">Add Spatial Model</button>
  </section>
</template>

<script>
  import NoteListener from './NoteListener';
  import NoteModel from './NoteModel';
  import SpatialModel from './SpatialModel';
  import midi from '../../lib/midi';

  export default {
    name: 'note-processors',
    components: { NoteListener, NoteModel, SpatialModel },
    computed: {
      showConfigurationEdit() {
        return this.$store.getters.showConfigurationEdit;
      },
      noteListeners() {
        return this.$store.state.Config.noteListeners;
      },
      noteModels() {
        return this.$store.getters.models;
      },
      spatialModels() {
        return this.$store.state.Config.spatialModels;
      },
    },
    methods: {
      addNoteListener() {
        this.$store.commit('ADD_NOTE_LISTENER');
        // this.$store.dispatch('saveConfig');
      },
      addNoteModel() {
        this.$store.commit('ADD_NOTE_MODEL');
        // this.$store.dispatch('saveConfig');
      },
      addSpatialModel() {
        this.$store.commit('ADD_SPATIAL_MODEL');
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
  &-items,
  .note-models {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }

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
