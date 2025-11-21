import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

interface LocationSearchProps {
  value: string;
  radius: number;
  onLocationChange: (location: string, coords?: { lat: number; lng: number }) => void;
  onRadiusChange: (radius: number) => void;
}

export function LocationSearch({ value, radius, onLocationChange, onRadiusChange }: LocationSearchProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          
          if (data.results && data.results[0]) {
            const address = data.results[0].formatted_address;
            onLocationChange(address, { lat: latitude, lng: longitude });
            toast.success('Location detected');
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          onLocationChange(`${latitude}, ${longitude}`, { lat: latitude, lng: longitude });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location');
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <Card className="p-6 gradient-subtle">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Location Search</h3>
        </div>

        <div className="relative">
          <Input
            placeholder="Enter city, state, or zip code..."
            value={value}
            onChange={(e) => onLocationChange(e.target.value)}
            className="pr-32 bg-background"
          />
          <Button
            size="sm"
            variant="ghost"
            className="absolute right-1 top-1 h-8 text-xs hover:bg-primary/10"
            onClick={handleUseMyLocation}
            disabled={isGettingLocation}
          >
            <Navigation className="h-3 w-3 mr-1" />
            {isGettingLocation ? 'Getting...' : 'Use My Location'}
          </Button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Search Radius</label>
          <Select value={radius.toString()} onValueChange={(val) => onRadiusChange(Number(val))}>
            <SelectTrigger className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Within 5 miles</SelectItem>
              <SelectItem value="10">Within 10 miles</SelectItem>
              <SelectItem value="25">Within 25 miles</SelectItem>
              <SelectItem value="50">Within 50 miles</SelectItem>
              <SelectItem value="100">Within 100 miles</SelectItem>
              <SelectItem value="0">Anywhere in Texas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
