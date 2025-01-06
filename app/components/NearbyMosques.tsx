'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react'

interface Mosque {
  name: string;
  distance: number;
  lat: number;
  lon: number;
}

export function NearbyMosques() {
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNearbyMosques = async () => {
    setLoading(true)
    setError(null)

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const { latitude, longitude } = position.coords

      const response = await fetch(`/api/nearby-mosques?lat=${latitude}&lon=${longitude}`)
      if (!response.ok) {
        throw new Error("Failed to fetch nearby mosques")
      }

      const data = await response.json()
      setMosques(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mt-4">
      <CardHeader>
        <CardTitle>Nearby Mosques</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button onClick={fetchNearbyMosques} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Fetching mosques...
            </>
          ) : (
            'Find Nearby Mosques'
          )}
        </Button>
        {mosques.length > 0 && (
          <ul className="mt-4 space-y-2">
            {mosques.map((mosque, index) => (
              <li key={index} className="border-b pb-2">
                <h3 className="font-semibold">{mosque.name}</h3>
                <p className="text-sm text-gray-600">Distance: {mosque.distance.toFixed(2)} km</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

