const fs = require("fs");
const path = require("path");
const { RandomForestClassifier } = require("ml-random-forest");
let model = null;
let scaler = null;
try {
  const modelPath = path.join(__dirname, "../ml/fraud_model.json");
  const scalerPath = path.join(__dirname, "../ml/scaler.json");
  if (fs.existsSync(modelPath) && fs.existsSync(scalerPath)) {
    const modelJson = fs.readFileSync(modelPath, "utf-8");
    model = RandomForestClassifier.load(JSON.parse(modelJson));
    console.log("Fraud detection model loaded successfully.");
    const scalerJson = fs.readFileSync(scalerPath, "utf-8");
    scaler = JSON.parse(scalerJson);
    console.log("Normalization scaler loaded successfully.");
  } else {
    console.error(
      'CRITICAL: Model or scaler file not found. Please train the model first by running "node ml/trainModel.js"'
    );
    process.exit(1);
  }
} catch (error) {
  console.error("CRITICAL: Error loading the model or scaler:", error);
  process.exit(1);
}
function predictFraud(features) {
  if (!model || !scaler) {
    throw new Error("Fraud detection model or scaler is not loaded.");
  }
  const scaledFeatures = features.map((value, index) => {
    const min = scaler.min[index];
    const max = scaler.max[index];
    const scaledValue = max - min === 0 ? 0 : (value - min) / (max - min);
    return Math.max(0, Math.min(1, scaledValue));
  });
  console.log("[DEBUG] Scaled features sent to model:", scaledFeatures);
  const sample = [scaledFeatures];
  try {
    const predictions = model.estimators.map((tree) => tree.predict(sample)[0]);
    const fraudVotes = predictions.filter((p) => p === 1).length;
    const probability = fraudVotes / model.estimators.length;
    console.log(
      `[DEBUG] Model Prediction: ${fraudVotes} of ${model.estimators.length} trees voted fraud. Probability: ${probability}`
    );
    return probability;
  } catch (error) {
    console.error("CRITICAL: Error during model prediction.", error);
    throw error;
  }
}
module.exports = { predictFraud };
