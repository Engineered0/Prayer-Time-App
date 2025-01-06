import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink } from 'lucide-react'

export function PrayerInfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-emerald-700 hover:text-emerald-600">
          How are prayer times calculated?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Prayer Time Calculation</DialogTitle>
          <DialogDescription>
            Information about the calculation method and API used
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <p>
            Prayer times are calculated using astronomical formulas based on the sun's position and geographical location.
          </p>
          <p>
            We use the Aladhan API, which offers various calculation methods. Our app uses Method 2, which corresponds to the Islamic Society of North America (ISNA) method.
          </p>
          <p>
            Key factors in the calculation include:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Latitude and longitude of the location</li>
            <li>Date (as prayer times vary throughout the year)</li>
            <li>Angle of the sun for Fajr and Isha prayers</li>
            <li>Madhab for Asr prayer calculation (Shafi'i or Hanafi)</li>
          </ul>
          <p>
            The API takes these factors into account to provide accurate prayer times for any location worldwide.
          </p>
          <a 
            href="https://aladhan.com/prayer-times-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center text-emerald-700 hover:text-emerald-600"
          >
            Learn more about the Aladhan API
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}

