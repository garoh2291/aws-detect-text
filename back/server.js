// server.js
const express = require("express");
const multer = require("multer");
const AWS = require("aws-sdk");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const upload = multer({ dest: "uploads/" });

// Configuring AWS Textract
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const textract = new AWS.Textract();

app.use(cors()); // Enable CORS for all routes

app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const file = req.file;
  const fileBuffer = fs.readFileSync(file.path);

  const params = {
    Document: { Bytes: fileBuffer },
    FeatureTypes: ["FORMS"],
  };

  try {
    const textractResponse = await textract.analyzeDocument(params).promise();

    // Process Textract response to extract key-value pairs if needed
    const extractedText = extractText(textractResponse);
    console.log(textractResponse);

    console.log(extractedText); // Logging the extracted text
    res.json({ extractedText });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing the file");
  }
});

function extractText(data) {
  // Placeholder for text extraction logic from Textract response
  // You would need to loop over blocks of type LINE or WORD and concatenate the text
  // Since this is a login form image, we're looking for an email
  let emailText = "";
  data.Blocks.forEach((block) => {
    if (block.BlockType === "LINE") {
      if (block.Text.includes("@")) {
        emailText = block.Text;
      }
    }
  });
  return emailText;
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
