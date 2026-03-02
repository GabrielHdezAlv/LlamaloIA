/**
 * AudioWorklet processor for TTS audio playback.
 * Uses a contiguous ring buffer with pre-buffering to avoid
 * choppy audio caused by network jitter.
 */
class AudioPlaybackProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Ring buffer: 10 seconds at 48kHz (max) = 480000 samples
    this._bufferSize = 480000;
    this._buffer = new Float32Array(this._bufferSize);
    this._writePos = 0;
    this._readPos = 0;
    this._samplesAvailable = 0;

    // Pre-buffer: accumulate this many samples before starting playback
    this._prebufferSize = 4000; // ~250ms at 16kHz, overridden by configure
    this._prebuffering = true;

    // Simple gain control for output volume (0.0 - 1.0)
    this._gain = 1.0;

    this.port.onmessage = (event) => {
      if (event.data.type === 'enqueue') {
        this._enqueue(event.data.samples);
      } else if (event.data.type === 'clear') {
        this._writePos = 0;
        this._readPos = 0;
        this._samplesAvailable = 0;
        this._prebuffering = true;
      } else if (event.data.type === 'configure') {
        if (event.data.prebufferSize) {
          this._prebufferSize = event.data.prebufferSize;
        }
      } else if (event.data.type === 'setGain') {
        const g = Number(event.data.gain);
        if (!Number.isNaN(g)) {
          this._gain = Math.max(0, Math.min(1, g));
        }
      }
    };
  }

  _enqueue(samples) {
    for (let i = 0; i < samples.length; i++) {
      this._buffer[this._writePos] = samples[i];
      this._writePos = (this._writePos + 1) % this._bufferSize;

      // If we overwrite unread data, advance the read pointer
      if (this._samplesAvailable >= this._bufferSize) {
        this._readPos = (this._readPos + 1) % this._bufferSize;
      } else {
        this._samplesAvailable++;
      }
    }
  }

  process(inputs, outputs) {
    const output = outputs[0];
    if (output.length === 0) return true;

    const channel = output[0];

    // While pre-buffering, output silence until we have enough data
    if (this._prebuffering) {
      if (this._samplesAvailable >= this._prebufferSize) {
        this._prebuffering = false;
      } else {
        for (let i = 0; i < channel.length; i++) {
          channel[i] = 0;
        }
        return true;
      }
    }

    // Read from ring buffer
    let written = 0;
    while (written < channel.length && this._samplesAvailable > 0) {
      channel[written] = this._buffer[this._readPos] * this._gain;
      this._readPos = (this._readPos + 1) % this._bufferSize;
      this._samplesAvailable--;
      written++;
    }

    // Fill remaining with silence
    for (let i = written; i < channel.length; i++) {
      channel[i] = 0;
    }

    // If buffer ran out, re-enter pre-buffering to avoid micro-stutters
    if (written < channel.length && written > 0) {
      this._prebuffering = true;
    }

    return true;
  }
}

registerProcessor('audio-playback-processor', AudioPlaybackProcessor);
