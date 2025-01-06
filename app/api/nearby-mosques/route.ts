import { NextResponse } from 'next/server';

interface Mosque {
  name: string;
  distance: number;
  lat: number;
  lon: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 });
  }

  const radius = 5000; // 5km radius
  const limit = 10; // Limit to 10 results

  const query = `
    [out:json];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
    );
    out center ${limit};
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from Overpass API');
    }

    const data = await response.json();

    const mosques: Mosque[] = data.elements.map((element: any) => {
      const mosque: Mosque = {
        name: element.tags.name || 'Unnamed Mosque',
        distance: calculateDistance(Number(lat), Number(lon), element.lat, element.lon),
        lat: element.lat,
        lon: element.lon,
      };
      return mosque;
    });

    mosques.sort((a, b) => a.distance - b.distance);

    return NextResponse.json(mosques);
  } catch (error) {
    console.error('Error fetching nearby mosques:', error);
    return NextResponse.json({ error: 'Failed to fetch nearby mosques' }, { status: 500 });
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

