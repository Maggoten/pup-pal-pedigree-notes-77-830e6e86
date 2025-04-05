
import { ChecklistGroup } from "@/types/checklist";

export const defaultPreBreedingChecklist: ChecklistGroup[] = [
  {
    id: "health",
    title: "Health Checks",
    items: [
      {
        id: "health-1",
        text: "Complete health screenings for female",
        description: "Ensure all breed-specific health tests are completed",
        isCompleted: false
      },
      {
        id: "health-2",
        text: "Complete health screenings for male",
        description: "Ensure all breed-specific health tests are completed",
        isCompleted: false
      },
      {
        id: "health-3",
        text: "Check vaccination status",
        description: "Ensure all vaccinations are up to date",
        isCompleted: false
      },
      {
        id: "health-4",
        text: "Verify female is at optimal weight",
        description: "Neither underweight nor overweight for breeding",
        isCompleted: false
      }
    ]
  },
  {
    id: "genetic",
    title: "Genetic Considerations",
    items: [
      {
        id: "genetic-1",
        text: "Research compatible bloodlines",
        description: "Ensure genetic diversity and complementary traits",
        isCompleted: false
      },
      {
        id: "genetic-2",
        text: "Check for genetic disorders in the lineage",
        description: "Research family history for both dogs",
        isCompleted: false
      }
    ]
  },
  {
    id: "practical",
    title: "Practical Preparations",
    items: [
      {
        id: "practical-1",
        text: "Prepare whelping area",
        description: "Set up a clean, quiet space with appropriate bedding",
        isCompleted: false
      },
      {
        id: "practical-2",
        text: "Assemble whelping kit",
        description: "Include clean towels, heating pad, scissors, dental floss, etc.",
        isCompleted: false
      },
      {
        id: "practical-3",
        text: "Schedule consultation with veterinarian",
        description: "Discuss the breeding plan with your vet",
        isCompleted: false
      },
      {
        id: "practical-4",
        text: "Plan for potential emergency vet visits",
        description: "Know where to go for emergency care during off-hours",
        isCompleted: false
      }
    ]
  },
  {
    id: "admin",
    title: "Administrative Tasks",
    items: [
      {
        id: "admin-1",
        text: "Check breed club regulations",
        description: "Ensure compliance with breed-specific requirements",
        isCompleted: false
      },
      {
        id: "admin-2",
        text: "Prepare puppy contracts",
        description: "Draft sales agreements and health guarantees",
        isCompleted: false
      },
      {
        id: "admin-3",
        text: "Research potential buyers/homes",
        description: "Start building a waiting list of approved homes",
        isCompleted: false
      }
    ]
  }
];
