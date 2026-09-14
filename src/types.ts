export interface Track {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  durationSec: number;
  bpm: number;
  key: string;
  category: 'Festival Anthem' | 'Electro-Balkan' | 'Club Peak' | 'Ambient Fusion';
  spotifyUrl: string;
  youtubeUrl: string;
  soundcloudUrl: string;
  description: string;
}

export interface TourDate {
  id: string;
  date: string;
  dayOfWeek: string;
  monthYear: string;
  city: string;
  country: string;
  venue: string;
  stage?: string;
  eventType: 'Festival' | 'Club' | 'Concert' | 'Special Event';
  status: 'Tickets Available' | 'Selling Fast' | 'Sold Out' | 'VIP Only';
  ticketPrice?: string;
  ticketLink: string;
}

export interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  eventType: 'Festival' | 'Club' | 'Private Event' | 'Corporate';
  eventDate: string;
  location: string;
  estimatedGuests: string;
  message: string;
  needsRiderInfo: boolean;
}

export interface Artist {
  name: string;
  role: string;
  instrument: string;
  accentColor: string;
  glowClass: string;
  borderClass: string;
  image: string;
  signatureSound: string;
  gearHighlights: string[];
  bioSnippet: string;
}
