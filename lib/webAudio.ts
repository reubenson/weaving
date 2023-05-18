import _ from 'lodash';
import mtof from 'mtof';

export class webAudio {
  numberOfVoices: number;
  voices: Array<Object>;
  hasStarted: boolean;
  audioCtx: AudioContext;
  reverbNode: ConvolverNode;

  constructor(numberOfVoices: number) {
    const audioContext = new AudioContext();
    const destination = audioContext.destination;
    const type = 'sine';

    console.log('destination', destination);

    this.audioCtx = audioContext;
    this.numberOfVoices = numberOfVoices;
    this.hasStarted = false;
    this.reverbNode = this.audioCtx.createConvolver()
    this.reverbNode.connect(audioContext.destination);
    this.configureReverb();

    this.voices = _.times(numberOfVoices).map(() => {
      return {
        ctx: audioContext,
        oscillatorNode: audioContext.createOscillator(),
        gainNode: audioContext.createGain(),
        panNode: audioContext.createStereoPanner()
      }
    });

    this.voices.forEach((voice, i) => {
      voice.gainNode.gain.setValueAtTime(0, 0);
      voice.oscillatorNode.connect(voice.gainNode);
      voice.gainNode.connect(voice.panNode);
      voice.panNode.connect(this.reverbNode);
      voice.panNode.connect(audioContext.destination);

      voice.oscillatorNode.type = type;
      voice.panNode.pan.setValueAtTime(-1 + i * (2 / (numberOfVoices - 1)), 0);
    });
  }

  private async configureReverb() {
    // load impulse response from file
    let response = await fetch("/weaving/Swede\ Plate\ 3.0s.wav");
    let arraybuffer = await response.arrayBuffer();
    this.reverbNode.buffer = await this.audioCtx.decodeAudioData(arraybuffer);
  }
  
  public playNote(voiceIndex: number, note: number, noteLength: number) {
    const voice = this.voices[voiceIndex];

    console.log('note', note);

    let frequency = mtof(note);
    const attack = noteLength * 0.5;
    const decay = noteLength - attack;
    const currentTime = this.audioCtx.currentTime;

    voice?.oscillatorNode?.frequency?.setValueAtTime(frequency, currentTime);
    // set up simple envelope VCA
    voice.gainNode.gain.linearRampToValueAtTime(0.3, currentTime + attack/1000.);
    voice.gainNode.gain.linearRampToValueAtTime(0, currentTime + attack/1000. + decay/1000.);
  }

  public start() {
    if (this.hasStarted) return;

    this.audioCtx.resume();

    this.voices.forEach(voice => {
      voice.oscillatorNode.start();
    });
    this.hasStarted = true;
  }
}
