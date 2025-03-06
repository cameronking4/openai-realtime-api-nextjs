// A simplified noise suppression worklet with parameter support
class SimpleNoiseWorklet extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: 'threshold',
        defaultValue: -30,
        minValue: -60,
        maxValue: 0,
        automationRate: 'k-rate'
      },
      {
        name: 'attackTime',
        defaultValue: 0.01,
        minValue: 0.001,
        maxValue: 0.1,
        automationRate: 'k-rate'
      },
      {
        name: 'releaseTime',
        defaultValue: 0.1,
        minValue: 0.01,
        maxValue: 1,
        automationRate: 'k-rate'
      }
    ];
  }
  
  constructor() {
    super();
    
    // State variables
    this.envelope = -60; // Start with a low envelope level
    this.lastThreshold = -30;
    this.lastAttackTime = 0.01;
    this.lastReleaseTime = 0.1;
    this._updateCoefficients(this.lastAttackTime, this.lastReleaseTime);
    
    // Debug counter to limit console output
    this.debugCounter = 0;
  }
  
  _updateCoefficients(attackTime, releaseTime) {
    // Ensure we have valid values
    attackTime = Math.max(0.001, Math.min(0.1, attackTime));
    releaseTime = Math.max(0.01, Math.min(1, releaseTime));
    
    // Calculate smoothing coefficients
    this.attackCoeff = Math.exp(-1 / (sampleRate * attackTime));
    this.releaseCoeff = Math.exp(-1 / (sampleRate * releaseTime));
  }
  
  process(inputs, outputs, parameters) {
    // Get input and output
    const input = inputs[0];
    const output = outputs[0];
    
    // If no input, return
    if (!input || !input.length === 0 || !input[0] || input[0].length === 0) {
      return true;
    }
    
    // Get parameters (with fallbacks to last values if not provided)
    const threshold = parameters.threshold && parameters.threshold.length > 0 
      ? parameters.threshold[0] 
      : this.lastThreshold;
    
    const attackTime = parameters.attackTime && parameters.attackTime.length > 0 
      ? parameters.attackTime[0] 
      : this.lastAttackTime;
    
    const releaseTime = parameters.releaseTime && parameters.releaseTime.length > 0 
      ? parameters.releaseTime[0] 
      : this.lastReleaseTime;
    
    // Store last values
    this.lastThreshold = threshold;
    this.lastAttackTime = attackTime;
    this.lastReleaseTime = releaseTime;
    
    // Update coefficients if needed
    this._updateCoefficients(attackTime, releaseTime);
    
    // Process each channel
    for (let channel = 0; channel < input.length; channel++) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      
      if (!outputChannel) continue;
      
      // Process each sample
      for (let i = 0; i < inputChannel.length; i++) {
        // Calculate signal level in dB
        const sample = inputChannel[i];
        const absValue = Math.abs(sample);
        const sampleLevel = absValue < 1e-10 ? -100 : 20 * Math.log10(absValue);
        
        // Update envelope follower
        if (sampleLevel > this.envelope) {
          this.envelope = this.attackCoeff * this.envelope + (1 - this.attackCoeff) * sampleLevel;
        } else {
          this.envelope = this.releaseCoeff * this.envelope + (1 - this.releaseCoeff) * sampleLevel;
        }
        
        // Apply noise gate with smooth transition
        let gain = 1;
        if (this.envelope < threshold) {
          // Calculate a smoother transition around the threshold
          const distanceBelow = threshold - this.envelope;
          const transitionWidth = 6; // 6dB transition width
          
          if (distanceBelow >= transitionWidth) {
            gain = 0.01; // Full reduction for signals well below threshold
          } else {
            // Gradual reduction for signals near the threshold
            const ratio = distanceBelow / transitionWidth;
            gain = 1 - (0.99 * ratio); // Linear interpolation between 1 and 0.01
          }
        }
        
        // Apply gain to output
        outputChannel[i] = sample * gain;
      }
    }
    
    // Occasional debug output (once every ~1000 blocks)
    if (this.debugCounter++ % 1000 === 0) {
      console.log(`[SimpleNoiseWorklet] Envelope: ${this.envelope.toFixed(1)}dB, Threshold: ${threshold.toFixed(1)}dB, Gain: ${(this.envelope < threshold ? 'reduced' : 'normal')}`);
    }
    
    return true;
  }
}

registerProcessor('simple-noise-worklet', SimpleNoiseWorklet); 