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
    const type = 'sine';

    this.audioCtx = audioContext;
    this.numberOfVoices = numberOfVoices;
    this.hasStarted = false;
    this.reverbNode = this.createReverb(audioContext);
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

  private createReverb(audioCtx) {
    let convolver = audioCtx.createConvolver();
  
    // load impulse response from file
    // let response = await fetch("/weaving/Swede\ Plate\ 1.0s.aif");
    // let arraybuffer = await response.arrayBuffer();
    // convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);
  
    return convolver;
  }

  private async configureReverb() {
    // load impulse response from file
    let response = await fetch("/weaving/Swede\ Plate\ 3.0s.wav");
    let arraybuffer = await response.arrayBuffer();
    this.reverbNode.buffer = await this.audioCtx.decodeAudioData(arraybuffer);
  }
  
  public playNote(voiceIndex: number, note: number, noteLength: number) {
    const voice = this.voices[voiceIndex];

    let frequency = mtof(note);
    const attack = noteLength * 0.5;
    const decay = noteLength - attack;
    const currentTime = voice.ctx?.currentTime;

    voice?.oscillatorNode?.frequency?.setValueAtTime(frequency, currentTime);
    // set up simple envelope VCA
    voice.gainNode.gain.linearRampToValueAtTime(0.3, currentTime + attack/1000.);
    voice.gainNode.gain.linearRampToValueAtTime(0, currentTime + attack/1000. + decay/1000.);
  }

  public start() {
    if (this.hasStarted) return;

    this.voices.forEach(voice => {
      this.reverbNode.connect(audioContext.destination);
      voice.oscillatorNode.start();
    });
    this.hasStarted = true;
  }
}
