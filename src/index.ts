document.addEventListener('click', () => {
  const Tone = window.Tone;

  const synth = new Tone.MonoSynth({
    oscillator: {type: 'sawtooth'},
    envelope: {
      attack: 0.1,
      release: 4,
      releaseCurve: 'linear',
    },
    filterEnvelope: {
      baseFrequency: 200,
      octaves: 2,
      attack: 0,
      decay: 0,
      release: 1000,
    },
  });
  synth.toMaster();
  synth.triggerAttackRelease('C4', 1);
});
