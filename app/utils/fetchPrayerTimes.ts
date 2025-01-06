import { PrayerTimes } from '../types/PrayerTimes';

export async function fetchPrayerTimes(city: string, country: string, method: number = 2): Promise<PrayerTimes> {
  const date = new Date();
  const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateStr}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`);
  const data = await response.json();
  const { Fajr, Dhuhr, Asr, Maghrib, Isha } = data.data.timings;
  return { Fajr, Dhuhr, Asr, Maghrib, Isha };
}

