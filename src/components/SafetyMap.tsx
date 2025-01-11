import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import IncidentForm from './IncidentForm';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Incident {
  id: string;
  title: string;
  description: string;
  type: string;
  location: { lat: number; lng: number };
  timestamp: string;
  messages?: Message[];
}

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: string;
  incident_id: string;
}

const SafetyMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const queryClient = useQueryClient();

  // Fetch incidents
  const { data: incidents = [], isError } = useQuery({
    queryKey: ['incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select(`
          *,
          messages(*)
        `)
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching incidents:', error);
        throw error;
      }
      return data as Incident[];
    }
  });

  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);

  useEffect(() => {
    setFilteredIncidents(incidents);
  }, [incidents]);

  const getUserLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast({
            title: "Success",
            description: "Located your position successfully",
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Error",
            description: "Could not get your location. Defaulting to NYC.",
            variant: "destructive",
          });
          setUserLocation({ lat: 40.7128, lng: -74.006 }); // Default to NYC
        }
      );
    } else {
      toast({
        title: "Error",
        description: "Geolocation is not supported by your browser. Defaulting to NYC.",
        variant: "destructive",
      });
      setUserLocation({ lat: 40.7128, lng: -74.006 }); // Default to NYC
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      if (map.current) {
        map.current.remove();
      }

      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [userLocation?.lng || -74.006, userLocation?.lat || 40.7128],
        zoom: 12
      });

      newMap.addControl(new mapboxgl.NavigationControl(), 'top-right');
      newMap.on('click', (e) => {
        setSelectedLocation({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        });
      });

      map.current = newMap;
      setIsMapInitialized(true);

      if (userLocation) {
        const userMarkerElement = document.createElement('div');
        userMarkerElement.className = 'w-6 h-6 bg-primary rounded-full border-2 border-white';
        
        new mapboxgl.Marker(userMarkerElement)
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(newMap);
      }

      toast({
        title: "Success",
        description: "Map initialized successfully",
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      toast({
        title: "Error",
        description: "Failed to initialize map. Please check your Mapbox token.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!map.current || !isMapInitialized) return;

    const markers = document.getElementsByClassName('mapboxgl-marker');
    while(markers[0]) {
      markers[0].remove();
    }

    filteredIncidents.forEach((incident) => {
      const markerElement = document.createElement('div');
      const root = document.createElement('div');
      markerElement.appendChild(root);
      
      root.className = 'relative';
      const marker = document.createElement('div');
      marker.className = 'w-6 h-6 bg-destructive rounded-full border-2 border-white cursor-pointer';
      root.appendChild(marker);

      const markerInstance = new mapboxgl.Marker(markerElement)
        .setLngLat([incident.location.lng, incident.location.lat])
        .addTo(map.current!);

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedIncident(incident);
      });

      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25,
        className: 'bg-card'
      });

      marker.addEventListener('mouseenter', () => {
        popup.setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${incident.title}</h3>
            <p class="text-sm">${incident.description}</p>
            <p class="text-xs mt-2">${new Date(incident.timestamp).toLocaleString()}</p>
          </div>
        `).setLngLat([incident.location.lng, incident.location.lat])
          .addTo(map.current!);
      });

      marker.addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  }, [filteredIncidents, isMapInitialized]);

  const handleIncidentSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('incidents')
        .insert([{
          ...data,
        }]);

      if (error) throw error;

      setSelectedLocation(null);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      
      toast({
        title: "Success",
        description: "Incident reported successfully",
      });
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast({
        title: "Error",
        description: "Failed to submit incident",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async () => {
    if (!selectedIncident || !newMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          incident_id: selectedIncident.id,
          text: newMessage,
          author: "Anonymous User",
        }]);

      if (error) throw error;

      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      
      toast({
        title: "Success",
        description: "Message sent successfully",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleFilterIncidents = (event: CustomEvent) => {
      const selectedType = event.detail.type;
      if (!selectedType) {
        setFilteredIncidents(incidents);
      } else {
        setFilteredIncidents(incidents.filter(incident => incident.type === selectedType));
      }
    };

    window.addEventListener('filter-incidents', handleFilterIncidents as EventListener);
    
    return () => {
      window.removeEventListener('filter-incidents', handleFilterIncidents as EventListener);
    };
  }, [incidents]);

  return (
    <div className="relative w-full h-screen">
      {!isMapInitialized && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
          <div className="bg-card p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Development Mode</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You can either:
              <br />1. Enter a Mapbox token to use the real map
              <br />2. Click the button below to test the incident form
            </p>
            <Input
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              placeholder="pk.eyJ1..."
              className="mb-4"
            />
            <div className="space-y-2">
              <Button onClick={initializeMap} className="w-full" disabled={!mapboxToken}>
                Initialize Map
              </Button>
              <Button 
                onClick={() => setSelectedLocation({ lat: 40.7128, lng: -74.006 })} 
                variant="secondary"
                className="w-full"
              >
                Test Incident Form
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0" />
      
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report an Incident</DialogTitle>
          </DialogHeader>
          {selectedLocation && (
            <IncidentForm
              location={selectedLocation}
              onSubmit={handleIncidentSubmit}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedIncident} onOpenChange={() => setSelectedIncident(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedIncident?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {selectedIncident?.description}
            </div>
            <div className="border rounded-lg">
              <ScrollArea className="h-[300px] p-4">
                <div className="space-y-4">
                  {selectedIncident?.messages?.map((message) => (
                    <div key={message.id} className="bg-muted p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{message.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm">{message.text}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SafetyMap;