// Guided Intake configuration — fictional demo pets and service-specific questions

export interface GuidedPet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  icon: string;
}

export interface ServiceOption {
  id: string;
  type: 'boarding' | 'grooming' | 'daycare' | 'sitting';
  label: string;
  icon: string;
}

export interface GuidedQuestion {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  forServices: string[];
  category: 'behavior' | 'allergy' | 'medication' | 'timing' | 'special';
}

export const GUIDED_PETS: GuidedPet[] = [
  { id: 'bentley', name: 'Bentley', species: 'dog', breed: 'Golden Retriever', age: '4 years', weight: '65 lbs', icon: '🐕' },
  { id: 'luna', name: 'Luna', species: 'dog', breed: 'Miniature Poodle', age: '3 years', weight: '12 lbs', icon: '🐩' },
  { id: 'cooper', name: 'Cooper', species: 'dog', breed: 'Labrador mix', age: '2 years', weight: '55 lbs', icon: '🐾' },
];

export const SERVICE_OPTIONS: ServiceOption[] = [
  { id: 'boarding', type: 'boarding', label: 'Boarding', icon: '🏠' },
  { id: 'daycare', type: 'daycare', label: 'Daycare', icon: '☀️' },
  { id: 'full-groom', type: 'grooming', label: 'Full Groom', icon: '✂️' },
  { id: 'bath-tidy', type: 'grooming', label: 'Bath & Tidy', icon: '🛁' },
  { id: 'nails-ears', type: 'grooming', label: 'Nails & Ears', icon: '💅' },
];

export const GUIDED_QUESTIONS: GuidedQuestion[] = [
  {
    id: 'nail-behavior',
    label: 'How does the pet do with nail trims?',
    options: [
      { value: 'great', label: 'Great' },
      { value: 'fine', label: 'Fine' },
      { value: 'unsure', label: 'Unsure' },
      { value: 'nervous', label: 'Nervous' },
      { value: 'very-anxious', label: 'Very anxious' },
    ],
    forServices: ['full-groom', 'nails-ears'],
    category: 'behavior',
  },
  {
    id: 'skin-sensitivity',
    label: 'Does the pet have sensitive skin?',
    options: [
      { value: 'no', label: 'No' },
      { value: 'yes', label: 'Yes' },
      { value: 'unsure', label: 'Unsure' },
    ],
    forServices: ['full-groom', 'bath-tidy'],
    category: 'allergy',
  },
  {
    id: 'allergies',
    label: 'Any allergies or sensitivities?',
    options: [
      { value: 'none', label: 'None known' },
      { value: 'chicken', label: 'Chicken / poultry' },
      { value: 'grain', label: 'Grain' },
      { value: 'other', label: 'Other' },
    ],
    forServices: ['full-groom', 'bath-tidy', 'boarding', 'daycare'],
    category: 'allergy',
  },
  {
    id: 'dog-behavior',
    label: 'How is the pet around other dogs?',
    options: [
      { value: 'friendly', label: 'Friendly with all' },
      { value: 'selective', label: 'Selective / careful' },
      { value: 'nervous-large', label: 'Nervous around large dogs' },
      { value: 'reactive', label: 'Reactive / needs separation' },
    ],
    forServices: ['boarding', 'daycare'],
    category: 'behavior',
  },
  {
    id: 'medications',
    label: 'Any medications to administer?',
    options: [
      { value: 'none', label: 'None' },
      { value: 'apoquel-morning', label: 'Apoquel — every morning' },
      { value: 'other', label: 'Other (will describe)' },
    ],
    forServices: ['boarding', 'daycare'],
    category: 'medication',
  },
  {
    id: 'timing',
    label: 'Preferred service timing?',
    options: [
      { value: 'this-saturday', label: 'This Saturday' },
      { value: 'this-sunday', label: 'This Sunday' },
      { value: 'next-week', label: 'Next week' },
    ],
    forServices: ['full-groom', 'bath-tidy', 'nails-ears', 'boarding', 'daycare'],
    category: 'timing',
  },
  {
    id: 'time-of-day',
    label: 'Preferred time of day?',
    options: [
      { value: 'morning', label: 'Morning' },
      { value: 'midday', label: 'Midday' },
      { value: 'afternoon', label: 'Afternoon' },
    ],
    forServices: ['full-groom', 'bath-tidy', 'nails-ears', 'boarding', 'daycare'],
    category: 'timing',
  },
];

export interface GuidedIntakeState {
  pet: GuidedPet | null;
  service: ServiceOption | null;
  answers: Record<string, string>;
}
