import * as functions from 'firebase-functions';
import axios from 'axios';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const FARMSENSE_API_KEY = process.env.FARMSENSE_API_KEY;
const FARMSENSE_BASE_URL = 'https://api.farmsense.net/v1/frostdates';

async function getNearestStation(lat: number, lon: number) {
  try {
    const response = await axios.get(`${FARMSENSE_BASE_URL}/stations`, {
      params: { 
        lat, 
        lon,
        apikey: FARMSENSE_API_KEY 
      }
    });
    return response.data[0]; // Get nearest station
  } catch (error) {
    console.error('Error fetching station:', error);
    throw error;
  }
}

async function getFrostDates(stationId: string) {
  try {
    const response = await axios.get(`${FARMSENSE_BASE_URL}/probabilities`, {
      params: {
        station: stationId,
        season: 1, // Spring season
        apikey: FARMSENSE_API_KEY
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching frost dates:', error);
    throw error;
  }
}

export const getPlantingDate = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { plant, location } = data;
  
  try {
    // 1. Get nearest frost station
    const station = await getNearestStation(location.latitude, location.longitude);
    
    // 2. Get frost dates
    const frostDates = await getFrostDates(station.id);
    
    // 3. Use OpenAI to determine planting date
    const prompt = `
      Based on the following data, provide ONLY a recommended planting date in YYYY-MM-DD format.
      Reference the Farmer's Almanac and consider:

      Plant: ${plant.displayName}
      Growing Requirements:
      - Sun: ${plant.sunPreference}
      - Water: ${plant.wateringPreference}

      Location: ${location.city}, ${location.country}
      Frost Dates:
      ${JSON.stringify(frostDates)}

      Return only the date in YYYY-MM-DD format, no other text.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a gardening expert. Respond only with a date in YYYY-MM-DD format." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 20
    });

    const plantingDate = completion.choices[0].message?.content?.trim();

    return { plantingDate };
  } catch (error) {
    console.error('Error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to generate planting date');
  }
}); 