import midi from "./midi";

function playNote(channel: number, note: number, noteLength: number, webSynth: any) {
  if (webSynth) {
    // play via web audio
    webSynth.playNote(channel, note, noteLength);
  } else {
    // play via external midi
    channel = 1;
    // try {
      midi.noteOn(channel, note, 127);
    // } catch (error) {
    //   throw error;
    // }

    if (noteLength) {
      // only send noteOff if noteLength > 0
      setTimeout(() => {
        midi.noteOff(channel, note, 127);
      }, noteLength);
    }
  }
}

export default {
  playNote
}
