
import { v4 as uuidv4 } from "uuid";
import { ChecklistItem } from "@/types/checklist";

// Early pregnancy symptoms (Weeks 1-3)
export const getEarlyPregnancyItems = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Morning sickness",
    description: "Nausea or vomiting, especially in the morning",
    isCompleted: false,
    weekNumber: 1
  },
  {
    id: uuidv4(),
    text: "Changes in appetite",
    description: "May eat less or be more picky about food",
    isCompleted: false,
    weekNumber: 1
  },
  {
    id: uuidv4(),
    text: "Slight behavioral changes",
    description: "More affectionate or slightly lethargic",
    isCompleted: false,
    weekNumber: 2
  },
  {
    id: uuidv4(),
    text: "Clear vaginal discharge",
    description: "Small amount of clear, non-smelly discharge",
    isCompleted: false,
    weekNumber: 3
  }
];

// Mid pregnancy symptoms (Weeks 4-6)
export const getMidPregnancyItems = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Noticeable weight gain",
    description: "Gradually increasing body weight",
    isCompleted: false,
    weekNumber: 4
  },
  {
    id: uuidv4(),
    text: "Enlarged nipples",
    description: "Nipples become darker and more prominent",
    isCompleted: false,
    weekNumber: 4
  },
  {
    id: uuidv4(),
    text: "Increased appetite",
    description: "Eating more than usual",
    isCompleted: false,
    weekNumber: 5
  },
  {
    id: uuidv4(),
    text: "Visible belly growth",
    description: "Abdomen starts to distend noticeably",
    isCompleted: false,
    weekNumber: 6
  },
  {
    id: uuidv4(),
    text: "Movement in abdomen",
    description: "Puppies may be felt moving inside",
    isCompleted: false,
    weekNumber: 6
  }
];

// Late pregnancy symptoms (Weeks 7-9)
export const getLatePregnancyItems = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Significant abdominal enlargement",
    description: "Very visible pregnancy with distended abdomen",
    isCompleted: false,
    weekNumber: 7
  },
  {
    id: uuidv4(),
    text: "Nesting behavior",
    description: "Digging, arranging bedding or seeking quiet places",
    isCompleted: false,
    weekNumber: 7
  },
  {
    id: uuidv4(),
    text: "Clear discharge increases",
    description: "More vaginal discharge as birth approaches",
    isCompleted: false,
    weekNumber: 8
  },
  {
    id: uuidv4(),
    text: "Temperature drop",
    description: "Rectal temperature drops below 100°F (37.8°C) 12-24 hours before labor",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: uuidv4(),
    text: "Restlessness and panting",
    description: "Unable to get comfortable, excessive panting",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: uuidv4(),
    text: "Refusing food",
    description: "Loss of appetite 12-24 hours before labor",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: uuidv4(),
    text: "Active labor begins",
    description: "Strong contractions and delivery of puppies",
    isCompleted: false,
    weekNumber: 9
  }
];
