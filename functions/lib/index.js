"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlantingDate = exports.getPlantProfile = void 0;
const functions = __importStar(require("firebase-functions"));
const openai_1 = __importDefault(require("openai"));
const dotenv = __importStar(require("dotenv"));
const admin = __importStar(require("firebase-admin"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Initialize Firebase Admin
admin.initializeApp();
// Load environment variables
dotenv.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.getPlantProfile = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const plantName = data.plantName.trim().toLowerCase();
    if (!plantName) {
        throw new functions.https.HttpsError("invalid-argument", "Plant name must be provided");
    }
    try {
        // First, check if plant exists and get profile
        const profilePrompt = `
Determine if the following input is the name of a real plant that can be grown in a garden. If it is not, respond with:

{
  "exists": false
}

If it is a real plant, generate accurate and verified gardening information based on current web data and respond with:

{
  "exists": true,
  "plantProfile": {
    "name": "common name of the plant",
    "sunPreference": "choose one from Full Sun, Partial Sun, Partial Shade, Full Shade, Dappled Sunlight",
    "wateringPreference": "choose one from Keep Soil Moist, Drought-Tolerant, High Water Needs, Water When Dry, Water Sparingly",
    "generalInformation": "3–5 sentences in a brief, conversational tone. Include space requirements (e.g., plant spacing), soil preferences (e.g., sandy, loamy, etc.), temperature tolerances, lifespan (e.g., annual, perennial), and good companion plants for gardening."
  }
}

For example:
Input: "Tomato"
Output:
{
  "exists": true,
  "plantProfile": {
    "name": "Tomato",
    "sunPreference": "Full Sun",
    "wateringPreference": "Keep Soil Moist",
    "generalInformation": "Tomatoes need plenty of sunlight and should be planted 18–24 inches apart. They prefer well-drained, slightly acidic soil. They thrive in temperatures between 70–85°F. Tomatoes are annual plants that pair well with basil and marigolds."
  }
}

Input: "${plantName}"`.trim();
        const profileResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a professional botanist and gardening expert who provides accurate, structured plant information.",
                },
                {
                    role: "user",
                    content: profilePrompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 1000,
        });
        const profileContent = ((_a = profileResponse.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "";
        const profileData = JSON.parse(profileContent);
        // If plant doesn't exist, return early
        if (!profileData.exists) {
            return { exists: false };
        }
        // Update the DALL-E prompt generation
        const dallePrompt = `
A photorealistic botanical illustration of a healthy ${plantName} centered against a clean white background. The image highlights a defining feature of the plant, such as [specific defining feature, e.g., ripe tomatoes for a tomato plant, soft velvety leaves for sage, or bright green peppers for a jalapeño plant], depicted with high detail, vibrant natural colors, and scientific accuracy.

The composition should:
- Showcase the defining feature in sharp focus, with supporting elements like stems, leaves, or additional features providing context in the background.
- Include enough of the plant to give a sense of its structure and overall characteristics.
- Depict the plant in perfect health, ensuring textures, colors, and forms are natural and realistic.
- Style it as a close-up, focusing on the plant's most recognizable and visually appealing traits.

Lighting: Soft, even illumination to enhance texture, color, and detail.
Style: Natural, photorealistic botanical photography.`.trim();
        // Update the image generation parameters
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: dallePrompt,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "natural",
        });
        console.log("DALL-E response:", imageResponse);
        const dalleUrl = (_b = imageResponse.data[0]) === null || _b === void 0 ? void 0 : _b.url;
        if (dalleUrl) {
            console.log("Generated DALL-E URL:", dalleUrl);
            // Immediately download the image
            const response = await (0, node_fetch_1.default)(dalleUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            }
            const buffer = await response.buffer();
            // Save to Firebase Storage
            const bucket = admin.storage().bucket();
            const filename = `plant-images/${Date.now()}-${plantName
                .toLowerCase()
                .replace(/\s+/g, "-")}.png`;
            const file = bucket.file(filename);
            await file.save(buffer, {
                metadata: {
                    contentType: "image/png",
                },
            });
            // Make the file publicly accessible
            await file.makePublic();
            // Get the public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
            return {
                exists: true,
                plantProfile: profileData.plantProfile,
                imagePrompt: dallePrompt,
                imageUrl: publicUrl,
            };
        }
        else {
            console.error("No URL in DALL-E response");
        }
        return {
            exists: false,
        };
    }
    catch (error) {
        console.error("Error in plant profile generation:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate plant profile");
    }
});
exports.getPlantingDate = functions.https.onCall(async (data, context) => {
    var _a, _b, _c;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { plantProfile, location } = data;
    try {
        const prompt = `
      Based on the following data, provide ONLY a recommended planting date in MM-DD format for ${location.city}, ${location.country}.
      
      Plant: ${plantProfile.name}
      Growing Requirements:
      - Sun: ${plantProfile.sunPreference}
      - Water: ${plantProfile.wateringPreference}

      Consider the typical growing season for this plant in ${location.city}, ${location.country}.
      Return only the date in MM-DD format, no other text.
    `;
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: "You are a gardening expert. Respond only with a date in MM-DD format.",
                },
                { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 20,
        });
        const monthDay = (_c = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim();
        if (!monthDay || !monthDay.match(/^\d{2}-\d{2}$/)) {
            throw new functions.https.HttpsError("internal", "Invalid date format received from AI");
        }
        // Calculate the appropriate year
        const now = new Date();
        const currentYear = now.getFullYear();
        const [month, day] = monthDay.split("-").map((num) => parseInt(num));
        // Validate month and day
        if (month < 1 || month > 12 || day < 1 || day > 31) {
            throw new functions.https.HttpsError("internal", "Invalid month or day received from AI");
        }
        // Create dates to compare
        const suggestedDate = new Date(currentYear, month - 1, day);
        let plantingDate;
        if (suggestedDate <= now) {
            // If the date has passed this year, use next year
            plantingDate = new Date(currentYear + 1, month - 1, day);
        }
        else {
            // If the date hasn't passed, use this year
            plantingDate = suggestedDate;
        }
        // Format the date as YYYY-MM-DD
        const formattedDate = plantingDate.toISOString().split("T")[0];
        return { plantingDate: formattedDate };
    }
    catch (error) {
        console.error("Error in planting date generation:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", "Failed to generate planting date");
    }
});
//# sourceMappingURL=index.js.map