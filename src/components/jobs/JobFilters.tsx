import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LocationSearch } from './LocationSearch';

interface JobFiltersProps {
  onLocationChange?: (location: string, coords?: { lat: number; lng: number }) => void;
  onRadiusChange?: (radius: number) => void;
}

export default function JobFilters({ onLocationChange, onRadiusChange }: JobFiltersProps) {
  return (
    <div className="space-y-4">
      <LocationSearch 
        value=""
        radius={25}
        onLocationChange={onLocationChange || (() => {})}
        onRadiusChange={onRadiusChange || (() => {})}
      />
    </div>
  );
}
