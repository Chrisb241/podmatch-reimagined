export interface UserProfile {
  id: string;
  name: string;
  type: "podcaster" | "guest";
  avatar: string;
  bio: string;
  topics: string[];
  location: string;
  availability: ("remote" | "in-person" | "travel")[];
  verified: boolean;
  rating: number;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  city: string;
  description: string;
  image: string;
  amenities: string[];
  price: string;
  rating: number;
}

export const mockProfiles: UserProfile[] = [
  {
    id: "1",
    name: "Sophie Martin",
    type: "podcaster",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    bio: "Animatrice du podcast 'Tech & Société'. 150+ épisodes, passionnée par l'innovation et l'impact social.",
    topics: ["Technologie", "Société", "Innovation"],
    location: "Paris, France",
    availability: ["remote", "in-person"],
    verified: true,
    rating: 4.9,
  },
  {
    id: "2",
    name: "Thomas Dubois",
    type: "guest",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    bio: "Entrepreneur et auteur. Expert en startups et croissance. Intervenu dans 40+ podcasts.",
    topics: ["Entrepreneuriat", "Startups", "Leadership"],
    location: "Lyon, France",
    availability: ["remote", "travel"],
    verified: true,
    rating: 4.8,
  },
  {
    id: "3",
    name: "Amira Benali",
    type: "podcaster",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    bio: "Créatrice du podcast 'Voix du Monde'. Focus sur la diversité culturelle et les parcours inspirants.",
    topics: ["Culture", "Diversité", "Inspiration"],
    location: "Marseille, France",
    availability: ["remote", "in-person", "travel"],
    verified: true,
    rating: 4.7,
  },
  {
    id: "4",
    name: "Lucas Bernard",
    type: "guest",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    bio: "Psychologue clinicien spécialisé en développement personnel. Auteur de 'Mieux vivre au quotidien'.",
    topics: ["Psychologie", "Bien-être", "Développement personnel"],
    location: "Bordeaux, France",
    availability: ["remote"],
    verified: false,
    rating: 4.6,
  },
  {
    id: "5",
    name: "Claire Moreau",
    type: "podcaster",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face",
    bio: "Journaliste et podcasteuse. Mon émission 'Éco-Futur' explore la transition écologique.",
    topics: ["Écologie", "Environnement", "Futur"],
    location: "Nantes, France",
    availability: ["remote", "in-person"],
    verified: true,
    rating: 4.9,
  },
  {
    id: "6",
    name: "Maxime Leroy",
    type: "guest",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    bio: "Chef cuisinier étoilé, passionné par la gastronomie durable et l'alimentation de demain.",
    topics: ["Gastronomie", "Durabilité", "Art de vivre"],
    location: "Toulouse, France",
    availability: ["in-person", "travel"],
    verified: true,
    rating: 4.5,
  },
];

export const mockVenues: Venue[] = [
  {
    id: "v1",
    name: "Studio Podcast Pro",
    type: "Studio professionnel",
    city: "Paris",
    description: "Studio insonorisé avec équipement haut de gamme. 2 cabines, micro Shure SM7B, mixeur Rodecaster.",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=600&h=400&fit=crop",
    amenities: ["Insonorisé", "Micros pro", "Mixeur", "Écran", "Wi-Fi"],
    price: "45€/h",
    rating: 4.9,
  },
  {
    id: "v2",
    name: "Le Café Silencieux",
    type: "Café calme",
    city: "Lyon",
    description: "Un café pensé pour les créateurs. Espace privé dédié aux enregistrements, ambiance feutrée.",
    image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600&h=400&fit=crop",
    amenities: ["Calme", "Wi-Fi", "Prises", "Boissons incluses"],
    price: "15€/h",
    rating: 4.6,
  },
  {
    id: "v3",
    name: "Cowork & Record",
    type: "Coworking",
    city: "Marseille",
    description: "Espace de coworking avec salle de podcast équipée. Réservation à l'heure ou à la journée.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop",
    amenities: ["Insonorisé", "Micros", "Wi-Fi", "Cuisine"],
    price: "25€/h",
    rating: 4.7,
  },
  {
    id: "v4",
    name: "Home Studio Nantes",
    type: "Studio privé",
    city: "Nantes",
    description: "Studio à domicile cosy et bien équipé. Idéal pour des interviews intimistes.",
    image: "https://images.unsplash.com/photo-1598520106830-8c45c2035460?w=600&h=400&fit=crop",
    amenities: ["Calme", "Micros", "Éclairage", "Parking"],
    price: "Gratuit",
    rating: 4.8,
  },
];

export const allTopics = [
  "Technologie", "Société", "Innovation", "Entrepreneuriat", "Startups",
  "Leadership", "Culture", "Diversité", "Inspiration", "Psychologie",
  "Bien-être", "Développement personnel", "Écologie", "Environnement",
  "Gastronomie", "Science", "Sport", "Musique", "Cinéma", "Politique",
];
