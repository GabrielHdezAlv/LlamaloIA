/**
 * AudioWorklet processor for microphone capture.
 * Buffers Float32 samples and posts them to the main thread
 * every ~100ms (1600 samples at 16kHz).
 */
class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._bufferSize = 0;
    this._sendThreshold = 1600;
    this._active = true;

    this.port.onmessage = (event) => {
      if (event.data.type === 'stop') {
        this._active = false;
      }
    };
  }

  process(inputs) {
    if (!this._active) return false;

    const input = inputs[0];
    if (input && input.length > 0) {
      const samples = input[0];
      for (let i = 0; i < samples.length; i++) {
        this._buffer.push(samples[i]);
      }
      this._bufferSize += samples.length;

      if (this._bufferSize >= this._sendThreshold) {
        this.port.postMessage({
          type: 'audio',
          samples: new Float32Array(this._buffer),
        });
        this._buffer = [];
        this._bufferSize = 0;
      }
    }
    return true;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
