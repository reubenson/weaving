<template>
  <section class="note-processors">
    <h2>Note Processors</h2>
    <div class="note-processors-items">
      <note-processor 
        v-for="(item, index) in noteProcessors" :key="item.id" :id="item.id" :index="index">
      </note-processor>
    </div>
    <button @click="addNoteProcessor" class="btn btn-primary" v-if="showConfigurationEdit">Add Note Processor</button>
  </section>
</template>

<script>
  import store from '../../store';
  import NoteProcessor from './NoteProcessor';
  import midi from '../../lib/midi';

  export default {
    name: 'note-processors',
    components: { NoteProcessor },
    store,
    data() {
      return {};
    },
    computed: {
      showConfigurationEdit() {
        return this.$store.getters.showConfigurationEdit;
      },
      noteProcessors() {
        return this.$store.state.Config.noteProcessors;
      },
    },
    // props: ['noteProcessors'],
    created() {
    },
    mounted() {
    },
    methods: {
      addNoteProcessor() {
        this.$store.commit('ADD_NOTE_PROCESSOR');
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
  &-items {
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
