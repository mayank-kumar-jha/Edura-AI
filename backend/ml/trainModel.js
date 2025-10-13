const { RandomForestClassifier } = require("ml-random-forest");
const { Matrix } = require("ml-matrix");
const fs = require("fs");
const path = require("path");

console.log("Starting QUICK AI model training for rapid testing...");

// --- Configuration (Reduced for speed) ---
const NUM_SAMPLES = 2000; // Reduced from 8000
const modelPath = path.join(__dirname, "fraud_model.json");
const scalerPath = path.join(__dirname, "scaler.json");

// --- Data Generation ---
const features = [];
const labels = [];

for (let i = 0; i < NUM_SAMPLES; i++) {
  const scenario = i % 4;
  if (scenario === 0) {
    labels.push(0); // Genuine
    features.push([
      0,
      Math.random() * 4 + 3,
      Math.random() * 0.1 + 0.02,
      Math.random() * 15 + 10,
      0,
    ]);
  } else if (scenario === 1) {
    labels.push(1); // Paste Fraud
    features.push([
      1,
      Math.random() * 2 + 0.5,
      Math.random() * 0.01,
      Math.random() * 3 + 1,
      0,
    ]);
  } else if (scenario === 2) {
    labels.push(0); // More Genuine
    features.push([
      0,
      Math.random() * 3 + 7,
      Math.random() * 0.03,
      Math.random() * 15 + 15,
      0,
    ]);
  } else {
    labels.push(1); // IP Fraud
    features.push([
      0,
      Math.random() * 4 + 3,
      Math.random() * 0.1 + 0.02,
      Math.random() * 15 + 10,
      1,
    ]);
  }
}
console.log(`Generated ${NUM_SAMPLES} data samples.`);

// --- Manual Feature Scaling ---
let minArray = [...features[0]];
let maxArray = [...features[0]];
const numFeatures = features[0].length;
for (let i = 1; i < features.length; i++) {
  for (let j = 0; j < numFeatures; j++) {
    if (features[i][j] < minArray[j]) minArray[j] = features[i][j];
    if (features[i][j] > maxArray[j]) maxArray[j] = features[i][j];
  }
}
const scaledFeatureData = features.map((row) =>
  row.map((value, j) => {
    const min = minArray[j];
    const max = maxArray[j];
    return max - min === 0 ? 0 : (value - min) / (max - min);
  })
);
const scaledFeaturesMatrix = new Matrix(scaledFeatureData);
console.log("Data normalization complete.");

// --- Model Training (Reduced for speed) ---
const options = {
  seed: 3,
  maxFeatures: 3,
  replacement: false,
  nEstimators: 25,
}; // Reduced from 100
console.log("Training the new, faster Random Forest Classifier...");
const classifier = new RandomForestClassifier(options);
classifier.train(scaledFeaturesMatrix, labels);
console.log("Training complete.");

// --- Save Model and Scaler ---
fs.writeFileSync(modelPath, JSON.stringify(classifier), "utf-8");
console.log(`New AI model saved to: ${modelPath}`);
const scaler = { min: minArray, max: maxArray };
fs.writeFileSync(scalerPath, JSON.stringify(scaler), "utf-8");
console.log(`Scaler saved to: ${scalerPath}`);
console.log("\n--- IMPORTANT: Please restart your backend server now! ---");
