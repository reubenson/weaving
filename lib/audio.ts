import midi from "./midi";

function playNote(channel: number, note: number, noteLength: number, webSynth: any) {
  if (note > 127) {
    // wrap note back around to lower registers
    console.error('note exceeded MIDI limit of 127')
    note = note % 127;
  }

  if (webSynth) {
    // play via web audio
    webSynth.playNote(channel, note, noteLength);
  } else {
    // play via external midi
    channel = 1;
    midi.noteOn(channel, note, 127);

    if (noteLength) {
      setTimeout(() => {
        midi.noteOff(channel, note, 127);
      }, noteLength);
    }
  }
}

export default {
  playNote
}
