function playNote(channel, note, webSynth) {
  if (webSynth) {
    // play via web audio
    console.log('note', note);
    webSynth.playNote(channel, note);
  } else {
    // play via external midi
  }
}

export default {
  playNote
}