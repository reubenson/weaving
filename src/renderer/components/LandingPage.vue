<template>
  <div id="wrapper">
    <top-nav></top-nav>
    <main>
      <midi-drivers></midi-drivers>
      <note-listener-settings></note-listener-settings>
      <noteProcessors></noteProcessors>
      <aggregate-processor></aggregate-processor>
    </main>
  </div>
</template>

<script>
  import MidiDrivers from './LandingPage/MidiDrivers';
  import TopNav from './LandingPage/TopNav';
  import NoteProcessors from './LandingPage/NoteProcessors';
  import NoteListenerSettings from './LandingPage/NoteListenerSettings';
  import NoteModel from './Landingpage/NoteModel';
  import AggregateProcessor from './LandingPage/AggregateProcessor';
  import store from '../store';
  import eventBus from '../lib/eventBus';

  export default {
    name: 'landing-page',
    components: {
      MidiDrivers, TopNav, NoteListenerSettings, NoteProcessors, AggregateProcessor, NoteModel,
    },
    store,
    created() {
      this.$eventBus = eventBus;
      this.$store.dispatch('retrieveConfig');
      console.log('store.state.Config', store.state.Config);
    },
  };
</script>

<style>
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  section {
    margin-bottom: 40px;
  }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top center,
        rgba(250, 250, 250, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    overflow-y: scroll;
    padding: 80px 40px;
    width: 100vw;
  }
</style>
