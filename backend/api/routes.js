const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { extractData } = require("../services/documentExtractor");

const router = express.Router();
let users = [];

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const upload = multer({ dest: uploadDir });

router.post("/auth/signup", (req, res) => {
  const {
    email,
    password,
    fullName,
    aadhar,
    pan,
    gender,
    age,
    dob,
    fatherName,
    address,
  } = req.body;
  if (
    !email ||
    !password ||
    !fullName ||
    !aadhar ||
    !pan ||
    !gender ||
    !age ||
    !dob ||
    !fatherName ||
    !address
  ) {
    return res
      .status(400)
      .json({ error: "All registration fields are required." });
  }
  if (users.find((u) => u.email === email)) {
    return res
      .status(409)
      .json({ error: "User with this email already exists." });
  }
  const newUser = {
    id: `user-${uuidv4()}`,
    email,
    password,
    fullName,
    aadhar,
    pan,
    gender,
    age,
    dob,
    fatherName,
    address,
    role: email.includes("officer") ? "officer" : "student",
  };
  users.push(newUser);
  res
    .status(201)
    .json({
      message: "User created successfully!",
      userId: newUser.id,
      role: newUser.role,
    });
});

router.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
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

router.post(
  "/user/verify-document",
  upload.single("document"),
  async (req, res) => {
    const { userId } = req.body;
    const file = req.file;
    if (!userId || !file) {
      return res
        .status(400)
        .json({ error: "User ID and document are required." });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      fs.unlinkSync(file.path);
      return res.status(404).json({ error: "User not found." });
    }

    const registeredData = {
      fullName: user.fullName,
      fatherName: user.fatherName,
      dateOfBirth: user.dob,
      address: user.address,
      aadharNumber: user.aadhar,
    };

    try {
      const extractedData = await extractData(file.path);
      const comparisonResult = [];
      const fieldsToCompare = [
        "fullName",
        "fatherName",
        "dateOfBirth",
        "address",
        "aadharNumber",
      ];

      fieldsToCompare.forEach((field) => {
        const registeredValue = (registeredData[field] || "")
          .trim()
          .toLowerCase()
          .replace(/[\s,-./]/g, "");
        const extractedValue = (extractedData[field] || "")
          .trim()
          .toLowerCase()
          .replace(/[\s,-./]/g, "");

        comparisonResult.push({
          attribute: field
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase()),
          registered: registeredData[field] || "N/A",
          extracted: extractedData[field] || "Not Found",
          match: registeredValue === extractedValue,
        });
      });

      const isVerified = comparisonResult.every((item) => item.match);
      console.log(
        `[VERIFY] ID Verification for ${user.email}: ${
          isVerified ? "SUCCESS" : "FAIL"
        }`
      );

      res.status(200).json({
        message: isVerified
          ? "Document details successfully matched! You can proceed to the next step."
          : "Mismatch found in document details.",
        isVerified: isVerified,
        comparison: comparisonResult,
      });
    } catch (error) {
      console.error("Verification process failed:", error);
      const failureComparison = Object.keys(registeredData).map((field) => ({
        attribute: field
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (str) => str.toUpperCase()),
        registered: registeredData[field] || "N/A",
        extracted: "AI Extraction Failed",
        match: false,
      }));
      res
        .status(200)
        .json({
          message: "Error: The AI could not process the document.",
          isVerified: false,
          comparison: failureComparison,
        });
    } finally {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }
);

router.post("/loan/submit", upload.single("bonafide"), (req, res) => {
  const { userId, loanData } = req.body;
  console.log(`[LOAN] Received loan application from user: ${userId}`);
  console.log(JSON.parse(loanData));
  res.status(201).json({ message: "Loan application submitted successfully!" });
});

module.exports = router;
