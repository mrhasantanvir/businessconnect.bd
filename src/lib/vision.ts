import vision from "@google-cloud/vision";

// Creates a client
const client = new vision.ImageAnnotatorClient({
  credentials: process.env.GOOGLE_VISION_CREDENTIALS 
    ? JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS) 
    : undefined,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function extractNIDInfo(imageUrl: string) {
  try {
    // In a real production environment, imageUrl would be an S3/Cloudinary URL or local path
    // For this example, we assume Google Vision can access it
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;
    
    if (!detections || detections.length === 0) {
      return { error: "No text detected in image" };
    }

    const fullText = detections[0].description || "";
    
    // Simple extraction logic for NID (this needs to be refined for Bengali/English formats)
    // NID formats vary, but we can look for keywords like "Name", "Permanent Address", "Date of Birth"
    
    const info = {
      name: "",
      fatherName: "",
      motherName: "",
      nidNumber: "",
      dob: "",
      permanentAddress: "",
      rawText: fullText
    };

    const lines = fullText.split('\n');
    
    // Improved Extraction Strategy
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 1. Name Extraction
      if (!info.name) {
        if (line.match(/^Name[:\s]/i)) {
          info.name = line.replace(/^Name[:\s]+/i, "").trim();
        } else if (line.includes("নাম") && lines[i+1] && !lines[i+1].includes(":")) {
          // If Bengali label, check next line for English name
          info.name = lines[i+1].trim();
        }
      }

      // 2. Father's Name
      if (!info.fatherName) {
        if (line.match(/^Father[''s]* Name[:\s]/i) || line.match(/^Father[:\s]/i)) {
          info.fatherName = line.replace(/^Father[''s]* Name[:\s]+/i, "").replace(/^Father[:\s]+/i, "").trim();
        } else if ((line.includes("পিতা") || line.includes("পিতা/স্বামী")) && lines[i+1] && !lines[i+1].includes(":")) {
          info.fatherName = lines[i+1].trim();
        }
      }

      // 3. Mother's Name
      if (!info.motherName) {
        if (line.match(/^Mother[''s]* Name[:\s]/i) || line.match(/^Mother[:\s]/i)) {
          info.motherName = line.replace(/^Mother[''s]* Name[:\s]+/i, "").replace(/^Mother[:\s]+/i, "").trim();
        } else if (line.includes("মাতা") && lines[i+1] && !lines[i+1].includes(":")) {
          info.motherName = lines[i+1].trim();
        }
      }

      // 4. Date of Birth
      if (!info.dob) {
        const dobMatch = line.match(/Date of Birth[:\s]+(\d{1,2} [A-Za-z]{3} \d{4})/i);
        if (dobMatch) {
          info.dob = dobMatch[1];
        } else if (line.includes("জন্ম তারিখ") || line.includes("Date of Birth")) {
          const dateMatch = line.match(/\d{1,2} [A-Za-z]{3} \d{4}/) || line.match(/\d{4}-\d{2}-\d{2}/);
          if (dateMatch) info.dob = dateMatch[0];
        }
      }

      // 5. NID Number
      if (!info.nidNumber) {
        const nidMatch = line.match(/ID NO[:\s]+(\d+)/i) || line.match(/NID NO[:\s]+(\d+)/i) || line.match(/(\d{10,17})/);
        if (nidMatch) {
          info.nidNumber = nidMatch[1] || nidMatch[0];
        }
      }

      // 6. Address
      if (!info.permanentAddress) {
        if (line.toLowerCase().includes("address") || line.toLowerCase().includes("ঠিকানা")) {
          // Address is usually the next few lines
          let addr = "";
          if (lines[i+1]) addr += lines[i+1].trim();
          if (lines[i+2] && !lines[i+2].includes(":")) addr += ", " + lines[i+2].trim();
          info.permanentAddress = addr;
        }
      }
    }

    // Fallback for Name if still empty (search for capitalized line near the top)
    if (!info.name && lines.length > 2) {
      for (let i = 0; i < Math.min(lines.length, 5); i++) {
        if (lines[i].match(/^[A-Z\s]{5,25}$/) && !lines[i].includes("BANGLADESH")) {
          info.name = lines[i].trim();
          break;
        }
      }
    }

    return info;
  } catch (error) {
    console.error("Vision API Error:", error);
    return { error: "Failed to extract information from NID" };
  }
}
