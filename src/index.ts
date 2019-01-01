const Tone = require('Tone');

const synth = new Tone.MonoSynth({
  oscillator: {type: 'sawtooth'},
});
synth.toMaster();
synth.triggerAttackRelease('C4', 1);
