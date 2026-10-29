import type {
  ComprehensionQuestion,
  ParagraphTask,
  StoryIllustration,
  StoryLesson,
  StoryPage,
  TextFeature,
  VocabularyWord,
} from "../types";

type LessonSeed = Omit<
  StoryLesson,
  "id" | "grade" | "contentVersion" | "textFeatures"
>;

const word = (
  wordValue: string,
  definition: string,
  synonyms: [string, string],
  contextSentence: string,
  hint: string,
  acceptedSpellings?: string[],
): VocabularyWord => ({
  word: wordValue,
  definition,
  synonyms,
  contextSentence,
  hint,
  acceptedSpellings,
});

const question = (
  id: string,
  classification: ComprehensionQuestion["classification"],
  prompt: string,
  modelAnswer: string,
  evidence: string,
  isOpinion = false,
): ComprehensionQuestion => ({
  id,
  classification,
  prompt,
  modelAnswer,
  evidence,
  isOpinion,
});

const illustration = (
  sequence: number,
  alt: string,
  caption: string,
  sceneKey: string,
  accent: string,
): StoryIllustration => ({
  src: `/story-adventures/illustrations/lesson-${String(sequence).padStart(3, "0")}.svg`,
  alt,
  caption,
  sceneKey,
  accent,
});

const paragraphTask = (
  sequence: number,
  prompt: string,
  centralIdea: string,
  topicSentenceStarter: string,
  relevantDetails: [string, string, string, string],
  irrelevantDetails: [string, string],
  missingDetailPrompt: string,
  conclusionPrompt: string,
  revisionPrompt: string,
  requiredVocabulary: string[],
  modelParagraph: string,
): ParagraphTask => ({
  prompt,
  centralIdea,
  topicSentenceStarter,
  sentenceOptions: [
    ...relevantDetails.map((text, index) => ({
      id: `l${sequence}-relevant-${index + 1}`,
      text,
      relevant: true,
      reason: "This sentence directly develops the paragraph's central idea.",
    })),
    ...irrelevantDetails.map((text, index) => ({
      id: `l${sequence}-irrelevant-${index + 1}`,
      text,
      relevant: false,
      reason: "This sentence does not explain or support the assigned central idea.",
    })),
  ],
  missingDetailPrompt,
  conclusionPrompt,
  revisionPrompt,
  requiredVocabulary,
  modelParagraph,
});

const textFeaturesFor = (
  title: string,
  pages: [StoryPage, StoryPage],
  art: StoryIllustration,
): [TextFeature, TextFeature, TextFeature, TextFeature] => [
  {
    id: "title",
    feature: "Title",
    location: "Above page 1",
    purpose: `Introduces the central subject or mystery: ${title}.`,
    helpsBecause: "It prepares the reader to predict the passage's focus.",
  },
  {
    id: "subheadings",
    feature: "Subheadings",
    location: `At the start of each page: “${pages[0].subheading}” and “${pages[1].subheading}”`,
    purpose: "Divides the continuous reading into two meaningful stages.",
    helpsBecause: "They show how the ideas or events develop from one page to the next.",
  },
  {
    id: "illustration-caption",
    feature: "Illustration with caption",
    location: `Beside the reading spread: “${art.caption}”`,
    purpose: "Shows a key scene or process and identifies why it matters.",
    helpsBecause: "The visual details make an important event or idea easier to picture.",
  },
  {
    id: "information-boxes",
    feature: "Information boxes",
    location: `The “${pages[0].callout.label}” and “${pages[1].callout.label}” callouts`,
    purpose: "Highlights concise information that supports the main reading.",
    helpsBecause: "The boxes help the reader notice and remember important clues or facts.",
  },
];

const lesson = (seed: LessonSeed): StoryLesson => {
  const art = seed.illustration;
  return {
    ...seed,
    id: `story-${String(seed.sequence).padStart(3, "0")}`,
    grade: 5,
    textFeatures: textFeaturesFor(seed.title, seed.pages, art),
    contentVersion: "1.0.0",
  };
};

