
import { ChecklistGroup } from "@/types/checklist";

export const defaultPregnancyChecklist: ChecklistGroup[] = [
  {
    id: "week1-3",
    title: "Weeks 1-3: Early Pregnancy",
    items: [
      {
        id: "week1-3-1",
        text: "Morning sickness",
        description: "Nausea or vomiting, especially in the morning",
        isCompleted: false,
        weekNumber: 1
      },
      {
        id: "week1-3-2",
        text: "Changes in appetite",
        description: "May eat less or be more picky about food",
        isCompleted: false,
        weekNumber: 1
      },
      {
        id: "week1-3-3",
        text: "Slight behavioral changes",
        description: "More affectionate or slightly lethargic",
        isCompleted: false,
        weekNumber: 2
      },
      {
        id: "week1-3-4",
        text: "Clear vaginal discharge",
        description: "Small amount of clear, non-smelly discharge",
        isCompleted: false,
        weekNumber: 3
      }
    ]
  },
  {
    id: "week4-6",
    title: "Weeks 4-6: Mid Pregnancy",
    items: [
      {
        id: "week4-6-1",
        text: "Noticeable weight gain",
        description: "Gradually increasing body weight",
        isCompleted: false,
        weekNumber: 4
      },
      {
        id: "week4-6-2",
        text: "Enlarged nipples",
        description: "Nipples become darker and more prominent",
        isCompleted: false,
        weekNumber: 4
      },
      {
        id: "week4-6-3",
        text: "Increased appetite",
        description: "Eating more than usual",
        isCompleted: false,
        weekNumber: 5
      },
      {
        id: "week4-6-4",
        text: "Visible belly growth",
        description: "Abdomen starts to distend noticeably",
        isCompleted: false,
        weekNumber: 6
      },
      {
        id: "week4-6-5",
        text: "Movement in abdomen",
        description: "Puppies may be felt moving inside",
        isCompleted: false,
        weekNumber: 6
      }
    ]
  },
  {
    id: "week7-9",
    title: "Weeks 7-9: Late Pregnancy & Whelping",
    items: [
      {
        id: "week7-9-1",
        text: "Significant abdominal enlargement",
        description: "Very visible pregnancy with distended abdomen",
        isCompleted: false,
        weekNumber: 7
      },
      {
        id: "week7-9-2",
        text: "Nesting behavior",
        description: "Digging, arranging bedding or seeking quiet places",
        isCompleted: false,
        weekNumber: 7
      },
      {
        id: "week7-9-3",
        text: "Clear discharge increases",
        description: "More vaginal discharge as birth approaches",
        isCompleted: false,
        weekNumber: 8
      },
      {
        id: "week7-9-4",
        text: "Temperature drop",
        description: "Rectal temperature drops below 100°F (37.8°C) 12-24 hours before labor",
        isCompleted: false,
        weekNumber: 9
      },
      {
        id: "week7-9-5",
        text: "Restlessness and panting",
        description: "Unable to get comfortable, excessive panting",
        isCompleted: false,
        weekNumber: 9
      },
      {
        id: "week7-9-6",
        text: "Refusing food",
        description: "Loss of appetite 12-24 hours before labor",
        isCompleted: false,
        weekNumber: 9
      },
      {
        id: "week7-9-7",
        text: "Active labor begins",
        description: "Strong contractions and delivery of puppies",
        isCompleted: false,
        weekNumber: 9
      }
    ]
  }
];
