function playNote(channel, note, noteLength, webSynth) {
  if (webSynth) {
    // play via web audio
    webSynth.playNote(channel, note, noteLength);
  } else {
    // play via external midi
  }
}

export default {
  playNote
}