export const lessons035To067: StoryLesson[] = [
  lesson({
    sequence: 35,
    title: "From Seed to Sunflower",
    genre: "Informational science narrative",
    informational: true,
    band: "developing",
    objective: "Explain the stages of a sunflower's life cycle and connect each stage through cause and effect.",
    skillTags: ["RI.5.2", "RI.5.3", "cause and effect", "life cycles", "explanatory writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Small Beginning",
        paragraphs: [
          `Nia pressed a striped sunflower seed into a pot of damp soil and set the pot beside a sunny window. The seed looked still, but a living plant waited inside its protective coat. When the soil stayed warm and moist, the seed absorbed water. It swelled until the coat split. This beginning stage is called germination, or the time when a seed starts to grow.`,
          `The first root pushed downward, following gravity. Tiny hairs along the root took in water and dissolved nutrients from the soil. Soon, a curved shoot reached upward. Its first two leaves unfolded like green paddles. They had stored food from inside the seed, which helped the young plant until its true leaves could work. Nia measured the shoot each morning without tugging it from the soil.`,
          `True leaves contain a green material called chlorophyll. With sunlight, water, and carbon dioxide from the air, they make sugars that supply energy for growth. This process is photosynthesis. As the stem became taller, it also thickened. More roots branched through the pot, so Nia moved the seedling into the school garden where it had room to spread.`,
          `A sunflower does not actually twist all day to stare at the Sun once it is mature. Young plants can slowly change direction as they grow, helping their leaves receive light. Nia noticed that her seedling leaned east in the morning. She turned this observation into a question instead of assuming the plant was following her.`
        ],
        callout: {
          label: "Life-Cycle Note",
          text: "Germination begins after a seed receives suitable moisture, warmth, and oxygen.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Flower Full of Flowers",
        paragraphs: [
          `By midsummer, the stem stood higher than Nia's shoulder. A round bud formed at its tip. Green coverings protected the developing flower head until it opened. What looked like one giant flower was actually a collection of many small flowers. The bright outer ray flowers attracted visitors, while hundreds of tiny disk flowers crowded the centre.`,
          `Bees and other insects landed to drink nectar and collect pollen. As they moved among disk flowers, they carried pollen from one flower part to another. This pollination allowed many of the flowers to produce seeds. Nia watched from a respectful distance. She recorded which insects visited, but she did not spray or shake the plant, because both actions could disturb useful pollinators.`,
          `After flowering, the head grew heavy and began to face downward. The petals faded, and the seeds matured in an orderly spiral. Each seed held an embryo, stored food, and a coat. Birds ate some seeds, while people could harvest others once the back of the head dried and turned brown. Nia saved several dry seeds in a labelled envelope rather than sealing damp seeds where mould might grow.`,
          `The tall plant eventually withered, but its life cycle had not simply ended. Seeds could feed animals, be planted the following season, or fall and grow where conditions were suitable. Nia's notebook showed the connected stages: seed, germination, seedling, mature plant, flower, pollination, and new seed. One small beginning had become both a towering plant and the start of many possible sunflowers.`
        ],
        callout: {
          label: "Pollinator Link",
          text: "Many disk flowers can become seeds after pollen is transferred between flower parts.",
        },
      },
    ],
    illustration: illustration(
      35,
      "Nia kneels beside a sunflower whose roots, seedling, bud, open flower, and seed head appear as a labelled life-cycle arc.",
      "One sunflower's stages connect in a repeating life cycle.",
      "sunflower-life-cycle-garden",
      "#F7C948",
    ),
    vocabulary: [
      word("germination", "the stage when a seed begins to sprout and grow", ["sprouting", "emergence"], "This beginning stage is called germination, or the time when a seed starts to grow.", "It begins after a seed absorbs water."),
      word("nutrients", "substances that living things need for growth and health", ["nourishment", "minerals"], "Tiny hairs along the root took in water and dissolved nutrients from the soil.", "Roots take these useful substances from soil."),
      word("pollination", "the transfer of pollen that allows a plant to make seeds", ["pollen transfer", "fertilization process"], "This pollination allowed many of the flowers to produce seeds.", "Bees often help this process."),
    ],
    comprehension: [
      question("l35-q1", "Right There", "What happened after the seed absorbed water?", "The seed swelled, its coat split, and the first root and shoot began to emerge.", "Page 1 directly describes the seed swelling and its coat splitting before the root and shoot appear."),
      question("l35-q2", "Think and Search", "How do roots and leaves work together to help a sunflower grow?", "Roots absorb water and nutrients, while leaves use light, water, and carbon dioxide to make sugars. Together they provide materials and energy for growth.", "The root information appears in paragraph 2, and the leaf information appears in paragraph 3."),
      question("l35-q3", "On My Own", "Would you rather observe a sunflower each day or once a week? Explain what your schedule might help you notice.", "A strong response chooses a schedule and explains, for example, that daily checks could reveal small changes while weekly checks might make larger changes easier to compare.", "This is a personal planning question; relevant reasons are required, but a quotation is not." , true),
      question("l35-q4", "Think and Search", "Why is a mature seed head both an ending and a beginning? Use evidence from both pages.", "It is the end of the parent plant's flowering stage, but its mature seeds contain new embryos that can feed animals or grow into new plants.", "Page 1 explains what is inside a seed; page 2 explains how the mature head produces and disperses new seeds."),
      question("l35-q5", "Author and You", "How does the life-cycle callout help the reader understand the passage's message?", "It highlights the conditions needed for germination, helping the reader connect the first stage to later growth rather than viewing the stages as unrelated facts.", "The answer combines the callout with the sequence explained throughout the passage."),
    ],
    paragraphTask: paragraphTask(
      35,
      "Build and revise an explanatory paragraph showing how a sunflower progresses from a seed to new seeds.",
      "A sunflower's life stages depend on connected changes and suitable conditions.",
      "A sunflower begins a connected life cycle when...",
      [
        "Water causes the seed to swell so its root and shoot can emerge.",
        "Roots absorb water and nutrients while leaves make sugar using sunlight.",
        "The mature plant forms many small flowers in one flower head.",
        "Pollination allows the flowers to develop new seeds.",
      ],
      [
        "Nia's notebook had a yellow cover with three pockets.",
        "Some garden paths are made from square grey stones.",
      ],
      "Add one detail explaining how mature seeds can continue the life cycle.",
      "Write a conclusion that connects the final seeds back to the original seed.",
      "Use clear sequence transitions, improve one sentence with a precise adjective or adverb, and include the word germination or pollination.",
      ["germination", "pollination"],
      "A sunflower begins a connected life cycle when moisture triggers germination. First, the seed swells, and a root and shoot emerge. Next, roots absorb nutrients while green leaves use sunlight to make sugar. The mature plant then develops a broad head filled with small flowers. After insects support pollination, those flowers produce new seeds. Therefore, the dry seed head is not only the end of one plant; it carries the beginnings of many more.",
    ),
    sourceReferences: [
      { label: "USDA Forest Service — Common Sunflower", url: "https://www.fs.usda.gov/wildflowers/plant-of-the-week/helianthus_annuus.shtml" },
      { label: "USDA Natural Resources Conservation Service — Insects and Pollinators", url: "https://www.nrcs.usda.gov/conservation-basics/animals/insects-pollinators" },
    ],
  }),
  lesson({
    sequence: 36,
    title: "The School Newspaper Scoop",
    genre: "School mystery",
    informational: false,
    band: "developing",
    objective: "Distinguish verified evidence from rumours and explain how responsible reporting builds trust.",
    skillTags: ["RL.5.2", "RL.5.3", "source evaluation", "character motivation", "opinion writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Headline in a Hurry",
        paragraphs: [
          `At lunch, an anonymous note slid under the newsroom door: PRINCIPAL PINE IS CANCELLING FIELD DAY. Nia, editor of The Maple Leaflet, read it twice. Field day was tomorrow, and the next newspaper issue had to be printed by three o'clock. Her reporter Leo bounced in his chair. “This is the biggest scoop of the year!” he said, already typing a giant headline.`,
          `Bark Bolt tapped the yellow paw badge on his cape. A dramatic note was not evidence. Nia asked Leo to pause the headline while they verified the claim. First, they visited the office. Principal Pine was meeting with a parent, but the secretary said no cancellation notice had crossed her desk. That did not prove the event was safe, yet it showed the rumour had not become an official decision.`,
          `Next, the team checked the school calendar and the weather service page their teacher used. The schedule still listed field day, although an afternoon storm was possible. Outside, they found the caretaker rolling equipment into the gym. Leo gasped. “The races are cancelled!” The caretaker shook his head. Wet grass could be slippery, so he was preparing an indoor backup plan.`,
          `A deadline can make a weak guess feel urgent. Nia wrote three columns in her notebook: confirmed, uncertain, and opinion. Field day remained on the calendar: confirmed. Storms might arrive: uncertain. Indoor relays would be boring: Leo's opinion. Bark Bolt noticed purple ink on the anonymous note. The same ink stained the fingers of Sam, the student who managed the lost-and-found desk.`
        ],
        callout: {
          label: "Reporter Check",
          text: "A claim is not confirmed merely because it sounds possible or arrives before a deadline.",
        },
      },
      {
        pageNumber: 2,
        subheading: "The Truth Behind the Note",
        paragraphs: [
          `Sam admitted writing the note, but not to cause trouble. He had overheard two teachers discussing “moving everything inside” and assumed that meant cancellation. He wanted the newspaper to warn everyone. Nia thanked him for explaining, then showed how one missing detail had changed the meaning. The teachers had been discussing only the equipment, not the whole event.`,
          `Principal Pine soon joined them. She confirmed that field day would continue, with outdoor stations in the morning and indoor stations if rain arrived. Nia asked permission to quote her accurately. The principal agreed and added an important reminder: families should check the official school message at seven the next morning because weather conditions could change.`,
          `With twelve minutes left, Leo replaced his alarming headline. Their final front page read: FIELD DAY READY WITH RAIN PLAN. The article described what was known, what might change, and where readers could find an update. A small sidebar explained how the paper had checked the original rumour. Nia did not name Sam, because his mistaken guess was less important than correcting the information.`,
          `The presses hummed at exactly three. The following day, a brief shower sent the beanbag toss indoors, but no one arrived confused or frightened. Leo admitted the careful headline was less explosive and much more useful. Bark Bolt pinned the anonymous note above the newsroom desk. Beneath it, Nia wrote their new rule: “Be curious quickly, but publish carefully.” Their real scoop was not a cancellation. It was the discovery that trust takes longer to build than a rumour takes to spread.`
        ],
        callout: {
          label: "Newsroom Rule",
          text: "Reliable reports identify what is confirmed, what is uncertain, and where updates will appear.",
        },
      },
    ],
    illustration: illustration(
      36,
      "Nia, Leo, and Bark Bolt sort notes into confirmed, uncertain, and opinion columns in the colourful school newsroom.",
      "The newsroom team checks a rumour before the printing deadline.",
      "newspaper-verification-board",
      "#2F80ED",
    ),
    vocabulary: [
      word("anonymous", "made or given by someone whose name is not known", ["unnamed", "unidentified"], "At lunch, an anonymous note slid under the newsroom door.", "The writer did not sign a name."),
      word("verified", "checked carefully and shown to be accurate", ["confirmed", "validated"], "Nia asked Leo to pause the headline while they verified the claim.", "Reporters do this before publishing a claim."),
      word("deadline", "the latest time by which something must be finished", ["due time", "time limit"], "A deadline can make a weak guess feel urgent.", "The newspaper had to be printed by three o'clock."),
    ],
    comprehension: [
      question("l36-q1", "Right There", "What did the anonymous note claim?", "It claimed that Principal Pine was cancelling field day.", "The claim appears in capital letters in the first paragraph."),
      question("l36-q2", "Think and Search", "Why did moving equipment indoors not prove that field day was cancelled?", "The caretaker was preparing a backup for slippery grass, and the school calendar still listed field day. The evidence supported a change of location, not a cancellation.", "The calendar, weather check, and caretaker's explanation must be combined."),
      question("l36-q3", "On My Own", "Should the newspaper have named Sam as the note's writer? Give a reason for your judgement.", "A strong answer may say no because correcting the rumour mattered more than embarrassing a student, or yes if it argues that accountability was necessary. The reason should consider fairness and public value.", "This opinion requires a thoughtful reason rather than a quotation.", true),
      question("l36-q4", "Think and Search", "How did Nia's actions protect readers before and after publication?", "Before publication, she checked the office, calendar, weather, caretaker, and principal. In the article, she separated confirmed facts from possible changes and told families where to find updates.", "Evidence appears across both pages, from the verification steps to the final article."),
      question("l36-q5", "Author and You", "Why does the author end with the contrast between building trust and spreading a rumour?", "The contrast expresses the story's message that responsible communication takes careful effort, while unsupported information can travel quickly.", "The reader connects Nia's slow checking process with the final statement."),
    ],
    paragraphTask: paragraphTask(
      36,
      "Write an opinion paragraph explaining why the newspaper's careful report was more useful than Leo's first headline.",
      "Verified reporting serves readers better than a dramatic but unsupported claim.",
      "The careful field-day report was more useful because...",
      [
        "Nia checked the calendar, office, caretaker, and principal before publishing.",
        "The final article separated confirmed plans from uncertain weather.",
        "Families learned where and when to find an official update.",
        "The accurate headline prevented needless confusion the next morning.",
      ],
      [
        "Leo's chair had wheels that squeaked when he bounced.",
        "The beanbags used for field day came in six colours.",
      ],
      "Add a sentence explaining how an unsupported headline could have affected families.",
      "Conclude with a general lesson about a reporter's responsibility.",
      "Use a cause-and-effect transition, replace one vague verb with a precise one, and include verified or deadline.",
      ["verified", "deadline"],
      "The careful field-day report was more useful because Nia verified the facts before the deadline. She checked several sources and learned that the school had a rain plan, not a cancellation. As a result, families knew what was confirmed and where to look for a morning update. A dramatic rumour might have caused students to stay home or bring the wrong equipment. Therefore, reporters should value accuracy over excitement when their words guide other people.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 37,
    title: "Bark Bolt and the Fake Treasure",
    genre: "Adventure mystery",
    informational: false,
    band: "developing",
    objective: "Analyze clues for authenticity and explain how context changes the meaning of evidence.",
    skillTags: ["RL.5.1", "RL.5.3", "context clues", "evidence", "narrative analysis"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Gold Beneath the Goalpost",
        paragraphs: [
          `During soccer practice, Bark Bolt's paw struck something hard beneath the grass. Nia helped him uncover a small wooden chest wrapped in a rusty chain. Inside lay twelve glittering coins and a torn map marked with a skull. Coach Rivera cancelled the next drill because half the team was already shouting about buried pirate treasure.`,
          `Bark Bolt examined the chest without touching the coins. The hinges looked old, but the wood smelled like fresh pine. Nia noticed that the skull on the map wore square sunglasses. “Either this pirate was very fashionable,” she said, “or someone wants us to believe too quickly.” They carried the find to the science room and invited Ms. Chen to supervise their investigation.`,
          `Under a magnifier, the coins showed identical scratches. Real objects usually collect different marks over time. A magnet pulled each coin upward, revealing that the “gold” was painted steel. The map's brown edges looked aged, yet a damp cotton swab lifted some colour. Tea, not centuries, had stained the paper. Every clue suggested that the treasure was not authentic.`,
          `Still, a fake chest could hide a real purpose. Nia deciphered tiny letters around the map's compass: C-O-M-E-T. That was the name of the school's soccer team. Dotted lines led not to an island but from the equipment shed to the centre circle, the bench, and the north goalpost. At each place, the team found a yellow ribbon tied low to the ground.`
        ],
        callout: {
          label: "Evidence Test",
          text: "A clue's age, material, pattern, and context can help investigators judge whether it is authentic.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Hoax with a Helpful Purpose",
        paragraphs: [
          `The ribbons formed the corners of a rectangle. Coach Rivera measured it and laughed. It matched the practice field she had planned for younger players. The final ribbon held another message: TREASURE IS WHERE EVERYONE GETS TO PLAY. The handwriting belonged to Mateo, the team captain, who stepped from behind the shed looking worried.`,
          `Mateo confessed that he had built the chest for a class project, then turned it into a dramatic proposal. The younger students' field had been muddy for weeks. He wanted the older team to help create a dry practice area, but he feared they would ignore an ordinary request. The pirate display certainly gained attention; however, it also caused people to mistake a performance for a historical discovery.`,
          `Nia was skeptical of Mateo's method but impressed by his goal. She asked him to explain the trick to the team and apologize for the false claim. Together, they wrote a new sign: PROP TREASURE—REAL COMMUNITY PROJECT. The sign preserved the fun while removing the deception. Players then marked the field and spread safe ground cover supplied by the school.`,
          `Before practice ended, Coach Rivera placed one painted coin at the new field's centre. It was not valuable metal, but it represented a valuable choice. Bark Bolt decided that “fake” and “worthless” were not the same word. The chest had failed as ancient treasure, yet it succeeded as a lesson: investigators should question exciting evidence, and good causes deserve honest explanations. The younger players arrived cheering, which sounded better than any clink of gold.`
        ],
        callout: {
          label: "Detective Decision",
          text: "Once evidence disproves one explanation, ask whether the objects may have a different purpose.",
        },
      },
    ],
    illustration: illustration(
      37,
      "Bark Bolt raises a magnet above painted coins while Nia studies a playful treasure map beside the soccer goal.",
      "The glittering treasure fails several careful evidence tests.",
      "fake-treasure-soccer-field",
      "#E6A700",
    ),
    vocabulary: [
      word("authentic", "genuine or truly what it claims to be", ["genuine", "real"], "Every clue suggested that the treasure was not authentic.", "Investigators tested whether the treasure was truly old."),
      word("deciphered", "worked out the meaning of something difficult to read or understand", ["decoded", "interpreted"], "Nia deciphered tiny letters around the map's compass.", "She solved a hidden message."),
      word("skeptical", "not easily convinced and wanting more evidence", ["doubtful", "questioning"], "Nia was skeptical of Mateo's method but impressed by his goal.", "A careful investigator may feel this before accepting a claim."),
    ],
    comprehension: [
      question("l37-q1", "Right There", "What tests showed that the treasure was not ancient gold?", "A magnet attracted the painted steel coins, their scratches were identical, the wood smelled fresh, and water lifted tea stain from the map.", "The tests are listed on page 1."),
      question("l37-q2", "Think and Search", "Why did Nia continue investigating after proving the treasure was fake?", "She realized the fake objects might still have a real purpose, and the coded map and ribbons suggested a plan connected to the soccer team.", "The answer combines her reasoning at the end of page 1 with the field revealed on page 2."),
      question("l37-q3", "On My Own", "Was Mateo's dramatic plan acceptable? Defend your judgement with a reason.", "A reasonable answer may approve the creative plan but criticize its deception, or reject it because it caused a false belief. It should weigh his helpful goal against the confusion he caused.", "This is a judgement question; relevant reasoning matters more than one fixed answer.", true),
      question("l37-q4", "Think and Search", "How did the team change Mateo's project so it remained fun but became honest?", "Mateo explained and apologized, the team labelled the chest as a prop, and everyone used the map's idea to build the younger players' field.", "These actions appear across several paragraphs on page 2."),
      question("l37-q5", "Author and You", "What does the painted coin at the centre of the new field symbolize?", "It symbolizes that an object need not be made of valuable material to represent honesty, teamwork, and a useful community project.", "The reader interprets the coin using the final paragraph and the team's actions."),
    ],
    paragraphTask: paragraphTask(
      37,
      "Write an evidence-based paragraph explaining why Bark Bolt and Nia concluded that the treasure was a modern prop.",
      "Several physical clues proved that the chest and its contents were recently made.",
      "The treasure appeared ancient at first, but several clues showed...",
      [
        "The chest's wood smelled like fresh pine even though its chain looked rusty.",
        "Every coin had the same scratch pattern and was attracted to a magnet.",
        "The gold surface was paint over steel rather than precious metal.",
        "A damp swab lifted the tea used to age the map.",
      ],
      [
        "Coach Rivera owned a bright orange whistle.",
        "The younger players cheered when they saw their new field.",
      ],
      "Add a detail explaining why identical wear marks are suspicious.",
      "Conclude by stating what the evidence allowed the investigators to infer.",
      "Combine two short sentences, use a transition showing contrast, and include authentic or skeptical.",
      ["authentic", "skeptical"],
      "The treasure appeared ancient at first, but several clues showed that it was a modern prop. Although the chain looked rusty, the chest smelled like fresh pine. The supposedly golden coins had identical scratches, stuck to a magnet, and revealed steel beneath their paint. In addition, water lifted the tea stain from the map. A skeptical investigator would not expect truly old objects to share such artificial marks. Therefore, the physical evidence proved that the treasure was not authentic.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 38,
    title: "The Unexpected Snow Day",
    genre: "Community adventure",
    informational: false,
    band: "developing",
    objective: "Trace how characters adapt a plan when changing conditions create new needs.",
    skillTags: ["RL.5.2", "RL.5.3", "cause and effect", "problem solving", "sequence writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Forecast Gone Sideways",
        paragraphs: [
          `The evening forecast promised a “light dusting,” so Nia expected to see a few white rooftops. Instead, she woke to snow stacked against the porch steps like a giant frozen wave. Maple Creek buses were cancelled, and school buildings closed to classes. Before Nia could celebrate, her mother received a message: the community centre had lost power, and the school gym would open as a warming space.`,
          `Nia pulled on boots and joined Bark Bolt at the school. Snow continued to accumulate, covering paths almost as quickly as volunteers cleared them. Principal Pine had heat and lights, but she needed a safe entrance, blankets from the theatre cupboard, and signs directing visitors. The sudden holiday had become a community workday.`,
          `Bark Bolt began shovelling the shortest path from the parking lot. Nia stopped him when she saw a ridge of snow above the gym roof. If it slid, it could land beside that door. They chose the longer library entrance, which had an overhead shelter. Mr. Ortiz marked the risky area with cones while a trained maintenance crew inspected the roof.`,
          `Inside, the volunteers had another problem. The gym echoed so loudly that instructions disappeared beneath scraping chairs and excited voices. Nia adapted the field-day station signs from the newspaper cupboard. Blue arrows led to warm drinks, yellow arrows to quiet seating, and green arrows to the charging table. Bark Bolt carried boxes, but he walked rather than raced on the wet floor.`
        ],
        callout: {
          label: "Safety Choice",
          text: "A short route is not always the safest route when weather changes the surroundings.",
        },
      },
      {
        pageNumber: 2,
        subheading: "The Best Kind of Detour",
        paragraphs: [
          `By noon, families filled the gym. Mrs. Bell arrived with her toddler and a worried expression; their apartment was getting cold. Nia showed them to a quiet corner near the reading mats. The cancelled school day suddenly felt less like a bonus vacation and more like a reminder that the same storm could affect neighbours in very different ways.`,
          `Then the delivery van carrying soup became stuck two blocks away. Bark Bolt could not pull a van through deep snow, superhero cape or not. Instead, the volunteers loaded covered containers onto three sturdy sleds. They travelled along the cleared sidewalk in pairs, taking smaller loads and moving steadily. The detour took longer, but every container reached the gym upright and warm.`,
          `The storm weakened in the afternoon. A revised forecast explained that a narrow band of heavy snow had formed over Maple Creek. Principal Pine announced that utility crews had restored power to the community centre. Before visitors left, Nia asked each family to take only the supplies they needed so enough remained for anyone still waiting.`,
          `School reopened two days later. Students compared snow forts, but Nia's clearest memory was a row of soup sleds beside the library door. The inaccurate forecast had surprised everyone, yet the successful response did not depend on predicting every detail. People observed new conditions, changed unsafe plans, and shared work. Bark Bolt added a sentence to the safety board: “Being prepared means having a plan; being helpful means knowing when to revise it.”`
        ],
        callout: {
          label: "Adaptation in Action",
          text: "The volunteers changed routes, signs, and transportation as new problems appeared.",
        },
      },
    ],
    illustration: illustration(
      38,
      "Nia and Bark Bolt guide three soup-filled sleds toward a brightly lit school entrance during heavy snow.",
      "A careful detour delivers warm soup to the community shelter.",
      "snow-day-soup-sleds",
      "#5BA7D9",
    ),
    vocabulary: [
      word("forecast", "a prediction about future weather", ["prediction", "outlook"], "The evening forecast promised a light dusting.", "Meteorologists make this prediction using weather information."),
      word("accumulate", "to collect or increase gradually over time", ["gather", "build up"], "Snow continued to accumulate, covering paths almost as quickly as volunteers cleared them.", "Think of a pile growing higher."),
      word("adapted", "changed something to make it suitable for a new use or condition", ["adjusted", "modified"], "Nia adapted the field-day station signs from the newspaper cupboard.", "She changed an old tool for a new problem."),
    ],
    comprehension: [
      question("l38-q1", "Right There", "Why did the school gym open even though classes were cancelled?", "It opened as a heated warming space because the community centre had lost power.", "This reason appears in the first paragraph."),
      question("l38-q2", "Think and Search", "How did observation help the volunteers make safer choices?", "Nia observed snow above the gym door and chose a sheltered entrance; volunteers noticed deep snow and used sleds; Bark Bolt noticed wet floors and walked carefully.", "Examples must be gathered from both pages."),
      question("l38-q3", "On My Own", "Which job at the warming centre would you choose, and why would it suit you?", "A strong response chooses a useful job and explains a personal strength, such as organizing signs, carrying supplies, reading to children, or serving food.", "The response is personal and should include a relevant reason.", true),
      question("l38-q4", "Think and Search", "Why was the longer detour more successful than the quickest choices?", "The library entrance avoided falling roof snow, and the soup sleds moved smaller loads safely along a cleared route. Taking more time protected people and supplies.", "The entrance decision appears on page 1 and the delivery decision on page 2."),
      question("l38-q5", "Author and You", "What message does the final safety-board sentence add to the story?", "It explains that preparation is useful, but responsible people must revise a plan when real conditions differ from expectations.", "The reader connects the sentence to the changed forecast and repeated adaptations."),
    ],
    paragraphTask: paragraphTask(
      38,
      "Write a cause-and-effect paragraph explaining how the volunteers adapted to the snowstorm.",
      "Changing conditions caused the volunteers to revise several parts of their shelter plan.",
      "Because the storm created unexpected conditions, the volunteers...",
      [
        "They used the sheltered library entrance instead of the shorter path below roof snow.",
        "Nia changed old field-day signs to guide people through the noisy gym.",
        "Volunteers used sleds when the soup van became stuck.",
        "They took smaller loads so the containers arrived safely.",
      ],
      [
        "Nia owned purple mittens with silver threads.",
        "Some students built snow forts after the storm.",
      ],
      "Add one detail showing how the volunteers protected people inside the gym.",
      "Conclude with what the response teaches about useful plans.",
      "Use at least two cause-and-effect transitions, strengthen one verb, and include adapted or accumulate.",
      ["adapted", "accumulate"],
      "Because the storm created unexpected conditions, the volunteers adapted their plans. When snow accumulated above the gym door, they redirected visitors to the sheltered library entrance. Since the noisy gym made instructions hard to hear, Nia created colour-coded signs. Later, the stuck soup van caused volunteers to haul smaller loads on sleds. These careful changes protected visitors and supplies. Overall, a useful plan is one that can be revised when conditions change.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 39,
    title: "How Recycling Works",
    genre: "Informational process article",
    informational: true,
    band: "developing",
    objective: "Describe the stages of recycling and explain how sorting choices affect the process.",
    skillTags: ["RI.5.3", "RI.5.5", "process sequence", "cause and effect", "environmental literacy"],
    pages: [
      {
        pageNumber: 1,
        subheading: "From Bin to Sorting Line",
        paragraphs: [
          `A yoghurt cup does not become a park bench simply because someone drops it into a blue bin. Recycling is a chain of collection, sorting, processing, manufacturing, and buying. The exact rules differ among communities because facilities accept different materials. The most responsible first step is to check the local programme rather than copy a symbol or guess.`,
          `Collection trucks carry accepted paper, metal, glass, and plastic to a material recovery facility. There, machines and workers separate mixed items. Screens may lift flat paper from containers. Magnets pull steel cans from the line, while another device can push aluminium away using an electric current. Optical sorters may identify certain plastics. People also remove objects that machines cannot handle safely.`,
          `Contamination occurs when the recycling stream contains food, liquids, bags, cords, or other items that do not belong. A greasy box can spoil clean paper. A plastic bag can wind around sorting equipment, forcing workers to stop the line. Emptying and lightly rinsing containers when local directions request it helps, but wasting large amounts of hot water would reduce the environmental benefit.`,
          `The triangular arrows on a plastic item identify its resin type; they do not guarantee that every local programme accepts it. A dark tray, foam cup, or tiny lid may be difficult for one facility to sort even if another accepts it. That is why a community's current list matters more than a hopeful toss into the bin.`
        ],
        callout: {
          label: "Sort Smart",
          text: "Check local rules, empty accepted containers, and keep bags or cords out unless your programme specifically collects them.",
        },
      },
      {
        pageNumber: 2,
        subheading: "New Materials Need New Buyers",
        paragraphs: [
          `After sorting, similar materials are gathered into bales or containers and sent to processors. Paper is mixed with water to make pulp, then cleaned and formed into new paper products. Metals are melted and reshaped. Glass can be crushed into small pieces called cullet before it is melted. Plastics are usually sorted by type, cleaned, and made into flakes or pellets for manufacturing.`,
          `Recycling can conserve raw materials and, for some products, use less energy than making items from newly extracted resources. Yet the process still requires transport, machinery, water, and energy. It is not a magic way to erase waste. Reducing unnecessary purchases and reusing durable items often prevent waste before recycling becomes necessary.`,
          `The loop also depends on demand. If factories use recovered material but shoppers never buy the resulting products, the cycle stalls. Recycled-content notebooks, metal cans, cardboard boxes, and some building materials help create a market. Product labels can show the percentage of recovered content, which is different from merely saying that a package might be recyclable.`,
          `Nia tested the system at lunch by making three choices. She carried a reusable bottle, saved an unmarked wrapper for the rubbish bin, and placed her empty accepted can loose in recycling rather than tying it inside a bag. None of these actions looked heroic. Together, however, careful choices reduced contamination and helped useful material continue through the loop. Recycling works best when people understand the whole process, not only the colour of the first bin.`
        ],
        callout: {
          label: "Waste-Wise Order",
          text: "Reduce what you do not need, reuse durable items, and recycle accepted materials correctly.",
        },
      },
    ],
    illustration: illustration(
      39,
      "A labelled loop shows a can travelling from a blue bin through collection, sorting, processing, manufacturing, and a shop shelf.",
      "Recycling succeeds through a connected loop, not a single bin.",
      "recycling-process-loop",
      "#28A96B",
    ),
    vocabulary: [
      word("contamination", "the presence of unwanted material that makes something less clean or usable", ["pollution", "impurity"], "Contamination occurs when the recycling stream contains food, liquids, bags, cords, or other items that do not belong.", "Wrong items can spoil a load."),
      word("conserve", "to protect or use a resource carefully so less is wasted", ["save", "preserve"], "Recycling can conserve raw materials.", "Using recovered metal can save newly mined material."),
      word("processing", "a series of actions that changes a material into a usable form", ["treatment", "preparation"], "Recycling is a chain of collection, sorting, processing, manufacturing, and buying.", "Paper becomes pulp and plastic becomes flakes during this stage."),
    ],
    comprehension: [
      question("l39-q1", "Right There", "Name two ways a sorting facility separates materials.", "Possible answers include screens lifting paper, magnets pulling steel, electric currents separating aluminium, optical sorters identifying plastic, and workers removing unsuitable items.", "The methods are listed in page 1, paragraph 2."),
      question("l39-q2", "Think and Search", "Why can placing an unaccepted item in recycling make the process less effective?", "It can contaminate clean material, damage or stop equipment, require extra labour, and still end up as rubbish after transport.", "The answer combines contamination examples with the description of the sorting line."),
      question("l39-q3", "On My Own", "Which change could your household or classroom make to reduce waste before recycling? Explain why it is practical.", "A strong response proposes a realistic reduction or reuse action, such as refillable bottles or double-sided paper, and explains how it prevents waste.", "This personal application needs a reason but no quotation.", true),
      question("l39-q4", "Think and Search", "How do careful sorting and buying recycled-content products support different parts of the same loop?", "Correct sorting gives processors cleaner material, while buying recycled-content goods creates demand for manufacturers to use that recovered material.", "Page 1 explains sorting; page 2 explains processing and market demand."),
      question("l39-q5", "Author and You", "Why does the author compare recycling with a loop rather than a one-way path?", "A loop shows that recovered material must return as a new product that people buy; putting an item in a bin is only the beginning.", "The reader connects the process stages, market paragraph, and illustration caption."),
    ],
    paragraphTask: paragraphTask(
      39,
      "Create a process paragraph explaining how an accepted metal can moves through the recycling loop.",
      "A correctly prepared metal can passes through several connected stages before becoming a new product.",
      "An accepted metal can begins its recycling journey when...",
      [
        "A person empties the can and places it loose in the correct collection bin.",
        "A truck delivers the materials to a sorting facility.",
        "Equipment separates the can from paper, glass, and plastic.",
        "A processor melts the metal so a manufacturer can shape it into a new product.",
      ],
      [
        "Blue bins are often a different shade from the afternoon sky.",
        "Nia's reusable bottle had a dent near its cap.",
      ],
      "Add a detail explaining how shoppers help complete the loop.",
      "Write a conclusion explaining why correct preparation matters.",
      "Use sequence transitions, change one repeated noun to a clear pronoun, and include processing or contamination.",
      ["processing", "contamination"],
      "An accepted metal can begins its recycling journey when a person empties it and places it loose in the correct bin. Next, a truck delivers it to a facility, where equipment separates it from other materials. After sorting prevents contamination, a processor melts the metal, and a manufacturer shapes it into a new product. Shoppers help complete the loop by choosing goods made with recovered material. Therefore, careful preparation allows the can to remain useful instead of becoming waste.",
    ),
    sourceReferences: [
      { label: "US EPA — Recycling Basics and Benefits", url: "https://www.epa.gov/recycle/recycling-basics-and-benefits" },
      { label: "US EPA — Reduce, Reuse, Recycle", url: "https://www.epa.gov/recycle" },
    ],
  }),
  lesson({
    sequence: 40,
    title: "The Lighthouse Riddle",
    genre: "Coastal mystery",
    informational: false,
    band: "developing",
    objective: "Use patterns and setting details to infer the meaning of a coded message.",
    skillTags: ["RL.5.1", "RL.5.5", "pattern analysis", "setting", "explanatory writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Three Flashes in the Fog",
        paragraphs: [
          `Fog folded around Gull Point lighthouse until the tower seemed to float. Nia and Bark Bolt were visiting keeper Mara when the lamp gave three quick flashes, paused, then flashed once. Its normal pattern was one bright sweep every ten seconds. Mara checked the control panel. The main beacon was working, but someone had switched on a small training lamp in the gallery.`,
          `On the stair below it, they found a card: THREE, ONE, FOUR, ONE, FIVE. FOLLOW THE LIGHT THAT DOES NOT GUIDE SHIPS. Bark Bolt stared through the window, but the harbour was only a grey blur. Mara explained that every working lighthouse has a recognizable light pattern so sailors can identify its location. Changing the main signal could be dangerous, but the training lamp faced inland and could not be mistaken for the navigational light.`,
          `Nia wrote the numbers in a row. They reminded her of the beginning of pi, but there was no mathematics book nearby. Each flash interval pointed across the circular room toward a framed photograph. The first burst lit the third picture, the next lit the first, and so on. Taking the first letter of each caption produced C-A-P-E-S, which was almost a word but did not solve the riddle.`,
          `Bark Bolt sniffed the card and sneezed chalk dust. Behind a chalkboard labelled COASTAL SIGNALS, they found a brass wheel with letters around its edge. When Nia turned the wheel by the flash numbers, the strange letters shifted into S-C-A-P-E. “A scape is a view,” Mara said, “but where is the view when we cannot see?” A bell rang faintly from below.`
        ],
        callout: {
          label: "Signal Clue",
          text: "A lighthouse's main pattern helps vessels identify it; the riddle uses a separate inland-facing training lamp.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A View Made of Sound",
        paragraphs: [
          `The bell rang again: three chimes, then one, four, one, and five. They followed the sound into the map room. Five raised models showed the coastline in different seasons. The third model had spring cliffs, the first showed winter ice, and the fourth showed a summer harbour. Reading the labels in the bell's order spelled C-A-P-E-S again.`,
          `Nia realized they had decoded the right letters in the wrong direction. A sailor approaching from the sea would navigate toward the lighthouse, while they had been moving away from the lamp. She reversed the sequence. The model labels now gave S-E-A-C-H, still one letter short of sense. Bark Bolt placed his paw over the final H. Without it, the word was SEAC. Mara laughed and pointed to a faded caption whose last letter had peeled away: BEACH.`,
          `At the beach model, a tiny drawer opened beneath a painted rock. Inside was a message from Mara's grandfather, the former keeper: WHEN FOG HIDES THE VIEW, USE MORE THAN YOUR EYES. A small key in the drawer opened the tower's old sound-signal exhibit. Mara had planned to reveal it to visitors, but the card had slipped from her grandfather's puzzle box before she understood it.`,
          `The fog lifted near sunset, uncovering the real beach below. Nia summarized the solution: flashes identified a pattern, captions supplied letters, the direction of travel required reversing, and the bell confirmed that sound mattered. Bark Bolt rang the exhibit bell once—after asking permission. The lighthouse had guided them without changing the signal that guided ships. Its riddle showed that careful investigators do not merely collect clues; they consider where each clue belongs.`
        ],
        callout: {
          label: "Riddle Route",
          text: "Pattern → captions → direction → sound exhibit. Each clue corrects or confirms the one before it.",
        },
      },
    ],
    illustration: illustration(
      40,
      "Bark Bolt and Nia stand inside a foggy lighthouse gallery as a safe training lamp illuminates numbered photographs and a brass letter wheel.",
      "A separate training light turns the tower into a riddle without changing its real beacon.",
      "lighthouse-training-lamp-riddle",
      "#16A6A1",
    ),
    vocabulary: [
      word("beacon", "a light or signal used to guide or warn", ["signal", "guiding light"], "The main beacon was working, but someone had switched on a small training lamp.", "A lighthouse is known for this guiding light."),
      word("interval", "the amount of time or space between events", ["gap", "pause"], "Each flash interval pointed across the circular room toward a framed photograph.", "It is the pause between flashes."),
      word("navigate", "to plan or follow a route from one place to another", ["steer", "find a way"], "A sailor approaching from the sea would navigate toward the lighthouse.", "Sailors use signals to do this safely."),
    ],
    comprehension: [
      question("l40-q1", "Right There", "Why was the unusual flashing not dangerous to ships?", "It came from a small training lamp that faced inland, while the main navigational beacon kept its normal pattern.", "Mara explains the two separate lights on page 1."),
      question("l40-q2", "Think and Search", "How did direction change the way Nia interpreted the clues?", "She realized that sailors move toward the light while the investigators had moved away from it, so reversing the sequence brought the letters closer to the intended location, BEACH.", "The answer combines the route on page 1 with Nia's correction on page 2."),
      question("l40-q3", "On My Own", "Would you enjoy a puzzle that requires sight and sound? Explain which kind of clue you would find easier.", "A strong answer gives a preference and explains a personal strategy or strength.", "No passage quotation is required; the reason should relate to multi-sensory clues.", true),
      question("l40-q4", "Think and Search", "What four steps allowed the group to solve the lighthouse riddle?", "They recognized the flash pattern, used captions to gather letters, reversed the direction, and followed the matching bell pattern to the sound exhibit.", "The four steps are summarized in the final paragraph and developed across both pages."),
      question("l40-q5", "Author and You", "Why does the author include Mara's warning about changing a lighthouse signal?", "It makes the setting believable, explains why a separate training lamp is used, and shows that a playful puzzle must not interfere with real safety equipment.", "The reader combines the warning with the later solution."),
    ],
    paragraphTask: paragraphTask(
      40,
      "Write a sequence paragraph explaining how Nia solved the lighthouse riddle.",
      "Nia solved the riddle by testing a linked series of visual, directional, and sound clues.",
      "Nia solved the lighthouse riddle by following several connected clues...",
      [
        "She recorded the training lamp's number pattern.",
        "The pattern pointed to captions that supplied letters.",
        "She reversed the order after considering a sailor's direction of travel.",
        "The matching bell pattern led the group to the sound-signal exhibit.",
      ],
      [
        "The keeper served warm cocoa in blue mugs.",
        "Fog made Bark Bolt's cape feel slightly damp.",
      ],
      "Add a detail explaining how the final message connected sight and sound.",
      "Conclude with a lesson about placing clues in context.",
      "Use precise sequence words, combine two related sentences, and include interval or navigate.",
      ["interval", "navigate"],
      "Nia solved the lighthouse riddle by following several connected clues. First, she recorded each flash interval from the safe training lamp. Next, the pattern pointed to captions that supplied letters. After thinking about how sailors navigate toward a beacon, she reversed the route. Finally, the matching bell pattern led the group to an exhibit and a message about using more than sight. The solution proved that clues become useful when an investigator understands their proper context.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 41,
    title: "The Secret of the Old Bridge",
    genre: "Community mystery",
    informational: false,
    band: "intermediate",
    objective: "Compare evidence from characters with different viewpoints and identify a theme about preserving community history safely.",
    skillTags: ["RL.5.1", "RL.5.2", "point of view", "theme", "evidence comparison"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Marks Beneath the Planks",
        paragraphs: [
          `Maple Creek's oldest footbridge had carried walkers over the river for ninety years. When orange fencing appeared at both ends, Grandad Sol called it an insult to local history. Engineer Priya Shah called it a necessary precaution. Recent floods had battered the wooden supports, and the town needed to know how much load the bridge could still hold.`,
          `Nia and Bark Bolt joined Priya for an inspection from the riverbank. They did not cross the barrier. Through binoculars, Nia saw red triangles painted under several planks and silver discs attached to the side beams. Grandad Sol whispered that someone was secretly marking the bridge for demolition. Priya explained that the triangles identified places to examine, while the discs measured tiny changes in the structure's position.`,
          `One mark puzzled even Priya: a small carved star inside the north railing. A town scrapbook showed the same star in a photograph from 1941, beside bridge builder Ada Mensah. According to the caption, Ada had hidden a “promise to future walkers” somewhere near her mark. Grandad Sol hoped for a box of photographs. Nia wondered whether the secret could help them understand the bridge itself.`,
          `From below, Bark Bolt noticed that one star point aimed toward a dark beam. A camera on a long inspection pole revealed a narrow metal tube strapped safely above the waterline. Priya removed it from the bank side, without stepping onto the closed bridge. Inside was a rolled drawing, dry and clear, showing the original beam pattern and several handwritten repair dates.`
        ],
        callout: {
          label: "Inspection Key",
          text: "Red triangles = inspection locations; silver discs = movement monitors; carved star = historical mark.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Promise, Not a Shortcut",
        paragraphs: [
          `Ada's note said, “Preserve the crossing by caring for it, not by pretending it cannot change.” The old drawing gave Priya useful information about hidden joints, but it did not prove the bridge was safe. Her tests showed that two supports had deteriorated. Grandad Sol's face fell when she recommended replacing them and limiting access during repairs.`,
          `At the town meeting, three viewpoints competed. Some residents wanted a new steel bridge in another location. Others wanted every old board left untouched. Priya proposed a third plan: strengthen the foundation, replace only unsafe pieces, and reuse sound planks in benches beside the crossing. The carved railing and Ada's drawings would be displayed under a weatherproof shelter.`,
          `Nia presented evidence from both the inspection and the scrapbook. She explained that preservation did not mean freezing the bridge in time. Repeated repairs were already part of its history. Grandad Sol then admitted that his favourite “original” handrail had been replaced when he was a child. His memories mattered, but they could not carry the weight of a safety test.`,
          `The council approved Priya's plan. Months later, the reopened bridge looked familiar, though stronger beams hid beneath its deck. A bench made from retired planks faced the carved star. Bark Bolt liked the secret note, but Nia liked its lesson more: history survives when people use evidence to decide what must change and what deserves to remain. Ada's promise had not chosen between safety and memory. It had connected them.`
        ],
        callout: {
          label: "Decision Balance",
          text: "The final plan protects walkers, keeps significant features, and records why repairs were made.",
        },
      },
    ],
    illustration: illustration(
      41,
      "Nia and Bark Bolt examine the old bridge from the safe riverbank while Engineer Priya points to inspection marks and a historic drawing.",
      "Modern inspection evidence and Ada's old plan reveal different parts of the bridge's story.",
      "old-bridge-inspection-history",
      "#A96B4F",
    ),
    vocabulary: [
      word("load", "the weight or force that a structure must support", ["weight", "burden"], "The town needed to know how much load the bridge could still hold.", "People and objects place this force on a bridge."),
      word("deteriorated", "became weaker or worse over time", ["decayed", "weakened"], "Her tests showed that two supports had deteriorated.", "Floodwater and age caused damage."),
      word("preserve", "to protect something so it can continue or be remembered", ["protect", "conserve"], "Preserve the crossing by caring for it, not by pretending it cannot change.", "The plan keeps important history while making repairs."),
    ],
    comprehension: [
      question("l41-q1", "Right There", "What did the red triangles and silver discs actually indicate?", "The triangles marked inspection locations, and the silver discs monitored small movements in the bridge.", "Priya explains both marks on page 1."),
      question("l41-q2", "Think and Search", "How did Ada's drawing help the inspection without proving the bridge was safe?", "It showed hidden joints and repair history, so Priya knew more about the structure, but current tests were still needed to reveal the deteriorated supports.", "The drawing is found on page 1; its value and limit are explained on page 2."),
      question("l41-q3", "On My Own", "When an old community place needs repair, which qualities should decision-makers consider? Explain your priorities.", "A thoughtful response may balance safety, use, cost, memories, design, and historical importance, with reasons for the chosen priorities.", "This judgement draws on personal values and needs relevant reasons.", true),
      question("l41-q4", "Think and Search", "How did Grandad Sol's viewpoint change during the story?", "He first treated any change as damage to history, but the inspection, Ada's note, and his memory of earlier repairs helped him accept careful replacement of unsafe parts.", "His statements at the bridge and town meeting show the change."),
      question("l41-q5", "Author and You", "What theme is expressed by Ada's promise and the final bridge plan?", "The story suggests that responsible preservation combines respect for the past with evidence-based care and necessary change.", "The answer connects the note, the three proposals, and the completed repair."),
    ],
    paragraphTask: paragraphTask(
      41,
      "Write an evidence-based explanation of why Priya's repair plan balanced safety and history.",
      "Priya's plan responded to current safety evidence while protecting meaningful parts of the bridge's history.",
      "Priya's plan created a sensible balance because...",
      [
        "Tests showed that two supports had deteriorated and needed replacement.",
        "The plan strengthened the foundation instead of ignoring the flood damage.",
        "Sound old planks became benches rather than being discarded.",
        "The carved railing and Ada's drawings remained available to visitors.",
      ],
      [
        "Bark Bolt preferred the bench with the widest seat.",
        "The river looked copper-coloured near sunset.",
      ],
      "Add a comparison showing why either extreme proposal was less effective.",
      "Conclude with a principle communities could use for similar decisions.",
      "Use a contrast transition, clarify one pronoun, and include preserve or deteriorated.",
      ["preserve", "deteriorated"],
      "Priya's plan created a sensible balance because it addressed both evidence and memory. Tests showed that two supports had deteriorated, so strengthening the foundation protected walkers. However, she did not erase the bridge's identity: sound planks became benches, and the carved railing and Ada's drawings were preserved. Leaving every board untouched would have ignored danger, while replacing the entire bridge would have removed meaningful history. Communities can honour the past best by caring for it responsibly.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 42,
    title: "Why Ocean Currents Matter",
    genre: "Informational earth science",
    informational: true,
    band: "intermediate",
    objective: "Explain how wind, density, Earth's rotation, and land shape currents and evaluate their effects on climate and ecosystems.",
    skillTags: ["RI.5.2", "RI.5.3", "systems", "cause and effect", "scientific explanation"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Rivers Within the Ocean",
        paragraphs: [
          `Ocean water is always moving. Some movement rolls ashore as waves, while tides raise and lower water levels. Currents are different: they are steady flows of ocean water travelling in particular directions. Together, surface and deep currents redistribute heat, nutrients, living things, and even floating debris around the planet.`,
          `Near the surface, winds push water across the ocean. Earth's rotation bends the paths of large currents, and continents guide the moving water around their coasts. These forces create enormous circular systems called gyres. On a map, a gyre may look like a simple loop, but its speed, width, and temperature vary from place to place.`,
          `The Sun heats Earth unevenly. Tropical ocean water receives more direct solar energy than polar water, so currents can carry warm water toward cooler regions and return cooler water toward the tropics. This transfer affects the air above the sea. Coastal climates may be milder, warmer, cooler, wetter, or foggier partly because of nearby currents, although winds, mountains, and latitude also matter.`,
          `Deep currents begin through differences in density. Cold water is generally denser than warm water, and saltier water is denser than fresher water. In some high-latitude regions, cold, salty water sinks and moves slowly through deep ocean basins. Elsewhere, deep water rises. This connected movement is sometimes described as a global conveyor, but it has many branches rather than one tidy belt.`
        ],
        callout: {
          label: "Current Drivers",
          text: "Surface: wind, rotation, and continents. Deep: density differences connected to temperature and salinity.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Connections to Life and Weather",
        paragraphs: [
          `Where deeper water rises, it can bring nutrients toward sunlit surface waters. Microscopic algae called phytoplankton use those nutrients and become food for many marine animals. Productive fishing areas often occur near upwelling zones. However, changing winds can strengthen or weaken upwelling, altering food supplies for fish, seabirds, and people.`,
          `Currents also transport organisms. Some young sea animals drift with water before settling in new habitats. Sea turtles may use currents during long journeys, while floating seeds can reach distant shores. Movement is not always helpful. Currents can also spread oil, plastic, heat, or harmful organisms, so responders study them when predicting where a spill might travel.`,
          `Scientists measure currents with drifting buoys, instruments anchored in place, research ships, and satellites that observe the ocean surface. A single buoy describes one path, not the whole sea. Researchers combine many measurements with computer models. Their maps support navigation, weather forecasting, search-and-rescue planning, fisheries research, and studies of Earth's changing climate.`,
          `Imagine adding one drop of blue dye to a moving stream. The colour would not remain in a perfect dot, yet its route would reveal the water's motion. Ocean currents operate on a vastly larger scale and interact with many other systems. They matter because the ocean is not a collection of separate puddles. It is a connected body of moving water that links distant places through heat, nutrients, hazards, and life.`
        ],
        callout: {
          label: "Upwelling Link",
          text: "Rising deep water can deliver nutrients to surface ecosystems where sunlight supports phytoplankton growth.",
        },
      },
    ],
    illustration: illustration(
      42,
      "A colourful world-ocean diagram shows warm surface arrows, cold deep arrows, a drifting buoy, and nutrient-rich upwelling near a coast.",
      "Surface and deep currents connect climate, navigation, and ocean food webs.",
      "ocean-current-world-system",
      "#1677B8",
    ),
    vocabulary: [
      word("redistribute", "to move or spread something to different places again", ["reallocate", "rearrange"], "Currents redistribute heat, nutrients, living things, and even floating debris around the planet.", "The ocean shifts materials from one region to another."),
      word("density", "the amount of matter packed into a given space", ["compactness", "concentration"], "Deep currents begin through differences in density.", "Cold or salty water can be more tightly packed."),
      word("upwelling", "the upward movement of deeper water toward the ocean surface", ["rising water", "upward flow"], "Productive fishing areas often occur near upwelling zones.", "This movement can bring nutrients into sunlight."),
    ],
    comprehension: [
      question("l42-q1", "Right There", "What forces help shape large surface currents?", "Winds push surface water, Earth's rotation bends its path, and continents guide it around coasts.", "These forces appear in page 1, paragraph 2."),
      question("l42-q2", "Think and Search", "How can a current affect both coastal weather and a marine food web?", "It can carry warm or cool water that influences air and coastal climate, while upwelling can deliver nutrients that support phytoplankton and the animals that eat them.", "The climate explanation is on page 1, and the food-web explanation begins page 2."),
      question("l42-q3", "On My Own", "Which use of current data seems most important to you—navigation, forecasting, rescue, fisheries, or spill response? Explain.", "A strong response selects one use and justifies it with a clear benefit to people or ecosystems.", "This opinion needs a relevant reason rather than quoted evidence.", true),
      question("l42-q4", "Think and Search", "Why do scientists combine many measurements instead of relying on one drifting buoy?", "One buoy records only its own route, while currents vary across places and depths. Multiple tools and models provide a broader, more reliable picture.", "The passage describes varied current systems on page 1 and measurement methods on page 2."),
      question("l42-q5", "Author and You", "How does the dye-in-a-stream comparison support the author's final message?", "The comparison makes invisible water motion easier to imagine, then helps show that ocean movement connects distant places on a much larger scale.", "The reader interprets the comparison using the article's examples."),
    ],
    paragraphTask: paragraphTask(
      42,
      "Write a cause-and-effect paragraph explaining why upwelling can support a productive ocean food web.",
      "Upwelling moves nutrients into sunlit water, starting effects that spread through a food web.",
      "Upwelling can support a productive food web because...",
      [
        "Deep water can contain nutrients needed by microscopic producers.",
        "Upwelling carries that water toward the sunlit surface.",
        "Phytoplankton use the available nutrients and light to grow.",
        "Many fish and other animals depend directly or indirectly on phytoplankton.",
      ],
      [
        "Research ships often have compact sleeping rooms.",
        "A beach umbrella may turn inside out in strong wind.",
      ],
      "Add a detail explaining how changing winds could affect this chain.",
      "Conclude by connecting moving water with life near the coast.",
      "Use precise cause-and-effect transitions, remove any vague phrase, and include upwelling or redistribute.",
      ["upwelling", "redistribute"],
      "Upwelling can support a productive food web because it lifts nutrient-rich deep water into sunlight. As nutrients become available, phytoplankton grow and feed small ocean animals. Fish and seabirds then depend on those organisms either directly or through other prey. If changing winds weaken upwelling, fewer nutrients may reach the surface and food supplies can shift. Thus, currents redistribute more than water; they help connect deep-ocean nutrients with coastal life.",
    ),
    sourceReferences: [
      { label: "NOAA Ocean Service — What Is a Current?", url: "https://oceanservice.noaa.gov/facts/current.html" },
      { label: "NOAA Ocean Service — Currents", url: "https://oceanservice.noaa.gov/education/tutorial_currents/" },
    ],
  }),
  lesson({
    sequence: 43,
    title: "The Missing Contest Entry",
    genre: "School investigation",
    informational: false,
    band: "intermediate",
    objective: "Compare documentary and digital evidence to reconstruct a sequence and judge a fair solution.",
    skillTags: ["RL.5.1", "RL.5.3", "sequence", "fairness", "evidence-based reasoning"],
    pages: [
      {
        pageNumber: 1,
        subheading: "An Empty Folder",
        paragraphs: [
          `The Young Inventors Contest closed at noon. At 12:05, Hana opened the blue submission folder and found only twenty-three entries. Her water-saving planter was missing. She had placed it on the office counter before assembly, with a signed form and three photographs. Without proof of an on-time submission, the judges could not score it.`,
          `Nia asked everyone to preserve the remaining papers in their current order. The entry log showed Hana's name at 8:34, written by office helper Jay. A security camera covered the hallway but not the counter. Its silent image showed Hana arriving with a large envelope. Ten minutes later, custodian Ms. Alvarez carried a stack of recycling past the office.`,
          `That clue made Jay certain the envelope had been thrown away. Bark Bolt disagreed. The recycling cart in the video had a green handle, while office paper went into a cart with a blue handle. Ms. Alvarez confirmed she was collecting bottles from the breakfast area. An ordinary action looked suspicious only because the team had ignored its context.`,
          `The printer history provided another clue. At 8:39, someone printed “Planter Photos—Hana.” The office printer stood beside the contest folder. Jay remembered that the three warm pages had curled, so he placed them under a heavy attendance binder. He intended to move them after they flattened, but a fire drill interrupted him.`
        ],
        callout: {
          label: "Evidence Timeline",
          text: "8:34 entry logged → 8:39 photos printed → 8:47 fire drill. The missing materials were handled before the deadline.",
        },
      },
      {
        pageNumber: 2,
        subheading: "One Entry in Two Places",
        paragraphs: [
          `Under the binder, Nia found Hana's photographs but not the form. A faint rectangle of blue ink marked the bottom photo. It matched the office's RECEIVED stamp, suggesting the form had rested against the wet mark. Bark Bolt followed a trail of tiny soil grains from the counter to a shelf where late mail was kept.`,
          `There, inside a mailing envelope from the garden club, lay Hana's form. During the fire drill, a gust from the open door had lifted several loose sheets. Someone returning the mail had gathered the form with the garden-club letter because both showed drawings of leaves. No one had deliberately removed the entry; its connected pieces had been separated by a series of reasonable mistakes.`,
          `The contest rules required a complete package by noon. Judge Patel could have rejected Hana's scattered materials. Instead, Nia presented the entry log, printer record, stamp mark, video, and matching soil. Together, they established that all parts had reached the office that morning. The judges accepted the reconstructed submission and wrote a note explaining their decision for every contestant to see.`,
          `Hana did not win first prize. Her planter earned a special award for practical design, while another project collected the most rainwater. She was disappointed for one quiet minute, then pleased that the process had been fair. Jay created a new checklist: log, stamp, clip, and store. Nia added one more step—review. The mystery had shown that a trustworthy contest needs both clear rules and a fair way to examine unusual evidence.`
        ],
        callout: {
          label: "Fair-Process Note",
          text: "The judges documented why several independent clues counted as proof of an on-time entry.",
        },
      },
    ],
    illustration: illustration(
      43,
      "Nia and Bark Bolt arrange an entry log, printed photographs, a stamped form, and a timeline around Hana's planter sketch.",
      "Separate records combine to reconstruct Hana's complete contest entry.",
      "contest-entry-evidence-timeline",
      "#536DFE",
    ),
    vocabulary: [
      word("submission", "something formally given for review, judging, or approval", ["entry", "application"], "Without proof of an on-time submission, the judges could not score it.", "Hana sent her project to a contest."),
      word("context", "the surrounding details that help explain an event or statement", ["circumstances", "background"], "An ordinary action looked suspicious only because the team had ignored its context.", "The cart colour explained where Ms. Alvarez had been."),
      word("reconstructed", "put together again from separate parts or evidence", ["rebuilt", "reassembled"], "The judges accepted the reconstructed submission.", "The team reunited the form and photos."),
    ],
    comprehension: [
      question("l43-q1", "Right There", "What evidence proved that Hana brought an envelope to the office before the deadline?", "The entry log recorded her at 8:34, and hallway video showed her arriving with a large envelope.", "Both facts appear on page 1."),
      question("l43-q2", "Think and Search", "Why was the recycling-cart clue misleading at first?", "Jay assumed Ms. Alvarez collected office paper, but the green handle and her explanation showed that she was collecting breakfast bottles instead.", "The initial suspicion and contextual correction occur in page 1, paragraph 3."),
      question("l43-q3", "On My Own", "Do you think judges should sometimes consider evidence beyond a checklist? Explain your limits for doing so.", "A reasonable answer supports flexibility when evidence is documented and all contestants are treated consistently, or argues for strict rules to protect fairness, with a clear reason.", "This is a judgement question and can have different defensible answers.", true),
      question("l43-q4", "Think and Search", "How did at least three clues combine to prove the complete entry arrived on time?", "The log and video placed Hana at the office, printer history dated the photos, the received-stamp mark linked the form and photos, and matching soil connected the form to her project.", "Evidence comes from both pages and must be synthesized."),
      question("l43-q5", "Author and You", "Why does the author have Hana receive a special award rather than first prize?", "It separates fairness of entry from the contest result. Hana deserved evaluation, but fair treatment did not guarantee that her project would be judged best.", "The reader connects the investigation's purpose with the final outcome."),
    ],
    paragraphTask: paragraphTask(
      43,
      "Write an argument explaining why the judges were fair to accept Hana's reconstructed entry.",
      "Several independent records proved that every part of Hana's entry arrived before noon.",
      "The judges acted fairly when they accepted Hana's entry because...",
      [
        "The signed log and hallway video placed her envelope at the office that morning.",
        "Printer history showed when her project photographs were produced.",
        "A received-stamp mark linked the separated photographs and form.",
        "The judges documented their reasoning so the decision was transparent.",
      ],
      [
        "Hana's planter used a blue water tube.",
        "Judge Patel carried a silver pencil case.",
      ],
      "Add one sentence addressing the concern that the package was incomplete when the folder was checked.",
      "Conclude with a general statement about fair rules and unusual evidence.",
      "Use a transition that acknowledges another viewpoint, improve sentence clarity, and include submission or reconstructed.",
      ["submission", "reconstructed"],
      "The judges acted fairly when they accepted Hana's reconstructed submission because several records proved that it arrived on time. The log and hallway video placed her envelope in the office, while printer history dated her photographs. In addition, the wet stamp mark connected the separated pages. Although the package was no longer clipped together at noon, the evidence explained exactly how it had been divided. Fair rules should be applied consistently while allowing documented facts to correct an unusual mistake.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 44,
    title: "The Eagle on the Roof",
    genre: "Wildlife school story",
    informational: false,
    band: "intermediate",
    objective: "Infer character motivation and explain why responsible wildlife observation requires restraint.",
    skillTags: ["RL.5.1", "RL.5.3", "inference", "character motivation", "responsible action"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Visitor Above the Gym",
        paragraphs: [
          `A dark shape landed above the school gym during morning recess. Students first called it a giant crow, then the bird lifted its white head. An adult bald eagle stood on the roof edge, watching Maple Creek. Phones rose instantly. Bark Bolt lowered his superhero cape and guided everyone beneath the covered walkway, where they could observe without crowding the visitor.`,
          `Mr. Ortiz closed the nearby playground and called a licensed wildlife rehabilitator for advice. The eagle did not appear trapped, yet it remained unusually still. One wing hung slightly lower than the other. Nia used binoculars from inside the library. She recorded the time, posture, weather, and location instead of guessing that the bird was tame or asking someone to chase it into flight.`,
          `A rumour rushed through school that the eagle had built a nest in the air vent. Nia checked from the opposite courtyard. The bundle near the vent contained silver ribbon, twigs, and a torn plastic banner, but no nest shape or eggs. Strong wind had collected litter in a roof corner. The eagle seemed interested in the river beyond the building, not the bundle.`,
          `Rehabilitator Amara Singh arrived with identification and safety equipment. She asked everyone to stay indoors while she observed from the ground. After fifteen minutes, the eagle shifted both wings evenly. Amara noticed its talons gripping a large fish. The lower wing had been balancing the meal, not signalling an injury. Still, she wanted to ensure the bird could leave on its own.`
        ],
        callout: {
          label: "Observe Responsibly",
          text: "Keep a generous distance, record behaviour, control pets, and contact trained adults rather than handling a wild bird.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Space Is a Kind of Help",
        paragraphs: [
          `The eagle began eating. Some students pressed close to the library glass, and the bird snapped its head toward the motion. Nia asked everyone to step back and dim the nearest lights. The eagle relaxed again. Their excitement had become part of the situation; being behind glass did not make their movement invisible.`,
          `Amara explained that wild animals often pause to feed, rest, or assess danger. A long stop does not automatically mean rescue is needed. Yet an animal that cannot fly, bleeds, becomes tangled, or remains in immediate danger does require professional help. Careful observers look for specific evidence and keep themselves safe.`,
          `After finishing the fish, the eagle spread its wings. For one breathless moment, it faced the playground. Then it launched toward the river, powerful and level. No one had touched it, fed it, or forced it to perform. The roof litter remained, so the caretaker later removed it when the area was safe. Students also secured loose decorations before the next windy day.`,
          `The school newspaper did not print “Hero Dog Rescues Eagle,” although Leo suggested it. Nia's headline read: SPACE HELPS WILD VISITOR RETURN TO RIVER. Her article credited Amara's expertise and explained the difference between an observation and a conclusion. Bark Bolt posed beside an empty roof in the illustration. His most useful action had been quiet and difficult to photograph: he helped hundreds of curious people choose patience over interference.`
        ],
        callout: {
          label: "Evidence, Not Assumption",
          text: "A lowered wing looked alarming, but continued observation revealed that the eagle was balancing its food.",
        },
      },
    ],
    illustration: illustration(
      44,
      "A bald eagle holding a fish rests on the gym roof while Nia, Bark Bolt, and classmates watch quietly through distant library windows.",
      "The students help most by giving the wild eagle space.",
      "eagle-roof-responsible-observation",
      "#8C6D3F",
    ),
    vocabulary: [
      word("rehabilitator", "a trained person who helps injured or ill wild animals recover", ["wildlife carer", "rescuer"], "Mr. Ortiz called a licensed wildlife rehabilitator for advice.", "Amara had training to assess the eagle."),
      word("posture", "the way a body is held or positioned", ["stance", "position"], "She recorded the time, posture, weather, and location.", "The wing and body position were observations."),
      word("interference", "action that interrupts or gets in the way of a natural process", ["disruption", "intrusion"], "He helped hundreds of curious people choose patience over interference.", "Crowding or chasing could disturb the bird."),
    ],
    comprehension: [
      question("l44-q1", "Right There", "Why did the eagle's lowered wing turn out not to be an injury sign?", "The eagle was using the wing to balance while gripping a large fish.", "Amara identifies the fish and observes the eagle shift both wings evenly."),
      question("l44-q2", "Think and Search", "How did the students' behaviour affect the eagle even while they were indoors?", "Their movement near the glass made the eagle alert, while stepping back and dimming lights helped it relax.", "The cause and effect appear at the start of page 2."),
      question("l44-q3", "On My Own", "Why can waiting feel difficult when an animal might need help? Explain a safe way to manage that feeling.", "A thoughtful answer may mention worry or excitement and suggest recording details, contacting an expert, and maintaining distance while waiting.", "This personal reflection requires a practical reason, not a quotation.", true),
      question("l44-q4", "Think and Search", "What evidence supported the conclusion that the eagle could leave without rescue?", "It gripped food, shifted both wings evenly, ate calmly when given space, spread its wings, and flew strongly toward the river.", "The evidence develops from Amara's arrival through the launch."),
      question("l44-q5", "Author and You", "Why is the rejected “Hero Dog Rescues Eagle” headline important to the story's message?", "It contrasts a dramatic but false rescue story with the quieter truth that restraint, accurate observation, and expert advice were the responsible actions.", "The reader interprets the headline using Bark Bolt's actual behaviour."),
    ],
    paragraphTask: paragraphTask(
      44,
      "Write an explanatory paragraph showing why giving the eagle space was a responsible response.",
      "Distance allowed accurate observation while reducing stress and danger for the eagle and students.",
      "Giving the eagle space was responsible because...",
      [
        "Crowds and sudden movement could have disturbed a wild bird.",
        "From a distance, Nia recorded specific behaviour instead of guessing.",
        "A trained rehabilitator could assess whether intervention was necessary.",
        "Once the students stepped back, the eagle ate and then flew strongly away.",
      ],
      [
        "The school roof had a grey drainage pipe.",
        "Leo liked headlines printed in very large letters.",
      ],
      "Add one detail distinguishing a true emergency from a normal rest stop.",
      "Conclude with advice for someone who notices a wild animal.",
      "Use a cause-and-effect transition, replace a general adjective with a precise one, and include interference or posture.",
      ["interference", "posture"],
      "Giving the eagle space was responsible because it protected both the bird and the students. Nia could study its posture from a safe distance, and Amara could check for specific signs of injury. When classmates backed away from the glass, the eagle relaxed, ate, and flew strongly toward the river. An animal that is bleeding, tangled, or unable to move may need expert help, but a resting animal may not. Careful observation and professional advice are better than risky interference.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 45,
    title: "The Soundproof Room Mystery",
    genre: "Science mystery",
    informational: false,
    band: "intermediate",
    objective: "Explain how a setting affects sensory evidence and distinguish sound absorption from complete silence.",
    skillTags: ["RL.5.1", "RL.5.5", "setting", "scientific reasoning", "compare and contrast"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Silence Behind the Red Door",
        paragraphs: [
          `The drama club's podcast vanished at 2:17. One moment, voices played through the editing computer; the next, the file was gone and a low thump came from the new soundproof room. Its red door was locked. On the hallway floor, Nia found a foam triangle and a note: “Silence keeps the answer.”`,
          `Bark Bolt pressed one ear to the door. He heard no voices, only another soft thump. The custodian unlocked the room, which was empty except for a microphone, padded walls, and a wooden stool. The computer screen outside still showed the file name, but its sound wave had become a flat line. Leo declared that the room had swallowed the recording.`,
          `Nia knew rooms could not eat files. She clapped inside. The sound ended quickly instead of echoing. Thick panels absorbed much of the reflected sound energy, while a sealed door and insulation reduced sound passing in or out. The room was quieter, not magically silent. She rested her fingertips on the microphone stand and felt a faint vibration each time the building's ventilation fan started.`,
          `The foam triangle matched one missing corner of a wall panel. Behind that loose panel ran a cable to the editing computer. A label read BACKUP AUDIO. When Nia gently moved the cable, the computer found a second recording device hidden behind the wall—not for spying, but for testing how much sound escaped the room.`
        ],
        callout: {
          label: "Sound Clue",
          text: "Soft materials reduce echoes by absorbing sound; sealing gaps and adding insulation reduce transmission between spaces.",
        },
      },
      {
        pageNumber: 2,
        subheading: "The File That Wasn't Gone",
        paragraphs: [
          `Music teacher Mr. Vale arrived carrying a toolbox. He had installed the backup recorder for an approved classroom experiment, but had forgotten to reconnect its loose cable after lunch. The unplugged device repeatedly connected and disconnected, confusing the editing programme. It had not erased the podcast. It had moved the active track to a muted backup channel.`,
          `Nia restored the original channel and the actors' voices returned. The mysterious thumps came from a loose ventilation flap above the ceiling. They had seemed to come from the locked room because vibrations travelled through the shared wall. The setting had changed how everyone interpreted both silence and sound.`,
          `The note belonged to Priyanka, the student sound engineer. “Silence keeps the answer” was a reminder that she had saved a clean section of quiet room tone at the end of the recording. Editors use room tone to smooth awkward gaps. Her foam triangle must have clung to the note with static before falling near the door. The note was useful, just not in the way Leo first imagined.`,
          `The club finished its podcast with two minutes to spare. As a bonus, they added a short segment explaining their investigation. They demonstrated echo with a clap in the hallway and a clap in the treated room, then played the hidden thump. Bark Bolt supplied a whisper: “Quiet places still have stories.” Nia added that good detectives pay attention not only to what they hear, but also to how walls, machines, and expectations shape the sound.`
        ],
        callout: {
          label: "Mystery Map",
          text: "Flat sound wave → muted channel; foam corner → loose panel; repeated thump → vibrating ventilation flap.",
        },
      },
    ],
    illustration: illustration(
      45,
      "Nia touches a vibrating microphone stand while Bark Bolt peers behind a loose acoustic panel in the colourful sound-treated room.",
      "A loose cable and travelling vibrations explain the room's strange silence and thumps.",
      "soundproof-room-cable-vibration",
      "#9B51E0",
    ),
    vocabulary: [
      word("absorbed", "took in energy instead of reflecting or passing it on", ["soaked up", "captured"], "Thick panels absorbed much of the reflected sound energy.", "The panels made claps echo less."),
      word("insulation", "material used to reduce the movement of sound, heat, or electricity", ["barrier", "padding"], "A sealed door and insulation reduced sound passing in or out.", "This material sits within walls."),
      word("vibration", "a rapid back-and-forth movement that can produce or carry sound", ["tremor", "oscillation"], "She felt a faint vibration each time the building's ventilation fan started.", "Nia felt this movement through the stand."),
    ],
    comprehension: [
      question("l45-q1", "Right There", "What actually happened to the podcast track?", "The programme switched the active track to a muted backup channel when the loose recorder cable connected and disconnected.", "Mr. Vale explains the file problem on page 2."),
      question("l45-q2", "Think and Search", "How did the room's construction make two clues confusing?", "Sound-absorbing panels made the room unusually quiet, while vibrations from a ventilation flap travelled through the shared wall and made thumps seem to come from inside.", "Page 1 explains absorption; page 2 explains the travelling thumps."),
      question("l45-q3", "On My Own", "Would complete silence help or distract you while working? Explain what kind of sound environment suits you.", "A strong response states a preference and explains how silence, steady background sound, or another environment affects concentration.", "This is personal and does not require textual evidence.", true),
      question("l45-q4", "Think and Search", "How did the foam triangle lead Nia from the locked room to the computer problem?", "It matched a missing panel corner; behind the panel she found the backup-audio cable, and moving it revealed the connected recorder and muted channel.", "The evidence chain appears at the end of page 1 and start of page 2."),
      question("l45-q5", "Author and You", "Why does the author make the note truthful but easy to misunderstand?", "The note really referred to saved room tone, but its mysterious wording encouraged a false interpretation. This reinforces the idea that clues need context.", "The reader compares the first interpretation with Priyanka's explanation."),
    ],
    paragraphTask: paragraphTask(
      45,
      "Write a compare-and-contrast paragraph explaining the hallway and sound-treated room.",
      "The two spaces changed sound differently because their surfaces and barriers were different.",
      "The hallway and sound-treated room affected sound in different ways...",
      [
        "Hard hallway surfaces reflected a clap and created a noticeable echo.",
        "Soft room panels absorbed reflected sound so a clap ended quickly.",
        "The sealed door and wall insulation reduced sound passing between spaces.",
        "Vibration could still travel through shared building materials.",
      ],
      [
        "The editing computer displayed a blue sound wave.",
        "Bark Bolt whispered his final line dramatically.",
      ],
      "Add a detail correcting the idea that the treated room was completely silent.",
      "Conclude by explaining why setting matters when interpreting sound evidence.",
      "Use both a comparison and a contrast transition, vary sentence openings, and include absorbed or vibration.",
      ["absorbed", "vibration"],
      "The hallway and sound-treated room affected sound in different ways. In the hallway, hard surfaces reflected a clap and produced an echo. By contrast, soft panels absorbed much of the reflected energy, so the room's clap ended quickly. The sealed door and insulation also reduced transmission, although vibration still travelled through the shared wall. Therefore, the room was quieter but not completely silent, and investigators needed to consider the setting before deciding where a sound began.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 46,
    title: "Inside an Ant Colony",
    genre: "Informational life science",
    informational: true,
    band: "intermediate",
    objective: "Describe how ant roles, communication, and nest organization help a colony function as a system.",
    skillTags: ["RI.5.2", "RI.5.3", "animal systems", "main idea", "explanatory writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "One Nest, Many Jobs",
        paragraphs: [
          `An ant crossing a pavement may seem like a tiny traveller working alone. Follow it carefully, without disturbing it, and the ant may lead toward a colony with hundreds or thousands of members. A colony functions through cooperation. No ant carries a miniature plan, yet many individual actions combine to gather food, protect young, maintain the nest, and respond to danger.`,
          `Most visible ants are female workers. Depending on their species and age, workers may care for eggs and larvae, clean chambers, search for food, defend entrances, or move waste away from the nest. A queen's main role is to lay eggs. Winged males and young queens appear at certain times for reproduction. Species differ, so not every colony has the same size, shape, or schedule.`,
          `Ants communicate mainly through chemicals. A pheromone is a chemical signal released by one ant and detected by others of the same species. A forager that finds food may leave a trail pheromone on its return. Other workers follow and strengthen a useful trail. When food disappears, the chemical gradually fades, so fewer ants continue along an empty route.`,
          `Touch and vibration can also carry information. Ants tap one another with antennae, which sense chemicals and physical contact. Some species create vibrations by moving body parts or striking the ground. Signals can recruit helpers, warn of danger, or help colony members recognize one another. The exact message depends on the species and situation.`
        ],
        callout: {
          label: "Colony Roles",
          text: "Queen: lays eggs. Workers: perform many nest tasks. Males and young queens: take part in reproduction.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Living Network Underground",
        paragraphs: [
          `Many nests contain connected chambers and tunnels. Young ants may be kept where temperature and moisture suit their growth. Food, waste, and resting workers can occupy other areas. Ants move soil one grain at a time, and the resulting nest can improve air and water movement through the ground. However, nest designs vary widely, from soil mounds to spaces inside wood or plants.`,
          `The colony must solve changing problems. If a path is blocked, scouts explore alternatives. Many may wander at first, but shorter successful routes receive more pheromone traffic and can become common. This behaviour does not mean the ants discussed a map. A useful group pattern emerged from repeated choices by individuals responding to local signals.`,
          `Colonies also interact with other living things. Ants eat seeds, insects, nectar, fungi, or other foods, depending on the species. Some disperse seeds. Others protect plant-feeding insects in exchange for sugary liquid, which can harm garden plants. Ants themselves become food for birds, reptiles, mammals, and other insects. Their effects can be helpful, harmful, or both in different settings.`,
          `Scientists study colonies with careful observations, marked trails, transparent laboratory nests, and harmless sensors. A single ant cannot explain the entire system. Researchers compare many ants over time to learn how simple signals produce organized activity. The next time an ant crosses a path, imagine the invisible network around it: chemical messages, changing jobs, branching tunnels, and thousands of small decisions supporting one cooperative colony.`
        ],
        callout: {
          label: "System Idea",
          text: "Organized colony behaviour can emerge from many ants responding to nearby signals rather than one leader directing every action.",
        },
      },
    ],
    illustration: illustration(
      46,
      "A cutaway ant nest shows a queen chamber, nursery, workers, food area, waste chamber, tunnels, and a pheromone trail above ground.",
      "Different roles and signals connect the above-ground trail with the underground colony.",
      "ant-colony-cutaway-network",
      "#C96B2C",
    ),
    vocabulary: [
      word("colony", "a group of the same kind of organisms living and working together", ["community", "settlement"], "A colony functions through cooperation.", "The ants share a nest system."),
      word("pheromone", "a chemical signal that affects other members of the same species", ["chemical signal", "scent message"], "A pheromone is a chemical signal released by one ant and detected by others.", "Foragers can leave this invisible trail."),
      word("cooperation", "the act of working together toward a shared result", ["teamwork", "collaboration"], "A colony functions through cooperation.", "Many small actions support the whole nest."),
    ],
    comprehension: [
      question("l46-q1", "Right There", "What are three jobs that worker ants may perform?", "Possible answers include caring for young, cleaning chambers, finding food, guarding entrances, and moving waste.", "Worker roles are listed in page 1, paragraph 2."),
      question("l46-q2", "Think and Search", "How can a food trail become strong and then fade without a leader directing it?", "A successful forager leaves pheromone, others follow and add more, but when food disappears the chemical is no longer reinforced and gradually fades.", "The signalling explanation appears in page 1 and the route pattern is expanded on page 2."),
      question("l46-q3", "On My Own", "What human team activity also depends on people doing different jobs? Explain one useful comparison and one difference.", "A strong response names a team, explains how roles support a shared goal, and notes a difference such as human planning or spoken language.", "This connection uses the reader's experience and a reasoned comparison.", true),
      question("l46-q4", "Think and Search", "How do nest structure and communication both support young ants?", "Suitable chambers provide proper conditions, while chemical, touch, and vibration signals coordinate workers who feed, move, and protect eggs and larvae.", "The nursery information is on page 2; worker roles and communication are on page 1."),
      question("l46-q5", "Author and You", "Why does the author warn against describing every ant interaction as helpful or harmful?", "Ant species and settings differ, and the same colony may disperse seeds while also protecting insects that damage a garden. Effects depend on context.", "The reader uses the varied examples on page 2."),
    ],
    paragraphTask: paragraphTask(
      46,
      "Write a systems paragraph explaining how pheromone trails help a colony respond to food.",
      "Pheromone trails allow individual choices to create an organized group response.",
      "A pheromone trail helps an ant colony find food because...",
      [
        "A successful forager deposits a chemical signal while returning to the nest.",
        "Other workers detect the signal and follow the route.",
        "Workers that also find food reinforce the useful trail.",
        "When the food is gone, the signal fades and fewer ants follow it.",
      ],
      [
        "Some ant nests have soil piled around their entrances.",
        "A magnifying lens can have a black handle.",
      ],
      "Add a detail explaining why this pattern does not require one ant to command the others.",
      "Conclude by connecting individual signals with cooperation.",
      "Use cause-and-effect transitions, improve one repeated verb, and include pheromone or colony.",
      ["pheromone", "colony"],
      "A pheromone trail helps an ant colony find food because it turns one discovery into shared information. A successful forager deposits a chemical signal, so other workers follow the route. When they also reach food, they reinforce the trail and recruit more ants. No commander chooses the path; each worker responds to a nearby signal. After the food disappears, the pheromone fades and traffic decreases. This flexible cooperation allows many individual ants to create an organized response.",
    ),
    sourceReferences: [
      { label: "USDA Forest Service — Ants", url: "https://www.fs.usda.gov/wildflowers/pollinators/animals/ants.shtml" },
      { label: "Smithsonian National Museum of Natural History — Ants", url: "https://naturalhistory.si.edu/education/teaching-resources/anthropology-and-social-studies/ants" },
    ],
  }),
  lesson({
    sequence: 47,
    title: "The Case of the Double Signature",
    genre: "Document mystery",
    informational: false,
    band: "intermediate",
    objective: "Evaluate document evidence and explain why intent and authorization matter when two signatures appear alike.",
    skillTags: ["RL.5.1", "RL.5.3", "evidence evaluation", "ethics", "argument writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Two Names, One Line",
        paragraphs: [
          `Two permission letters appeared on Principal Pine's desk. Both approved the gym for Saturday, both carried her signature, and both promised the same time to different groups. The robotics team expected a tournament. The dance club expected a rehearsal. When Nia placed the papers together, the signatures matched so perfectly that even the dots of ink occupied identical positions.`,
          `Principal Pine recognized the signature on the robotics letter. It came from an authorized digital stamp used after she approved a standard booking. She had never seen the dance letter. At first, Bark Bolt suspected forgery, but Nia noted that copying a signature and inventing an entire request were different claims. They needed to trace each document's path.`,
          `The robotics letter had a booking number, date, and email receipt. The dance letter had no number and listed “Pineapple Principal” in its hidden file information. Its printed signature was slightly fuzzy around the edges, as if copied from a photograph. Yet dance captain Marisol insisted she had received the letter from the activities committee, not created it.`,
          `Committee member Dev admitted making a sample flyer for a design lesson. He had photographed the real robotics letter, replaced its text with imaginary dance details, and changed the principal's name to a joke inside the file. He printed one copy to check the colours, then left it on the library printer. Someone had placed that sheet in the dance-club mailbox, assuming it was official.`
        ],
        callout: {
          label: "Document Check",
          text: "Authorization depends on approval, records, and purpose—not only on whether a signature looks familiar.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Copy Without Permission",
        paragraphs: [
          `Dev had not intended to reserve the gym, but he had copied a real signature without permission and made the practice page look official. Principal Pine explained that intent affected how they responded, not whether the choice was acceptable. A realistic sample should use a clearly invented name, a SAMPLE label, and no personal signature.`,
          `The dance club had already hired a pianist. Instead of blaming Marisol, the two groups compared their needs. Robots required the marked gym floor and safety barriers. Dancers needed a smooth surface and piano. The community hall had a piano and was free on Saturday. The school helped move the rehearsal there, while the verified robotics booking remained in the gym.`,
          `Dev wrote an accurate correction, collected the mistaken copies, and apologized to both groups. The activities committee added a verification link to future letters. Anyone could type a booking number and confirm the date, room, and approving office without seeing private information. Principal Pine also limited access to the digital signature file.`,
          `Nia kept photocopies with the signatures covered. One was an authorized document; the other was a classroom sample mistaken for one. Their matching names had concealed different histories. Bark Bolt wrote the case rule in bold: “A signature is evidence only when its source and permission are known.” The mystery ended without a villain, but not without responsibility. Careless copying had real consequences, and careful records helped repair them.`
        ],
        callout: {
          label: "Verification Trail",
          text: "Booking number + dated receipt + approving office = stronger evidence than an image of a signature alone.",
        },
      },
    ],
    illustration: illustration(
      47,
      "Nia compares two nearly identical signatures under a document camera while Bark Bolt points to the verified booking number.",
      "Matching signatures hide two very different document histories.",
      "double-signature-document-check",
      "#3F51B5",
    ),
    vocabulary: [
      word("authorized", "officially permitted or approved", ["approved", "permitted"], "It came from an authorized digital stamp.", "Principal Pine had approved its use."),
      word("verification", "the process of checking that something is true or valid", ["confirmation", "validation"], "The activities committee added a verification link to future letters.", "The booking number could be checked."),
      word("concealed", "kept something hidden or prevented it from being noticed", ["hid", "covered"], "Their matching names had concealed different histories.", "The identical look distracted from the documents' origins."),
    ],
    comprehension: [
      question("l47-q1", "Right There", "What records supported the robotics team's booking?", "Its letter had a booking number, date, email receipt, and approved digital signature.", "The records are described in page 1, paragraph 3."),
      question("l47-q2", "Think and Search", "Why was the dance letter not authorized even though Dev did not mean to book the gym?", "He copied the signature without permission, the document lacked a booking record, and no approving office had accepted it. His intent did not create authorization.", "The document clues are on page 1, and Principal Pine explains intent on page 2."),
      question("l47-q3", "On My Own", "What responsibility should someone have when creating a realistic sample document? Explain.", "A strong answer recommends clear SAMPLE labels, invented names, removal of signatures, secure handling, or checking with an adult, with reasons.", "This application requires practical reasoning rather than a quotation.", true),
      question("l47-q4", "Think and Search", "How did the solution address both the immediate conflict and future risks?", "The dance rehearsal moved to a suitable hall while robotics kept the verified gym booking; Dev corrected the error, and the school added verification links and restricted signature access.", "The answer draws from paragraphs 2 and 3 on page 2."),
      question("l47-q5", "Author and You", "Why does the author say the case ended without a villain but not without responsibility?", "Dev made a careless mistake rather than planning harm, yet his action caused real problems. The statement separates harmful intent from accountability for consequences.", "The reader considers Dev's explanation, apology, and corrective actions."),
    ],
    paragraphTask: paragraphTask(
      47,
      "Write an argument explaining why a booking number and approval record are stronger evidence than a signature image alone.",
      "A verifiable record connects a signature to an actual approved action and traceable source.",
      "A signature image alone is weak evidence because...",
      [
        "An image can be copied from another document without permission.",
        "The dance letter's identical signature came from a classroom sample.",
        "The robotics booking had a unique number and dated receipt.",
        "A verification system could confirm the room, time, and approving office.",
      ],
      [
        "The dance club's pianist owned a folding music stand.",
        "Bark Bolt used a thick blue marker for the case rule.",
      ],
      "Add a sentence explaining how authorization differs from appearance.",
      "Conclude with advice for checking an official-looking document.",
      "Use evidence transitions, revise one sentence for concision, and include authorized or verification.",
      ["authorized", "verification"],
      "A signature image alone is weak evidence because it can be copied without permission. The dance letter looked official, but it came from a sample and had no approval record. In contrast, the robotics letter had a unique number and dated receipt that connected it to an authorized booking. A verification link could also confirm the room and time. Therefore, readers should check a document's source and records instead of trusting its appearance alone.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 48,
    title: "The Science Fair Mix-Up",
    genre: "School science mystery",
    informational: false,
    band: "intermediate",
    objective: "Compare experimental records to identify a variable mix-up and explain how fair tests depend on accurate labels.",
    skillTags: ["RL.5.1", "RI.5.3", "scientific method", "compare evidence", "procedural writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Plants That Broke the Graph",
        paragraphs: [
          `At the science fair, Imani's display claimed that bean plants grew tallest under blue light. Her graph showed a clear result, but the plants on the table seemed to disagree. The red-light group towered above the blue-light group. A judge paused with her clipboard. Imani looked as though the floor had tilted beneath her.`,
          `Nia asked what had remained constant. Imani had used the same seed type, soil amount, pot size, water schedule, and growing time. Light colour was the variable she intentionally changed. Each group contained five plants, which helped reduce the effect of one unusual seed. Her dated notebook listed daily heights and matched the graph exactly.`,
          `Bark Bolt sniffed the labels but wisely did not touch the soil. The blue card beside the short plants had a square hole from a thumbtack. In Imani's setup photographs, that square-holed card stood beside the tall group. The labels had been switched after the final measurement. The recorded results might still be sound, but the display no longer represented them accurately.`,
          `Across the aisle, Mateo discovered that his temperature experiment had also changed. His silver cup was labelled INSULATED, although his notebook showed that the insulated cup was red. Both projects had passed through the same preparation room, where volunteers replaced damp labels during a leaking-pipe cleanup. The mix-up involved display cards, not the experiments themselves.`
        ],
        callout: {
          label: "Fair-Test Checklist",
          text: "Change one planned variable, keep other conditions consistent, test several samples, and record results before display day.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Records Before Ribbons",
        paragraphs: [
          `The judges could not simply swap every coloured card based on memory. Nia and Imani compared photographs, notebook measurements, plant heights, and tiny pot numbers. All four sources agreed: the tall plants were group B, which had received blue light. The red card now beside them belonged to group R. They restored the labels and attached copies of the dated photographs.`,
          `Mateo's case required a different check. His cup colours were less important than the starting and ending temperatures recorded beside cup numbers. The insulated cup had lost less heat over thirty minutes. He relabelled it using the number etched underneath, then revised his conclusion to avoid saying insulation “keeps liquids hot forever.” It only slowed heat transfer during his test.`,
          `Judge Salazar praised both students for reporting the disruption instead of quietly hiding it. She explained that science is not a performance in which every object must look perfect. It is a process in which methods, observations, and conclusions can be examined. Reliable records allowed the students to correct a display error without inventing new results.`,
          `Imani's project earned a ribbon for clear experimental design. Mateo received one for careful revision. The preparation team adopted waterproof labels with project numbers and asked students to verify displays after any emergency move. Bark Bolt posed beneath a new sign: DO NOT LET THE COLOUR CARD BECOME THE CONCLUSION. Everyone laughed, but Nia underlined the serious idea. Evidence belongs to a documented process, not to whichever label happens to be nearest.`
        ],
        callout: {
          label: "Evidence Chain",
          text: "Notebook + photographs + pot or cup numbers + measurements can confirm which label belongs where.",
        },
      },
    ],
    illustration: illustration(
      48,
      "Nia, Imani, and Bark Bolt compare coloured plant labels with dated notebook pages and numbered pots at the science fair.",
      "Multiple records reveal that the display labels—not the experiment—were mixed up.",
      "science-fair-label-mixup",
      "#25A18E",
    ),
    vocabulary: [
      word("variable", "a factor that can change in an investigation", ["factor", "condition"], "Light colour was the variable she intentionally changed.", "Imani compared blue and red light."),
      word("constant", "a condition kept the same during a fair comparison", ["fixed factor", "unchanged condition"], "Nia asked what had remained constant.", "The pot size and water schedule did not change."),
      word("reliable", "consistently trustworthy or supported by careful evidence", ["dependable", "trustworthy"], "Reliable records allowed the students to correct a display error.", "Several dated sources agreed."),
    ],
    comprehension: [
      question("l48-q1", "Right There", "Which variable did Imani change, and name two conditions she kept constant?", "She changed light colour. Constants included seed type, soil amount, pot size, water schedule, and growing time.", "These details are listed on page 1, paragraph 2."),
      question("l48-q2", "Think and Search", "How did investigators determine that the labels, rather than the plants or data, had been mixed up?", "The notebook matched the graph, the square-holed card appeared beside a different group in photographs, and pot numbers and heights confirmed the original grouping.", "Evidence comes from page 1's first clues and page 2's comparison."),
      question("l48-q3", "On My Own", "If you discovered an error in a project just before judging, what would you do first and why?", "A strong response proposes preserving records, telling an adult or judge, checking the evidence, and correcting the error openly.", "The answer applies a personal plan and gives a reason.", true),
      question("l48-q4", "Think and Search", "How were Imani's and Mateo's mix-ups similar, and how did their corrections differ?", "Both had replacement labels switched during cleanup. Imani used plant photographs and pot groups, while Mateo relied on etched cup numbers and temperature records; he also narrowed an overbroad conclusion.", "The two projects are compared across both pages."),
      question("l48-q5", "Author and You", "What does the sign about not letting a colour card become the conclusion mean?", "It means conclusions should come from documented measurements and methods, not from a nearby label or a display's appearance.", "The reader interprets the joke using the entire investigation."),
    ],
    paragraphTask: paragraphTask(
      48,
      "Write an explanatory paragraph showing why Imani's original experiment remained trustworthy after the display mix-up.",
      "The experimental process was documented before the labels were accidentally switched.",
      "Imani's experiment remained trustworthy because...",
      [
        "She changed only the planned light-colour variable while keeping key conditions constant.",
        "Five plants in each group reduced the influence of one unusual seed.",
        "Her dated notebook measurements matched the graph.",
        "Photographs and pot numbers identified which plants belonged to each group.",
      ],
      [
        "Mateo's silver cup reflected the gym lights.",
        "The judge's clipboard had a metal clip at the top.",
      ],
      "Add a sentence acknowledging the display error and explaining its limit.",
      "Conclude with what makes a science result reliable.",
      "Use an acknowledging transition such as although, correct a vague pronoun, and include variable or reliable.",
      ["variable", "reliable"],
      "Imani's experiment remained trustworthy because she documented a fair process. She changed the light-colour variable while keeping soil, water, pot size, and growing time constant. Five plants per group and dated measurements made the graph more reliable. Although volunteers switched the display labels, photographs and pot numbers revealed the error without changing the recorded results. A science conclusion earns trust through clear methods and evidence, not through a flawless display.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 49,
    title: "The Message in the Meteorite",
    genre: "Museum mystery",
    informational: false,
    band: "intermediate",
    objective: "Separate evidence about an object from assumptions and explain how a staged clue can still communicate a meaningful message.",
    skillTags: ["RL.5.1", "RL.5.3", "inference", "source context", "theme"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Marks from Space?",
        paragraphs: [
          `The Maple Creek museum unveiled a fist-sized meteorite on Friday. By Saturday morning, silver lines on its surface seemed to spell LOOK UP. Visitors crowded the case, whispering about a message from space. Curator Dr. Okafor immediately closed the gallery. Meteorites are natural rocks, and a neat English command required a much more ordinary explanation.`,
          `The stone itself had not been scratched. The words appeared only when a lamp shone from the left. Nia examined the case from outside its barrier and noticed five clear strips stuck to the glass. Each strip bent light across grooves in the meteorite, arranging bright reflections into letter shapes. Someone had turned natural texture into an optical puzzle.`,
          `Security records showed that the display case had remained locked. Three people had entered the gallery after closing: Dr. Okafor, electrician Jo Bell, and student volunteer Amir. Jo had adjusted the lamp. Amir had cleaned the outside glass. Dr. Okafor had placed a card describing how the meteorite formed. Any of them could have positioned the transparent strips without touching the rock.`,
          `Bark Bolt found a crescent of adhesive backing in the recycling. Printed on it was the logo of the museum's planetarium. Amir admitted borrowing removable tape there, but he asked Nia to watch the message again. As the lamp slowly moved on its programmed track, LOOK UP disappeared and a second pattern formed: AT NINE.`
        ],
        callout: {
          label: "Object Check",
          text: "The meteorite remained unchanged; removable strips on the case redirected light across its natural grooves.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Message About the Sky",
        paragraphs: [
          `At nine that evening, the museum had scheduled a public sky watch for a meteor shower. Registration was low because the event poster had been hidden behind construction fencing. Amir created the light message to attract attention. He had avoided damaging the meteorite and planned to reveal the trick before the gallery opened, but his bus arrived late.`,
          `Dr. Okafor appreciated Amir's goal and disliked his method. Visitors had been led to believe the message came from the meteorite. Even a harmless illusion could spread false information once photographs travelled online. Amir apologized and helped remove the strips. The silver words vanished, leaving the rock's dark, irregular surface exactly as it had been.`,
          `They replaced the trick with an honest demonstration. A labelled diagram showed how angled light and transparent strips had created the letters. Beside it, Amir posted an invitation: MAKE A LIGHT MESSAGE, THEN JOIN TONIGHT'S SKY WATCH. Visitors could experiment with a replica rock while the protected meteorite remained the subject of accurate information.`,
          `Clouds covered the first half of the evening, but at 9:42 a bright meteor streaked above the roof. Everyone looked up—not because a space rock had spoken, but because someone had transformed a mistake into a transparent lesson. Nia wrote that the most important source of a message is sometimes its method. Bark Bolt added that the real sky needed no spelling. It offered one quick silver line, and the crowd understood the invitation.`
        ],
        callout: {
          label: "Claim and Cause",
          text: "Claim: the meteorite carried words. Evidence-based cause: outside strips and a moving lamp created reflected patterns.",
        },
      },
    ],
    illustration: illustration(
      49,
      "Nia and Bark Bolt watch silver letters appear across a meteorite display as a moving lamp shines through clear strips on the case.",
      "The message comes from redirected light, not writing on the meteorite.",
      "meteorite-light-message",
      "#5D5FEF",
    ),
    vocabulary: [
      word("optical", "related to sight, light, or vision", ["visual", "light-based"], "Someone had turned natural texture into an optical puzzle.", "The effect depended on reflected light."),
      word("irregular", "not even, smooth, or following a regular pattern", ["uneven", "unequal"], "The rock's dark, irregular surface remained exactly as it had been.", "Meteorite grooves were not neat letters."),
      word("transparent", "able to be seen through; also open and honest about how something works", ["clear", "open"], "Someone had positioned the transparent strips without touching the rock.", "The strips were clear, and the later explanation was honest."),
    ],
    comprehension: [
      question("l49-q1", "Right There", "What objects created the words on the meteorite display?", "Clear removable strips on the case and a moving lamp redirected light across the meteorite's grooves.", "The mechanism is explained on page 1."),
      question("l49-q2", "Think and Search", "Why did Dr. Okafor object even though Amir protected the meteorite and had a helpful goal?", "He allowed visitors to form a false belief, and images of the illusion could spread misinformation before he explained it.", "Amir's care appears across both pages; Dr. Okafor's concern appears on page 2."),
      question("l49-q3", "On My Own", "When is an illusion entertaining rather than misleading? Explain a rule you would use.", "A thoughtful answer may require labels, consent, timely explanation, or a setting where people expect a trick, with a reason.", "This opinion question needs a defensible principle rather than a quotation.", true),
      question("l49-q4", "Think and Search", "How did the museum turn the misleading display into an accurate learning experience?", "They removed the secret strips, labelled a diagram of the method, offered a replica for experiments, protected the real meteorite, and gave an honest sky-watch invitation.", "These changes are described in page 2, paragraphs 2 and 3."),
      question("l49-q5", "Author and You", "What two meanings does transparent have in the story, and why are both important?", "It describes the clear strips and also the museum's open explanation. Seeing through the material created the trick; seeing through the method restored trust.", "The vocabulary use on both pages supports this double meaning."),
    ],
    paragraphTask: paragraphTask(
      49,
      "Write a comparison paragraph explaining why the revised demonstration was better than Amir's secret message.",
      "The revised activity kept the wonder of the light effect while presenting accurate information openly.",
      "The revised light demonstration was more effective because...",
      [
        "A diagram clearly identified the strips, lamp, and reflected patterns.",
        "Visitors could experiment safely with a replica instead of the protected meteorite.",
        "The invitation accurately connected the activity to the sky watch.",
        "The open explanation prevented visitors from believing that the rock contained English words.",
      ],
      [
        "The construction fence was made from green mesh.",
        "Bark Bolt saw one meteor at 9:42.",
      ],
      "Add a sentence acknowledging what was appealing about Amir's original idea.",
      "Conclude by explaining how openness can support wonder rather than spoil it.",
      "Use a contrast transition, improve one weak adjective, and include optical or transparent.",
      ["optical", "transparent"],
      "The revised light demonstration was more effective because it combined wonder with accuracy. Amir's secret optical message was surprising, but it encouraged a false belief about the meteorite. In contrast, the labelled diagram made the method transparent, and a replica let visitors test the effect safely. The honest invitation also connected the activity to the real sky watch. Explaining how an effect works does not remove its wonder; it gives curious visitors a stronger reason to explore.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 50,
    title: "The Carnival Code",
    genre: "Festival puzzle adventure",
    informational: false,
    band: "intermediate",
    objective: "Interpret a multi-part code by combining symbols, coordinates, and repeated patterns.",
    skillTags: ["RL.5.1", "RL.5.5", "pattern reasoning", "sequence", "collaborative problem solving"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Tickets That Did Not Match",
        paragraphs: [
          `At the Maple Creek carnival, the prize booth received six tickets printed with stars instead of numbers. Each star had a colour and a tiny arrow. The booth manager feared the ticket machine had broken, but Nia noticed that the arrows pointed in different directions. On the back of every ticket was the same line: “Begin where music meets water.”`,
          `Music came from the bandstand, and water sparkled in the fountain. Where the two paths met, Bark Bolt found a painted grid on the pavement. Letters ran across the top and numbers down the side. The first ticket showed a blue star, arrow right, and the coordinate C2. At C2, a blue tile contained the letter S.`,
          `The remaining coordinates produced A-F-E-T-Y, spelling SAFETY. That was useful but incomplete. Nia arranged the tickets by arrow direction: up, right, down, left, then repeated. In that order, tiny letters along their edges read CHECK GATE FOUR. The code was not a request for a prize; it was a message for the carnival team.`,
          `Gate Four appeared closed, but its latch had not caught. A gust could push it toward the bicycle lane outside. Bark Bolt stood guard while an adult secured it. Tied to the fence was a yellow card: “Good start. Now find the quietest roar.” The carnival contained roaring speakers, a dinosaur game, and excited crowds. Nia suspected “quietest roar” described an image rather than a sound.`
        ],
        callout: {
          label: "Code Layers",
          text: "Coordinates reveal one message; arrow order reveals another. Both are needed before acting.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Puzzle with a Practical Prize",
        paragraphs: [
          `They found a painted lion on the silent carousel. Beneath its open mouth, four paw prints formed another grid. The secured gate's number—four—told them which print to press. A drawer opened with a checklist: clear exits, covered cables, filled water station, attached signs, and tested radios. Every item had a box except ATTACHED SIGNS.`,
          `Near the food tents, one emergency-exit sign flapped from a single corner. An adult volunteer fastened it securely. The sign had been visible from one direction but folded backward from the other. Nia now understood the code's purpose because she had interpreted each clue in its setting. Safety captain Ms. Ruiz had designed a final inspection as a carnival puzzle, hoping student volunteers would examine places from more than one angle.`,
          `Ms. Ruiz apologized for mixing coded tickets with the real prize batch. The accidental delivery had made the puzzle confusing, but the safety issues were genuine practice examples, not dangerous traps. Adults had monitored each location. She invited Nia and Bark Bolt to complete the checklist and explain every clue to the volunteer team.`,
          `Their prize was a brass token labelled SHARPEST EYES, plus two ordinary ride tickets. Nia valued the token because the code had led to useful actions, not because it proved she was clever. Coordinates, sequence, symbols, and setting had each supplied part of the meaning. As the carousel turned, its painted lion roared silently past. Bark Bolt waved from a striped horse and announced that even detectives occasionally solve a case by going in circles.`
        ],
        callout: {
          label: "Final Checklist",
          text: "A code is solved only when its message is interpreted, checked in context, and used responsibly.",
        },
      },
    ],
    illustration: illustration(
      50,
      "Nia and Bark Bolt arrange star tickets over a carnival coordinate grid while a silent carousel lion points toward a safety checklist.",
      "Colour, arrows, coordinates, and setting combine to reveal the carnival code.",
      "carnival-coordinate-code",
      "#F05A7E",
    ),
    vocabulary: [
      word("coordinate", "a letter, number, or set of values used to locate a point", ["position", "grid reference"], "The first ticket showed the coordinate C2.", "C2 identified one square on the grid."),
      word("sequence", "an ordered arrangement of events or items", ["order", "series"], "Coordinates, sequence, symbols, and setting had each supplied part of the meaning.", "The arrows showed which ticket came next."),
      word("interpreted", "explained or understood the meaning of something", ["decoded", "understood"], "A code is solved only when its message is interpreted.", "Finding letters is not enough; the message must make sense."),
    ],
    comprehension: [
      question("l50-q1", "Right There", "What two messages did the first set of tickets reveal?", "The coordinates spelled SAFETY, and arranging tickets by arrow direction revealed CHECK GATE FOUR.", "Both messages are stated on page 1."),
      question("l50-q2", "Think and Search", "Why did Nia search for a picture when the clue said “quietest roar”?", "Real roars and speakers were loud, so she inferred that a silent image of a roaring animal fit the contradiction; the carousel lion confirmed it.", "The reasoning begins at the end of page 1 and resolves on page 2."),
      question("l50-q3", "On My Own", "Would a puzzle make you more likely to remember a safety checklist? Explain why or why not.", "A strong response explains how challenge and discovery might improve memory, or how clarity might matter more in a real emergency.", "This is a personal judgement with no required quotation.", true),
      question("l50-q4", "Think and Search", "How did each code layer lead to a different safety action?", "The coordinate and arrow code led to Gate Four, the gate number selected a carousel paw print, and the resulting checklist directed them to secure the exit sign.", "The chain spans both pages."),
      question("l50-q5", "Author and You", "Why does the story distinguish monitored practice issues from dangerous traps?", "It keeps the puzzle responsible and shows that entertainment should not create real hazards. Adults supervised while students learned to notice genuine safety details.", "The reader connects Ms. Ruiz's explanation to the story's practical message."),
    ],
    paragraphTask: paragraphTask(
      50,
      "Write a sequence paragraph explaining how the layered code led to the loose exit sign.",
      "Each solved clue supplied information needed for the next stage of the safety inspection.",
      "The carnival code led to the loose sign through a sequence of clues...",
      [
        "Ticket coordinates first spelled the word SAFETY.",
        "Arrow order revealed the direction to check Gate Four.",
        "The gate number selected the fourth paw print beneath the silent carousel lion.",
        "The drawer's checklist showed that attached signs still needed inspection.",
      ],
      [
        "The fountain reflected strings of carnival lights.",
        "Bark Bolt chose a striped carousel horse.",
      ],
      "Add a detail explaining how Nia interpreted the phrase quietest roar.",
      "Conclude by stating why the meaning, not just the letters, completed the code.",
      "Use varied sequence transitions, repair one run-on sentence, and include coordinate or interpreted.",
      ["coordinate", "interpreted"],
      "The carnival code led to the loose sign through a sequence of clues. First, each coordinate supplied a letter that spelled SAFETY. Next, the arrow order directed the team to Gate Four. The number four selected a paw print beneath the carousel lion, which Nia had interpreted as the “quietest roar.” Inside the drawer, a checklist identified signs as the unfinished task. Thus, decoding letters was only the beginning; acting on their connected meaning completed the puzzle.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 51,
    title: "What Makes a Thunderstorm?",
    genre: "Informational weather science",
    informational: true,
    band: "intermediate",
    objective: "Explain how moisture, unstable air, and lifting produce thunderstorms and connect cloud stages with safety decisions.",
    skillTags: ["RI.5.2", "RI.5.3", "weather systems", "cause and effect", "safety communication"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Building a Tower of Cloud",
        paragraphs: [
          `A thunderstorm begins with three main ingredients: moisture, unstable air, and a way to lift air upward. Moisture may arrive from warm oceans, lakes, wet ground, or humid winds. Air is unstable when a lifted parcel can remain warmer than the surrounding air and continue rising. Hills, fronts, or heated ground can provide the upward push.`,
          `As moist air rises, the lower pressure around it allows it to expand and cool. Water vapour condenses onto tiny particles, forming countless cloud droplets. Condensation releases heat, which can help the air rise farther. A growing cumulus cloud may build upward into a tall cumulonimbus cloud, sometimes reaching heights where water freezes.`,
          `Inside the cloud, powerful updrafts lift droplets and ice while downdrafts carry cooler air and precipitation downward. These moving particles collide. Electric charges become separated in different parts of the cloud. When the electrical difference becomes great enough, a lightning discharge occurs within a cloud, between clouds, or between a cloud and the ground.`,
          `Lightning heats a narrow channel of air extremely quickly. The air expands so suddenly that it creates a pressure wave we hear as thunder. Light reaches our eyes much faster than sound reaches our ears, so a distant flash is seen before its thunder arrives. Every thunderstorm produces lightning; if thunder can be heard, lightning is close enough to be a hazard.`
        ],
        callout: {
          label: "Storm Ingredients",
          text: "Moisture + unstable air + lift can build a thunderstorm when conditions work together.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Storm's Changing Stages",
        paragraphs: [
          `During the developing stage, updrafts dominate and the cloud grows. In the mature stage, both updrafts and downdrafts occur. Heavy rain, gusty winds, hail, and sometimes tornadoes are most likely during this active stage. Later, downdrafts spread cool air and cut off the storm's supply of warm, moist air. The cloud begins to weaken, although lightning can continue.`,
          `A storm may last less than an hour, but groups of storms can persist much longer. Boundaries of cool air flowing from one storm can lift nearby warm air and help another storm form. Meteorologists combine radar, satellites, surface instruments, weather balloons, and reports to track storms. A radar image shows patterns of precipitation and motion, not a photograph of every raindrop.`,
          `Thunderstorm safety depends on responding early. A sturdy building or hard-topped vehicle is safer than an open field, isolated tree, shallow shelter, or body of water. People should follow local alerts and wait after the last thunder according to guidance from their weather service or emergency officials. Windows do not make a building lightning-proof, so staying away from plumbing and corded electrical equipment may also be advised.`,
          `Nia once watched a white cloud rise above Maple Creek on a humid afternoon. Instead of treating its shape as a prediction, she checked the official forecast and noticed a storm watch. She moved soccer practice indoors before thunder began. Understanding storm ingredients did not let her control the sky. It helped her recognize changing evidence, use reliable information, and make a safer decision before the first flash.`
        ],
        callout: {
          label: "Safety Signal",
          text: "When thunder is heard, move to a sturdy enclosed shelter and follow current local weather guidance.",
        },
      },
    ],
    illustration: illustration(
      51,
      "A labelled thunderstorm diagram shows warm moist air rising, a tall cumulonimbus cloud, updrafts, downdrafts, rain, and lightning above Maple Creek.",
      "Moisture, unstable air, and lift build a cloud where updrafts and downdrafts interact.",
      "thunderstorm-formation-diagram",
      "#5067C5",
    ),
    vocabulary: [
      word("unstable", "likely to keep changing or moving rather than remain balanced", ["unsteady", "changeable"], "Air is unstable when a lifted parcel can remain warmer than the surrounding air and continue rising.", "This air keeps rising instead of settling."),
      word("condenses", "changes from a gas into liquid droplets", ["liquefies", "forms droplets"], "Water vapour condenses onto tiny particles.", "Cooling water vapour forms cloud droplets."),
      word("downdrafts", "currents of air moving downward through a storm", ["descending currents", "downward flows"], "Downdrafts carry cooler air and precipitation downward.", "These air currents move toward the ground."),
    ],
    comprehension: [
      question("l51-q1", "Right There", "What three ingredients are needed for a thunderstorm to begin?", "Moisture, unstable air, and a lifting force are needed.", "The three ingredients appear in the opening sentence."),
      question("l51-q2", "Think and Search", "How can condensation help a cloud continue growing?", "Rising air cools and water vapour condenses; that process releases heat, which can help the air remain buoyant and rise farther into a taller cloud.", "The sequence is described in page 1, paragraph 2."),
      question("l51-q3", "On My Own", "What is one change your team or family could plan before an outdoor activity when storms are possible? Explain why it helps.", "A strong answer suggests checking alerts, identifying sturdy shelter, choosing a cancellation signal, or planning transportation, with a safety reason.", "This is a real-world application and needs a relevant reason, not a quotation.", true),
      question("l51-q4", "Think and Search", "How do updrafts and downdrafts change from the developing stage to the weakening stage?", "Updrafts dominate early; both currents operate during the mature stage; later, downdrafts spread cool air and cut off warm, moist inflow so the storm weakens.", "Information from both pages explains the currents and stages."),
      question("l51-q5", "Author and You", "Why does the author include Nia's decision without claiming that she predicted the exact storm?", "It shows that scientific understanding supports safer choices when combined with official information, but it does not guarantee perfect local forecasts.", "The reader connects the final example with the earlier discussion of ingredients and tracking tools."),
    ],
    paragraphTask: paragraphTask(
      51,
      "Write a cause-and-effect paragraph explaining how a growing cloud can develop into a thunderstorm.",
      "Moisture, unstable air, lift, and changes inside the cloud create connected storm effects.",
      "A thunderstorm can develop when...",
      [
        "A lifting force pushes warm, moist, unstable air upward.",
        "The rising air expands, cools, and water vapour condenses into droplets.",
        "Released heat supports further rising and the cloud grows taller.",
        "Colliding water and ice help separate electric charges that can produce lightning.",
      ],
      [
        "Nia's soccer ball had white zigzag stripes.",
        "Weather balloons are often filled before sunrise.",
      ],
      "Add a detail explaining why thunder follows a visible flash.",
      "Conclude with how this understanding supports a safety decision.",
      "Use clear cause-and-effect transitions, avoid claiming certainty, and include unstable or condenses.",
      ["unstable", "condenses"],
      "A thunderstorm can develop when a lifting force pushes warm, moist, unstable air upward. As the air expands and cools, water vapour condenses into cloud droplets. Released heat can help the air rise farther, so the cloud grows tall and strong air currents develop. Collisions among droplets and ice separate electrical charges, which may produce lightning. The heated air then expands and creates thunder. Recognizing these connected changes helps people seek reliable updates and shelter before a storm arrives.",
    ),
    sourceReferences: [
      { label: "NOAA National Severe Storms Laboratory — Severe Weather 101: Thunderstorms", url: "https://www.nssl.noaa.gov/education/svrwx101/thunderstorms/" },
      { label: "US National Weather Service — Lightning Safety", url: "https://www.weather.gov/safety/lightning" },
    ],
  }),
  lesson({
    sequence: 52,
    title: "A Rescue at Maple Creek",
    genre: "Community rescue adventure",
    informational: false,
    band: "intermediate",
    objective: "Analyze a sequence of safe decisions and explain how precise information supports emergency responders.",
    skillTags: ["RL.5.1", "RL.5.3", "sequence", "problem solving", "procedural explanation"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Red Paddle on the Island",
        paragraphs: [
          `Nia and Bark Bolt were counting birds from the Maple Creek trail when a red paddle flashed between willow branches. A kayaker stood on a gravel island, waving both arms. His empty kayak was pinned against a log downstream. Rain from the previous night had strengthened the current, and the water between the island and bank moved too quickly to wade.`,
          `Nia called emergency services while Bark Bolt stayed where the kayaker could see him. She read the trail marker—MC-7—and described the island as upstream from the green footbridge. She also reported the red life jacket, the lost kayak, and the kayaker's ability to stand. Precise details helped responders choose the right access point and equipment.`,
          `Two cyclists offered to swim a rope across. Nia asked them not to enter the water. A rescuer should not create additional people who need rescue. Bark Bolt pointed to the safety board beside the trail, which warned about cold water, submerged branches, and changing flow after rain. The group kept the path clear and used large hand signals to tell the kayaker that help was coming.`,
          `The kayaker, Mr. Lewis, shouted that his ankle hurt. He had reached the island after his kayak struck the log. He wore a properly fastened life jacket, which had helped him float during the short swim. Nia did not ask him to test the ankle or jump back into moving water. She encouraged him to remain in the stable centre of the island.`
        ],
        callout: {
          label: "Location Report",
          text: "Trail marker MC-7, upstream of green footbridge, gravel island, one adult in a red life jacket.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Plan Built for the Current",
        paragraphs: [
          `Firefighters arrived at the footbridge and evaluated the channel. A boat could not safely pass the trapped log, so a trained rescue team approached from a calm inlet upstream. They wore helmets and flotation gear and attached their craft to a managed safety line. Nia and the other bystanders moved farther back when directed.`,
          `One rescuer reached the island, checked Mr. Lewis's ankle, and secured him in the rescue craft. The team travelled through the gentler channel rather than fighting the strongest current. On shore, paramedics treated a sprain and checked for cold stress. Another crew marked the trapped kayak for later recovery; saving equipment was less urgent than bringing a person to safety.`,
          `Mr. Lewis thanked Nia for calling quickly and for not encouraging a risky crossing. He had checked the morning forecast but had not considered how overnight rain upstream could affect the creek later. He promised to review water conditions and carry a whistle on future trips. The rescue captain praised his life jacket while reminding everyone that protective gear does not remove every hazard.`,
          `The next school assembly displayed a map of the rescue. Nia emphasized that Bark Bolt had not leapt into raging water or pulled a boat with his teeth. Real help looked less dramatic: notice, report, protect the scene, and follow trained directions. Bark Bolt agreed, although he requested one heroic detail in the illustration. The artist gave his cape an impressive breeze—safely on the dry bank.`
        ],
        callout: {
          label: "Bystander Priorities",
          text: "Call for trained help, share exact location and conditions, stay out of moving water, and follow responder instructions.",
        },
      },
    ],
    illustration: illustration(
      52,
      "From the dry trail, Nia reports marker MC-7 while Bark Bolt signals reassurance to a life-jacketed kayaker on a gravel island.",
      "Accurate information and a clear bank allow trained rescuers to choose a safer route.",
      "maple-creek-island-rescue",
      "#2C9AB7",
    ),
    vocabulary: [
      word("current", "the steady movement of water in a particular direction", ["flow", "stream"], "Rain from the previous night had strengthened the current.", "This moving water made wading dangerous."),
      word("precise", "exact, accurate, and clearly stated", ["exact", "specific"], "Precise details helped responders choose the right access point and equipment.", "Nia named the marker, bridge, island, and clothing."),
      word("evaluated", "examined carefully in order to make a judgement", ["assessed", "reviewed"], "Firefighters arrived at the footbridge and evaluated the channel.", "They checked the water before choosing a plan."),
    ],
    comprehension: [
      question("l52-q1", "Right There", "What location and condition details did Nia give emergency services?", "She reported marker MC-7, the island upstream of the green footbridge, a man in a red life jacket, the missing kayak, and his ability to stand.", "The details appear in page 1, paragraph 2."),
      question("l52-q2", "Think and Search", "Why did the rescue team approach from upstream rather than follow the kayak's route?", "The log blocked the direct channel, while an upstream inlet provided calmer water and a gentler path to the island.", "The kayak hazard is described on page 1 and the rescue route on page 2."),
      question("l52-q3", "On My Own", "Why might a bystander feel pressure to act before trained help arrives, and how could the person respond safely?", "A thoughtful answer may mention fear or urgency and suggest calling, observing, sharing directions, reassuring the person, and avoiding new hazards.", "The question asks for personal reasoning, not a quotation.", true),
      question("l52-q4", "Think and Search", "Which actions prevented the rescue from becoming more dangerous?", "Nia stopped cyclists from entering the current, kept the path clear, asked Mr. Lewis to stay put, gave exact information, moved back for responders, and left the kayak for later.", "Evidence appears throughout both pages."),
      question("l52-q5", "Author and You", "Why does the author joke about Bark Bolt's cape at the end?", "The humour keeps the adventure appealing while reinforcing that safe, realistic help—not a dramatic leap into danger—was genuinely heroic.", "The ending contrasts the illustration with the rescue's actual decisions."),
    ],
    paragraphTask: paragraphTask(
      52,
      "Write a sequence paragraph explaining how Nia helped without entering the creek.",
      "Nia supported the rescue through accurate reporting, scene safety, communication, and cooperation with responders.",
      "Nia helped the stranded kayaker safely by...",
      [
        "She called emergency services and reported an exact trail marker and landmarks.",
        "She described the kayaker, water conditions, and lost boat.",
        "She discouraged untrained bystanders from entering the current.",
        "She kept Mr. Lewis informed and followed responder directions when help arrived.",
      ],
      [
        "The willow branches had narrow green leaves.",
        "Bark Bolt wanted his cape to look dramatic in the assembly picture.",
      ],
      "Add a detail showing why leaving the kayak for later was sensible.",
      "Conclude with a rule for helping during a water emergency.",
      "Use logical sequence transitions, strengthen one verb, and include precise or evaluated.",
      ["precise", "evaluated"],
      "Nia helped the stranded kayaker safely by taking useful steps from the bank. First, she called emergency services and gave the precise trail marker, landmarks, and water conditions. Next, she discouraged untrained people from entering the current and reassured Mr. Lewis while he waited. When responders arrived, she cleared the area so they could evaluate the channel. Equipment could be recovered later, but a person needed immediate care. In a water emergency, helpful bystanders report clearly and avoid becoming additional victims.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 53,
    title: "The Underwater Camera Clue",
    genre: "Lake investigation",
    informational: false,
    band: "intermediate",
    objective: "Interpret visual evidence by considering angle, scale, and time before drawing a conclusion.",
    skillTags: ["RL.5.1", "RL.5.3", "visual evidence", "perspective", "inference"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Shadow Below the Dock",
        paragraphs: [
          `The lake club lowered an underwater camera to count fish near Willow Dock. At minute twelve, a striped shadow crossed the screen and snapped the rope holding a small temperature sensor. Club members froze the image. The shape looked enormous—perhaps an unknown fish with a square fin. By afternoon, someone had named it the Willow Lake Monster.`,
          `Nia asked for the complete video rather than the single dramatic frame. Three seconds earlier, tiny bubbles moved sideways. One second later, the square “fin” showed the number 4. Bark Bolt recognized the typeface from the lane markers used during the summer swim programme. A floating marker could seem huge when it passed centimetres from the lens.`,
          `The lane markers had been stored on shore for autumn, but marker four was missing. Coach Lin remembered that its anchor line had frayed in August. Wind might have pushed it under the dock, where the remaining rope tangled with the sensor cord. That explanation fit the number, stripes, and square shape, but the club still needed to locate the object.`,
          `They moved the camera in a slow grid while staying on the stable dock. Sunlight weakened with depth, turning colours dull. At a different angle, the “monster” appeared as a faded orange float wrapped in dark waterweed. The broken sensor rested beneath it. The image had changed because distance, light, and perspective had changed, not because the object had transformed.`
        ],
        callout: {
          label: "Image Questions",
          text: "How far is the object from the lens? What is the viewing angle? What appears before and after the chosen frame?",
        },
      },
      {
        pageNumber: 2,
        subheading: "What the Camera Did Not Show",
        paragraphs: [
          `Retrieving the marker required trained adult divers because fishing line had also collected near the piling. The students marked the location on a dock map and kept people away. When divers returned the float and sensor, they found a fresh cut on the sensor cord but only a worn break on the marker's old anchor line. The marker had not sliced the sensor by itself.`,
          `A metal edge on the marker had trapped the cord. Repeated waves pulled the two objects in opposite directions until the sensor line failed. The underwater video showed the final jerk, not the hours of abrasion that weakened the rope. Nia revised the explanation: the float was involved, but ongoing motion caused the break.`,
          `The lake club replaced both cords, removed the fishing line, and added protective sleeves where equipment touched rough surfaces. They also created a scale bar beside the camera. Future viewers could compare an object's size with known markings. Coach Lin posted the entire short clip, including the before-and-after frames, beneath a cheerful headline: MONSTER IDENTIFIED; EQUIPMENT IMPROVED.`,
          `Bark Bolt requested that marker four receive a retirement ceremony. The club hung it on the boathouse wall with the famous blurry picture. Below it, Nia wrote, “A camera records what enters its frame, not everything that caused the event.” The clue had been accurate but incomplete. By changing angles, checking scale, and studying time, investigators turned a lake monster into a useful lesson about visual evidence.`
        ],
        callout: {
          label: "Revised Explanation",
          text: "The float trapped the cord; repeated wave motion weakened it; the video captured only the final break.",
        },
      },
    ],
    illustration: illustration(
      53,
      "A split view shows Nia and Bark Bolt watching an underwater camera screen and the numbered lane float tangled near the dock below.",
      "Close to the lens, an ordinary lane marker appears like a giant striped creature.",
      "underwater-camera-perspective-clue",
      "#147F9F",
    ),
    vocabulary: [
      word("perspective", "the position or angle from which something is viewed", ["viewpoint", "angle"], "The image had changed because distance, light, and perspective had changed.", "A new camera angle revealed the float."),
      word("abrasion", "damage caused by repeated rubbing or scraping", ["wear", "scraping"], "The video did not show the hours of abrasion that weakened the rope.", "Waves rubbed the cord against metal."),
      word("incomplete", "missing some information or parts", ["partial", "unfinished"], "The clue had been accurate but incomplete.", "One frame did not show the whole cause."),
    ],
    comprehension: [
      question("l53-q1", "Right There", "Which details first suggested that the shadow was lane marker four?", "The square shape showed the number 4 and had the same stripes and typeface as the swim lane markers.", "These details appear in page 1, paragraph 2."),
      question("l53-q2", "Think and Search", "Why did the same object look like a monster in one image and a float in another?", "It passed very close to the lens in poor light, making it seem huge; a slower grid search from another angle showed its colour, number, and surrounding waterweed.", "The answer combines lens distance, lighting, and perspective information."),
      question("l53-q3", "On My Own", "What should a person check before sharing a surprising image online? Explain which check matters most to you.", "A strong response may mention the full clip, source, scale, angle, date, edits, or independent evidence, with a reason.", "This real-world judgement needs relevant reasoning.", true),
      question("l53-q4", "Think and Search", "How did the explanation of the broken sensor cord change after retrieval?", "At first the float seemed to snap the cord directly. Physical wear showed that the float trapped it while waves caused repeated abrasion, and the camera captured only the final failure.", "The first theory is on page 1; the revised mechanism is on page 2."),
      question("l53-q5", "Author and You", "How does the retirement display for marker four support the story's message?", "It preserves the funny first impression beside the corrected explanation, reminding viewers that memorable images still require context.", "The reader connects the display with Nia's statement about camera frames."),
    ],
    paragraphTask: paragraphTask(
      53,
      "Write an evidence paragraph explaining why the first monster conclusion was unreliable.",
      "The dramatic frame lacked the scale, angle, and time information needed to identify the object and cause.",
      "The first image did not prove that a lake monster broke the cord because...",
      [
        "The object passed extremely close to the camera and appeared larger than it was.",
        "A later angle revealed the number and shape of lane marker four.",
        "The single frame omitted the events before and after the final jerk.",
        "Physical wear showed that waves caused repeated rubbing over time.",
      ],
      [
        "The boathouse wall had hooks for life jackets.",
        "Coach Lin used a cheerful headline on the club post.",
      ],
      "Add a detail explaining how a scale bar would improve future evidence.",
      "Conclude with a general rule about using visual clues.",
      "Use an evidence transition, correct one vague reference, and include perspective or incomplete.",
      ["perspective", "incomplete"],
      "The first image did not prove that a lake monster broke the cord because its evidence was incomplete. The object passed close to the lens, so perspective made it appear enormous. A later angle revealed marker four's number and shape, while the full clip showed only the final jerk. Physical abrasion also proved that repeated wave motion weakened the cord over time. A scale bar would make future size comparisons clearer. Visual clues are strongest when viewers examine context, scale, and sequence.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 54,
    title: "The Problem with Perfect Predictions",
    genre: "School logic story",
    informational: false,
    band: "intermediate",
    objective: "Evaluate prediction evidence, identify selective attention, and explain why useful forecasts include uncertainty.",
    skillTags: ["RL.5.2", "RL.5.3", "reasoning", "bias awareness", "argument writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Milo Is Never Wrong",
        paragraphs: [
          `Milo posted three predictions on Monday: the lunch line would serve noodles, Principal Pine would carry an umbrella, and the class goldfish would face north at noon. All three came true. By Tuesday, students crowded around his notebook. He predicted a surprise quiz, a power flicker, and Bark Bolt sneezing during assembly. Again, every event seemed to occur.`,
          `Nia admired patterns but distrusted perfection. Milo's noodle prediction came from the rotating menu. Rain appeared in the forecast, so an umbrella was likely. The goldfish swam in every direction, yet students photographed only the moment it faced north. Bark Bolt had sneezed after Milo secretly shook a dusty curtain. Some predictions were informed guesses; others were shaped after they were announced.`,
          `Milo insisted that results mattered more than methods. He displayed a page labelled PERFECT RECORD, containing twelve checks and no crosses. Nia asked to see his earlier pages. In a recycling tray, they found crumpled predictions: a fire drill that never happened, a green bus, and a lunchroom song. Milo had removed failed guesses instead of counting them.`,
          `The class designed a fair test. Before Wednesday, Milo would write ten clear predictions, seal them in an envelope, and avoid causing any event. The statements needed specific times or conditions. “Something surprising will happen” was too flexible, while “the library clock will stop before noon” could be checked.`
        ],
        callout: {
          label: "Prediction Test",
          text: "Record every forecast in advance, state it clearly, do not cause the outcome, and count successes and failures.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Useful Kind of Uncertainty",
        paragraphs: [
          `On Wednesday, two of Milo's ten predictions came true. A delivery arrived before ten, and the playground gate squeaked. Six were wrong, and two were too vague to judge. Milo's success did not look magical, but neither did it look foolish. He had used schedules and observations to make two reasonable forecasts.`,
          `Nia explained probability with a bag containing nine blue tiles and one yellow tile. Drawing blue was likely, not guaranteed. Drawing yellow was unlikely, not impossible. A prediction can be useful without being certain if the evidence and level of confidence are clear. Weather alerts, travel estimates, and game strategies all depend on possibilities rather than promises.`,
          `Milo revised his notebook. He restored the failed pages and added columns for evidence, confidence, outcome, and explanation. His next statement read: “Because the delivery comes most Thursdays, it is likely—but not certain—to arrive before ten.” When the truck came at 10:14, he recorded the miss instead of moving the time.`,
          `Students stopped calling him Milo the Mind Reader. They called his chart the Possibility Project and helped collect data. Bark Bolt volunteered one prediction: “At some point today, I will want a snack.” Nia labelled it highly probable but not useful because it was too broad. Everyone laughed, including Milo. Perfect predictions had made him impressive for two days; honest predictions helped the whole class think better for the rest of the year.`
        ],
        callout: {
          label: "Probability Reminder",
          text: "Likely does not mean guaranteed, and unlikely does not mean impossible.",
        },
      },
    ],
    illustration: illustration(
      54,
      "Nia compares Milo's sealed prediction envelope with a probability bag of nine blue tiles and one yellow tile while Bark Bolt watches.",
      "Recording every result turns a perfect performance into an honest investigation.",
      "prediction-probability-test",
      "#6C63C7",
    ),
    vocabulary: [
      word("prediction", "a statement about what someone thinks will happen in the future", ["forecast", "projection"], "Milo posted three predictions on Monday.", "It describes an outcome before it happens."),
      word("probability", "a measure of how likely an event is to happen", ["likelihood", "chance"], "Nia explained probability with a bag containing nine blue tiles and one yellow tile.", "Nine blue tiles made blue more likely."),
      word("vague", "not expressed clearly or specifically", ["unclear", "imprecise"], "Two were too vague to judge.", "A statement like something surprising will happen lacks detail."),
    ],
    comprehension: [
      question("l54-q1", "Right There", "What four rules did the class set for testing Milo's predictions?", "They would record all predictions in advance, make them specific, prevent Milo from causing outcomes, and count both successes and failures.", "The rules appear at the end of page 1 and in its callout."),
      question("l54-q2", "Think and Search", "Why did Milo's original record appear more accurate than it really was?", "He used known schedules, influenced at least one event, counted only favourable moments, removed failed predictions, and allowed flexible claims.", "Examples are spread across page 1."),
      question("l54-q3", "On My Own", "Describe a situation where a likely outcome would still require a backup plan. Why?", "A strong response names a realistic situation and explains that likely events can fail, so preparation reduces the impact of uncertainty.", "This personal application does not require a quotation.", true),
      question("l54-q4", "Think and Search", "How did Milo's purpose for predicting change by the end?", "He began by trying to seem perfectly impressive, but later recorded evidence, confidence, misses, and explanations so the class could learn from patterns.", "His perfect-record page contrasts with the Possibility Project."),
      question("l54-q5", "Author and You", "Why is Bark Bolt's snack prediction called probable but not useful?", "It is likely because he often wants snacks, but it has no specific time or testable value. The joke reinforces the need for clear predictions.", "The reader applies the class rules to Bark Bolt's final statement."),
    ],
    paragraphTask: paragraphTask(
      54,
      "Write an argument explaining why Milo's revised notebook was more trustworthy than his perfect record.",
      "The revised notebook showed the full evidence, uncertainty, and outcomes instead of hiding mistakes.",
      "Milo's revised notebook was more trustworthy because...",
      [
        "It included every prediction rather than only successful ones.",
        "Each statement listed the evidence and a confidence level.",
        "Specific outcomes and times made the claims testable.",
        "Milo recorded misses honestly instead of changing the prediction afterward.",
      ],
      [
        "The playground gate produced a squeaking sound.",
        "Bark Bolt's favourite snack came in a paper bag.",
      ],
      "Add a sentence explaining why mistakes can improve future predictions.",
      "Conclude with a rule for communicating uncertainty.",
      "Use a comparison transition, make one broad claim more precise, and include probability or vague.",
      ["probability", "vague"],
      "Milo's revised notebook was more trustworthy because it displayed the complete record. Unlike his perfect page, it included failures and rejected vague claims. Each prediction named its evidence, probability, time, and outcome. When the delivery arrived late, Milo recorded the miss rather than shifting the deadline. Studying mistakes could help him adjust future expectations. A trustworthy forecast should state both its evidence and its uncertainty instead of pretending to guarantee the future.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 55,
    title: "The Story of Public Libraries",
    genre: "Informational history and civics",
    informational: true,
    band: "intermediate",
    objective: "Summarize how public libraries developed and compare the changing services they provide communities.",
    skillTags: ["RI.5.2", "RI.5.5", "history", "institutions", "summary writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "From Collected Records to Shared Shelves",
        paragraphs: [
          `People have collected written records for thousands of years, but those collections were not always open to everyone. Ancient archives and libraries often served rulers, religious communities, or scholars. Books had to be copied by hand, which made them scarce. Later, printing allowed many more copies to circulate, although access still depended on money, membership, location, and local rules.`,
          `Different places developed public libraries in different ways. Some grew from reading rooms or subscription collections. Others were founded by towns, schools, community groups, or gifts from donors. During the nineteenth and early twentieth centuries, tax-supported libraries expanded in many communities. The idea that residents could borrow books without paying for each item became a central public service.`,
          `A building and shelves were only part of the work. Librarians selected, organized, catalogued, and protected materials so people could find them. Card catalogues once directed readers to books by author, title, or subject. Bookmobiles and travelling collections brought reading materials to rural communities and neighbourhoods far from a branch. Children's rooms and story programmes welcomed younger readers.`,
          `Access was not equally fair. In many regions, racist laws and local practices excluded or separated people. Communities challenged those barriers through advocacy, legal action, and determined use of public spaces. Other obstacles included stairs, limited language choices, long travel distances, and rules that did not meet every reader's needs. The history of libraries includes both expanding opportunity and continued efforts to improve it.`
        ],
        callout: {
          label: "Changing Access",
          text: "Collections became more widely available through public funding, branch libraries, bookmobiles, and community action—though barriers did not disappear at once.",
        },
      },
      {
        pageNumber: 2,
        subheading: "More Than a Place for Books",
        paragraphs: [
          `Modern public libraries still lend printed books, but many also provide e-books, audiobooks, newspapers, music, films, internet access, research databases, and local history materials. Some lend tools, art, musical instruments, or wireless hotspots. Exact services vary because each library responds to its community, budget, laws, and partnerships.`,
          `Libraries also offer help. Staff may teach research skills, support job searches, lead language or literacy programmes, assist with technology, and connect visitors with community information. Meeting rooms host clubs, classes, and discussions. A quiet desk can matter to someone without study space at home, while a computer can connect a person to school, work, or government forms.`,
          `Public does not mean that every resource can be used without limits. Libraries protect privacy, care for shared items, follow copyright rules, manage waiting lists, and set behaviour policies. Communities debate which materials and services belong in a collection. Librarians use professional practices and local policies to support broad access while managing limited space and funds.`,
          `Nia's library card fits in her pocket, but it connects her to a long civic story. Past communities organized books; later communities funded branches, challenged exclusion, and added new formats. Today's readers influence what comes next by borrowing responsibly, asking questions, attending meetings, and supporting access. A public library is not finished when its doors open. It remains a changing agreement that shared knowledge should be organized, cared for, and made useful to the community.`
        ],
        callout: {
          label: "Community Service Map",
          text: "Borrowing + research help + technology + programmes + shared space are common services, but offerings differ by library.",
        },
      },
    ],
    illustration: illustration(
      55,
      "A timeline-style library scene connects a hand-copied record, card catalogue, bookmobile, accessible branch, books, and digital resources around Nia's library card.",
      "Public libraries have changed their tools while continuing to organize and share knowledge.",
      "public-library-history-timeline",
      "#D96C5F",
    ),
    vocabulary: [
      word("circulate", "to pass or move from person to person or place to place", ["distribute", "share"], "Printing allowed many more copies to circulate.", "Books could reach more readers."),
      word("catalogued", "recorded and organized so items can be identified and found", ["indexed", "classified"], "Librarians selected, organized, catalogued, and protected materials.", "A catalogue points readers toward materials."),
      word("advocacy", "public support or action for a cause or change", ["campaigning", "support"], "Communities challenged those barriers through advocacy, legal action, and determined use of public spaces.", "People worked to improve access."),
    ],
    comprehension: [
      question("l55-q1", "Right There", "What were two methods libraries used to help people find or reach books?", "Card catalogues helped people locate books, while bookmobiles and travelling collections brought materials to distant communities.", "Both methods appear on page 1, paragraph 3."),
      question("l55-q2", "Think and Search", "How did technology both expand library access and create continuing responsibilities?", "Printing, digital formats, internet access, and hotspots reached more users, while libraries still had to organize resources, protect privacy, follow copyright, manage queues, and support people using technology.", "The historical expansion is on page 1 and current responsibilities are on page 2."),
      question("l55-q3", "On My Own", "Which library service would most help your community, and what need would it address?", "A strong response selects a realistic service and explains the community need it would meet.", "This is a community judgement and does not require a quotation.", true),
      question("l55-q4", "Think and Search", "Why does the passage describe library history as both progress and continued effort?", "Access expanded through public funding and new services, but exclusion, disability barriers, distance, language needs, limited budgets, and policy debates required further action.", "Evidence from the access paragraph and modern-service paragraphs must be combined."),
      question("l55-q5", "Author and You", "What does the author mean by calling a library a changing agreement?", "A library depends on continuing community choices to fund, organize, protect, and adapt shared knowledge rather than being a finished service once built.", "The answer interprets the final paragraph using changes described throughout."),
    ],
    paragraphTask: paragraphTask(
      55,
      "Write a comparison paragraph explaining what has changed and what has remained important in public libraries.",
      "Library formats and services have expanded, while organized access to shared knowledge remains central.",
      "Public libraries have changed greatly, yet one central purpose remains...",
      [
        "Printed catalogues have often been replaced or joined by digital search systems.",
        "Many libraries now lend digital media and offer internet access.",
        "Libraries continue to organize materials so people can find reliable information.",
        "Community efforts still shape who can access resources and which services are offered.",
      ],
      [
        "Nia's library card fit inside a striped wallet.",
        "Some old bookmobiles had rounded headlights.",
      ],
      "Add one detail comparing an older outreach method with a modern one.",
      "Conclude with why community participation still matters.",
      "Use comparison and contrast transitions, vary sentence length, and include catalogued or advocacy.",
      ["catalogued", "advocacy"],
      "Public libraries have changed greatly, yet organized access to shared knowledge remains central. Earlier readers used card catalogues, while many visitors now search digital systems. Bookmobiles once extended rural access, and today's branches may also lend hotspots or e-books. In every period, materials had to be catalogued and cared for. Advocacy also remained important when services excluded or overlooked people. Therefore, community participation helps libraries adapt their tools while protecting their shared purpose.",
    ),
    sourceReferences: [
      { label: "US Institute of Museum and Library Services — Public Libraries Survey", url: "https://www.imls.gov/research-evaluation/surveys/public-libraries-survey-pls" },
      { label: "Library of Congress — Library History", url: "https://www.loc.gov/about/history-of-the-library/" },
    ],
  }),
  lesson({
    sequence: 56,
    title: "The Theatre Prop Mystery",
    genre: "Backstage mystery",
    informational: false,
    band: "intermediate",
    objective: "Analyze how stage context changes an object's appearance and explain how a misleading clue can result from a production process.",
    skillTags: ["RL.5.1", "RL.5.3", "setting", "cause and effect", "explanatory writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "The Crown That Turned Black",
        paragraphs: [
          `An hour before the school play, Queen Maribel's golden crown turned black beneath the stage lights. Back in the prop room, it gleamed gold again. Each trip to the stage changed it. Costume designer Ana blamed sabotage; lighting student Owen suspected a faulty lamp. Director Ms. Cho asked Nia and Bark Bolt to investigate without delaying rehearsal.`,
          `The crown was a lightweight replica made from foam, safe for an actor to wear. Nia photographed it under the prop-room bulbs, hallway lights, and stage lights. Only the ultraviolet effect lamps made the gold surface dark. A tiny crescent on the side then glowed blue. Someone had painted part of the crown with a material that reacted to ultraviolet light.`,
          `The script offered a clue. In scene four, the queen entered a “shadow forest,” where her crown was supposed to lose its shine. The effect belonged in that scene, not in the opening. Owen's lighting cue sheet showed ultraviolet lamps at cue 38. The control board, however, labelled them cue 8. One missing digit had moved the effect thirty cues early.`,
          `Bark Bolt found a strip of tape marked 3 beneath the console. During cleanup, tape had peeled from the board and stuck to a rolling cable cart. No saboteur had altered the number. Yet simply replacing the tape would not explain why the crown glowed blue. The script mentioned no blue crescent.`
        ],
        callout: {
          label: "Backstage Evidence",
          text: "Prop-room light: gold. Ultraviolet stage light: dark with blue crescent. Cue sheet: effect at 38, not 8.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Hidden Rehearsal Mark",
        paragraphs: [
          `Ana admitted painting the crescent as a temporary mark so the actor would know which side faced the audience. She planned to cover it with matching paint after the final fitting. Under ordinary light, the mark was invisible, so she forgot. Two separate production choices—the reactive shadow paint and hidden fitting mark—had combined into one mysterious effect.`,
          `The team restored the 3 on the console and covered the crescent with paint tested under every stage colour. Owen then ran each lighting cue while Ana watched the crown from the audience. Ms. Cho added a technical rehearsal checklist: prop appearance, costume safety, cue number, actor position, and backup plan.`,
          `At the evening performance, the crown shone during the opening. In the shadow forest, cue 38 darkened it gradually, just as the story required. The audience gasped for the right reason. Backstage, Bark Bolt held up a sign that said MYSTERY SOLVED, but Nia turned it around because the words faced the wall. Theatre, she observed, depends on checking every effect from the audience's perspective.`,
          `Ana kept a small test card showing each layer of paint. She labelled it ORDINARY LIGHT and UV LIGHT, then stored it with the crown. Future crews would not mistake an intentional effect for damage. The mystery had no single cause and no villain. It came from several reasonable tasks that were not fully communicated. The final checklist mattered because a production is a network: one loose number can change the meaning of light, paint, prop, and story.`
        ],
        callout: {
          label: "Production Fix",
          text: "Restore cue 38, cover the fitting mark, test the prop under every light, and document the layered paint.",
        },
      },
    ],
    illustration: illustration(
      56,
      "Nia and Bark Bolt compare a gold foam crown under ordinary bulbs and ultraviolet stage lights beside a cue board missing the number three.",
      "Light-reactive paint and a damaged cue label create the crown's mysterious change.",
      "theatre-crown-lighting-cue",
      "#8E5BC7",
    ),
    vocabulary: [
      word("replica", "a copy made to look like an original object", ["copy", "reproduction"], "The crown was a lightweight replica made from foam.", "It looked royal but was a safe stage copy."),
      word("sabotage", "deliberate damage meant to prevent success", ["wrecking", "disruption"], "Costume designer Ana blamed sabotage.", "The evidence later showed there was no deliberate damage."),
      word("perspective", "a position or way of viewing something", ["viewpoint", "angle"], "Theatre depends on checking every effect from the audience's perspective.", "The sign and crown must face viewers correctly."),
    ],
    comprehension: [
      question("l56-q1", "Right There", "Why did the crown turn dark too early?", "The ultraviolet lighting effect was labelled cue 8 after the 3 fell off, instead of its correct position at cue 38.", "The cue sheet and missing tape explain the timing on page 1."),
      question("l56-q2", "Think and Search", "Why did the blue crescent require a different explanation from the dark crown?", "The dark surface was an intentional shadow-forest effect, while the crescent was a temporary fitting mark that Ana had forgotten to cover.", "The first effect is explained on page 1; Ana explains the mark on page 2."),
      question("l56-q3", "On My Own", "Which part of a group production would you most want to test in advance, and why?", "A strong answer identifies a part such as sound, lighting, props, costumes, or movement and explains what a test could prevent.", "This personal response needs a practical reason.", true),
      question("l56-q4", "Think and Search", "How did the team's final checklist address more than the original number error?", "It checked prop appearance, safety, cue number, actor position, and backup plans, addressing the combined effects of paint, light, placement, and communication.", "The original causes appear across both pages; the checklist is on page 2."),
      question("l56-q5", "Author and You", "Why does the author include Bark Bolt's backward sign?", "The joke gives a simple example of the same theme: an object may seem correct backstage but fail if no one checks it from the audience's viewpoint.", "The reader connects the sign with Nia's perspective comment."),
    ],
    paragraphTask: paragraphTask(
      56,
      "Write a cause-and-effect paragraph explaining how several small choices created the crown mystery.",
      "The mystery resulted from interacting paint, lighting, labels, and incomplete communication rather than one act of sabotage.",
      "Several small production choices combined to make the crown seem mysterious...",
      [
        "Ana used reactive paint for a planned shadow-forest effect.",
        "A temporary blue fitting mark remained beneath the ordinary-looking surface.",
        "The number three peeled from cue 38, changing the label to cue 8.",
        "The crew had not tested the finished crown under every light before rehearsal.",
      ],
      [
        "The foam crown was lighter than a metal crown.",
        "Bark Bolt's sign used thick black letters.",
      ],
      "Add a sentence explaining why the evidence did not support sabotage.",
      "Conclude with how communication could prevent a similar problem.",
      "Use cause-and-effect transitions, combine two related details, and include replica or sabotage.",
      ["replica", "sabotage"],
      "Several small production choices combined to make the crown seem mysterious. Reactive paint intentionally darkened the replica in the shadow scene, while a forgotten fitting mark glowed blue. When the number three fell from cue 38, the lighting effect began thirty cues early. These accidental causes provided no evidence of sabotage. A shared checklist and full lighting test could help future crews communicate how each prop, cue, and costume should appear.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 57,
    title: "The Trolley Track Trail",
    genre: "Historical community mystery",
    informational: false,
    band: "intermediate",
    objective: "Synthesize map, photograph, and physical evidence to reconstruct a historical route.",
    skillTags: ["RL.5.1", "RI.5.7", "historical evidence", "map skills", "synthesis"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Rails Beneath the Garden",
        paragraphs: [
          `While volunteers dug a rain garden beside Maple Street, a shovel struck metal. Two narrow rails lay beneath the soil, heading toward a brick wall. The town archive had no trolley route on its current map. Grandad Sol remembered hearing a trolley bell as a child, but he insisted the line had run three blocks east.`,
          `Nia photographed the rails before workers covered the trench for safety. Their spacing matched a faded 1928 photograph showing a small streetcar labelled CREEK LOOP. In the background stood a bakery with a striped awning. The same building now housed a bicycle shop, although its upper windows had not changed. That placed one stop beside the garden.`,
          `Bark Bolt noticed circular metal patches along the pavement. Most people thought they covered water valves. One patch carried a tiny lightning-bolt symbol. An old utility map showed electric cables following a curved route from the former power station. Electric trolleys often needed power along their line, so the cable route offered a second trail—but not proof by itself.`,
          `At the library, a 1931 newspaper announced that the Creek Loop would close after a spring flood damaged the riverside section. Its written directions named streets but skipped the final turn. A conductor's notebook in the archive listed stop times: Bakery, Market, Theatre, Mill, Park. Nia plotted the intervals and realized Grandad Sol remembered the replacement bus, not the earlier trolley.`
        ],
        callout: {
          label: "Route Evidence",
          text: "Buried rails + dated photograph + power markers + newspaper directions + stop notebook each reveal part of the former line.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Following a Route That Was Gone",
        paragraphs: [
          `The team walked only on public pavements, matching old landmarks with current ones. The market had become flats, but a stone apple remained above its doorway. The theatre was now a hardware shop with a rounded ticket window. Near the mill, a short rail remnant served as the edge of a flower bed. Each clue supported the route sketched from the records.`,
          `At Riverside Park, the rails did not continue toward the modern bridge. Instead, they curved beside a row of sycamores and ended at a concrete platform hidden under ivy. A metal ring in the platform once helped workers change the trolley's direction. The flood-damaged section had followed an older bridge that no longer existed.`,
          `The town did not uncover every rail or rebuild the trolley. Digging would damage streets, roots, and private land. Instead, the rain-garden project added five pavement markers along the verified public route. A walking guide paired historical photographs with modern views and clearly labelled uncertain sections. Grandad Sol recorded his bus memory too, showing how transportation changed after the trolley closed.`,
          `At the guide's opening walk, people followed a route that had nearly vanished. Bark Bolt rang a handbell at each former stop until the librarian suggested a quieter interpretation. Nia preferred the small bronze markers. They did not pretend the past was complete; they invited walkers to compare evidence. The secret trail had been visible in rails, windows, symbols, and stories, but only when different sources were connected carefully.`
        ],
        callout: {
          label: "Evidence Limit",
          text: "The guide marks verified locations and labels uncertain sections instead of filling gaps with guesses.",
        },
      },
    ],
    illustration: illustration(
      57,
      "Nia and Bark Bolt overlay a faded trolley photograph and route map on a modern street where rails emerge beside the rain garden.",
      "Old records and surviving landmarks trace the Creek Loop through today's town.",
      "trolley-route-historical-trail",
      "#B76A3B",
    ),
    vocabulary: [
      word("archive", "a collection of records preserved for research or history", ["records collection", "repository"], "The town archive had no trolley route on its current map.", "Old newspapers and notebooks were stored there."),
      word("remnant", "a small surviving piece of something that once was larger", ["remainder", "trace"], "Near the mill, a short rail remnant served as the edge of a flower bed.", "Only one piece of the former track remained visible."),
      word("verified", "checked with evidence and confirmed as accurate", ["confirmed", "validated"], "The rain-garden project added five pavement markers along the verified public route.", "Several sources supported those locations."),
    ],
    comprehension: [
      question("l57-q1", "Right There", "Which feature in the 1928 photograph helped locate the bakery stop?", "The old bakery's upper windows still matched the building now used as a bicycle shop.", "This comparison appears on page 1, paragraph 2."),
      question("l57-q2", "Think and Search", "How did the records correct Grandad Sol's sincere memory?", "The conductor's stop list, photograph, rails, and closure article traced the trolley elsewhere. He had remembered the replacement bus route that followed after the trolley closed.", "The correction requires evidence from the first page and context on the second."),
      question("l57-q3", "On My Own", "Should a town mark a historical route if some sections remain uncertain? Explain how it could do so honestly.", "A reasonable answer may support marking verified parts while clearly labelling gaps, or oppose it if uncertainty is too great, with a reason.", "This judgement permits different evidence-based positions.", true),
      question("l57-q4", "Think and Search", "Why did the team choose pavement markers and a guide instead of uncovering all the rails?", "Full excavation could damage streets, roots, and private property; markers preserved access to the story without harming current places, and the guide could show both evidence and uncertainty.", "The physical trail and final preservation choice appear on page 2."),
      question("l57-q5", "Author and You", "How do the old windows and stone apple support the passage's message about historical evidence?", "They show that ordinary details can survive major changes and help connect records with real locations when no single source tells the complete story.", "The reader links landmark details with the final statement."),
    ],
    paragraphTask: paragraphTask(
      57,
      "Write an evidence paragraph explaining how investigators reconstructed the Creek Loop route.",
      "Different physical and documentary sources supported one another and corrected an unreliable memory.",
      "Investigators reconstructed the trolley route by connecting...",
      [
        "Buried rails matched the spacing and location shown in a dated photograph.",
        "Surviving windows and carved symbols linked old businesses to modern buildings.",
        "Power markers and an old utility map traced a supporting cable route.",
        "A newspaper and conductor's notebook supplied closure details and stop order.",
      ],
      [
        "The librarian preferred quiet markers to a handbell.",
        "The rain garden contained purple flowers.",
      ],
      "Add a sentence explaining how the team treated uncertain sections.",
      "Conclude with why several sources were stronger than one memory.",
      "Use evidence transitions, distinguish fact from inference, and include archive or verified.",
      ["archive", "verified"],
      "Investigators reconstructed the trolley route by connecting physical and archived evidence. Buried rails matched a dated photograph, while unchanged windows and carved symbols identified former stops. Power markers suggested a related cable path, and a newspaper and conductor's notebook supplied the route order. Where evidence remained incomplete, the guide labelled uncertainty instead of guessing. Several independent sources produced a more reliable, verified route than one person's honest memory could provide.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 58,
    title: "The Secret of the Silver Medal",
    genre: "Sports history mystery",
    informational: false,
    band: "intermediate",
    objective: "Infer the meaning of an artifact by comparing inscriptions, records, and character testimony.",
    skillTags: ["RL.5.1", "RL.5.2", "artifact evidence", "theme", "character motivation"],
    pages: [
      {
        pageNumber: 1,
        subheading: "A Medal with Two Winners",
        paragraphs: [
          `The school trophy case held a silver medal engraved CROSS-COUNTRY, 1986. Beneath the date were two sets of initials: E.M. and R.K. A typed card named only one runner, Elena Mora. During exhibit cleaning, Nia noticed a faint seam around the medal's edge and a tiny arrow pointing toward it.`,
          `Grandad Sol remembered the race. Elena had finished second after stopping near the final hill, but he could not recall why. The newspaper clipping praised her “unusual decision” without explaining it. Race results listed Rina Kwan as fifth. If the medal belonged to Elena, why did it also carry Rina's initials?`,
          `Bark Bolt held the medal while curator Mr. Lee pressed the edge only after receiving permission from Elena, now a local coach. A thin outer ring rotated. When the arrow aligned with the date, an inner inscription appeared: WE FINISH TOGETHER. Elena smiled but asked the students to investigate the records before hearing her version.`,
          `Photographs showed heavy rain and a muddy course. In one image, Rina sat beside a fallen direction sign while runners turned down the wrong trail. Elena, already past the turn, looked back. A judge's report said the sign had collapsed in wind. Rina had stayed there, redirecting runners until an official arrived, losing several places herself.`
        ],
        callout: {
          label: "Artifact Clues",
          text: "Two initials, rotating ring, hidden inscription, race photograph, and judge's report reveal different parts of the medal's meaning.",
        },
      },
      {
        pageNumber: 2,
        subheading: "The Choice Behind Second Place",
        paragraphs: [
          `Elena had been leading when she saw Rina alone in the storm. She stopped, helped brace the sign, and waited until two adults reached them. By the time she resumed, another runner had passed her. The official offered to adjust the results because of the broken marker, but Elena declined. She said the winner had run fairly and deserved first place.`,
          `At the awards table, Elena received the silver medal. She later asked the maker to add Rina's initials and the hidden message. Rina's action had protected the fairness and safety of the entire race, while Elena's choice had supported her. Neither runner wanted a separate public award, so their shared inscription remained a quiet reminder known to the team.`,
          `The old exhibit card had reduced the story to a place and a name. Nia wrote a new caption after Elena and Rina approved it. It explained the collapsed sign and shared inscription without claiming that one person “rescued” the other. The decision had been mutual: Rina guarded the route, Elena chose to help, officials completed the repair, and the winner still earned first.`,
          `At the display reopening, current runners studied the medal longer than any gold trophy. Bark Bolt asked whether teamwork always required giving up a prize. Coach Elena said no; it required noticing how one's choices affected others and acting with integrity. The medal remained silver, but its secret changed what second place meant. It commemorated a race in which fairness depended on more than who crossed the line first.`
        ],
        callout: {
          label: "Revised Caption",
          text: "The medal honours Elena Mora's second-place finish and the shared sportsmanship of Elena Mora and Rina Kwan during a storm-damaged race.",
        },
      },
    ],
    illustration: illustration(
      58,
      "Nia and Bark Bolt turn the silver medal's outer ring to reveal a hidden inscription beside a rainy 1986 race photograph.",
      "The rotating medal reveals why two runners share one message.",
      "silver-medal-hidden-inscription",
      "#9AA7B6",
    ),
    vocabulary: [
      word("inscription", "words cut, printed, or written on an object", ["engraving", "message"], "When the arrow aligned with the date, an inner inscription appeared.", "The message was hidden inside the rotating medal."),
      word("integrity", "the quality of acting honestly and according to strong principles", ["honesty", "uprightness"], "Coach Elena said teamwork required acting with integrity.", "She respected the winner and helped another runner."),
      word("commemorated", "honoured or kept the memory of an event or person", ["honoured", "memorialized"], "It commemorated a race in which fairness depended on more than who crossed the line first.", "The medal preserved the story."),
    ],
    comprehension: [
      question("l58-q1", "Right There", "What hidden message appeared when the medal's ring was turned?", "The message was “WE FINISH TOGETHER.”", "It appears in page 1, paragraph 3."),
      question("l58-q2", "Think and Search", "Why did both Elena and Rina's initials belong on the medal?", "Rina stayed to direct runners after the sign fell, and Elena stopped to help her until officials arrived. Their connected choices protected fairness and safety.", "Rina's action is described on page 1 and Elena's on page 2."),
      question("l58-q3", "On My Own", "Can a person make a fair choice and still feel disappointed by the result? Explain.", "A thoughtful answer recognizes that doing what is right does not erase feelings about losing, and supports the view with a reason or example.", "This personal reflection does not require a passage quotation.", true),
      question("l58-q4", "Think and Search", "How did the new exhibit caption improve on the original card?", "It added the broken sign, both runners, and the shared sportsmanship while avoiding an oversimplified rescue claim.", "The original card is introduced on page 1; the revision is explained on page 2."),
      question("l58-q5", "Author and You", "Why is a silver medal more effective than a gold trophy for this story's message?", "Second place shows that Elena's choice had a cost, yet the shared inscription gives the result deeper value and shifts attention from winning to integrity.", "The reader interprets the object using Elena's choice and the final paragraph."),
    ],
    paragraphTask: paragraphTask(
      58,
      "Write a theme paragraph explaining how the medal represents integrity rather than only second place.",
      "The medal records both a race result and choices that protected fairness and other people.",
      "The silver medal represents integrity because...",
      [
        "Rina gave up racing positions to direct runners away from a wrong turn.",
        "Elena stopped while leading so Rina did not manage the danger alone.",
        "Elena accepted the fair winner instead of demanding the result be changed.",
        "The shared inscription honoured both runners' choices.",
      ],
      [
        "The medal's rotating ring made a faint clicking sound.",
        "The trophy case was cleaned before the exhibit reopened.",
      ],
      "Add a sentence explaining what Elena sacrificed and what she preserved.",
      "Conclude with a broader meaning of success in competition.",
      "Use a theme transition, strengthen one character description, and include integrity or commemorated.",
      ["integrity", "commemorated"],
      "The silver medal represents integrity because it records choices beyond the finishing order. Rina sacrificed places to guide runners safely, and Elena gave up her lead to help her. Elena then accepted the fair winner rather than demanding an adjusted result. The shared inscription commemorated both athletes' courage and honesty. Their actions preserved a fair race even though Elena lost first place. In competition, success can include protecting others and respecting a deserved result.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 59,
    title: "How the Moon Affects Ocean Tides",
    genre: "Informational space and ocean science",
    informational: true,
    band: "intermediate",
    objective: "Explain how gravity and relative positions of the Moon, Sun, and Earth influence predictable tidal patterns.",
    skillTags: ["RI.5.2", "RI.5.3", "earth and space systems", "model reasoning", "cause and effect"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Gravity Across a Moving Earth",
        paragraphs: [
          `Along many coasts, ocean water rises and falls in a repeating pattern called tides. The Moon is the strongest influence on Earth's tides because its gravitational pull affects the oceans. The Sun also contributes. Coastline shape, water depth, weather, and the size of an ocean basin change how high, low, early, or late local tides appear.`,
          `The Moon pulls more strongly on the side of Earth nearest to it than on Earth's centre, and least strongly on the far side. These differences help create two broad tidal bulges: one generally facing the Moon and another on the opposite side. As Earth rotates through these bulges, many coastal locations experience two high and two low tides during a lunar day, though local patterns vary.`,
          `A diagram often shows smooth bulges around a perfectly round Earth. That simplified model explains the main gravitational pattern, not the exact shape of real oceans. Continents interrupt water movement. Narrow bays can concentrate tides, while shallow shelves, islands, and seafloor features alter timing and height. Some places have one main high tide each day, and others have mixed heights.`,
          `Tides are not caused by the Moon “lifting” a single wave that follows beneath it. The whole Earth-Moon system is moving, and gravity acts across the planet. Nor are tides the same as wind-driven waves. Waves may rise and fall in seconds, while the interval between a high tide and the next low tide is usually measured in hours.`
        ],
        callout: {
          label: "Model Reminder",
          text: "Two smooth bulges show the basic gravitational pattern; coastlines and ocean basins make real local tides more complex.",
        },
      },
      {
        pageNumber: 2,
        subheading: "When the Sun Joins the Pattern",
        paragraphs: [
          `Near new moon and full moon, the Sun, Earth, and Moon are roughly aligned. Their combined influence produces spring tides, which have a larger difference between high and low water. “Spring” here means to rise or leap; it is not the season. Near first- and third-quarter moon, the Sun and Moon pull at roughly right angles, producing neap tides with a smaller range.`,
          `These names describe a repeating astronomical pattern, not a promise of a particular water level. Air pressure and strong winds can raise or lower water, especially during storms. A high spring tide combined with onshore wind may create more coastal flooding than the tide alone. Local tide predictions use long observations and detailed calculations for specific locations.`,
          `Tide tables help harbour workers, fishers, boaters, scientists, and beach visitors plan. A rocky path that is dry at low tide may be covered later. Responsible visitors check the correct location and date, leave time to return, and follow local warnings. They do not estimate safety only by looking at the Moon or by copying a table from another harbour.`,
          `Nia compared a tide chart with marks on a pier. The predicted times were close, but wind made that afternoon's high water slightly higher. The difference did not mean gravity had stopped working or the chart was useless. It showed that a strong scientific pattern can interact with local conditions. The Moon helps make tides predictable, while careful observers still respect the coast's specific shape, weather, and changing water.`
        ],
        callout: {
          label: "Tidal Range",
          text: "Spring tides: larger high-to-low difference. Neap tides: smaller difference. Both occur throughout the year.",
        },
      },
    ],
    illustration: illustration(
      59,
      "A two-part diagram shows tidal bulges aligned with the Moon and compares Sun-Moon positions during spring and neap tides.",
      "Gravity creates a broad pattern that local coastlines and weather reshape.",
      "moon-tides-spring-neap-diagram",
      "#4169A8",
    ),
    vocabulary: [
      word("gravitational", "related to the force that attracts masses toward one another", ["gravity-related", "attractive"], "The Moon's gravitational pull affects the oceans.", "This force links Earth and the Moon."),
      word("interval", "a period of time or space between two events", ["gap", "span"], "The interval between a high tide and the next low tide is usually measured in hours.", "It is the time from one stage to another."),
      word("aligned", "arranged along a line or in matching positions", ["lined up", "positioned"], "The Sun, Earth, and Moon are roughly aligned.", "Their positions combine near new and full moon."),
    ],
    comprehension: [
      question("l59-q1", "Right There", "What are spring and neap tides?", "Spring tides have a larger difference between high and low water when Sun, Earth, and Moon are roughly aligned; neap tides have a smaller range when Sun and Moon pull at roughly right angles.", "Both definitions appear on page 2, paragraph 1."),
      question("l59-q2", "Think and Search", "Why can two coastal places have different tides even on the same day?", "Coastline shape, water depth, basin size, islands, seafloor features, winds, and pressure alter the broad gravitational pattern differently at each place.", "Local factors are explained across both pages."),
      question("l59-q3", "On My Own", "What information would you check before walking on a beach route that floods at high tide? Explain why each item matters.", "A strong response includes the correct local tide table, date, weather, return time, and local warnings, with practical reasons.", "This safety application requires reasoning, not a quotation.", true),
      question("l59-q4", "Think and Search", "How is the smooth-bulge model useful and limited?", "It shows how differences in lunar gravity create a basic two-bulge pattern, but it cannot show exact local timing and height because real continents, basins, and weather complicate the water's movement.", "Page 1 describes the model; page 2 adds weather and prediction details."),
      question("l59-q5", "Author and You", "Why does the author include Nia's slightly higher-than-predicted tide?", "It demonstrates that a reliable astronomical pattern can interact with weather, so a small difference does not disprove the science or eliminate the need for local observation.", "The answer interprets the final example using the article's distinction between pattern and local conditions."),
    ],
    paragraphTask: paragraphTask(
      59,
      "Write a comparison paragraph explaining spring tides and neap tides.",
      "The Moon and Sun affect tidal range differently depending on their relative positions.",
      "Spring and neap tides are both predictable patterns, but...",
      [
        "Spring tides occur near new and full moon when the Sun, Earth, and Moon are roughly aligned.",
        "Their combined influence creates a larger difference between high and low water.",
        "Neap tides occur near quarter moons when solar and lunar pulls are roughly at right angles.",
        "Neap tides have a smaller difference between high and low water.",
      ],
      [
        "Nia noticed wind moving a flag near the pier.",
        "The word spring can also name a season with flowers.",
      ],
      "Add a detail explaining why neither pattern guarantees one exact local water level.",
      "Conclude with how the comparison helps a coastal visitor plan.",
      "Use both similarity and contrast transitions, maintain accurate cause language, and include aligned or interval.",
      ["aligned", "interval"],
      "Spring and neap tides are both predictable patterns, but they produce different tidal ranges. Near new and full moon, the Sun, Earth, and Moon are roughly aligned, so spring tides have a larger high-to-low difference. By contrast, near quarter moons their pulls act at roughly right angles, producing the smaller range of neap tides. Coastline shape and weather can alter either pattern locally. Understanding the difference helps coastal visitors choose a correct tide table and allow a safe travel interval.",
    ),
    sourceReferences: [
      { label: "NOAA Ocean Service — What Causes Tides?", url: "https://oceanservice.noaa.gov/education/tutorial_tides/tides02_cause.html" },
      { label: "NOAA Ocean Service — Tides and Water Levels", url: "https://oceanservice.noaa.gov/education/tutorial_tides/" },
    ],
  }),
  lesson({
    sequence: 60,
    title: "The Bark Bolt Detective Games",
    genre: "Mystery competition",
    informational: false,
    band: "intermediate",
    objective: "Compare plausible explanations, corroborate clues, and explain how collaboration improves a deduction.",
    skillTags: ["RL.5.1", "RL.5.3", "compare evidence", "collaboration", "theme"],
    pages: [
      {
        pageNumber: 1,
        subheading: "The Race to Be Right",
        paragraphs: [
          `Maple Creek's first Detective Games offered three staged cases. Bark Bolt wanted the golden magnifying glass, while Nia wanted a careful investigation. In round one, teams had to identify who moved a box of library bookmarks. Bark Bolt spotted muddy paw prints and accused the dog mascot before Nia finished reading the rules.`,
          `The prints were real but belonged to a demonstration earlier that morning. A fresh wheel mark led from the box's original shelf to a reading cart. A librarian's checklist confirmed that volunteers had moved the bookmarks for an outdoor event. Bark Bolt's explanation was plausible because it matched one clue, but the checklist and timing contradicted it.`,
          `In round two, a recorded voice said, “The key is under the blue bench.” Three blue benches stood in different places. Nia compared background sounds. One recording contained a ticking clock, another a fountain, and the original included bouncing balls. The gym bench fit the sound. Bark Bolt checked beneath it and found a card marked CORROBORATE.`,
          `The card explained that one clue should be supported by another independent clue. Bark Bolt slowed down. In round three, a sandwich disappeared from a picnic display. Crumbs led to a tree, a squirrel puppet sat on a branch, and a wrapper rested below. The quick answer was “squirrel,” but the puppet had fabric paws and could not make the tiny scratches on the box.`
        ],
        callout: {
          label: "Game Rule",
          text: "A plausible idea becomes stronger when independent evidence supports its timing, location, and cause.",
        },
      },
      {
        pageNumber: 2,
        subheading: "The Clue No Team Owned",
        paragraphs: [
          `Nia saw that the wrapper had been folded into a paper boat. Bark Bolt smelled cinnamon, though the display sandwich contained cheese. Another team had found cinnamon dust beside the craft table but hid the fact, hoping to win alone. A third team held a schedule showing that the picnic display was empty during setup. No group had enough evidence by itself.`,
          `The teams reluctantly shared clues. The craft leader then explained that the “sandwich” was a foam prop used to shape paper wrappers. It had never contained food. Cinnamon dough from another activity made the scratches and scent. A fan blew the lightweight prop behind the tree, where a volunteer later picked it up. The supposed theft was a chain of setup events.`,
          `Judge Amara awarded no points for the fastest accusation. She awarded points for revised reasoning, evidence sharing, and clear explanations. Bark Bolt and Nia tied with the other teams. At first, Bark Bolt's ears drooped because no single champion received the golden glass. Then Amara turned the trophy around. Its base read BEST QUESTIONERS, plural.`,
          `The Detective Games ended with every team presenting one mistake and one improvement. Bark Bolt admitted that he had treated the first story that fit as the only possible story. Nia admitted that she sometimes collected too long before sharing. Their final deduction was simple: good detectives need both curiosity and correction. They carried the trophy together, which was fortunate because the giant golden magnifying glass was heavier than it looked.`
        ],
        callout: {
          label: "Detective Cycle",
          text: "Notice → propose → corroborate → compare alternatives → revise → explain.",
        },
      },
    ],
    illustration: illustration(
      60,
      "Nia, Bark Bolt, and several student teams combine a sound clue, schedule, cinnamon dust, and paper wrapper beneath a giant golden magnifying glass.",
      "The final case can be solved only when teams share and corroborate their clues.",
      "detective-games-shared-evidence",
      "#F0A623",
    ),
    vocabulary: [
      word("plausible", "seeming reasonable or possible", ["believable", "credible"], "Bark Bolt's explanation was plausible because it matched one clue.", "The idea could be true, but it needed more support."),
      word("corroborate", "to support a statement with additional evidence", ["confirm", "support"], "The card explained that one clue should be supported by another independent clue.", "A second clue strengthens the first."),
      word("deduction", "a conclusion reached by reasoning from evidence", ["conclusion", "inference"], "Their final deduction was simple: good detectives need both curiosity and correction.", "They reached this idea after reviewing the games."),
    ],
    comprehension: [
      question("l60-q1", "Right There", "Which evidence showed that the library dog mascot had not moved the bookmarks?", "The paw prints were from an earlier demonstration, while a fresh wheel mark and librarian checklist showed volunteers moved the box on a cart.", "The correction appears in page 1, paragraph 2."),
      question("l60-q2", "Think and Search", "Why could no single team solve the final case alone?", "One had the wrapper and scent, another had cinnamon dust, and a third had the setup schedule. The explanation required all clues plus the craft leader's account.", "Evidence is divided between the end of page 1 and beginning of page 2."),
      question("l60-q3", "On My Own", "When does competition improve teamwork, and when can it weaken teamwork? Give one reason for each.", "A thoughtful response may say goals create motivation but secrecy or rushing can block shared evidence, with a clear example or reason.", "This personal judgement does not require a quotation.", true),
      question("l60-q4", "Think and Search", "How did Bark Bolt and Nia each improve as detectives?", "Bark Bolt slowed down and revised quick accusations; Nia recognized that collecting evidence is not enough if she waits too long to share it.", "Their early behaviour and final admissions must be compared."),
      question("l60-q5", "Author and You", "Why is BEST QUESTIONERS a more suitable trophy label than FASTEST DETECTIVE?", "The games reward checking, sharing, revising, and explaining rather than speed. The plural label also reflects collaborative investigation.", "The answer draws on the scoring rules and shared solution."),
    ],
    paragraphTask: paragraphTask(
      60,
      "Write a theme paragraph explaining why revision was more valuable than a fast accusation in the Detective Games.",
      "Investigators improved their conclusions by comparing alternatives, sharing evidence, and correcting mistakes.",
      "Revision mattered more than speed in the Detective Games because...",
      [
        "The first explanation about paw prints ignored the checklist and timing.",
        "Background sounds were needed to select the correct blue bench.",
        "The final case required clues held by several teams.",
        "Judges awarded points for revised reasoning and clear explanations.",
      ],
      [
        "The golden magnifying glass was surprisingly heavy.",
        "The squirrel puppet sat on a tree branch.",
      ],
      "Add a sentence showing how a plausible idea can still be wrong.",
      "Conclude with a principle for collaborative problem solving.",
      "Use an example transition, improve one general noun, and include corroborate or deduction.",
      ["corroborate", "deduction"],
      "Revision mattered more than speed in the Detective Games because the first plausible idea was not always correct. For example, paw prints suggested the mascot, but the timing and checklist contradicted that accusation. In the final case, teams had to corroborate one another's clues before explaining the missing prop. Judges rewarded this careful revision rather than quick answers. A strong deduction grows when collaborators share evidence, compare alternatives, and correct an idea openly.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 61,
    title: "The Mystery of the Contradictory Witnesses",
    genre: "Evidence mystery",
    informational: false,
    band: "advanced",
    objective: "Reconcile apparently conflicting witness accounts by evaluating viewpoint, timing, and the limits of observation.",
    skillTags: ["RL.5.1", "RL.5.6", "point of view", "conflicting evidence", "argument writing"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Four Stories About One Crash",
        paragraphs: [
          `A crash shook the school art show at 6:12. When Nia reached the atrium, a tall cardboard sculpture lay across the floor, safely away from visitors. Four witnesses offered contradictory accounts. Leo said a person in red had bumped it. Ana said nobody touched it. Mr. Ortiz saw the base slide left. Mina insisted it tipped right.`,
          `Bark Bolt wanted to count votes, but witnesses are not measuring machines. Nia mapped each person's vantage point. Leo had looked through a red glass panel from the hallway. Ana stood behind the sculpture, where a curtain hid its base. Mr. Ortiz watched from the stairs above, and Mina faced its mirrored side. The same movement could appear different through coloured glass, reflected space, and blocked views.`,
          `The “person in red” was actually Principal Pine in a white jacket viewed through the red panel. Hallway video showed her walking two metres from the sculpture without contact. Ana had correctly seen no person touch it, though she could not see the bottom. Those accounts were no longer in conflict once the investigators defined what each witness could observe.`,
          `The direction remained puzzling. A straight scrape ran left across the floor, supporting Mr. Ortiz. Yet Mina's phone video showed the silver top leaning right before it fell. Nia separated sliding from tipping: the base could travel left while the tall upper section leaned right. Both witnesses had described a different part of the same motion.`
        ],
        callout: {
          label: "Viewpoint Chart",
          text: "Leo: through red glass. Ana: base blocked. Mr. Ortiz: above. Mina: beside mirror. Each view reveals and hides different details.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Agreement Hidden Inside Disagreement",
        paragraphs: [
          `A fifth account arrived from the building sensor log. At 6:11:58, the ventilation system started its evening cycle. A strong air current crossed the atrium. The sculpture's label said that its base should contain four sandbags, but volunteers found only three. One bag had been removed earlier when a leaking plant pot soaked it and had not been replaced.`,
          `Nia reconstructed the event without pretending every detail was certain. The air current pushed the lightweight upper section. The underweighted base slid left on the smooth floor; momentum made the top lean right and collapse. The evidence explained the marks and video. It also fit Ana's report that no one touched the sculpture.`,
          `The art teacher asked whether any witness had been wrong. Nia said Leo had misidentified the jacket colour and assumed a bump, but his observation of someone nearby was sincere. Each account mixed observation with interpretation. The group revised their statements: “I saw a light jacket through red glass,” or “I saw the top lean right.” The precise wording made differences easier to reconcile.`,
          `Volunteers added the fourth sandbag, secured the sculpture, and placed delicate work outside the strongest airflow. At the closing meeting, Mina and Mr. Ortiz read their first statements aloud, then acted out the slide-and-tip motion. Everyone laughed at how opposite their words had sounded. Bark Bolt wrote the lesson on the incident card: disagreement does not always mean dishonesty. Sometimes the truth is larger than any one place from which it is seen.`
        ],
        callout: {
          label: "Reconciled Sequence",
          text: "Ventilation starts → underweighted base slides left → tall top leans right → sculpture falls without being touched.",
        },
      },
    ],
    illustration: illustration(
      61,
      "A top-down atrium diagram places four witnesses around a fallen sculpture with arrows showing its base sliding left and top tipping right.",
      "Different vantage points produce different but partly compatible accounts of one motion.",
      "contradictory-witness-viewpoints",
      "#D75555",
    ),
    vocabulary: [
      word("contradictory", "appearing to state opposite or incompatible things", ["conflicting", "inconsistent"], "Four witnesses offered contradictory accounts.", "One said left while another said right."),
      word("vantage", "a position from which something is viewed", ["viewpoint", "standpoint"], "Nia mapped each person's vantage point.", "The stairs, mirror, curtain, and glass changed each view."),
      word("reconcile", "to show how differences can be made consistent or understood together", ["resolve", "harmonize"], "The precise wording made differences easier to reconcile.", "Sliding left and tipping right could both occur."),
    ],
    comprehension: [
      question("l61-q1", "Right There", "Why did Leo report seeing a person in red?", "He saw Principal Pine's white jacket through a red glass panel.", "The colour effect is explained on page 1."),
      question("l61-q2", "Think and Search", "How could Mr. Ortiz and Mina both describe the sculpture's direction accurately?", "Mr. Ortiz saw the base slide left from above, while Mina saw the upper section lean right beside a mirror. They observed different parts of one motion.", "Their vantage points and the slide-tip distinction appear on page 1."),
      question("l61-q3", "On My Own", "When two people remember an event differently, what question would you ask before deciding that one is wrong? Explain why.", "A strong response asks about location, timing, exact observations, obstructions, or assumptions and explains how the answer might clarify the difference.", "This personal strategy question needs reasoning, not a quotation.", true),
      question("l61-q4", "Think and Search", "Which evidence supports the final explanation of the fall?", "The ventilation log showed an air current, the missing sandbag left the base light, the floor scrape showed a left slide, the video showed a right lean, and no contact appeared on video.", "Evidence from both pages must be combined."),
      question("l61-q5", "Author and You", "Why does the author have witnesses revise “what happened” into precise statements about what they saw?", "It separates observation from interpretation, showing how careful language can reveal agreement hidden inside conflicting conclusions.", "The answer connects the revised wording with the story's final message."),
    ],
    paragraphTask: paragraphTask(
      61,
      "Write an evidence-based explanation that reconciles the apparently contradictory witness statements.",
      "Viewpoint and the sculpture's two-part motion explain why sincere witnesses reported different details.",
      "The witness statements sounded contradictory, but they can be reconciled because...",
      [
        "Red glass changed the appearance of Principal Pine's white jacket.",
        "A curtain prevented Ana from seeing the moving base.",
        "Mr. Ortiz saw the base slide left from above.",
        "Mina saw the upper section lean right from beside a mirror.",
      ],
      [
        "The art show included a painting of three green apples.",
        "Bark Bolt wrote the incident card with a blue pen.",
      ],
      "Add a sentence connecting the missing sandbag and ventilation cycle to the motion.",
      "Conclude with a rule for evaluating conflicting eyewitness accounts.",
      "Use a concession transition, clarify each pronoun's referent, and include vantage or reconcile.",
      ["vantage", "reconcile"],
      "The witness statements sounded contradictory, but their vantage points help reconcile them. Although Leo reported red clothing, red glass had changed a white jacket's appearance. Ana saw no contact but could not see the base. From above, Mr. Ortiz saw that base slide left, while Mina saw the upper section lean right. The missing sandbag and ventilation current explain both motions. Conflicting accounts should be compared by separating exact observations from later interpretations.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 62,
    title: "What’s Beneath a Glacier?",
    genre: "Informational earth science",
    informational: true,
    band: "advanced",
    objective: "Synthesize evidence about glacier movement and explain how ice, water, rock, and landforms interact below the surface.",
    skillTags: ["RI.5.2", "RI.5.3", "earth systems", "model evaluation", "scientific evidence"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Ice That Moves Over Hidden Ground",
        paragraphs: [
          `A glacier is a large, long-lasting mass of ice formed on land from accumulated snow. Its bright surface may look still, but gravity causes glacier ice to deform and flow downhill. Some glaciers also slide where their bases meet the ground. Beneath the ice lies a hidden boundary of rock, sediment, water, pressure, and changing temperature.`,
          `The bottom of a glacier is not the same everywhere. Where ice is frozen to its bed, movement may be slow and the underlying material can remain relatively protected. Where pressure and geothermal heat allow liquid water, the base may slide more readily. Meltwater can travel through cracks, channels, and spaces within sediment, changing friction between ice and ground.`,
          `As a glacier moves, rock fragments frozen into its base can scrape and polish bedrock. Larger pieces may carve grooves called striations. Ice can also pluck blocks from cracked rock and transport them. Beneath other glaciers, mixtures of clay, sand, gravel, and boulders form a sediment called till. These processes reshape valleys over long periods.`,
          `Scientists cannot simply lift a glacier to look underneath. They study exposed landscapes left after ice retreats, drill narrow boreholes, measure motion with GPS, and send radar energy through ice. Ice-penetrating radar can reveal the shape of buried bedrock and layers, though interpreting the signals requires care. Seismic instruments and meltwater studies add other kinds of evidence.`
        ],
        callout: {
          label: "Subglacial Possibilities",
          text: "Bedrock, loose sediment, frozen contact, flowing meltwater, or mixtures of these can exist beneath different parts of a glacier.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Landscapes Revealed After Ice",
        paragraphs: [
          `A glacier can deepen and widen an existing river valley into a broad U shape. It may leave ridges of till called moraines along its sides or at former edges. When ice melts, transported boulders called erratics can remain far from the rock type where they began. Scratches in bedrock preserve clues about the direction ice once travelled.`,
          `Meltwater creates its own features. Subglacial streams beneath the ice, and other streams beside it, sort some sediment by size. In certain places, winding ridges of sand and gravel called eskers record channels that once carried water through or under a glacier. A buried block of ice may melt and leave a hollow called a kettle. Not every glaciated landscape contains every feature.`,
          `What happens beneath modern glaciers matters to predictions of ice movement. If extra surface meltwater reaches the bed, sliding can briefly increase in some places, but the drainage system may later become more efficient and change that response. Bed shape, ice thickness, temperature, and water pressure interact. One measurement or one season cannot describe every glacier.`,
          `Imagine reading a book with its cover closed by examining the shadow it casts, sounds from inside, and marks left on a table. Glaciologists face a similar challenge. They combine indirect measurements, physical samples, landforms, and computer models. The hidden world under ice is not an empty gap. It is an active boundary where water flows, rock breaks, sediment shifts, and evidence of past and future glacier motion is written into the land.`
        ],
        callout: {
          label: "Landform Evidence",
          text: "Striations show motion direction; moraines hold unsorted till; eskers can mark former meltwater channels; erratics reveal transport.",
        },
      },
    ],
    illustration: illustration(
      62,
      "A cutaway glacier diagram shows flowing ice, bedrock striations, till, meltwater channels, a moraine, an esker, and radar waves from a scientist above.",
      "Tools and landforms reveal the active boundary hidden beneath glacier ice.",
      "glacier-subglacial-cutaway",
      "#65B8D6",
    ),
    vocabulary: [
      word("deform", "to change shape under force or pressure", ["reshape", "distort"], "Gravity causes glacier ice to deform and flow downhill.", "Solid ice slowly changes shape."),
      word("striations", "long scratches or grooves cut into rock by moving material", ["grooves", "scratches"], "Larger pieces may carve grooves called striations.", "They can show the direction of ice travel."),
      word("subglacial", "located or occurring beneath a glacier", ["under-ice", "beneath-glacier"], "Subglacial possibilities include bedrock, sediment, and meltwater.", "The prefix sub means under."),
    ],
    comprehension: [
      question("l62-q1", "Right There", "What can exist at the boundary beneath a glacier?", "Bedrock, sediment, rock fragments, frozen contact, and liquid meltwater channels can occur beneath different parts.", "Page 1 and its callout list these materials and conditions."),
      question("l62-q2", "Think and Search", "How can water beneath ice both affect movement and leave evidence after the glacier is gone?", "Water can change friction and glacier sliding, and subglacial streams can sort sediment into features such as eskers that remain after melting.", "The movement effect is on page 1 and the landform evidence on page 2."),
      question("l62-q3", "On My Own", "Which tool or clue would you choose to investigate a hidden surface, and what limitation would you remember?", "A strong response chooses radar, boreholes, GPS, landforms, or another method and explains that each provides only part of the evidence.", "This application needs a reasoned choice rather than a quotation.", true),
      question("l62-q4", "Think and Search", "Why can scientists not use one simple rule to predict how every glacier responds to more meltwater?", "Glaciers differ in drainage, bed shape, thickness, temperature, and pressure, and their drainage systems can change over a season.", "The passage describes varied beds on page 1 and interacting factors on page 2."),
      question("l62-q5", "Author and You", "How does the closed-book comparison explain the work of glaciologists?", "Scientists cannot see the whole bed directly, so they combine indirect signals and traces, much as someone might infer a closed book's contents from several outside clues.", "The analogy is interpreted using the earlier list of methods."),
    ],
    paragraphTask: paragraphTask(
      62,
      "Write a cause-and-evidence paragraph explaining how moving glacier ice can reshape land.",
      "Rock fragments and ice motion erode, transport, and deposit material, leaving identifiable landforms.",
      "Moving glacier ice reshapes land by...",
      [
        "Rock fragments at the base scrape and polish bedrock.",
        "Embedded stones carve striations that record movement direction.",
        "Ice plucks and transports rock blocks away from their source.",
        "Melting ice deposits till, moraines, and transported erratics.",
      ],
      [
        "Scientists wear protective eyewear near drilling equipment.",
        "Fresh snow can sparkle in direct sunlight.",
      ],
      "Add a detail explaining how meltwater can create a different kind of landform.",
      "Conclude by stating how exposed landforms help reveal hidden past processes.",
      "Use cause-and-effect transitions, distinguish erosion from deposition, and include striations or subglacial.",
      ["striations", "subglacial"],
      "Moving glacier ice reshapes land by eroding, transporting, and depositing material. Rock fragments at the base scrape bedrock and carve striations, while ice plucks blocks and carries them downhill. When the glacier melts, it deposits till, moraines, and far-travelled erratics. Subglacial streams can also sort sand and gravel into winding eskers. These exposed features allow scientists to infer processes that once occurred beneath ice they could not directly observe.",
    ),
    sourceReferences: [
      { label: "USGS Water Science School — Glaciers and Icecaps", url: "https://www.usgs.gov/special-topics/water-science-school/science/glaciers-and-icecaps" },
      { label: "NASA Earth Observatory — Glaciers", url: "https://earthobservatory.nasa.gov/world-of-change/glacier" },
    ],
  }),
  lesson({
    sequence: 63,
    title: "The Time-Capsule Challenge",
    genre: "Community problem-solving story",
    informational: false,
    band: "advanced",
    objective: "Evaluate how selected artifacts represent a community and develop criteria for preserving evidence fairly.",
    skillTags: ["RL.5.2", "RL.5.3", "representation", "criteria", "evidence-based opinion"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Twenty Objects, Five Spaces",
        paragraphs: [
          `Maple Creek planned to seal a time capsule for fifty years, but the container held only five objects. Every club argued that its choice represented the school. The robotics team offered a circuit board; athletes wanted a jersey; the garden club brought seeds; the newspaper proposed a printed issue; and Bark Bolt nominated his favourite squeaky carrot.`,
          `Nia asked a difficult question: would five popular objects tell future students what daily life was actually like? The student council created criteria. Each item should reveal something important, survive safely, respect privacy, and add information not already shown by another item. A capsule was not a prize cupboard; it was a carefully curated message.`,
          `The criteria changed several choices. Seeds might not remain able to grow and could introduce moisture, but a labelled photograph and planting record could document the garden. A jersey showed school spirit, yet it took most of the container. Students photographed it beside many team and club shirts, creating one inclusive image. Bark Bolt's carrot failed the smell test before the durability test.`,
          `The newspaper offered broad coverage, but ordinary paper could become brittle in poor conditions. The library helped print an archival-quality summary and placed it in a protective sleeve. Students added a glossary because future readers might not understand current slang, app names, or school routines. Even familiar words can change meaning over fifty years.`
        ],
        callout: {
          label: "Selection Criteria",
          text: "Informative, durable, respectful of privacy, and different from the other chosen evidence.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Message with Honest Gaps",
        paragraphs: [
          `The final candidates were a class photograph, the school-life summary, a small 3-D printed model of the building, a local creek water-quality chart, and a student-created audio recording stored with written instructions and a transcript. Technology might change, so the recording could not stand alone. The transcript preserved its words even if the file became unreadable.`,
          `Then Mina noticed that the class photograph showed only students who attended picture day. Several absences and the remote-learning group were missing. The council could either pretend the image represented everyone or label its limits. They chose a collage made from voluntary contributions and added a caption stating the date, contributors, and known gaps.`,
          `The capsule challenge still had no perfectly representative answer. Five objects could not capture every language, friendship, lesson, worry, joke, or family. Nia wrote a letter to future students explaining how the council chose and what it left out. That admission became the sixth item, but it took almost no space because it was printed on the reverse of the summary.`,
          `At the sealing ceremony, Bark Bolt placed a drawing of the squeaky carrot in a margin. It was a joke, but also evidence of what the group had enjoyed. The capsule now held facts, voices, images, a model, measurements, and acknowledged limits. Future students would not receive Maple Creek exactly as it was. They would receive a transparent collection of clues—and an invitation to ask what the curators could not fit.`
        ],
        callout: {
          label: "Final Contents",
          text: "Collage, school-life summary and letter, building model, creek chart, audio with transcript—and clear captions about limits.",
        },
      },
    ],
    illustration: illustration(
      63,
      "Nia, Bark Bolt, and student council members arrange candidate artifacts around a small time-capsule container and a four-part criteria board.",
      "Limited space forces the council to choose, combine, caption, and explain its evidence.",
      "time-capsule-selection-challenge",
      "#E58B38",
    ),
    vocabulary: [
      word("criteria", "standards used to judge or make a decision", ["standards", "requirements"], "The student council created criteria.", "Items had to be informative, durable, respectful, and distinct."),
      word("curated", "carefully selected and organized for a purpose", ["selected", "organized"], "It was a carefully curated message.", "The council chose rather than collecting randomly."),
      word("representative", "showing important qualities of a larger group or whole", ["typical", "reflective"], "The capsule challenge still had no perfectly representative answer.", "Five items could not show every person and experience."),
    ],
    comprehension: [
      question("l63-q1", "Right There", "What four criteria did the council use to judge capsule items?", "Items had to be informative, durable, respectful of privacy, and different from the other evidence.", "The criteria are listed on page 1."),
      question("l63-q2", "Think and Search", "How did the council preserve information when an original object or technology might not last?", "It replaced seeds and a large jersey with documented images, protected the printed summary, and paired digital audio with instructions and a transcript.", "Solutions appear on both pages."),
      question("l63-q3", "On My Own", "What one item would you contribute to a time capsule, and which selection criteria would it meet?", "A strong response proposes an item and specifically explains its information, durability, privacy, or uniqueness.", "This personal choice requires reasons rather than a quotation.", true),
      question("l63-q4", "Think and Search", "Why was acknowledging gaps more honest than calling the collage a complete school picture?", "Not everyone participated or was present. The caption and letter identified who contributed and what could not be represented, preventing future readers from mistaking a sample for the whole community.", "The photo problem and final letter on page 2 support the answer."),
      question("l63-q5", "Author and You", "What does the squeaky-carrot drawing add even though it fails the formal artifact tests?", "It adds humour and evidence of the group's personality without risking odour or decay, showing that small informal details can complement formal records.", "The reader interprets the margin drawing using the earlier failed nomination."),
    ],
    paragraphTask: paragraphTask(
      63,
      "Write an argument explaining why the final capsule was more representative than a collection of the five most popular objects.",
      "The final selection used clear criteria, combined formats, and honest captions to show more of the school within limited space.",
      "The final time capsule represented the school more responsibly because...",
      [
        "The council chose items for information and durability rather than popularity alone.",
        "Combined images included more teams, clubs, and voluntary contributors.",
        "A transcript protected the audio message from future technology changes.",
        "Captions and a letter stated known gaps instead of claiming completeness.",
      ],
      [
        "The capsule's lid closed with a loud click.",
        "Bark Bolt liked a carrot-shaped toy.",
      ],
      "Add a counterpoint explaining one thing even the improved capsule could not capture.",
      "Conclude with a principle for curating historical evidence.",
      "Use a counterargument transition, choose precise nouns, and include criteria or representative.",
      ["criteria", "representative"],
      "The final time capsule represented the school more responsibly because clear criteria guided every choice. Combined photographs included more groups, while a transcript protected the audio message from changing technology. Captions and a letter openly identified missing voices instead of claiming completeness. Although five objects could never capture every daily experience, the curated collection offered varied evidence and honest limits. Historical collections become more representative when selectors explain both what they include and what they cannot.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 64,
    title: "A Letter with Two Meanings",
    genre: "Language mystery",
    informational: false,
    band: "advanced",
    objective: "Analyze ambiguity, punctuation, and context to compare two defensible interpretations of a message.",
    skillTags: ["RL.5.1", "L.5.3", "ambiguity", "author's craft", "interpretation"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Move the Garden Tomorrow",
        paragraphs: [
          `A letter from former principal Rosa Vale arrived during the school's anniversary week. It read: “When the clock reaches ten, move the garden tomorrow. Leave the stones where young readers gather.” No one knew whether it was a forgotten instruction or an anniversary puzzle. Garden club members worried that someone planned to dig up their beds.`,
          `Nia examined the envelope. Rosa had written the letter twenty years earlier and labelled it OPEN BEFORE THE CLOCK CEREMONY. At ten on Saturday, the restored tower clock would begin working again. “Move the garden” could mean relocate plants, but it could also mean make the garden move. The word tomorrow might describe Sunday—or a sculpture titled Tomorrow.`,
          `The second sentence was equally ambiguous. “Leave the stones” might mean do not move them. It might also mean depart from them and go toward the place where young readers gather. The missing comma after stones allowed both readings. Bark Bolt tried reading the sentence aloud with different pauses and produced two different sets of directions.`,
          `In Rosa's archived anniversary notes, Nia found a sketch labelled TOMORROW: A GARDEN OF TURNING FLOWERS. The school once owned a wind-powered sculpture with metal petals. A photograph showed it beside the old reading circle, whose stone seats still stood beneath the library windows. The sculpture had disappeared during a renovation.`
        ],
        callout: {
          label: "Two Readings",
          text: "Leave the stones where readers gather = keep stones there, OR depart from the stones at the reading circle.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Following Both Interpretations",
        paragraphs: [
          `The team did not choose one interpretation and discard the other. They left the stone seats untouched and also began their search there. At exactly ten, the clock's long hand pointed toward a library weather vane shaped like a leaf. The vane turned in the wind, pointing toward a locked storage shed behind the greenhouse.`,
          `Inside the shed, under protective cloth, stood Tomorrow. Its metal flowers turned when Bark Bolt gently spun a test handle, but rust made one gear stiff. The group did not drag it outdoors. A conservator inspected the sculpture, treated the mechanism, and confirmed that it could safely return to the reading circle for the ceremony.`,
          `Rosa joined by video call. She explained that the double meaning was intentional. Readers had to protect the stones and use them as a starting point; they had to “move” a garden that was a sculpture, not disturb living plants. She had omitted the comma because the ambiguity forced people to test both meanings against historical context.`,
          `The restored petals began turning beside the library on Sunday. Nia added a plaque displaying the original lines with two annotated readings. Bark Bolt asked whether unclear writing was always clever. Rosa said no. Instructions should normally be precise, especially for safety, but poetry and puzzles can use ambiguity when readers are invited to explore. The letter worked because records, setting, and the harmless first steps allowed both meanings to meet at one answer.`
        ],
        callout: {
          label: "Context Solution",
          text: "Tomorrow = sculpture; garden = metal flowers; stones = protected seats and starting point; ten = clock-hand direction.",
        },
      },
    ],
    illustration: illustration(
      64,
      "Nia and Bark Bolt compare two punctuated versions of Rosa's letter beside stone reading seats and a wind-powered metal-flower sculpture.",
      "Both readings of the ambiguous letter lead to the sculpture called Tomorrow.",
      "two-meaning-letter-sculpture",
      "#4FAE8A",
    ),
    vocabulary: [
      word("ambiguous", "open to more than one possible meaning", ["unclear", "double-meaning"], "The second sentence was equally ambiguous.", "Punctuation allowed two sensible readings."),
      word("interpretation", "an explanation of what something means", ["reading", "explanation"], "The team did not choose one interpretation and discard the other.", "Each reading guided a different action."),
      word("context", "surrounding details that help determine meaning", ["background", "circumstances"], "The ambiguity forced people to test both meanings against historical context.", "The sketch, clock, and reading circle clarified the words."),
    ],
    comprehension: [
      question("l64-q1", "Right There", "What were the two possible meanings of “leave the stones where young readers gather”?", "It could mean keep the stones in place, or depart from the stones located at the reading circle.", "Both readings are explained on page 1 and in its callout."),
      question("l64-q2", "Think and Search", "How did records and setting clarify the words garden, tomorrow, stones, and ten?", "An archive named Tomorrow as a turning-flower sculpture, the reading circle supplied stones, and the restored clock at ten pointed toward the leaf vane and storage shed.", "Evidence from the archived sketch and live clock sequence must be combined."),
      question("l64-q3", "On My Own", "When is ambiguous language enjoyable, and when could it be harmful? Give a reason for each situation.", "A thoughtful answer may support ambiguity in poetry or puzzles but reject it in safety instructions, directions, or urgent messages because consequences differ.", "This judgement requires reasons, not a quotation.", true),
      question("l64-q4", "Think and Search", "Why was following both interpretations safer and more effective than acting on only one?", "It prevented digging or moving stone seats, used the reading circle as a harmless starting point, and allowed evidence to narrow the meaning before anyone moved the fragile sculpture.", "The initial concerns and later cautious steps occur across both pages."),
      question("l64-q5", "Author and You", "Why does the story end by limiting the value of unclear writing?", "It prevents readers from treating every ambiguity as clever and emphasizes that double meanings suit controlled creative contexts, not situations requiring precise action.", "The answer interprets Rosa's final explanation and the safe puzzle design."),
    ],
    paragraphTask: paragraphTask(
      64,
      "Write a comparison paragraph explaining the letter's two readings and how they converge.",
      "Different grammatical readings guide separate but compatible actions that meet at the sculpture.",
      "Rosa's letter carried two meanings that eventually worked together...",
      [
        "One reading instructed the group to leave the stone seats untouched.",
        "The other reading told them to depart from those seats as a starting point.",
        "Garden referred both to familiar living plants and to a metal-flower sculpture.",
        "Tomorrow referred both to a time word and the sculpture's title.",
      ],
      [
        "The storage shed door had a strong metal lock.",
        "Rosa appeared on a video screen during the ceremony.",
      ],
      "Add a detail explaining how the clock resolved the next step without making either reading unsafe.",
      "Conclude with how context can narrow an ambiguous message.",
      "Use parallel structure for the two readings, punctuate quoted words carefully, and include ambiguous or context.",
      ["ambiguous", "context"],
      "Rosa's letter carried two meanings that eventually worked together. “Leave the stones” meant both keep the reading seats in place and depart from them to begin searching. “Garden” could mean living beds, but historical context revealed a metal-flower sculpture. Likewise, “tomorrow” named a future day and the artwork itself. At ten, the clock hand supplied a harmless direction toward the next clue. The ambiguous words became clear only when readers compared grammar with records and setting.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 65,
    title: "How Bridges Carry Weight",
    genre: "Informational engineering",
    informational: true,
    band: "advanced",
    objective: "Explain how bridge shapes direct loads through tension and compression and evaluate why engineers test whole systems.",
    skillTags: ["RI.5.2", "RI.5.3", "engineering design", "forces", "systems thinking"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Forces Have to Go Somewhere",
        paragraphs: [
          `A bridge carries its own weight, called dead load, plus changing live loads such as people, vehicles, wind, snow, or moving water. Those forces do not vanish when a bridge looks still. Its deck, beams, cables, towers, foundations, and ground create paths that transfer loads safely. Engineers study both individual parts and the complete structure.`,
          `Compression squeezes material together, while tension pulls it apart. A simple beam bridge bends slightly under weight. Its upper region is compressed while its lower region is in tension. Supports at each end transfer forces into foundations and then the ground. A deeper or differently shaped beam may resist bending better, but every design also depends on material and span.`,
          `An arch bridge directs much of its load along the curved arch toward strong supports called abutments. Stone performs well under compression, which is why many old stone arches remain. If the abutments spread or the stones shift, however, the arch can lose its stable force path. Shape and support work together.`,
          `In a suspension bridge, the deck hangs from vertical suspenders connected to main cables. The cables carry tension over towers, and anchorages resist their pull at the ends. Towers carry compression toward the foundations. A cable may look thin beside a tower, but many wires and a carefully designed curve allow it to carry enormous forces.`
        ],
        callout: {
          label: "Force Key",
          text: "Compression = squeezing. Tension = pulling. A safe bridge directs both through connected parts into foundations and ground.",
        },
      },
      {
        pageNumber: 2,
        subheading: "Designing Beyond One Perfect Part",
        paragraphs: [
          `Truss bridges use connected triangles. A triangle keeps its shape more readily than a four-sided frame with flexible joints. Under a particular load, some truss members may experience tension while others experience compression. Changing where weight is placed can change the forces, so engineers calculate many load cases rather than testing one toy car in one position.`,
          `Real materials have limits. Steel can stretch or buckle, concrete can crack, wood can split or decay, and connections can loosen or corrode. Engineers choose safety factors, inspect structures, control traffic when necessary, and repair damage. Some bridges include redundancy, meaning more than one path can help carry load if one component is damaged. Redundancy is helpful, not permission to ignore maintenance.`,
          `Models reveal patterns but have limits. A paper bridge can compare folds or shapes, yet paper does not behave exactly like steel or concrete. Scaling matters: a model twice as long is not simply the same bridge made bigger. Wind, vibration, temperature changes, soil, water, construction details, and repeated traffic all influence a real design.`,
          `Nia built three index-card bridges with equal amounts of paper. The flat strip sagged first, a folded beam carried more coins, and a triangular truss distributed weight across several members. She did not announce that trusses were always best. Instead, she concluded that changing shape changed the load path in her model. Engineering begins with that careful idea: understand forces, test evidence, identify limits, and choose a design suited to its place and purpose.`
        ],
        callout: {
          label: "Model Limitation",
          text: "A classroom model compares design ideas; it does not certify a full-size bridge or reproduce every real force and material.",
        },
      },
    ],
    illustration: illustration(
      65,
      "A labelled engineering diagram compares beam, arch, suspension, and truss bridges with arrows for load, tension, compression, and foundations.",
      "Different bridge forms create different paths for carrying weight into the ground.",
      "bridge-forces-comparison-diagram",
      "#E07A3F",
    ),
    vocabulary: [
      word("compression", "a force that squeezes material together", ["squeezing", "pressure"], "Compression squeezes material together.", "Towers and arches often carry this force."),
      word("tension", "a force that pulls material apart", ["pulling", "strain"], "Tension pulls material apart.", "Suspension cables are pulled by the deck's load."),
      word("redundancy", "the use of more than one component or path to provide backup", ["backup", "duplication"], "Some bridges include redundancy, meaning more than one path can help carry load.", "Another path may share forces if one part is damaged."),
    ],
    comprehension: [
      question("l65-q1", "Right There", "How do the main cables, towers, and anchorages of a suspension bridge carry forces?", "Cables carry tension, towers carry compression toward foundations, and anchorages resist the cables' pull at the ends.", "The force roles appear on page 1, paragraph 4."),
      question("l65-q2", "Think and Search", "Why is a strong bridge more than a collection of strong individual parts?", "Parts must connect to form continuous load paths into supports and ground; connections, material limits, placement of loads, and foundation conditions affect the whole system.", "The systems idea develops across both pages."),
      question("l65-q3", "On My Own", "Which bridge form would you choose for a classroom paper challenge, and what test would make your comparison fair?", "A strong response selects a form and controls paper amount, span, coin placement, and loading method while explaining the choice.", "This design question requires a justified plan, not a quotation.", true),
      question("l65-q4", "Think and Search", "What can Nia's index-card test show, and what can it not prove?", "It can compare how paper shapes distribute coins in one setup, but it cannot prove which full-size bridge is best or reproduce real materials, scale, wind, soil, and repeated traffic.", "Nia's result and model limits are both on page 2."),
      question("l65-q5", "Author and You", "Why does the author say redundancy is not permission to ignore maintenance?", "Backup paths can improve safety, but corrosion, cracks, or multiple damaged components can still weaken the system, so inspection and repair remain necessary.", "The reader connects the redundancy definition with the list of material limits."),
    ],
    paragraphTask: paragraphTask(
      65,
      "Write a compare-and-contrast paragraph explaining how an arch bridge and suspension bridge carry loads.",
      "Both bridge types direct forces into the ground, but they use different shapes and components.",
      "Arch and suspension bridges both carry loads through connected force paths, but...",
      [
        "An arch directs compression along its curved form toward abutments.",
        "Strong abutments resist the outward force at an arch's ends.",
        "A suspension bridge uses main cables in tension to support the deck.",
        "Its towers carry compression while anchorages resist cable pull.",
      ],
      [
        "Nia used shiny coins to load her paper models.",
        "Some famous bridges are photographed at sunset.",
      ],
      "Add a detail explaining the role of foundations in both structures.",
      "Conclude with why shape and support must be evaluated together.",
      "Use precise comparison transitions, avoid saying forces disappear, and include compression and tension.",
      ["compression", "tension"],
      "Arch and suspension bridges both carry loads through connected force paths, but their systems differ. An arch directs compression along its curve toward abutments. By contrast, a suspension bridge's main cables carry tension over towers, while those towers carry compression. In both designs, foundations transfer forces into stable ground. Therefore, a bridge's shape cannot be judged alone; cables, supports, connections, foundations, and materials must work together.",
    ),
    sourceReferences: [
      { label: "US Federal Highway Administration — Bridge Engineering", url: "https://www.fhwa.dot.gov/bridge/" },
      { label: "US Federal Highway Administration — Covered Bridge Form and Forces", url: "https://www.fhwa.dot.gov/publications/research/infrastructure/structures/04098/02.cfm" },
    ],
  }),
  lesson({
    sequence: 66,
    title: "Nia and the Unreliable Narrator",
    genre: "Metafiction mystery",
    informational: false,
    band: "advanced",
    objective: "Evaluate a first-person narrator's reliability by comparing claims, omissions, motives, and independent evidence.",
    skillTags: ["RL.5.1", "RL.5.6", "narrator reliability", "point of view", "text evidence"],
    pages: [
      {
        pageNumber: 1,
        subheading: "According to Felix Fox",
        paragraphs: [
          `Felix submitted a first-person story to the newspaper: “I Alone Solved the Mystery of the Vanishing Chess Trophy.” In his version, he entered an empty games room, noticed a dust-free square, followed “secret footprints,” and found the trophy behind a curtain. He described Nia as arriving too late and Bark Bolt as distracted by a biscuit.`,
          `The article was lively, but Nia remembered the event differently. Felix had not been alone; twelve chess club members were packing equipment. The dust-free square showed where the trophy normally stood, which everyone already knew. His “footprints” were arrows printed on temporary floor signs. An engaging narrator could still select details that improved his own role.`,
          `Bark Bolt wanted a correction for the biscuit insult. Nia wanted evidence. The club's sign-out sheet showed that adviser Ms. Patel had moved the trophy at 3:20 to protect it during window repairs. A group photograph at 3:25 showed Felix reading the sheet. His story began at 3:40 but never mentioned the record.`,
          `Nia interviewed Felix. He said that “alone” meant he alone understood the final curtain clue. Yet a voice memo captured Mina saying, “The sheet says storage curtain,” before Felix crossed the room. Felix had not invented every event. The trophy was behind a curtain, and he reached it first. His bias appeared in emphasis, omission, and exaggerated language rather than a completely imaginary plot.`
        ],
        callout: {
          label: "Reliability Check",
          text: "Compare the narrator's claims with records, other viewpoints, timing, word choice, and details the account leaves out.",
        },
      },
      {
        pageNumber: 2,
        subheading: "A Story That Shows Its Point of View",
        paragraphs: [
          `Felix argued that all stories choose details. Nia agreed. A narrator cannot report every chair, breath, or second. The problem was not selection itself; it was presenting a boastful interpretation as a complete factual report. Readers received no signal that other people had contributed or that Felix had seen the sign-out sheet.`,
          `The newspaper offered two options: label the piece humorous fiction inspired by the event, or revise it as a factual club report. Felix chose fiction. He added a note explaining that the narrator was a character who loved attention. He kept the biscuit line, but gave Bark Bolt a clever final observation that exposed the narrator's exaggeration.`,
          `Beside the story, Nia published a small “Viewpoint Challenge.” Readers compared one paragraph with the sign-out sheet and voice memo, then underlined facts, opinions, and unsupported claims. The exercise did not tell them to distrust every first-person voice. Personal narrators can honestly share thoughts and feelings that an outside narrator cannot. Readers simply need to notice the limits of any viewpoint.`,
          `Felix's revised title was “Felix Fox, Almost-Solo Detective.” It was funnier because the audience understood the gap between his confidence and the evidence. Bark Bolt accepted the biscuit joke after being paid one actual biscuit by the author. Nia concluded that an unreliable narrator is not necessarily a useless narrator. The mismatches can reveal character, create humour, and challenge readers—provided the genre and evidence do not disguise fiction as fact.`
        ],
        callout: {
          label: "Account Comparison",
          text: "Felix reached the trophy first; Mina read the location aloud; the adviser had documented the move; the story omitted both contributions.",
        },
      },
    ],
    illustration: illustration(
      66,
      "Nia and Bark Bolt compare Felix's dramatic first-person article with a sign-out sheet, group photograph, and voice-memo transcript.",
      "Independent records reveal how Felix's entertaining narration enlarges his role.",
      "unreliable-narrator-evidence-board",
      "#7A5BC4",
    ),
    vocabulary: [
      word("narrator", "the voice or character that tells a story", ["storyteller", "speaker"], "An engaging narrator could still select details that improved his own role.", "Felix tells the event in first person."),
      word("omission", "something important that has been left out", ["exclusion", "missing detail"], "His bias appeared in emphasis, omission, and exaggerated language.", "He did not mention the sign-out sheet or Mina."),
      word("bias", "a preference or viewpoint that influences judgement or presentation", ["partiality", "preference"], "His bias appeared in emphasis, omission, and exaggerated language.", "Felix made his own actions seem most important."),
    ],
    comprehension: [
      question("l66-q1", "Right There", "Which two records showed that Felix knew how the trophy had been moved?", "The sign-out sheet documented the adviser's move, and a photograph showed Felix reading it before his story began.", "Both records appear on page 1, paragraph 3."),
      question("l66-q2", "Think and Search", "Why is Felix's original story unreliable rather than completely false?", "The trophy really was behind a curtain and Felix reached it first, but he exaggerated being alone, omitted records and helpers, and turned ordinary signs into secret clues.", "Truthful and distorted parts are compared across page 1."),
      question("l66-q3", "On My Own", "Can a strongly opinionated narrator still teach a reader something important? Explain with a reason.", "A thoughtful response may say yes because bias reveals character or feelings, or warn that facts need checking, with a clear explanation.", "This is an open judgement and needs reasoning rather than a fixed quotation.", true),
      question("l66-q4", "Think and Search", "How did changing the genre solve the newspaper's fairness problem?", "Labelling the piece humorous fiction told readers to expect an exaggerated character voice, while the note and Viewpoint Challenge separated entertainment from the documented event.", "The original factual presentation and revised publication must be compared."),
      question("l66-q5", "Author and You", "Why does the author preserve the biscuit joke in the revision?", "Keeping the joke shows that exaggeration can be entertaining when readers understand the fictional voice; Bark Bolt's added insight also lets the story reveal the narrator's unreliability.", "The answer connects genre, humour, and evidence on page 2."),
    ],
    paragraphTask: paragraphTask(
      66,
      "Write an evidence-based paragraph evaluating Felix as an unreliable narrator.",
      "Felix reports a real event but enlarges his role through omissions and exaggerated interpretations.",
      "Felix is an unreliable narrator because...",
      [
        "He claims to be alone although twelve club members were present.",
        "He describes printed floor arrows as secret footprints.",
        "He omits the sign-out sheet even though a photograph shows him reading it.",
        "He fails to credit Mina for reading the trophy's location aloud.",
      ],
      [
        "The trophy stood behind a blue curtain.",
        "Bark Bolt eventually received a real biscuit.",
      ],
      "Add a counterpoint identifying one accurate part of Felix's account.",
      "Conclude with how a reader should respond to his viewpoint.",
      "Use a concession transition, distinguish evidence from opinion, and include narrator, omission, or bias.",
      ["narrator", "omission", "bias"],
      "Felix is an unreliable narrator because his bias enlarges his role. He claims to be alone despite twelve witnesses, turns floor signs into secret tracks, and omits both the sign-out record and Mina's clue. Admittedly, he did reach the trophy first and correctly places it behind the curtain. Those facts do not erase the misleading omissions. Readers can enjoy his voice while checking its claims against independent evidence and other viewpoints.",
    ),
    sourceReferences: [],
  }),
  lesson({
    sequence: 67,
    title: "The Puzzle of the Three Timelines",
    genre: "Chronology mystery",
    informational: false,
    band: "advanced",
    objective: "Reconcile timestamps from devices and witnesses by identifying offsets, event types, and shared anchor points.",
    skillTags: ["RL.5.1", "RL.5.5", "chronology", "data reconciliation", "multi-step inference"],
    pages: [
      {
        pageNumber: 1,
        subheading: "Three Clocks, Three Stories",
        paragraphs: [
          `The charity concert's donation envelope reached the office at 5:00—or 4:56—or 5:03. The office log recorded 5:00. Hallway video showed a volunteer entering at 4:56. A phone photograph of the sealed envelope displayed 5:03. When organizers discovered that one receipt was missing, the three timelines made everyone suspect a gap.`,
          `Nia searched for shared anchor events before deciding any clock was wrong. At the concert's 4:30 sound check, a distinctive cymbal crash appeared on hallway audio. The office clock in the same frame displayed 4:34, so the video system was four minutes slow compared with the office clock. That converted its 4:56 entry to 5:00 office time.`,
          `The phone photograph presented a different problem. Its information showed 5:03, but the photo captured the envelope after the volunteer placed it beside the office clock reading 5:01. Nia learned that the phone had been set three minutes fast intentionally, helping its owner avoid lateness. Subtracting three minutes made the photo time 5:00, close to the visible clock because seconds were not displayed.`,
          `Bark Bolt drew three lines and shifted them until the cymbal crash, office arrival, and photograph aligned. The timelines were not three versions of events; they were one chronology measured by clocks with different offsets. Yet the missing receipt remained unexplained. Its number fell between receipts written at 4:42 and 4:48 office time.`
        ],
        callout: {
          label: "Clock Offsets",
          text: "Office = reference. Video = 4 minutes slow. Phone = 3 minutes fast. Convert before comparing events.",
        },
      },
      {
        pageNumber: 2,
        subheading: "The Event Behind the Timestamp",
        paragraphs: [
          `A digital payment report listed the missing number at 4:46. No matching paper receipt appeared in the cash box because no cash had changed hands. The volunteer had demonstrated the card reader with a cancelled test transaction. The system assigned a receipt number before the test was cancelled, leaving a gap in the paper sequence.`,
          `The transaction log marked the entry VOID, but its small status column had been hidden when the spreadsheet was printed. A time alone could not explain the event type. Once Nia restored the column, the record showed no donation amount and no missing money. The gap was a bookkeeping trace, not evidence of theft.`,
          `Organizers revised their procedure. Every device would synchronize with a shared network clock before an event. Test transactions would use a labelled training mode when available, and printed reports would include status columns. If a clock had to run fast, its offset would be recorded. These changes would not make every device perfect, but they would make differences visible.`,
          `At the concert summary, Bark Bolt displayed three crooked paper timelines and then slid them into alignment. Nia warned that investigators should not adjust times merely to force a favourite explanation. They need an independent anchor, a known offset, and records of what each timestamp represents. The three clocks had seemed to create a suspicious missing period. Careful chronology revealed one ordinary arrival, one cancelled test, and a complete donation total.`
        ],
        callout: {
          label: "Reconciled Chronology",
          text: "4:46 voided test → 5:00 office arrival → photo of sealed envelope; no receipt or donation disappeared.",
        },
      },
    ],
    illustration: illustration(
      67,
      "Nia and Bark Bolt align three coloured timelines labelled office, hallway video, and phone beneath a cymbal-crash anchor point.",
      "Known clock offsets turn three conflicting timestamps into one chronology.",
      "three-timelines-clock-offsets",
      "#3E7CB1",
    ),
    vocabulary: [
      word("chronology", "the arrangement of events in the order they happened", ["timeline", "sequence"], "They were one chronology measured by clocks with different offsets.", "It places the receipt test before the office arrival."),
      word("offset", "a known difference between a measurement and a reference", ["difference", "adjustment"], "The timelines were measured by clocks with different offsets.", "The video was four minutes slow."),
      word("synchronize", "to set things to the same time or make them operate together", ["coordinate", "align"], "Every device would synchronize with a shared network clock.", "Matching clocks make comparisons easier."),
    ],
    comprehension: [
      question("l67-q1", "Right There", "What were the offsets of the hallway video and phone compared with the office clock?", "The hallway video was four minutes slow, and the phone was three minutes fast.", "The offsets are calculated on page 1 and listed in its callout."),
      question("l67-q2", "Think and Search", "How did the cymbal crash and visible office clock help reconcile the first two timelines?", "The same cymbal crash appeared on hallway audio while the office clock was visible, proving a four-minute difference that converted video 4:56 to office 5:00.", "The shared event and calculation are in page 1, paragraph 2."),
      question("l67-q3", "On My Own", "When might setting a personal clock fast be helpful, and what confusion could it create?", "A thoughtful response explains how it may encourage punctuality but can confuse shared records or people who do not know the offset.", "This application needs balanced personal reasoning.", true),
      question("l67-q4", "Think and Search", "Why did aligning the clocks not by itself solve the missing-receipt puzzle?", "The timestamps showed when events occurred but not whether a transaction was cash, digital, completed, or cancelled. Restoring the hidden VOID status identified the test transaction.", "The clock solution is on page 1; event-type evidence is on page 2."),
      question("l67-q5", "Author and You", "Why does Nia warn against shifting times to fit a favourite explanation?", "Adjustments are valid only when supported by independent anchors and known offsets; otherwise, changing times could manufacture a misleading story.", "The answer applies the investigation method stated in the final paragraph."),
    ],
    paragraphTask: paragraphTask(
      67,
      "Write a multi-step explanation of how the investigators reconciled all three timelines and the receipt gap.",
      "Independent anchors and status records converted differing timestamps into one complete chronology.",
      "The three timelines were reconciled by...",
      [
        "A cymbal crash and visible clock proved the video system was four minutes slow.",
        "The phone owner confirmed that the phone clock was set three minutes fast.",
        "Applying both offsets placed the envelope events at about 5:00 office time.",
        "The digital report's VOID status identified the receipt gap as a cancelled test.",
      ],
      [
        "The concert included a cymbal with a bright brass surface.",
        "Bark Bolt used three colours of paper for his display.",
      ],
      "Add a sentence explaining why a shared anchor is necessary before adjusting timestamps.",
      "Conclude with one procedure that would prevent future confusion.",
      "Use exact chronological transitions, make all time references explicit, and include chronology, offset, or synchronize.",
      ["chronology", "offset", "synchronize"],
      "The three timelines were reconciled through supported adjustments. First, a shared cymbal crash proved that the video clock had a four-minute offset. Next, the phone owner confirmed a three-minute fast setting. Converting both times placed the arrival and photograph at about 5:00 office time. Finally, the restored VOID column identified the missing receipt number as a cancelled test, not a donation. Future organizers should synchronize devices and preserve transaction status so one chronology remains clear.",
    ),
    sourceReferences: [],
  }),
];
