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
      nidNumber: "",
      dob: "",
      permanentAddress: "",
      rawText: fullText
    };

    // Very basic parsing (Regex or line-by-line)
    const lines = fullText.split('\n');
    
    // Example: Look for NID number (usually 10 or 13 or 17 digits)
    const nidMatch = fullText.match(/\d{10,17}/);
    if (nidMatch) info.nidNumber = nidMatch[0];

    // Look for Date of Birth (usually DD MMM YYYY or YYYY-MM-DD)
    const dobMatch = fullText.match(/\d{1,2} [A-Za-z]{3} \d{4}/);
    if (dobMatch) info.dob = dobMatch[0];

    // permanent address is usually after "Permanent Address" or similar
    const addressIndex = lines.findIndex(l => l.toLowerCase().includes("address") || l.toLowerCase().includes("ঠিকানা"));
    if (addressIndex !== -1 && lines[addressIndex + 1]) {
      info.permanentAddress = lines[addressIndex + 1] + (lines[addressIndex + 2] ? ", " + lines[addressIndex + 2] : "");
    }

    return info;
  } catch (error) {
    console.error("Vision API Error:", error);
    return { error: "Failed to extract information from NID" };
  }
}
