
import { v4 as uuidv4 } from "uuid";
import { ChecklistItem } from "@/types/checklist";

// Week 1 - Conception & Hormonal Shift
export const getWeek1Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Slight appetite change",
    description: "May eat less or become slightly pickier as hormone levels begin to shift.",
    isCompleted: false,
    weekNumber: 1
  }
];

// Week 2 - Early Changes
export const getWeek2Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Slight behavioral change",
    description: "May become more affectionate, clingy or tired.",
    isCompleted: false,
    weekNumber: 2
  },
  {
    id: uuidv4(),
    text: "Mild nausea (morning sickness)",
    description: "May vomit slightly or seem queasy due to hormonal changes.",
    isCompleted: false,
    weekNumber: 2
  }
];

// Week 3 - Implantation
export const getWeek3Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Clear vaginal discharge",
    description: "Small amount of clear, non-smelly discharge can appear when embryos implant.",
    isCompleted: false,
    weekNumber: 3
  }
];

// Week 4 - Physical Signs Begin
export const getWeek4Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Enlarged nipples",
    description: "Nipples become larger, rounder and darker in color.",
    isCompleted: false,
    weekNumber: 4
  },
  {
    id: uuidv4(),
    text: "Noticeable weight gain",
    description: "Slight increase in body weight as pregnancy progresses.",
    isCompleted: false,
    weekNumber: 4
  }
];

// Week 5 - Appetite Returns
export const getWeek5Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Increased appetite",
    description: "Appetite increases as hormone levels stabilize and fetal growth accelerates.",
    isCompleted: false,
    weekNumber: 5
  }
];

// Week 6 - Visible Growth
export const getWeek6Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Visible belly growth",
    description: "Abdomen begins to expand visibly.",
    isCompleted: false,
    weekNumber: 6
  },
  {
    id: uuidv4(),
    text: "Possible fetal movement",
    description: "Some may feel slight movement when gently palpating, but more common in Week 7–8.",
    isCompleted: false,
    weekNumber: 6
  }
];

// Week 7 - Preparing for Birth
export const getWeek7Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Significant abdominal enlargement",
    description: "Belly is clearly distended; pregnancy very visible.",
    isCompleted: false,
    weekNumber: 7
  },
  {
    id: uuidv4(),
    text: "Nesting behavior begins",
    description: "May begin arranging bedding, digging or seeking quiet areas.",
    isCompleted: false,
    weekNumber: 7
  }
];

// Week 8 - Approaching Labor
export const getWeek8Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Increased vaginal discharge",
    description: "Clear discharge may increase slightly as the body prepares for labor.",
    isCompleted: false,
    weekNumber: 8
  }
];

// Week 9 - Pre-labor & Whelping
export const getWeek9Items = (): ChecklistItem[] => [
  {
    id: uuidv4(),
    text: "Temperature drop",
    description: "Rectal temperature drops below 100°F (37.8°C) 12–24 hours before labor.",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: uuidv4(),
    text: "Restlessness and panting",
    description: "Difficulty settling, increased panting and pacing.",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: uuidv4(),
    text: "Refusing food",
    description: "Appetite may vanish shortly before labor starts.",
    isCompleted: false,
    weekNumber: 9
  },
  {
    id: uuidv4(),
    text: "Active labor begins",
    description: "Strong contractions followed by delivery of puppies.",
    isCompleted: false,
    weekNumber: 9
  }
];
