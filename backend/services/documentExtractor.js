const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const API_KEY = "AIzaSyAEG1q3wS5hjterEs89kTa_Jdk1KI5T0Jk";
const genAI = new GoogleGenerativeAI(API_KEY);

function fileToGenerativePart(path, mimeType) {
  if (!fs.existsSync(path)) {
    throw new Error(`File not found at path: ${path}`);
  }
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function extractData(pathToPdf) {
  try {
    console.log(`Processing file with Gemini: ${pathToPdf}...`);
    const pdfFilePart = fileToGenerativePart(pathToPdf, "application/pdf");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
            Analyze the provided identity document (like an Aadhar card).
            Extract the following details if they exist:
            - Full Name (key: "fullName")
            - Father's Name (key: "fatherName")
            - Date of Birth (key: "dateOfBirth", format as DD/MM/YYYY)
            - Full Address, including pin code (key: "address")
            - Aadhar Number (key: "aadharNumber")
            Return the output as a single, clean JSON object. Do not include any extra text, markdown formatting, or explanations.
            If a field is not found, omit it from the JSON.
            Example: {"fullName": "ARUN KUMAR", "fatherName": "VIJAY KUMAR", "dateOfBirth": "15/08/1998", "address": "123, ABC Colony, New Delhi - 110001", "aadharNumber": "123456789012"}
        `;

    const result = await model.generateContent([prompt, pdfFilePart]);
    const response = await result.response;
    const text = response.text();

    console.log("\n--- Gemini Extracted Details (Raw Text) ---");
    console.log(text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(
        "AI did not return a valid JSON object from the document."
      );
    }

    const jsonString = jsonMatch[0];
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(
      "An error occurred during the Gemini extraction process:",
      error
    );
    throw error;
  }
}

module.exports = { extractData };
