
import { PregnancyWeek, WeeklyDevelopment } from "@/types/pregnancyJourney";
import { v4 as uuidv4 } from "uuid";

// Weekly development information
const weeklyDevelopments: WeeklyDevelopment[] = [
  {
    week: 1,
    title: "Week 1: Fertilization",
    description: "Fertilized eggs travel through the fallopian tubes to implant in the uterus.",
    keyPoints: [
      "Breeding has occurred",
      "Eggs are fertilized within 24-48 hours",
      "Fertilized eggs begin cell division",
      "Zygotes travel to the uterus"
    ]
  },
  {
    week: 2,
    title: "Week 2: Implantation",
    description: "Embryos implant in the uterine lining and development begins.",
    keyPoints: [
      "Embryos attach to uterine wall",
      "Implantation begins",
      "Placenta formation starts",
      "No visible signs of pregnancy yet"
    ]
  },
  {
    week: 3,
    title: "Week 3: Early Development",
    description: "Embryos continue developing. First physical signs may appear in the mother.",
    keyPoints: [
      "Organs begin to form in embryos",
      "Slightly enlarged nipples may be noticeable",
      "Possible behavior changes in mother",
      "Embryos approximately 1cm long"
    ]
  },
  {
    week: 4,
    title: "Week 4: Heartbeats",
    description: "Fetal heartbeats may be detected by ultrasound. Morning sickness may occur.",
    keyPoints: [
      "Heartbeats can be detected via ultrasound",
      "Embryos grow to 1.5-2cm long",
      "Mother may experience morning sickness",
      "Possible changes in eating habits"
    ]
  },
  {
    week: 5,
    title: "Week 5: Visible Growth",
    description: "Abdomen begins to swell noticeably. Appetite may increase.",
    keyPoints: [
      "Puppies approximately 3-4cm long",
      "Eyes, ears, and limbs forming",
      "Mother's abdomen begins to enlarge",
      "Increased appetite in mother"
    ]
  },
  {
    week: 6,
    title: "Week 6: Rapid Development",
    description: "Puppies developing rapidly. Abdomen continues to enlarge.",
    keyPoints: [
      "Puppies' skeletons start to calcify",
      "Puppies approximately 6cm long",
      "Development of claws and whiskers",
      "Puppies becoming more active"
    ]
  },
  {
    week: 7,
    title: "Week 7: Preparation",
    description: "Puppies continuing to grow. Milk may be expressed from nipples.",
    keyPoints: [
      "Puppies have fur starting to grow",
      "Mother begins nesting behavior",
      "Milk production starts",
      "Puppies can be felt moving in abdomen"
    ]
  },
  {
    week: 8,
    title: "Week 8: Pre-Labor",
    description: "Final week. Temperature should be monitored. Milk present.",
    keyPoints: [
      "Puppies are fully developed",
      "Mother's temperature should be monitored",
      "Mother shows nesting behavior",
      "Milk production increases"
    ]
  },
  {
    week: 9,
    title: "Week 9: Birth",
    description: "Expected whelping day. Temperature typically drops before labor.",
    keyPoints: [
      "Temperature drops below 100°F (37.8°C) 24-48 hours before labor",
      "Contractions begin",
      "Mother may become restless",
      "Puppies are born!"
    ]
  }
];

// Generate pregnancy weeks with both development info and checklist items
export const generatePregnancyJourneyData = (): PregnancyWeek[] => {
  // Extract checklist items from defaultPregnancyChecklist
  const earlyPregnancyItems = [
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

  const midPregnancyItems = [
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

  const latePregnancyItems = [
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

  // Create week by week data
  return weeklyDevelopments.map(development => {
    // Find checklist items for this week
    const weekItems = [
      ...earlyPregnancyItems.filter(item => item.weekNumber === development.week),
      ...midPregnancyItems.filter(item => item.weekNumber === development.week),
      ...latePregnancyItems.filter(item => item.weekNumber === development.week)
    ];

    return {
      weekNumber: development.week,
      development,
      checklistItems: weekItems
    };
  });
};
