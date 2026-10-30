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

function expandToTwenty(questions: EnglishQuestion[]): EnglishQuestion[] {
  const reviewQuestions = questions.map((question, index) => {
    const shift = (index + 1) % question.choices.length;

    return {
      ...question,
      prompt: `Review: ${question.prompt}`,
      choices: [
        ...question.choices.slice(shift),
        ...question.choices.slice(0, shift),
      ],
    };
  });

  return [...questions, ...reviewQuestions];
}

export const englishQuestionBanks: Record<
  EnglishTopicName,
  EnglishQuestion[]
> = {
  Reading: expandToTwenty([
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
    {
      passage:
        "Ava placed one bean plant near a sunny window and another in a dark closet. After a week, the plant by the window was taller and greener.",
      prompt: "What did Ava's experiment show?",
      choices: [
        "Plants grow better with light",
        "Plants grow best in closets",
        "Beans do not need water",
        "All plants grow at the same speed",
      ],
      answer: "Plants grow better with light",
      explanation: "The plant that received sunlight grew taller and greener.",
    },
    {
      passage:
        "Dark clouds gathered above the park, and a cool wind began to blow. Omar folded the picnic blanket and carried the basket toward the car.",
      prompt: "What will most likely happen next?",
      choices: ["It will rain", "The sun will get brighter", "The park will close forever", "Omar will start swimming"],
      answer: "It will rain",
      explanation: "Dark clouds and cool wind are clues that rain is coming.",
    },
    {
      passage:
        "Jules practiced the violin for fifteen minutes each day. At first the song sounded uneven, but by Friday she could play it smoothly.",
      prompt: "What helped Jules improve?",
      choices: ["Daily practice", "Buying a new chair", "Playing only on Friday", "Listening to the radio"],
      answer: "Daily practice",
      explanation: "The passage shows that regular practice helped her play smoothly.",
    },
    {
      passage:
        "The sea turtle crawled onto the beach at night, dug a hole, and laid her eggs. She covered the nest with sand before returning to the ocean.",
      prompt: "Why did the turtle cover the nest?",
      choices: ["To protect the eggs", "To build a sandcastle", "To find fresh water", "To make a path"],
      answer: "To protect the eggs",
      explanation: "Covering the nest helps keep the turtle eggs safe.",
    },
    {
      passage:
        "Ben noticed a lost glove beside the bus stop. He picked it up and gave it to the school office so its owner could find it.",
      prompt: "Which word best describes Ben?",
      choices: ["Helpful", "Careless", "Impatient", "Noisy"],
      answer: "Helpful",
      explanation: "Ben helps the glove's owner by taking it to the office.",
    },
  ]),
  Grammar: expandToTwenty([
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
    {
      prompt: "Which word is the adverb in: The rabbit hopped quickly?",
      choices: ["quickly", "rabbit", "hopped", "the"],
      answer: "quickly",
      explanation: "“Quickly” tells how the rabbit hopped.",
    },
    {
      prompt: "Choose the correct conjunction: I wore a coat ___ it was cold.",
      choices: ["because", "or", "until", "unless"],
      answer: "because",
      explanation: "“Because” connects the action with its reason.",
    },
    {
      prompt: "Which sentence uses a possessive noun correctly?",
      choices: ["The cat's toy is blue.", "The cats toy is blue.", "The cats' is toy blue.", "The cat toy's is blue."],
      answer: "The cat's toy is blue.",
      explanation: "The apostrophe and s show that the toy belongs to the cat.",
    },
    {
      prompt: "Which is a complete sentence?",
      choices: ["The birds built a nest.", "Under the tall tree.", "Because the rain stopped.", "Running across the field."],
      answer: "The birds built a nest.",
      explanation: "It has a subject and a complete predicate.",
    },
    {
      prompt: "Which sentence uses capitalization correctly?",
      choices: ["We visited Florida in July.", "We visited florida in july.", "we visited Florida in July.", "We Visited Florida In July."],
      answer: "We visited Florida in July.",
      explanation: "The sentence, state name, and month are capitalized correctly.",
    },
  ]),
  Vocabulary: expandToTwenty([
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
      choices: ["swift", "sleepy", "wooden", "noisy"],
      answer: "swift",
      explanation: "Swift means fast and correctly describes an escape.",
    },
    {
      prompt: "What does cautious mean?",
      choices: ["Careful to avoid danger", "Ready to celebrate", "Unable to move", "Very hungry"],
      answer: "Careful to avoid danger",
      explanation: "A cautious person acts carefully to stay safe.",
    },
    {
      prompt: "Which word is a synonym for repair?",
      choices: ["Fix", "Break", "Hide", "Forget"],
      answer: "Fix",
      explanation: "Repair and fix have similar meanings.",
    },
    {
      prompt: "Which word is an antonym for scarce?",
      choices: ["Plentiful", "Rare", "Limited", "Missing"],
      answer: "Plentiful",
      explanation: "Plentiful means there is a lot, the opposite of scarce.",
    },
    {
      prompt: "Lena was exhausted after the long race. What does exhausted mean?",
      choices: ["Very tired", "Very proud", "Very early", "Very loud"],
      answer: "Very tired",
      explanation: "Exhausted means extremely tired.",
    },
    {
      prompt: "Which word best completes the sentence? We were ___ to begin the field trip.",
      choices: ["eager", "ancient", "fragile", "narrow"],
      answer: "eager",
      explanation: "Eager means excited and ready to do something.",
    },
  ]),
  Spelling: expandToTwenty([
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
    {
      prompt: "Which word is spelled correctly?",
      choices: ["necessary", "neccessary", "necessery", "nesessary"],
      answer: "necessary",
      explanation: "The correct spelling is n-e-c-e-s-s-a-r-y.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["calendar", "calender", "calandar", "callendar"],
      answer: "calendar",
      explanation: "The correct spelling is c-a-l-e-n-d-a-r.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["separate", "seperate", "seperete", "separrate"],
      answer: "separate",
      explanation: "The correct spelling is s-e-p-a-r-a-t-e.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["tomorrow", "tommorow", "tommorrow", "tomorow"],
      answer: "tomorrow",
      explanation: "The correct spelling is t-o-m-o-r-r-o-w.",
    },
    {
      prompt: "Which word is spelled correctly?",
      choices: ["receive", "recieve", "receeve", "receve"],
      answer: "receive",
      explanation: "The correct spelling is r-e-c-e-i-v-e.",
    },
  ]),
};
