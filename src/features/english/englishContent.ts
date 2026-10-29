export type EnglishTopicName =
  | "Reading"
  | "Grammar"
  | "Vocabulary"
  | "Spelling";

export type EnglishQuestion = {
  prompt: string;
  passage?: string;
  choices: string[];
  answer: string;
  explanation: string;
};

export const englishQuestionBanks: Record<
  EnglishTopicName,
  EnglishQuestion[]
> = {
  Reading: [
    {
      passage:
        "Maya waters the garden every morning before school. She checks each plant and pulls out any weeds she sees.",
      prompt: "Why does Maya visit the garden every morning?",
      choices: [
        "To care for the plants",
        "To wait for the bus",
        "To feed the birds",
        "To play a game",
      ],
      answer: "To care for the plants",
      explanation: "She waters the plants and removes weeds to care for them.",
    },
    {
      passage:
        "The library was quiet, but Leo could hear rain tapping on the windows. He chose a mystery book and curled up in a chair.",
      prompt: "Where is Leo?",
      choices: ["At a library", "At a stadium", "At a bakery", "At a farm"],
      answer: "At a library",
      explanation: "The passage says Leo chose a book in the library.",
    },
    {
      passage:
        "Nina packed a sandwich, a water bottle, and a map. Then she laced up her boots and joined her family at the trail.",
      prompt: "What is Nina most likely preparing to do?",
      choices: ["Go hiking", "Bake a cake", "Paint a room", "Take a test"],
      answer: "Go hiking",
      explanation: "A map, boots, and a trail are clues that Nina is going hiking.",
    },
    {
      passage:
        "At first, the puppy hid behind the sofa. After Sam offered it a treat and spoke softly, it came out and wagged its tail.",
      prompt: "How did the puppy's feelings change?",
      choices: [
        "From nervous to friendly",
        "From excited to angry",
        "From hungry to sleepy",
        "From playful to bored",
      ],
      answer: "From nervous to friendly",
      explanation: "Hiding shows nervousness; coming out and wagging shows trust.",
    },
    {
      passage:
        "The class collected cans for three weeks. On Friday, they filled the final box and cheered because they had reached their goal.",
      prompt: "What is the main idea of the passage?",
      choices: [
        "The class worked together to reach a goal",
        "Friday was the first day of school",
        "The class wanted new boxes",
        "Three weeks is a long vacation",
      ],
      answer: "The class worked together to reach a goal",
      explanation: "The important idea is their shared effort and success.",
    },
  ],
  Grammar: [
    {
      prompt: "Which sentence uses the correct verb?",
      choices: [
        "The dogs bark loudly.",
        "The dogs barks loudly.",
        "The dogs barking loudly.",
        "The dogs is bark loudly.",
      ],
      answer: "The dogs bark loudly.",
      explanation: "The plural subject “dogs” uses the verb “bark.”",
    },
    {
      prompt: "Which word is the adjective in: The bright kite flew high?",
      choices: ["bright", "kite", "flew", "high"],
      answer: "bright",
      explanation: "“Bright” describes the noun “kite.”",
    },
    {
      prompt: "Which sentence is punctuated correctly?",
      choices: [
        "Where are you going?",
        "Where are you going.",
        "where are you going?",
        "Where, are you going?",
      ],
      answer: "Where are you going?",
      explanation: "A question starts with a capital letter and ends with a question mark.",
    },
    {
      prompt: "Choose the correct pronoun: Mia and ___ made a poster.",
      choices: ["I", "me", "mine", "my"],
      answer: "I",
      explanation: "“I” is the subject pronoun used with Mia.",
    },
    {
      prompt: "Which sentence is in the past tense?",
      choices: [
        "We walked to school.",
        "We walk to school.",
        "We will walk to school.",
        "We are walking to school.",
      ],
      answer: "We walked to school.",
      explanation: "“Walked” shows that the action already happened.",
    },
  ],
  Vocabulary: [
    {
      prompt: "What does enormous mean?",
      choices: ["Very large", "Very quiet", "Very old", "Very quick"],
      answer: "Very large",
      explanation: "Enormous means extremely large.",
    },
    {
      prompt: "Which word is a synonym for joyful?",
      choices: ["Happy", "Angry", "Tired", "Careful"],
      answer: "Happy",
      explanation: "Joyful and happy have similar meanings.",
    },
    {
      prompt: "Which word is an antonym for ancient?",
      choices: ["Modern", "Old", "Historic", "Past"],
      answer: "Modern",
      explanation: "Modern means new or current, the opposite of ancient.",
    },
    {
      prompt: "The glass vase is fragile. What does fragile mean?",
      choices: [
        "Easy to break",
        "Hard to lift",
        "Brightly colored",
        "Full of water",
      ],
      answer: "Easy to break",
      explanation: "Something fragile can be damaged or broken easily.",
    },
    {
      prompt: "Which word best completes the sentence? The rabbit made a ___ escape.",
      choices: ["swift", "sleepy", "wooden", "silentest"],
      answer: "swift",
      explanation: "Swift means fast and correctly describes an escape.",
    },
  ],
  Spelling: [
    {
      prompt: "Which word is spelled correctly?",
      choices: ["because", "becuase", "beacause", "becaus"],
      answer: "because",
      explanation: "The correct spelling is b-e-c-a-u-s-e.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["beautiful", "beautifull", "beutiful", "beautyful"],
      answer: "beautiful",
      explanation: "The correct spelling is b-e-a-u-t-i-f-u-l.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["different", "diffrent", "differant", "diferent"],
      answer: "different",
      explanation: "The correct spelling is d-i-f-f-e-r-e-n-t.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["favorite", "faverite", "favrite", "favorit"],
      answer: "favorite",
      explanation: "The correct spelling is f-a-v-o-r-i-t-e.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["surprise", "suprise", "surprize", "surprice"],
      answer: "surprise",
      explanation: "The correct spelling is s-u-r-p-r-i-s-e.",
    },
  ],
};
