<template>
  <div class="midi-download">
    <p>You can download a MIDI file for your swatch in two formats:</p>
    <ul>
      <li>
        <a :href="downloadLinkHref" :download="`$swatch - {downloadFilename}.mid`">Download MIDI file</a> (with each row as a separate track)
      </li>
      <li>
        <a :href="downloadLinkHref_combined" :download="`swatch - ${downloadFilename}_combined.mid`">Download MIDI file</a> (with all rows combined onto a single track)
      </li>
    </ul>
  </div>
</template>

<script setup>
  import _ from 'lodash';
  import MidiWriter from 'midi-writer-js';
  import { useStore } from '~/store/main';
  import { useWeaveStore } from '~/store/weave-settings';
  import { useMusicStore } from '~/store/music-settings';
  import { storeToRefs } from 'pinia';

  const store = useStore();
  const weaveStore = useWeaveStore();
  const musicStore = useMusicStore();
  const { swatchNotes, swatchWeave, bpm } = storeToRefs(store);
  const { swatchWidth } = storeToRefs(weaveStore);
  const { noteScale, rootNote } = storeToRefs(musicStore);

  const downloadLinkHref = computed({
    get: () => {
      return handleDownload(false);
    }
  });

  const downloadLinkHref_combined = computed({
    get: () => {
      return handleDownload(true);
    }
  });

  const downloadFilename = computed({
    get: () => `${rootNote?.value} - ${noteScale?.value}`
  });

  function handleDownload(combineRows = false) {
    const tracks = [];

    if (combineRows) {
      const track = new MidiWriter.Track();
      const channel = 1;
      const beatsPerMeasure = swatchWidth.value;
        
      track.setTempo(bpm.value);
      track.addTrackName(`weaving-row-${channel}`);

      // (T128 = 1 beat)
      const numTicks = Math.round(128 / beatsPerMeasure * swatchWidth.value);
      
      _.times(swatchWidth.value, (columnIndex) => {
        const notes = [];
        let wait = 0;
        swatchNotes.value.forEach((swatchRow, i) => {
          const weaveRow = swatchWeave.value[i];
          if (!weaveRow) return;
          // console.log('swatchRow', swatchRow);
          // console.log('columnIndex', columnIndex);
          // console.log('swatchWeave.value', swatchWeave.value);
          
          if (swatchWeave.value[i][columnIndex]) {
            notes.push(swatchRow[columnIndex]);

            // console.log('notes', notes);
          }
        });

        if (notes.length) {
          const e = new MidiWriter.NoteEvent({
            pitch: notes,
            wait: `T${wait * numTicks}`,
            duration: `T${numTicks}`
          });
          track.addEvent(e);
          wait = 0;
        } else {
          wait++;
        }
      });

      tracks.push(track);
    } else {
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
  
        swatchRow.forEach((note, i) => {
          if (!weaveRow[i]) {
            wait++; return;
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
    }
    

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
</script>

<style lang="scss">
  .midi-download {
    // padding: 10px;
    margin-top: 10px;
    width: 100%;

    .icon {
      font-weight: bold;
      margin-right: 10px;
    }

    ul {
      list-style: none;
      margin-top: 10px;
    }

    li::before {
      content: '⤓';
      font-weight: bold;
      margin-right: 10px;
    }
  }
</style>
