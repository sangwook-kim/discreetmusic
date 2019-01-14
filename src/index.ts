const { Tone } = window;
// Tone.Transport.bpm.value = 120;
Tone.Transport.bpm.value = 244;

const noUiSlider = require('nouislider');

const EQUALIZER_CENTER_FREQUENCIES = [
  100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250,
  1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000,
];

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

function initEqualizerUI(container, equalizer) {
  equalizer.forEach(eq => {
    const frq = eq.frequency.value;

    const wrapper = document.createElement('div');
    const slider : any = document.createElement('div');
    const label = document.createElement('label');

    wrapper.classList.add('slider-wrapper');
    slider.classList.add('slider');
    label.textContent = frq < 1000 ? frq : `${frq / 1000}K`;

    noUiSlider.create(slider, {
      start: 0,
      range: {min: -12, max: 12},
      step: 0.1,
      orientation: 'vertical',
      direction: 'rtl',
    });

    slider.noUiSlider.on('update', ([value]) => {
      console.log(value);
      eq.gain.value = value;
    });

    wrapper.appendChild(slider);
    wrapper.appendChild(label);
    container.appendChild(wrapper);
  });
}

const leftSynth = makeSynth();
const rightSynth = makeSynth();

const leftPanner = new Tone.Panner(-0.5);
const rightPanner = new Tone.Panner(0.5);

const equalizer = EQUALIZER_CENTER_FREQUENCIES.map(frequency => {
  const filter = Tone.context.createBiquadFilter();
  filter.type = 'peaking';
  filter.frequency.value = frequency;
  filter.Q.value = 4.31;
  filter.gain.value = 0;

  return filter;
});

const echo = new Tone.FeedbackDelay('16n', 0.2).toMaster();
const delay = Tone.context.createDelay(6.0); // Borrow the AudioContext From Tone.js
const delayFade = Tone.context.createGain();

delay.delayTime.value = 6.0;
delayFade.gain.value = 0.75;

leftSynth.connect(leftPanner);
rightSynth.connect(rightPanner);

// Serial
leftPanner.connect(equalizer[0]);
rightPanner.connect(equalizer[0]);

equalizer.forEach((eq, i) => {
  if (i < equalizer.length - 1) {
    equalizer[i].connect(equalizer[i + 1]);
  } else {
    equalizer[i].connect(echo);
  }
});

/*
// Parallel
equalizer.forEach((eq) => {
  leftPanner.connect(eq);
  rightPanner.connect(eq);

  eq.connect(echo);
});
*/

/*
leftPanner.connect(echo);
rightPanner.connect(echo);
*/

echo.connect(delay);
delay.connect(Tone.context.destination);
delay.connect(delayFade);
delayFade.connect(delay);

document.querySelector('.start').addEventListener('click', (e) => {
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
  console.log(e);

  Tone.Transport.start();
  initEqualizerUI(document.querySelector('.eq'), equalizer);
});

document.querySelector('.stop').addEventListener('click', (e) => {
  console.log(e);
  Tone.context.close();
});
