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

    this.voices = _.times(numberOfVoices, () => {
      return {
        oscillatorNode: audioContext.createOscillator(),
        gainNode: audioContext.createGain()
      }
    });

    this.voices.forEach(voice => {
      voice.gainNode.value = 0;
      voice.oscillatorNode.connect(voice.gainNode);
      voice.gainNode.connect(audioContext.destination);

      voice.oscillatorNode.type = type;
    });
  }
  
  public playNote(voiceIndex: number, note: number) {
    const voice = this.voices[voiceIndex];
    const frequency = mtof(note);
    const attack = 10; // ms
    const decay = 50; // ms
    console.log('voiceInded', voiceIndex);
    
    if (!voice.hasStarted) {
      voice.oscillatorNode.start();
      voice.hasStarted = true;
    }

    voice?.oscillatorNode?.frequency?.setValueAtTime(frequency, 0);

    // set up simple envelope VCA
    voice.gainNode.gain.linearRampToValueAtTime(0.6, Date.now() + attack);
    voice.gainNode.gain.linearRampToValueAtTime(0, Date.now() + attack + decay);
  }
}