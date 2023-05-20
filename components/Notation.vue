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
    import { Chord, AbcNotation } from 'tonal';
    import { useMusicStore } from '~/store/music-settings';
    import { storeToRefs } from 'pinia';

    const store = useMusicStore();
    const { noteScale, rootNote } = storeToRefs(store);
    let chordNotes = ref([]);

    watch(rootNote, renderChord);
    watch(noteScale, renderChord);
    
    onMounted(() => {
      renderChord();
    });
    
    function renderChord() {
      const { notes } = Chord.getChord(noteScale.value, `${rootNote.value}4`);

      const chord = notes.reduce((acc, note) => {
        note = AbcNotation.scientificToAbcNotation(note);

        return `${acc} ${note}2`;
      }, '');
  
      abcjs.renderAbc("paper", `X:1\nK\n|[${chord}]|`);

      chordNotes.value = Chord.getChord(noteScale.value, rootNote.value).notes;
    }

  </script>

<style scoped lang="scss">
  #paper {
   width: 200px; 
  }
</style>
  