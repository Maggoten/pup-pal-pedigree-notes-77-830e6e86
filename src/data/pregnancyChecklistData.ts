
import { ChecklistGroup } from "@/types/checklist";

// Add a constant for the current checklist version
export const CURRENT_CHECKLIST_VERSION = 2;

export const defaultPregnancyChecklist: ChecklistGroup[] = [
  {
    id: "week1",
    title: "Week 1 – Conception & Hormonal Shift",
    items: [
      {
        id: "week1-1",
        text: "Slight appetite change",
        description: "May eat less or become slightly pickier as hormone levels begin to shift.",
        isCompleted: false,
        weekNumber: 1
      }
    ]
  },
  {
    id: "week2",
    title: "Week 2 – Early Changes",
    items: [
      {
        id: "week2-1",
        text: "Slight behavioral change",
        description: "May become more affectionate, clingy or tired.",
        isCompleted: false,
        weekNumber: 2
      },
      {
        id: "week2-2",
        text: "Mild nausea (morning sickness)",
        description: "May vomit slightly or seem queasy due to hormonal changes.",
        isCompleted: false,
        weekNumber: 2
      }
    ]
  },
  {
    id: "week3",
    title: "Week 3 – Implantation",
    items: [
      {
        id: "week3-1",
        text: "Clear vaginal discharge",
        description: "Small amount of clear, non-smelly discharge can appear when embryos implant.",
        isCompleted: false,
        weekNumber: 3
      }
    ]
  },
  {
    id: "week4",
    title: "Week 4 – Physical Signs Begin",
    items: [
      {
        id: "week4-1",
        text: "Enlarged nipples",
        description: "Nipples become larger, rounder and darker in color.",
        isCompleted: false,
        weekNumber: 4
      },
      {
        id: "week4-2",
        text: "Noticeable weight gain",
        description: "Slight increase in body weight as pregnancy progresses.",
        isCompleted: false,
        weekNumber: 4
      }
    ]
  },
  {
    id: "week5",
    title: "Week 5 – Appetite Returns",
    items: [
      {
        id: "week5-1",
        text: "Increased appetite",
        description: "Appetite increases as hormone levels stabilize and fetal growth accelerates.",
        isCompleted: false,
        weekNumber: 5
      }
    ]
  },
  {
    id: "week6",
    title: "Week 6 – Visible Growth",
    items: [
      {
        id: "week6-1",
        text: "Visible belly growth",
        description: "Abdomen begins to expand visibly.",
        isCompleted: false,
        weekNumber: 6
      },
      {
        id: "week6-2",
        text: "Possible fetal movement",
        description: "Some may feel slight movement when gently palpating, but more common in Week 7–8.",
        isCompleted: false,
        weekNumber: 6
      }
    ]
  },
  {
    id: "week7",
    title: "Week 7 – Preparing for Birth",
    items: [
      {
        id: "week7-1",
        text: "Significant abdominal enlargement",
        description: "Belly is clearly distended; pregnancy very visible.",
        isCompleted: false,
        weekNumber: 7
      },
      {
        id: "week7-2",
        text: "Nesting behavior begins",
        description: "May begin arranging bedding, digging or seeking quiet areas.",
        isCompleted: false,
        weekNumber: 7
      }
    ]
  },
  {
    id: "week8",
    title: "Week 8 – Approaching Labor",
    items: [
      {
        id: "week8-1",
        text: "Increased vaginal discharge",
        description: "Clear discharge may increase slightly as the body prepares for labor.",
        isCompleted: false,
        weekNumber: 8
      }
    ]
  },
  {
    id: "week9",
    title: "Week 9 – Pre-labor & Whelping",
    items: [
      {
        id: "week9-1",
        text: "Temperature drop",
        description: "Rectal temperature drops below 100°F (37.8°C) 12–24 hours before labor.",
        isCompleted: false,
        weekNumber: 9
      },
      {
        id: "week9-2",
        text: "Restlessness and panting",
        description: "Difficulty settling, increased panting and pacing.",
        isCompleted: false,
        weekNumber: 9
      },
      {
        id: "week9-3",
        text: "Refusing food",
        description: "Appetite may vanish shortly before labor starts.",
        isCompleted: false,
        weekNumber: 9
      },
      {
        id: "week9-4",
        text: "Active labor begins",
        description: "Strong contractions followed by delivery of puppies.",
        isCompleted: false,
        weekNumber: 9
      }
    ]
  }
];

