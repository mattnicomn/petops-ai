export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  text: string;
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'bentley',
    name: 'Bentley',
    description: 'Boarding with medication and behavioral concerns',
    icon: '🐕',
    tags: ['Boarding', 'Medication', 'Behavioral'],
    text: `Bentley needs boarding from August 15th through August 18th. He's a 4-year-old Golden Retriever, about 65 pounds. He's nervous around large dogs and should be kept separate from bigger breeds if possible.

He takes Apoquel every morning for his allergies — one tablet with his breakfast. Please make sure he gets it around 8am.

Can you also give him a bath before I pick him up on Monday? His rabies vaccine expires September 10th.

Drop-off will be Friday around 9am, pickup Monday after 3pm. Thanks!`,
  },
  {
    id: 'luna',
    name: 'Luna',
    description: 'Grooming with allergy and sensitivity concerns',
    icon: '🐩',
    tags: ['Grooming', 'Allergy', 'Sensitivity'],
    text: `I'd like to schedule a grooming appointment for Luna this Saturday. She's a 3-year-old Miniature Poodle, about 12 pounds.

She has a chicken allergy so please don't use any treats with poultry ingredients. She also has sensitive skin — please use hypoallergenic shampoo only.

I'd like a full groom: bath, haircut (puppy cut style), nail trim, and ear cleaning. She can be a little anxious during nail trims so go slow with those.

Drop-off around 10am, I'll pick her up whenever she's ready.`,
  },
  {
    id: 'cooper',
    name: 'Cooper',
    description: 'Boarding with vaccination timing concerns',
    icon: '🐾',
    tags: ['Boarding', 'Vaccination', 'Extended Stay'],
    text: `We need to board Cooper from August 20th through August 27th while we're on vacation. He's a 2-year-old Labrador mix, neutered, about 55 pounds.

His bordetella vaccine expires on August 22nd — I know that's during his stay. His vet said it should be fine but wanted to let you know. His rabies and DHPP are current through next year.

He eats 2 cups of Blue Buffalo twice a day (morning and evening). He's friendly with all dogs and people. No medications.

We'll drop off Wednesday morning around 8am and pick up the following Wednesday afternoon.`,
  },
];
