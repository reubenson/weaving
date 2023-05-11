import _ from 'lodash';
import mtof from 'mtof';

export class webAudio {
  numberOfVoices: number;
  voices: Array<Object>;
  hasStarted: boolean;

  constructor(numberOfVoices: number) {
    const audioContext = new AudioContext();
    const type = 'sine';

    this.numberOfVoices = numberOfVoices;
    this.hasStarted = false;

    // this.voices = new Array(numberOfVoices).map(() => {
    this.voices = _.times(numberOfVoices).map(() => {
      return {
        ctx: audioContext,
        oscillatorNode: audioContext.createOscillator(),
        gainNode: audioContext.createGain(),
        panNode: audioContext.createStereoPanner()
      }
    });

    console.log('this.voices', this.voices);

    this.voices.forEach((voice, i) => {
      voice.gainNode.gain.setValueAtTime(0, 0);
      voice.oscillatorNode.connect(voice.gainNode);
      voice.gainNode.connect(voice.panNode);
      voice.panNode.connect(audioContext.destination);

      voice.oscillatorNode.type = type;
      voice.panNode.pan.setValueAtTime(-1 + i * (2 / (numberOfVoices - 1)), 0);
    });
  }
  
  public playNote(voiceIndex: number, note: number, noteLength: number) {
    const voice = this.voices[voiceIndex];

    console.log('voice', voice);
    console.log('this.voices', this.voices);
    console.log('voiceIndex', voiceIndex);

    let frequency = mtof(note);
    // const attack = 220; // ms
    // const decay = 300; // ms
    const attack = noteLength * 0.5;
    const decay = noteLength - attack;
    const currentTime = voice.ctx?.currentTime;

    frequency *= -1 + Math.floor(voiceIndex / 2);


    voice?.oscillatorNode?.frequency?.setValueAtTime(frequency, currentTime);
    // set up simple envelope VCA
    voice.gainNode.gain.linearRampToValueAtTime(0.3, currentTime + attack/1000.);
    voice.gainNode.gain.linearRampToValueAtTime(0, currentTime + attack/1000. + decay/1000.);
  }

  public start() {
    if (this.hasStarted) return;

    this.voices.forEach(voice => voice.oscillatorNode.start());
    this.hasStarted = true;
  }
}
