<template>
    <div class="notation">
      <div id="paper"></div>
      <p>
        {{ chordNotes.join(', ') }}
      </p>
    </div>
  </template>
  
  <script setup>
    import abcjs from 'abcjs';
    import * as Chord from 'tonal-chord';
    import { useMusicStore } from '~/store/music-settings';
    import { storeToRefs } from 'pinia';

    const store = useMusicStore();
    const { noteScale } = storeToRefs(store);

    watch(noteScale, renderChord);
    const chordNotes = computed({
      get: () => {
        return Chord.notes('C' + noteScale.value);
      }
    });
    
    onMounted(() => {
      renderChord();
    });
    
    function renderChord() {
      const notes = Chord.notes('C' + noteScale.value).reduce((acc, note) => {
        note = note.replace(/[A-G]b/, '_$&').replace('b', '');
        note = note.replace(/[A-G]#/, '^$&').replace('#', '');
        note = note.replace(/[0-9]/, '');

        return `${acc} ${note}`;
      }, '');
  
      abcjs.renderAbc("paper", `X:1\nK\n|[${notes}]|`);
    }

  </script>

<style scoped lang="scss">
  #paper {
   width: 200px; 
  }
</style>
  