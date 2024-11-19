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
exports.generatePlantProfile = void 0;
const functions = __importStar(require("firebase-functions"));
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.generatePlantProfile = functions.https.onCall(async (data, context) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    // Ensure user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { plantName } = data;
    if (!plantName || typeof plantName !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'Plant name must be provided');
    }
    try {
        const prompt = `Create a plant profile with accurate and verified information for gardening purposes only. Search the web for current data to ensure accuracy. The response should include the following fields:

1. Name: The plant's common name.
2. Sun Preference: Choose one from "Full Sun", "Partial Sun", "Partial Shade", "Full Shade", or "Dappled Sunlight".
3. Watering Preference: Choose one from "Keep Soil Moist", "Drought-Tolerant", "High Water Needs", "Water When Dry", or "Water Sparingly".
4. General Information: Write 3–5 sentences in a brief, conversational tone. Include information on:
   - Space requirements (e.g., plant spacing)
   - Soil preferences (e.g., sandy, loamy, etc.)
   - Temperature tolerances
   - Lifespan (e.g., annual, perennial)
   - Good companion plants for gardening

Format the response exactly like this example:
Name: Tomato
Sun Preference: Full Sun
Watering Preference: Keep Soil Moist
General Information: Tomatoes need plenty of sunlight and should be planted 18–24 inches apart. They prefer well-drained, slightly acidic soil. They thrive in temperatures between 70–85°F. Tomatoes are annual plants that pair well with basil and marigolds.

Input: "${plantName}"`;
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
        });
        const result = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
        // Parse the response into structured data
        const lines = result.split('\n');
        const profile = {
            name: ((_d = (_c = lines.find((line) => line.startsWith('Name:'))) === null || _c === void 0 ? void 0 : _c.split('Name:')[1]) === null || _d === void 0 ? void 0 : _d.trim()) || plantName,
            sunPreference: ((_f = (_e = lines.find((line) => line.startsWith('Sun Preference:'))) === null || _e === void 0 ? void 0 : _e.split('Sun Preference:')[1]) === null || _f === void 0 ? void 0 : _f.trim()) || '',
            wateringPreference: ((_h = (_g = lines.find((line) => line.startsWith('Watering Preference:'))) === null || _g === void 0 ? void 0 : _g.split('Watering Preference:')[1]) === null || _h === void 0 ? void 0 : _h.trim()) || '',
            generalInformation: ((_k = (_j = lines.find((line) => line.startsWith('General Information:'))) === null || _j === void 0 ? void 0 : _j.split('General Information:')[1]) === null || _k === void 0 ? void 0 : _k.trim()) || '',
        };
        return profile;
    }
    catch (error) {
        console.error('Error generating plant profile:', error);
        throw new functions.https.HttpsError('internal', 'Failed to generate plant profile');
    }
});
//# sourceMappingURL=generatePlantProfile.js.map