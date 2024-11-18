// import { db } from '../config/firebase';
// import { collection, query, where, getDocs } from 'firebase/firestore';

// export async function getPlantEvents(date: string) {
//   try {
//     const eventsRef = collection(db, 'plantEvents');
//     const q = query(eventsRef, where('date', '==', date));
//     const querySnapshot = await getDocs(q);
    
//     const events: PlantEvent[] = [];
//     querySnapshot.forEach((doc) => {
//       events.push({
//         id: doc.id,
//         ...doc.data()
//       } as PlantEvent);
//     });
    
//     return events;
//   } catch (error) {
//     console.error('Error fetching plant events:', error);
//     return [];
//   }
// }

// Firestore structure example:
// Collection: plantEvents
// Document: {
//   plantName: string,
//   action: string,
//   date: string (YYYY-MM-DD),
//   userId: string,
//   createdAt: timestamp
// } 