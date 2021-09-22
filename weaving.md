### TODO
- woof can have arbitrary number of elements
- weft no longer triggers notes
- update grid to allow rows of arbitrary length
  - each row to be a separate vue component?
  - each row will listen to different tick events (sent from DAW)
  - note values will be rendered in grey-scale, with a global option to show the value/name?
  - in render, each row will have equal width, and individual cells will have variable width
  - move swatch-level params around pattern and length?






* Output channel selection
* Configuration per cell (i.e. note length)
* Handle multiple swatches
* Different modes (non-static) for note generation (defined on woof)
* Move configuration into a toolbar setting
* Refine store implementation to handle weaving settings
* Euclidean cell generator
* Refactor to handle midi streams isomorphically

#### Components
* Swatch
  * Woof

#### Swatch
_ Swatch is like a router that takes a clock-in and triggers actions
* Properties:
  - width (number)
  - depth (number)
  - noteLength (number)
  - noteGrid
  - scale
  - pattern
  - warp
  - weft
  - readMode

#### Woof
_ 
* Properties:
  - Length
  - Notes


#### Read Mode
_ On trigger, noteGrid is iterated on, and event is passed to warp/weft
_ readMode handles how the noteGrid is advanced


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
