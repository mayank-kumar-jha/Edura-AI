const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { extractData } = require('../services/documentExtractor');

const router = express.Router();

// Mock database (for hackathon purposes)
let users = [];

// Multer setup for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// --- AUTH ROUTES ---

router.post('/auth/signup', (req, res) => {
    const userData = req.body;
    if (!userData.email || !userData.fullName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (users.find(u => u.email === userData.email)) {
        return res.status(409).json({ error: 'User already exists' });
    }

    const newUser = { 
        id: `user-${uuidv4()}`, 
        ...userData,
        role: userData.email.includes('officer') ? 'officer' : 'student' 
    };
    
    users.push(newUser);
    console.log(`[AUTH] New User Registered: ${newUser.email}`);
    res.status(201).json({ message: 'User created successfully', userId: newUser.id, role: newUser.role });
});

router.post('/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    res.status(200).json({ 
        message: 'Login successful', 
        userId: user.id, 
        fullName: user.fullName, 
        role: user.role 
    });
});

// --- VERIFICATION ROUTE ---

router.post('/user/verify-document', upload.single('document'), async (req, res) => {
    const { userId } = req.body;
    const file = req.file;

    try {
        if (!userId || !file) throw new Error("Missing userId or file");

        const user = users.find(u => u.id === userId);
        if (!user) throw new Error("User session expired. Please log in again.");

        // Call Gemini AI
        const extractedData = await extractData(file.path);
        
        // Logical Comparison (Fuzzy Matching)
        const compare = (reg, ext) => {
            const clean = (val) => String(val || "").toLowerCase().replace(/[^a-z0-9]/g, "");
            return clean(reg) === clean(ext);
        };

        const comparison = [
            { attribute: 'Full Name', registered: user.fullName, extracted: extractedData.fullName, match: compare(user.fullName, extractedData.fullName) },
            { attribute: 'Aadhar Number', registered: user.aadhar, extracted: extractedData.aadharNumber, match: compare(user.aadhar, extractedData.aadharNumber) },
            { attribute: 'Date of Birth', registered: user.dob, extracted: extractedData.dateOfBirth, match: compare(user.dob, extractedData.dateOfBirth) }
        ];

        const isVerified = comparison.every(c => c.match);

        res.json({
            message: isVerified ? "Identity Verified" : "Data Mismatch Detected",
            isVerified,
            comparison
        });

    } catch (error) {
        console.error("[ROUTE ERROR]", error.message);
        res.status(500).json({ error: error.message, isVerified: false });
    } finally {
        if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    }
});

module.exports = router;