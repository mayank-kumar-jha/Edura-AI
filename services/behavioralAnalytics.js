function analyzeBehavior(behavioralData) {
  const { keyPressCount, pasteCount, errorCount, totalTimeSeconds } =
    behavioralData;

  const keyPressSpeed =
    keyPressCount > 0 ? keyPressCount / totalTimeSeconds : 0;
  const errorRate = keyPressCount > 0 ? errorCount / keyPressCount : 0;

  const features = {
    pasteCount: pasteCount > 0 ? 1 : 0,
    keyPressSpeed: parseFloat(keyPressSpeed.toFixed(2)),
    errorRate: parseFloat(errorRate.toFixed(2)),
    timeToComplete: parseFloat(totalTimeSeconds.toFixed(2)),
  };

  console.log("[DEBUG] Auth Behavior Features Calculated:", features);
  return features;
}

module.exports = {
  analyzeBehavior,
};
