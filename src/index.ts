const { Tone } = window;
Tone.Transport.bpm.value = 240;

function makeSynth() {
  const envelope = {
    attack: 0.1,
    release: 4,
    releaseCurve: 'linear'
  };
  const filterEnvelope = {
    baseFrequency: 200,
    octaves: 2,
    attack: 0,
    decay: 0,
    release: 1000,
  };

  return new Tone.DuoSynth({
    harmonicity: 1,
    volume: -20,
    voice0: {
      oscillator: {type: 'sawtooth'},
      envelope,
      filterEnvelope,
    },
    voice1: {
      oscillator: {type: 'sine'},
      envelope,
      filterEnvelope,
    },
    vibratoRate: 0.5,
    vibratoAmount: 0.1,
  });
}

const leftSynth = makeSynth();
const rightSynth = makeSynth();

const leftPanner = new Tone.Panner(-0.5);
const rightPanner = new Tone.Panner(0.5);
const echo = new Tone.FeedbackDelay('16n', 0.2).toMaster();
const delay = Tone.context.createDelay(6.0); // Borrow the AudioContext From Tone.js
const delayFade = Tone.context.createGain();

delay.delayTime.value = 6.0;
delayFade.gain.value = 0.75;

leftSynth.connect(leftPanner);
rightSynth.connect(rightPanner);

leftPanner.connect(echo);
rightPanner.connect(echo);

echo.connect(delay);
delay.connect(Tone.context.destination);
delay.connect(delayFade);
delayFade.connect(delay);

document.addEventListener('click', () => {
  new Tone.Loop((time) => {
    leftSynth.triggerAttackRelease('C5', '1:2', time);
    leftSynth.setNote('D5', '+0:2');
    leftSynth.triggerAttackRelease('E4', '0:2', '+6:0');
    leftSynth.triggerAttackRelease('G4', '0:2', '+11:2');
    leftSynth.triggerAttackRelease('E5', '2:0', '+19:0');
    leftSynth.setNote('G5', '+19:1:2');
    leftSynth.setNote('A5', '+19:3:0');
    leftSynth.setNote('G5', '+19:4:2');
  }, '34m').start();
  new Tone.Loop(() => {
    rightSynth.triggerAttackRelease('D4', '1:2', '+5:0');
    rightSynth.setNote('E4', '+6:0');
    rightSynth.triggerAttackRelease('B3', '1m', '+11:2:2');
    rightSynth.setNote('G3', '+12:0:2');
    rightSynth.triggerAttackRelease('G4', '0:2', '+23:2');
  }, '37m').start();
  Tone.Transport.start();
});
