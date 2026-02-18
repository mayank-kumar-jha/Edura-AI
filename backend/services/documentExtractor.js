const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

// Replace with your verified API Key
const API_KEY = "AIzaSyAEG1q3wS5hjterEs89kTa_Jdk1KI5T0Jk";
const genAI = new GoogleGenerativeAI(API_KEY);

async function extractData(filePath) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const filePart = {
            inlineData: {
                data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
                mimeType: "application/pdf"
            }
        };

        const prompt = `
            Extract data from this Aadhar PDF. 
            Return ONLY a JSON object with: 
            {"fullName": "...", "dateOfBirth": "DD/MM/YYYY", "aadharNumber": "..."}
        `;

        const result = await model.generateContent([prompt, filePart]);
        const response = await result.response;
        const text = response.text().replace(/```json|```/g, "").trim();
        
        return JSON.parse(text);
    } catch (error) {
        console.error("[AI ERROR]", error);
        throw new Error("AI failed to read document.");
    }
}

module.exports = { extractData };