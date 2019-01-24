### TODO
- Develop note-utils around handling registers and midi conversion
- Optimize sending midi output by evaluating diff
- Workflow for ingesting / re-composing MIDI


Compositional requirements
- Multi-valent quad system
  - Each valence is a different quad-frame?
  - Spatialization programs that determine how each quad-frame works?
  - How to determine how each voice plugs into a quad-frame?
  - Spatialization Frame
    - Each model assigns into a spatialization frame
    - Depending on the number of voices assigned, frame generates signal to distribute across four channels
    - Parameters:
      - Depth of spatialization
      - Speed of rotation

Integrator Models
- Set models it ingests
- Set number of channels it outputs to
- For example, it ingests four channels, and outputs to control 12 audio channels?
- Feeds on the whole set of inputs to produce an ensemble of control signals?
  - A single model may control the movement of the multi-channel cotton gin feed
    - Mean velocity may control the depth of spatialization
    - Relative spikes in velocity may control perturbations to the rotation speed/pattern

Articulation models
- Processes a single model to produce a set of signals that help articulate a voice
  - This may be very specific to a group of macro controls around plugins

Mixer Controls
- Each quad-frame has a relative output level into each set of quad speakers?

General Notes on Spatialization
- Sets of four-channel output?
- Main mic array output to eight or more channels, with additional single-channel sentinels?

Streams
- Input stream -> onNote listeners -> aggregate model -> outputStream
- Input stream -> onNote listeners -> individual models -> outputStream
