import * as Location from 'expo-location';
import axios from 'axios';

const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export async function getCurrentLocation(): Promise<LocationData | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({});
    const places = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    if (places && places[0]) {
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        city: places[0].city || '',
        country: places[0].country || '',
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting location:", error);
    return null;
  }
}

export async function validateLocation(city: string, country: string): Promise<boolean> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);
    return response.status === 200;
  } catch (error) {
    console.error("Error validating location:", error);
    return false;
  }
} 