<template>
  <div class="midi-download">
    <span class="icon">⤓</span>
    <a :href="downloadLinkHref" download="swatch.mid">Download MIDI file</a>
  </div>
</template>

<script setup>
  import MidiWriter from 'midi-writer-js';
  import { useStore } from '~/store/main';
  import { storeToRefs } from 'pinia';

  const store = useStore();
  const { swatchNotes, swatchWeave, bpm } = storeToRefs(store);

  function handleDownload() {
    const tracks = [];
    
    swatchNotes.value.forEach((swatchRow, i) => {
      const track = new MidiWriter.Track();
      const channel = i + 1;
      const weaveRow = swatchWeave.value[i];
      let wait = 0;

      const beatsPerMeasure = 16;
      
      track.setTempo(bpm.value);
      track.addTrackName(`weaving-row-${channel}`);

      // (T128 = 1 beat)
      const numTicks = Math.round(128 / beatsPerMeasure * swatchRow.length);

      console.log('numTicks', numTicks);

      swatchRow.forEach((note, i) => {
        if (!weaveRow[i]) {
          wait++;
          return;
        }

        const e = new MidiWriter.NoteEvent({
          pitch: note,
          wait: `T${wait * numTicks}`,
          duration: `T${numTicks}`
        });

        wait = 0;

        track.addEvent(e);
      });

      tracks.push(track);
    });

    const write = new MidiWriter.Writer(tracks);
    const fileContent = write.buildFile();
    const blob = new Blob(
      [fileContent],
      {
        type: 'text/plain'
      }
    );

    const downloadUrl = URL.createObjectURL(blob);

    return downloadUrl;
  }

  const downloadLinkHref = computed({
    get: () => {
      return handleDownload();
    }
  });
</script>

<style lang="scss">
  .midi-download {
    padding: 10px;
    .icon {
      font-weight: bold;
      margin-right: 10px;
    }
  }
</style>
