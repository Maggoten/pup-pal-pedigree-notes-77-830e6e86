
import { ChecklistItem } from "@/types/checklist";

// Create stable IDs instead of generating new UUIDs on each render
const createStableId = (prefix: string, index: number): string => {
  return `${prefix}_${index}`;
};

// Early pregnancy symptoms (Weeks 1-3)
export const getEarlyPregnancyItems = (): ChecklistItem[] => [
  {
    id: createStableId('early', 1),
    text: "Morning sickness",
    description: "Nausea or vomiting, especially in the morning",
    isCompleted: false,
    weekNumber: 1
  },
  {
    id: createStableId('early', 2),
    text: "Changes in appetite",
    description: "May eat less or be more picky about food",
    isCompleted: false,
    weekNumber: 1
  },
  {
    id: createStableId('early', 3),
    text: "Slight behavioral changes",
    description: "More affectionate or slightly lethargic",
    isCompleted: false,
    weekNumber: 2
  },
  {
    id: createStableId('early', 4),
    text: "Clear vaginal discharge",
    description: "Small amount of clear, non-smelly discharge",
    isCompleted: false,
    weekNumber: 3
  }
];

// Mid pregnancy symptoms (Weeks 4-6)
export const getMidPregnancyItems = (): ChecklistItem[] => [
  {
    id: createStableId('mid', 1),
    text: "Noticeable weight gain",
    description: "Gradually increasing body weight",
    isCompleted: false,
    weekNumber: 4
  },
  {
    id: createStableId('mid', 2),
    text: "Enlarged nipples",
    description: "Nipples become darker and more prominent",
    isCompleted: false,
    weekNumber: 4
  },
  {
    id: createStableId('mid', 3),
    text: "Increased appetite",
    description: "Eating more than usual",
    isCompleted: false,
    weekNumber: 5
  },
  {
    id: createStableId('mid', 4),
    text: "Visible belly growth",
    description: "Abdomen starts to distend noticeably",
    isCompleted: false,
    weekNumber: 6
  },
  {
    id: createStableId('mid', 5),
    text: "Movement in abdomen",
    description: "Puppies may be felt moving inside",
    isCompleted: false,
    weekNumber: 6
  }
];

// Late pregnancy symptoms (Weeks 7-9)
export const getLatePregnancyItems = (): ChecklistItem[] => [
  {
    id: createStableId('late', 1),
    text: "Significant abdominal enlargement",
    description: "Very visible pregnancy with distended abdomen",
    isCompleted: false,
    weekNumber: 7
  },
  {
    id: createStableId('late', 2),
    text: "Nesting behavior",
    description: "Digging, arranging bedding or seeking quiet places",
    isCompleted: false,
    weekNumber: 7
  },
  {
    id: createStableId('late', 3),
    text: "Clear discharge increases",
    description: "More vaginal discharge as birth approaches",
    isCompleted: false,
    weekNumber: 8
  },
  {
    id: createStableId('late', 4),
    text: "Temperature drop",
    description: "Rectal temperature drops below 100°F (37.8°C) 12-24 hours before labor",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: createStableId('late', 5),
    text: "Restlessness and panting",
    description: "Unable to get comfortable, excessive panting",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: createStableId('late', 6),
    text: "Refusing food",
    description: "Loss of appetite 12-24 hours before labor",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: createStableId('late', 7),
    text: "Active labor begins",
    description: "Strong contractions and delivery of puppies",
    isCompleted: false,
    weekNumber: 9
  }
];
