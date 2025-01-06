'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { fetchPrayerTimes } from './utils/fetchPrayerTimes'
import { PrayerTimes, PrayerName } from './types/PrayerTimes'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { PrayerInfoModal } from './components/PrayerInfoModal'
import { NearbyMosques } from './components/NearbyMosques'
import { motion } from "framer-motion"
import { Github, Linkedin } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { canadianCities } from './data/canadianCities'

const gradients: Record<PrayerName, string> = {
  Fajr: 'from-blue-300 to-purple-300',
  Dhuhr: 'from-yellow-200 to-yellow-400',
  Asr: 'from-orange-200 to-orange-400',
  Maghrib: 'from-pink-200 to-pink-400',
  Isha: 'from-blue-400 to-blue-600',
}

export default function PrayerTimingApp() {
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [userName, setUserName] = useState('')
  const [currentPrayer, setCurrentPrayer] = useState<PrayerName>('Fajr')
  const [nextPrayer, setNextPrayer] = useState<PrayerName>('Fajr')
  const [countdownMessage, setCountdownMessage] = useState('')
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [use24HourFormat, setUse24HourFormat] = useState(false)
  const [isLocationSet, setIsLocationSet] = useState(false)
  const [greeting, setGreeting] = useState('')
  const [calculationMethod, setCalculationMethod] = useState(2) // Default to ISNA method
  const [displayCity, setDisplayCity] = useState('')
  const [currentDate, setCurrentDate] = useState(new Date())

  const { data: prayerTimes, error, mutate } = useSWR<PrayerTimes>(
    isLocationSet ? [city, country, calculationMethod] : null,
    () => fetchPrayerTimes(city, country, calculationMethod),
    { refreshInterval: 60000 } // Refresh every minute
  )

  useEffect(() => {
    const fetchData = async () => {
      if (isLocationSet) {
        const times = await fetchPrayerTimes(city, country, calculationMethod);
        mutate(times);
      }
    };

    fetchData();
    const interval = setInterval(() => {
      setCurrentDate(new Date());
      fetchData();
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [city, country, calculationMethod, isLocationSet, mutate]);

  useEffect(() => {
    if (prayerTimes) {
      const updatePrayerInfo = () => {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const prayerOrder: PrayerName[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
        let current: PrayerName = 'Isha';
        let next: PrayerName = 'Fajr';
        
        for (let i = 0; i < prayerOrder.length; i++) {
          const prayer = prayerOrder[i];
          const [hours, minutes] = prayerTimes[prayer].split(':').map(Number);
          const prayerTime = hours * 60 + minutes;
          
          if (currentTime < prayerTime) {
            current = i === 0 ? prayerOrder[prayerOrder.length - 1] : prayerOrder[i - 1];
            next = prayer;
            break;
          }
        }
        
        setCurrentPrayer(current);
        setNextPrayer(next);
      };

      const updateCountdown = () => {
        const now = new Date()
        const [nextHours, nextMinutes] = prayerTimes[nextPrayer].split(':').map(Number)
        const nextPrayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextHours, nextMinutes)
        
        if (nextPrayerTime < now) {
          nextPrayerTime.setDate(nextPrayerTime.getDate() + 1)
        }
        
        const diff = nextPrayerTime.getTime() - now.getTime()
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        
        const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        
        if (currentPrayer === nextPrayer) {
          setCountdownMessage(`${currentPrayer} prayer has started. Next prayer (${nextPrayer}) in ${timeString}`)
        } else {
          setCountdownMessage(`You can pray ${currentPrayer} for another ${timeString} until ${nextPrayer} time`)
        }
      }

      updatePrayerInfo()
      updateCountdown()

      const interval = setInterval(() => {
        updatePrayerInfo()
        updateCountdown()
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [prayerTimes, currentPrayer, nextPrayer])

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) setGreeting('Good morning')
      else if (hour < 18) setGreeting('Good afternoon')
      else setGreeting('Good evening')
    }

    updateGreeting()
    const interval = setInterval(updateGreeting, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  if (error) return <div>Failed to load prayer times</div>
  if (!isLocationSet) return <LocationInput setCity={setCity} setCountry={setCountry} setUserName={setUserName} setIsLocationSet={setIsLocationSet} setDisplayCity={setDisplayCity} />
  if (!prayerTimes) return <div>Loading...</div>

  const formatTime = (time: string) => {
    if (use24HourFormat) return time
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const formattedHours = hours % 12 || 12
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br ${gradients[currentPrayer]}`}>
      <Card className="w-full max-w-md mb-4">
        <CardContent className="p-6">
          <motion.h1 
            className="text-3xl font-bold mb-2 text-emerald-800"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {greeting}, <Popover>
              <PopoverTrigger asChild>
                <span className="cursor-pointer underline decoration-dotted">{userName}</span>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Personalize your experience</h4>
                    <p className="text-sm text-muted-foreground">
                      Click the buttons below to see what happens!
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Button onClick={() => alert(`May Allah accept your prayers, ${userName}!`)}>Dua for {userName}</Button>
                    <Button onClick={() => setGreeting("As-salamu alaykum")}>Islamic Greeting</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </motion.h1>
          <p className="text-muted-foreground">
            Prayer times for {displayCity}, Canada on {currentDate.toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
      
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{currentPrayer}</h2>
            <p className="text-xl">{countdownMessage}</p>
          </div>
          
          <div className="space-y-4">
            {(Object.keys(prayerTimes) as PrayerName[]).map((prayer) => (
              <motion.div 
                key={prayer} 
                className={`flex justify-between items-center ${prayer === currentPrayer ? 'font-bold' : 'text-muted-foreground'}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span>{prayer}</span>
                <span>{formatTime(prayerTimes[prayer])}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="notifications"
            checked={notificationsEnabled}
            onCheckedChange={setNotificationsEnabled}
          />
          <Label htmlFor="notifications">Notifications</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="24hour"
            checked={use24HourFormat}
            onCheckedChange={setUse24HourFormat}
          />
          <Label htmlFor="24hour">24-hour format</Label>
        </div>
      </div>
      
      <Button className="mt-4" onClick={() => setIsLocationSet(false)}>Change Location</Button>
      
      <div className="text-black font-semibold">
        <PrayerInfoModal />
      </div>

      <NearbyMosques />

      <motion.div 
        className="mt-8 text-sm text-center text-gray-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <p className="text-black font-semibold">Created by Khaled Ali Ahmed</p>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="link" className="text-xs">About the developer</Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="flex justify-center space-x-4">
              <a href="https://www.github.com/Engineered0" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Github className="h-4 w-4" />
                </Button>
              </a>
              <a href="https://www.linkedin.com/in/kaa786" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </a>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>
    </div>
  )
}

function LocationInput({ setCity, setCountry, setUserName, setIsLocationSet, setDisplayCity }: {
  setCity: (city: string) => void,
  setCountry: (country: string) => void,
  setUserName: (name: string) => void,
  setIsLocationSet: (isSet: boolean) => void,
  setDisplayCity: (city: string) => void
}) {
  const [tempCity, setTempCity] = useState('')
  const [tempName, setTempName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (tempCity && tempName) {
      setCity(tempCity)
      setCountry('Canada')
      setUserName(tempName)
      setDisplayCity(tempCity)
      setIsLocationSet(true)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-400 to-purple-500">
      <h1 className="text-4xl font-bold mb-8 text-white">Prayer Timing App</h1>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select onValueChange={setTempCity} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {canadianCities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">Set Location</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

