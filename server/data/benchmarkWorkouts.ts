import { InsertBenchmarkWorkout } from "@shared/schema";

export const BENCHMARK_WORKOUTS: InsertBenchmarkWorkout[] = [
  // The Girls - Original 6
  {
    name: "Fran",
    category: "girls",
    description: "21-15-9\nThrusters (95/65 lb)\nPull-ups",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },
  {
    name: "Helen",
    category: "girls", 
    description: "3 rounds for time:\n400m Run\n21 Kettlebell swings (53/35 lb)\n12 Pull-ups",
    type: "for_time",
    timeCap: 900 // 15 minutes
  },
  {
    name: "Grace",
    category: "girls",
    description: "For time:\n30 Clean & jerks (135/95 lb)",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },
  {
    name: "Isabel",
    category: "girls",
    description: "For time:\n30 Snatches (135/95 lb)",
    type: "for_time",
    timeCap: 480 // 8 minutes
  },
  {
    name: "Diane",
    category: "girls",
    description: "21-15-9\nDeadlifts (225/155 lb)\nHandstand push-ups",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },
  {
    name: "Elizabeth",
    category: "girls",
    description: "21-15-9\nSquat cleans (135/95 lb)\nRing dips",
    type: "for_time",
    timeCap: 900 // 15 minutes
  },
  
  // Additional Girls
  {
    name: "Angie",
    category: "girls",
    description: "For time:\n100 Pull-ups\n100 Push-ups\n100 Sit-ups\n100 Squats",
    type: "for_time",
    timeCap: 1200 // 20 minutes
  },
  {
    name: "Barbara",
    category: "girls",
    description: "5 rounds for time:\n20 Pull-ups\n30 Push-ups\n40 Sit-ups\n50 Squats\n3 minute rest between rounds",
    type: "for_time",
    timeCap: 1800 // 30 minutes
  },
  {
    name: "Chelsea",
    category: "girls",
    description: "EMOM 30 minutes:\n5 Pull-ups\n10 Push-ups\n15 Squats",
    type: "emom",
    timeCap: 1800 // 30 minutes
  },
  {
    name: "Jackie",
    category: "girls",
    description: "For time:\n1000m Row\n50 Thrusters (45/35 lb)\n30 Pull-ups",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },
  {
    name: "Karen",
    category: "girls",
    description: "For time:\n150 Wall balls (20/14 lb)",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },
  {
    name: "Linda",
    category: "girls",
    description: "3 rounds:\nDeadlift (bodyweight)\nBench press (bodyweight)\nSquat clean (bodyweight)\n*Work up to max in each movement",
    type: "strength"
  },
  {
    name: "Mary",
    category: "girls",
    description: "AMRAP 20 minutes:\n5 Handstand push-ups\n10 Pistol squats\n15 Pull-ups",
    type: "amrap",
    timeCap: 1200 // 20 minutes
  },
  {
    name: "Nancy",
    category: "girls",
    description: "5 rounds for time:\n400m Run\n15 Overhead squats (95/65 lb)",
    type: "for_time",
    timeCap: 1200 // 20 minutes
  },
  {
    name: "Amanda",
    category: "girls",
    description: "9-7-5\nSquat snatches (135/95 lb)\nRing muscle-ups",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },
  {
    name: "Annie",
    category: "girls",
    description: "50-40-30-20-10\nDouble unders\nSit-ups",
    type: "for_time",
    timeCap: 600 // 10 minutes
  },

  // Hero Workouts
  {
    name: "Murph",
    category: "heroes",
    description: "For time:\n1 mile Run\n100 Pull-ups\n200 Push-ups\n300 Squats\n1 mile Run\n*If you've got a twenty pound vest or body armor, wear it",
    type: "for_time",
    timeCap: 3600, // 60 minutes
    story: "In memory of Navy Lieutenant Michael Murphy, 29, of Patchogue, N.Y., who was killed in Afghanistan June 28th, 2005."
  },
  {
    name: "Josh",
    category: "heroes",
    description: "For time:\n21 Overhead squats (95/65 lb)\n42 Pull-ups\n15 Overhead squats (95/65 lb)\n30 Pull-ups\n9 Overhead squats (95/65 lb)\n18 Pull-ups",
    type: "for_time",
    timeCap: 1200, // 20 minutes
    story: "In memory of Army Staff Sgt. Joshua Hager, 29, of Baxter, Tenn."
  },
  {
    name: "Daniel",
    category: "heroes",
    description: "For time:\n50 Pull-ups\n400m Run\n21 Thrusters (95/65 lb)\n800m Run\n21 Thrusters (95/65 lb)\n400m Run\n50 Pull-ups",
    type: "for_time",
    timeCap: 1800, // 30 minutes
    story: "In memory of Sgt. Daniel Craik, 22, of Lacey, Wash."
  },
  {
    name: "Michael",
    category: "heroes", 
    description: "3 rounds for time:\n800m Run\n50 Back extensions\n50 Sit-ups",
    type: "for_time",
    timeCap: 1800, // 30 minutes
    story: "In memory of Navy Lieutenant Michael McGreevy, 30, of Portville, N.Y."
  },
  {
    name: "JT",
    category: "heroes",
    description: "For time:\n21 Handstand push-ups\n15 Ring dips\n9 Push-ups\n21 Handstand push-ups\n15 Ring dips\n9 Push-ups\n21 Handstand push-ups\n15 Ring dips\n9 Push-ups",
    type: "for_time",
    timeCap: 900, // 15 minutes
    story: "In memory of Petty Officer 1st Class Jeff Taylor, 30, of Little Creek, Va."
  },
  {
    name: "Danny",
    category: "heroes",
    description: "For time:\n30 Box jumps (24/20 in)\n20 Push presses (115/75 lb)\n30 Pull-ups\n20 Box jumps (24/20 in)\n20 Push presses (115/75 lb)\n30 Pull-ups\n20 Box jumps (24/20 in)\n20 Push presses (115/75 lb)\n30 Pull-ups\n10 Box jumps (24/20 in)\n20 Push presses (115/75 lb)\n30 Pull-ups",
    type: "for_time",
    timeCap: 1200, // 20 minutes
    story: "In memory of Trooper Daniel Sakai, 23, of Kailua, Hawaii."
  },
  {
    name: "Jason",
    category: "heroes",
    description: "For time:\n100 Squats\n5 Muscle-ups\n75 Squats\n10 Muscle-ups\n50 Squats\n15 Muscle-ups\n25 Squats\n20 Muscle-ups",
    type: "for_time",
    timeCap: 1800, // 30 minutes
    story: "In memory of Corporal Jason Dunham, 22, of Scio, N.Y."
  },
  {
    name: "Adam",
    category: "heroes",
    description: "For time:\n50 GHD sit-ups\n50 Back extensions\n50 Knees to elbows\n50 Hip extensions\n50 Good mornings\n50 Squats",
    type: "for_time",
    timeCap: 1200, // 20 minutes
    story: "In memory of Adam Brown, 36, a Navy SEAL."
  },
  {
    name: "Brad",
    category: "heroes", 
    description: "For time:\n800m Run\n50 Air squats\n400m Run\n50 Air squats\n200m Run\n50 Air squats\n100m Run\n50 Air squats",
    type: "for_time",
    timeCap: 900, // 15 minutes
    story: "In memory of Staff Sgt. Bradley Crose, 27, of Casper, Wyo."
  },
  {
    name: "Chad",
    category: "heroes",
    description: "For time:\n1000 Box steps (20 in)\n*Each athlete steps up and down 1000 times",
    type: "for_time",
    timeCap: 2400, // 40 minutes
    story: "In memory of Navy SEAL Chad Wilkinson, 29, of Meridian, Idaho."
  }
];
