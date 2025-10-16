import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface JobMapViewProps {
  jobs: any[];
  center?: { lat: number; lng: number };
}

export function JobMapView({ jobs, center = { lat: 31.9686, lng: -99.9018 } }: JobMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [infoWindow, setInfoWindow] = useState<any>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map || typeof window === 'undefined' || !(window as any).google) return;

    const google = (window as any).google;
    
    const newMap = new google.maps.Map(mapRef.current, {
      center,
      zoom: 7,
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
    });

    const newInfoWindow = new google.maps.InfoWindow();
    
    setMap(newMap);
    setInfoWindow(newInfoWindow);
  }, []);

  // Update markers when jobs change
  useEffect(() => {
    if (!map || !infoWindow || typeof window === 'undefined' || !(window as any).google) return;

    const google = (window as any).google;

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));

    // Create new markers for jobs with coordinates
    const newMarkers = jobs
      .filter(job => job.location_lat && job.location_lng)
      .map(job => {
        const marker = new google.maps.Marker({
          position: { lat: job.location_lat, lng: job.location_lng },
          map,
          title: job.title,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#2563eb',
            fillOpacity: 0.8,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          },
        });

        marker.addListener('click', () => {
          infoWindow.setContent(`
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="font-weight: 600; margin: 0 0 8px 0; font-size: 16px;">${job.title}</h3>
              <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">${job.category?.name || 'Uncategorized'}</p>
              <p style="margin: 8px 0; font-size: 14px;">${job.description.substring(0, 100)}...</p>
              <div style="display: flex; align-items: center; gap: 8px; margin: 8px 0;">
                <span style="font-weight: 600; color: #16a34a; font-size: 18px;">$${job.budget}</span>
                <span style="color: #6b7280; font-size: 12px;">${job.location}</span>
              </div>
              <a href="/jobs/${job.id}" style="display: inline-block; margin-top: 8px; padding: 6px 12px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-size: 14px;">View Details</a>
            </div>
          `);
          infoWindow.open(map, marker);
        });

        return marker;
      });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      newMarkers.forEach((marker: any) => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
    }
  }, [jobs, map, infoWindow]);

  return (
    <div className="space-y-4">
      <div 
        ref={mapRef} 
        className="w-full h-[600px] rounded-lg border shadow-sm"
        style={{ minHeight: '400px' }}
      />
      
      {jobs.filter(job => !job.location_lat || !job.location_lng).length > 0 && (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">
            <MapPin className="inline h-4 w-4 mr-1" />
            {jobs.filter(job => !job.location_lat || !job.location_lng).length} jobs without location data are not shown on the map
          </p>
        </Card>
      )}
    </div>
  );
}
