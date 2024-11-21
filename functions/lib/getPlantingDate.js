"use strict";
// import * as functions from 'firebase-functions';
// import OpenAI from 'openai';
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// export const getPlantingDate = functions.https.onCall(async (data, context) => {
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }
//   const { plantProfile, location } = data;
//   try {
//     const prompt = `
//       Based on the following data, provide ONLY a recommended planting date in YYYY-MM-DD format for ${location.city}, ${location.country}.
//       Plant: ${plantProfile.name}
//       Growing Requirements:
//       - Sun: ${plantProfile.sunPreference}
//       - Water: ${plantProfile.wateringPreference}
//       Consider the typical growing season and climate for ${location.city}, ${location.country}.
//       Return only the date in YYYY-MM-DD format, no other text.
//     `;
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         { role: "system", content: "You are a gardening expert. Respond only with a date in YYYY-MM-DD format." },
//         { role: "user", content: prompt }
//       ],
//       temperature: 0.7,
//       max_tokens: 20
//     });
//     const plantingDate = completion.choices[0].message?.content?.trim();
//     return { plantingDate };
//   } catch (error) {
//     console.error('Error:', error);
//     throw new functions.https.HttpsError('internal', 'Failed to generate planting date');
//   }
// }); 
//# sourceMappingURL=getPlantingDate.js.map