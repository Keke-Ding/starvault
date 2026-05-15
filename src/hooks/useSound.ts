const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

let initialized = false;

function ensureContext() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  initialized = true;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.08,
  rampDown = true
) {
  if (!initialized) ensureContext();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  if (rampDown) {
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  }
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + duration);
}

function playChime(frequencies: number[], duration: number, volume = 0.06) {
  if (!initialized) ensureContext();
  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.06);
    gain.gain.setValueAtTime(volume, audioCtx.currentTime + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + i * 0.06 + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + i * 0.06);
    osc.stop(audioCtx.currentTime + i * 0.06 + duration);
  });
}

function playNoise(duration: number, volume = 0.03) {
  if (!initialized) ensureContext();
  const bufferSize = audioCtx.sampleRate * duration;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(2000, audioCtx.currentTime);
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

export function useSound() {
  const init = () => {
    if (!initialized) {
      ensureContext();
    }
  };

  return {
    init,

    playHover: () => {
      playTone(880, 0.08, 'sine', 0.03);
    },

    playClick: () => {
      playChime([1200, 1600], 0.1, 0.05);
    },

    playCreate: () => {
      playChime([523, 659, 784, 1047], 0.2, 0.06);
      setTimeout(() => {
        playNoise(0.15, 0.02);
      }, 150);
    },

    playDelete: () => {
      playChime([600, 450, 300], 0.25, 0.05);
    },

    playOpen: () => {
      playChime([440, 554, 659, 880], 0.25, 0.06);
      setTimeout(() => {
        playTone(1200, 0.15, 'triangle', 0.04);
      }, 180);
    },

    playClose: () => {
      playChime([880, 659, 554, 440], 0.2, 0.05);
    },

    playNotification: () => {
      playTone(1760, 0.1, 'sine', 0.05);
      setTimeout(() => {
        playTone(2093, 0.15, 'sine', 0.05);
      }, 100);
    },

    playTransition: () => {
      playNoise(0.2, 0.025);
      setTimeout(() => {
        playChime([523, 784], 0.2, 0.04);
      }, 80);
    },

    playToggleOn: () => {
      playChime([600, 900, 1200], 0.15, 0.05);
    },

    playToggleOff: () => {
      playChime([900, 600], 0.12, 0.04);
    },
  };
}

export default useSound;