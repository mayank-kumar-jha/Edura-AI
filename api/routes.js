const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { predictFraud } = require("../services/fraudDetectionService");
const { analyzeBehavior } = require("../services/behavioralAnalytics");
const { getExplanation } = require("../services/xaiService");
const { isIpConsistent } = require("../services/geolocationService");

const router = express.Router();
let users = [];
let activityLog = [];
let auditLog = []; // The immutable log for officer actions

router.use((req, res, next) => {
  req.app.set("trust proxy", true);
  next();
});

// --- User Signup with Integrated Fraud Detection ---
router.post("/auth/signup", async (req, res) => {
  const { formData, behavioralData } = req.body;
  if (!formData || !behavioralData) {
    return res.status(400).json({ error: "Invalid request structure." });
  }
  const { email, password, fullName } = formData;
  const ip = req.ip;
  const ipResult = await isIpConsistent(email, ip);
  const behavioralFeatures = analyzeBehavior(behavioralData);
  const features = [
    behavioralFeatures.pasteCount,
    behavioralFeatures.keyPressSpeed,
    behavioralFeatures.errorRate,
    behavioralFeatures.timeToComplete,
    ipResult.isInconsistent ? 1 : 0,
  ];
  const fraudScore = predictFraud(features);
  const explanation = getExplanation(fraudScore, behavioralFeatures, ipResult);
  const isSuspicious = fraudScore > 0.6 || ipResult.isInconsistent;

  activityLog.unshift({
    id: uuidv4(),
    type: "Signup Attempt",
    email,
    timestamp: new Date().toISOString(),
    fraudScore,
    explanation,
    ipAddress: ip,
    ipConsistency: ipResult.reason,
    isSuspicious,
    status: isSuspicious ? "Suspicious" : "Normal", // NEW: Add initial status
  });

  if (users.find((u) => u.email === email)) {
    return res.status(409).json({ error: "User already exists." });
  }
  const newUser = {
    id: `user-${uuidv4()}`,
    ...formData,
    role: email.includes("officer") ? "officer" : "student",
  };
  users.push(newUser);

  res.status(201).json({ message: "User created successfully!" });
});

// --- User Login with Integrated Fraud Detection ---
router.post("/auth/login", async (req, res) => {
  const { formData, behavioralData } = req.body;
  if (!formData || !behavioralData) {
    return res.status(400).json({ error: "Invalid request structure." });
  }
  const { email, password } = formData;
  const ip = req.ip;
  const ipResult = await isIpConsistent(email, ip);
  const behavioralFeatures = analyzeBehavior(behavioralData);
  const features = [
    behavioralFeatures.pasteCount,
    behavioralFeatures.keyPressSpeed,
    behavioralFeatures.errorRate,
    behavioralFeatures.timeToComplete,
    ipResult.isInconsistent ? 1 : 0,
  ];
  const fraudScore = predictFraud(features);
  const explanation = getExplanation(fraudScore, behavioralFeatures, ipResult);
  const isSuspicious = fraudScore > 0.6 || ipResult.isInconsistent;

  activityLog.unshift({
    id: uuidv4(),
    type: "Login Attempt",
    email,
    timestamp: new Date().toISOString(),
    fraudScore,
    explanation,
    ipAddress: ip,
    ipConsistency: ipResult.reason,
    isSuspicious,
    status: isSuspicious ? "Suspicious" : "Normal", // NEW: Add initial status
  });

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  res
    .status(200)
    .json({
      message: "Login successful!",
      userId: user.id,
      fullName: user.fullName,
      role: user.role,
    });
});

// --- NEW: OFFICER OVERRIDE ENDPOINT ---
router.post("/activity/override", (req, res) => {
  const { logId, officerId, reason } = req.body;
  const logIndex = activityLog.findIndex((log) => log.id === logId);
  if (logIndex === -1) {
    return res.status(404).json({ error: "Activity log not found." });
  }
  const activity = activityLog[logIndex];
  const previousStatus = activity.status;

  // L1/L2 Hierarchy Logic
  const isHighRisk = activity.fraudScore > 0.8;
  const newStatus = isHighRisk ? "Pending L2 Approval" : "Cleared by L1";
  activity.status = newStatus;

  const auditEntry = {
    logId: uuidv4(),
    timestamp: new Date().toISOString(),
    activityId: activity.id,
    userEmail: activity.email,
    officerId,
    reason,
    previousStatus,
    newStatus,
    fraudScoreAtOverride: activity.fraudScore,
  };
  auditLog.unshift(auditEntry);
  activityLog[logIndex] = activity;

  console.log(
    `[AUDIT] Officer ${officerId} cleared flag for ${activity.email}. New status: ${newStatus}`
  );
  res.status(200).json(activity);
});

router.get("/activity-log", (req, res) => {
  res.json({ activityLog, auditLog });
});

module.exports = router;
