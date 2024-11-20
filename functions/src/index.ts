import * as functions from "firebase-functions";
import OpenAI from "openai";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface PlantProfileDetails {
  name: string;
  sunPreference: string;
  wateringPreference: string;
  generalInformation: string;
}

export const getPlantProfile = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  const {plantName} = data;
  if (!plantName || typeof plantName !== "string") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Plant name must be provided"
    );
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

    const profileContent = profileResponse.choices[0].message?.content || "";
    const profileData = JSON.parse(profileContent) as {
      exists: boolean;
      plantProfile?: PlantProfileDetails;
    };

    // If plant doesn't exist, return early
    if (!profileData.exists) {
      return {exists: false};
    }

    // If plant exists, generate DALL-E prompt
    const dallePrompt = `
Generate a DALL-E prompt to create an image of a plant based on the following input. Replace "${plantName}" with the user's provided plant name, and generate a description that matches the plant's typical appearance using accurate and verified information. The image should follow these criteria:

- Completely blank, white background.
- In the center of the image, place a cartoon-style rendering of a single ${plantName}.
- Describe the plant's key physical features, such as leaf shape, color, texture, and notable characteristics, in a way that matches its real-world appearance. Ensure the description includes enough detail to make the plant visually recognizable.
- The plant should appear singular and clearly defined, with clean, natural details, and no other elements or distractions in the image.

Respond with only the generated prompt text, no additional formatting or explanation.`.trim();

    const dalleResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert at creating clear, detailed DALL-E image generation prompts.",
        },
        {
          role: "user",
          content: dallePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const imagePrompt = dalleResponse.choices[0].message?.content || "";

    // If we have a valid plant and image prompt, generate the image
    if (profileData.exists && imagePrompt) {
      try {
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          style: "natural",
        });

        const imageUrl = imageResponse.data[0]?.url;

        // Return everything including the generated image URL
        return {
          exists: true,
          plantProfile: profileData.plantProfile,
          imagePrompt,
          imageUrl,
        };
      } catch (imageError) {
        console.error("Error generating image:", imageError);
        // Still return profile data even if image generation fails
        return {
          exists: true,
          plantProfile: profileData.plantProfile,
          imagePrompt,
        };
      }
    }

    return {
      exists: false,
    };
  } catch (error) {
    console.error("Error in plant profile generation:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate plant profile"
    );
  }
});