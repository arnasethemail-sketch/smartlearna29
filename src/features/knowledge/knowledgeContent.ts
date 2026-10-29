import type { EnglishQuestion } from "../english/englishContent";

export type KnowledgeSubjectName = "Science" | "Social Studies";

export type ScienceTopicName =
  | "Plants & Animals"
  | "Earth & Space"
  | "Matter & Energy"
  | "Science Skills";

export type SocialStudiesTopicName =
  | "Geography"
  | "U.S. History"
  | "Government"
  | "Economics";

export type KnowledgeTopicName = ScienceTopicName | SocialStudiesTopicName;

function question(
  prompt: string,
  answer: string,
  distractors: [string, string, string],
  explanation: string,
): EnglishQuestion {
  return {
    prompt,
    choices: [answer, ...distractors],
    answer,
    explanation,
  };
}

function expandToTwenty(questions: EnglishQuestion[]): EnglishQuestion[] {
  return [
    ...questions,
    ...questions.map((item, index) => {
      const shift = (index + 2) % item.choices.length;

      return {
        ...item,
        prompt: `Challenge review: ${item.prompt}`,
        choices: [
          ...item.choices.slice(shift),
          ...item.choices.slice(0, shift),
        ],
      };
    }),
  ];
}

export const knowledgeQuestionBanks: Record<
  KnowledgeTopicName,
  EnglishQuestion[]
> = {
  "Plants & Animals": expandToTwenty([
    question("Which plant part absorbs water from the soil?", "Roots", ["Flowers", "Fruit", "Seeds"], "Roots take in water and minerals from the soil."),
    question("What job do leaves do for a plant?", "Make food using sunlight", ["Hold the plant in soil", "Carry seeds underground", "Turn into roots"], "Leaves use sunlight, water, and carbon dioxide to make food."),
    question("Which animal is a vertebrate?", "Frog", ["Earthworm", "Jellyfish", "Spider"], "A frog has a backbone, so it is a vertebrate."),
    question("What is a producer in a food chain?", "An organism that makes its own food", ["An animal that eats plants", "An organism that breaks down waste", "An animal at the top of a food chain"], "Plants are producers because they make food using sunlight."),
    question("Which trait helps a polar bear survive in the Arctic?", "Thick fur and body fat", ["Large wings", "Dry scales", "A long thin tail"], "Thick fur and fat help a polar bear stay warm."),
    question("What do decomposers do?", "Break down dead organisms", ["Make sunlight", "Hunt every animal", "Stop plants from growing"], "Decomposers return nutrients to the environment."),
    question("Which stage comes after a caterpillar in a butterfly's life cycle?", "Chrysalis", ["Egg", "Adult butterfly", "Tadpole"], "A caterpillar forms a chrysalis before becoming an adult butterfly."),
    question("Why do many flowers have bright petals?", "To attract pollinators", ["To hide from sunlight", "To absorb soil", "To scare away rain"], "Bright petals can attract bees and other pollinators."),
    question("What is an inherited trait?", "A feature passed from parents to offspring", ["A skill learned at school", "A choice made each morning", "A temporary injury"], "Inherited traits come from an organism's parents."),
    question("Which is an example of a habitat?", "A pond where frogs live", ["A frog's green color", "A bird's wing", "A plant's seed"], "A habitat is the place where an organism lives and finds what it needs."),
  ]),
  "Earth & Space": expandToTwenty([
    question("What causes day and night on Earth?", "Earth rotating on its axis", ["The Moon changing shape", "Earth moving closer to the Sun", "Clouds covering the sky"], "Earth's rotation turns different parts of the planet toward and away from the Sun."),
    question("How long does Earth take to orbit the Sun?", "About one year", ["About one day", "About one week", "About one month"], "One complete orbit around the Sun takes about 365 days."),
    question("Which object is a star?", "The Sun", ["Earth", "The Moon", "Mars"], "The Sun is the star at the center of our solar system."),
    question("What causes the Moon's phases?", "We see different amounts of its sunlit half", ["The Moon makes less light", "Clouds change its shape", "Earth's shadow covers it every night"], "The Moon reflects sunlight, and its position changes the portion we see."),
    question("Which layer of Earth is solid rock where we live?", "Crust", ["Outer core", "Inner core", "Mantle only"], "Earth's thin outer layer is called the crust."),
    question("What tool measures rainfall?", "Rain gauge", ["Thermometer", "Compass", "Balance"], "A rain gauge collects and measures rain."),
    question("What is weather?", "The condition of the air at a certain time and place", ["The average pattern over many years", "The shape of a continent", "The path of a planet"], "Weather describes short-term conditions such as temperature and rain."),
    question("Which process changes liquid water into water vapor?", "Evaporation", ["Condensation", "Freezing", "Precipitation"], "Heat causes liquid water to evaporate into a gas."),
    question("What forms when water vapor cools into tiny droplets?", "Clouds", ["Rocks", "Soil", "Sunlight"], "Cooling water vapor condenses into droplets that form clouds."),
    question("Which planet is known for its large rings?", "Saturn", ["Mercury", "Earth", "Mars"], "Saturn has a wide, visible ring system made of ice and rock."),
  ]),
  "Matter & Energy": expandToTwenty([
    question("Which state of matter has a fixed shape and volume?", "Solid", ["Liquid", "Gas", "Energy"], "Particles in a solid stay close together, giving it a fixed shape."),
    question("What happens when ice melts?", "It changes from a solid to a liquid", ["It changes from a gas to a solid", "It disappears", "It becomes a new substance"], "Melting is a physical change from solid water to liquid water."),
    question("Which material is a good conductor of electricity?", "Copper", ["Rubber", "Plastic", "Dry wood"], "Copper allows electric current to flow easily."),
    question("What type of energy is stored in food?", "Chemical energy", ["Sound energy", "Light energy", "Magnetic energy"], "Food stores chemical energy that bodies can use."),
    question("Which force pulls objects toward Earth?", "Gravity", ["Friction", "Magnetism", "Electricity"], "Gravity attracts objects toward Earth's center."),
    question("What does friction usually do to a moving object?", "Slows it down", ["Makes it weightless", "Turns it into a liquid", "Makes it glow"], "Friction acts against motion between surfaces."),
    question("Which simple machine is a ramp?", "Inclined plane", ["Pulley", "Wheel and axle", "Lever"], "A ramp is an inclined plane that helps move objects between heights."),
    question("How does sound travel?", "As vibrations through matter", ["Only through empty space", "As drops of water", "Only as light waves"], "Sound needs matter such as air, water, or solids to carry vibrations."),
    question("What happens when light hits a mirror?", "It reflects", ["It freezes", "It becomes sound", "It loses all energy"], "A mirror reflects light, changing its direction."),
    question("Which change creates a new substance?", "Iron rusting", ["Paper being cut", "Ice melting", "Water freezing"], "Rusting is a chemical change that forms iron oxide."),
  ]),
  "Science Skills": expandToTwenty([
    question("What is an observation?", "Information gathered using senses or tools", ["A wild guess", "The final answer only", "A rule that never changes"], "Scientists observe carefully and record what they notice."),
    question("What is a hypothesis?", "A testable possible explanation", ["A measuring tool", "A completed graph", "A proven law"], "A hypothesis is an idea that can be tested with evidence."),
    question("In a fair test, how many variables should be changed at a time?", "One", ["None", "Two", "All of them"], "Changing one variable helps show what caused the result."),
    question("Which tool measures temperature?", "Thermometer", ["Ruler", "Stopwatch", "Graduated cylinder"], "A thermometer measures how hot or cold something is."),
    question("Which metric unit is best for the length of a pencil?", "Centimeters", ["Liters", "Grams", "Degrees Celsius"], "Centimeters are a unit of length suited to small objects."),
    question("What belongs on the horizontal axis of most graphs?", "The independent variable", ["The graph title only", "The conclusion", "The dependent variable every time"], "The independent variable is usually shown on the horizontal x-axis."),
    question("Why do scientists repeat trials?", "To make results more reliable", ["To change the question", "To avoid recording data", "To guarantee their guess is right"], "Repeated trials help reveal consistent patterns and reduce random error."),
    question("Which statement is a measurement?", "The leaf is 8 centimeters long", ["The leaf is pretty", "The leaf looks healthy", "The leaf might grow"], "A measurement uses a number and unit."),
    question("What should a conclusion explain?", "What the results show about the question", ["Only the materials list", "A different experiment", "The scientist's favorite answer"], "A conclusion uses evidence to answer the investigation question."),
    question("Which safety rule is correct?", "Wear goggles when an experiment could splash", ["Taste unknown materials", "Run while carrying glass", "Mix chemicals without instructions"], "Safety goggles protect the eyes during investigations."),
  ]),
  Geography: expandToTwenty([
    question("What does a map key explain?", "The meaning of symbols on a map", ["The age of the map", "The weather tomorrow", "The names of every citizen"], "A map key or legend tells what map symbols mean."),
    question("Which direction is opposite east?", "West", ["North", "South", "Northeast"], "East and west are opposite directions."),
    question("What is a continent?", "A very large landmass", ["A small river", "A kind of city", "A line of latitude"], "Earth has seven major landmasses called continents."),
    question("Which is the largest ocean?", "Pacific Ocean", ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"], "The Pacific Ocean covers more area than any other ocean."),
    question("What does a physical map show?", "Landforms and bodies of water", ["Only election results", "Only road construction", "A daily schedule"], "Physical maps show features such as mountains, rivers, and plains."),
    question("What is the equator?", "An imaginary line around Earth's middle", ["The highest mountain", "A river in Europe", "The edge of a time zone"], "The equator divides Earth into Northern and Southern Hemispheres."),
    question("Which landform is higher and steeper than a hill?", "Mountain", ["Plain", "Valley", "Island"], "Mountains rise high above the surrounding land and often have steep sides."),
    question("What is a region?", "An area with shared features", ["A single house", "One map symbol", "Only a state capital"], "Regions are grouped by common physical or human characteristics."),
    question("Why do many cities grow near rivers?", "Rivers provide water and transportation", ["Rivers stop all storms", "Rivers create mountains", "Rivers make every climate warm"], "Waterways support drinking water, trade, farming, and travel."),
    question("What does population mean?", "The number of people living in an area", ["The height of the land", "The distance between cities", "The amount of rainfall"], "Population counts the people who live in a place."),
  ]),
  "U.S. History": expandToTwenty([
    question("Why did many colonists come to North America?", "For opportunities and religious freedom", ["To build pyramids", "To find the South Pole", "To join the Roman Empire"], "Colonists came for land, work, trade, and freedom to practice religion."),
    question("What document declared the colonies independent from Britain?", "Declaration of Independence", ["Constitution", "Bill of Rights", "Mayflower Compact"], "The Declaration of Independence announced the colonies' separation in 1776."),
    question("Who was the first U.S. president?", "George Washington", ["Abraham Lincoln", "Thomas Edison", "Benjamin Franklin"], "George Washington served as the nation's first president."),
    question("What was one main cause of the American Revolution?", "Taxation without representation", ["A shortage of maps", "The building of railroads", "A disagreement about airplanes"], "Many colonists opposed taxes made by a government in which they had no elected voice."),
    question("What did the Louisiana Purchase do?", "Greatly expanded U.S. land", ["Ended the Civil War", "Created the first colony", "Moved the capital to New York"], "The 1803 purchase added a vast area west of the Mississippi River."),
    question("Why were Lewis and Clark sent west?", "To explore and map new land", ["To write the Constitution", "To build the White House", "To start the first factory"], "Their expedition studied and mapped lands from the Louisiana Purchase."),
    question("What issue was central to the Civil War?", "Slavery", ["The color of money", "Ocean tides", "The number of states on maps"], "Conflict over slavery and its expansion was central to the Civil War."),
    question("What did the Emancipation Proclamation announce?", "Freedom for enslaved people in rebelling states", ["A new national anthem", "The end of all taxes", "A plan to buy Alaska"], "President Lincoln issued it during the Civil War."),
    question("Why did many pioneers travel west?", "To seek land and new opportunities", ["To reach Europe by train", "To avoid all rivers", "To join the British army"], "Many settlers moved west hoping for farms, work, or a new start."),
    question("What is a primary source?", "Evidence made during the time being studied", ["A modern fictional story", "A guess with no evidence", "A summary written much later only"], "Letters, diaries, photographs, and objects from the time are primary sources."),
  ]),
  Government: expandToTwenty([
    question("What is the purpose of the U.S. Constitution?", "To set the framework for the national government", ["To list every city", "To predict elections", "To describe the weather"], "The Constitution explains the government's powers, limits, and structure."),
    question("Which branch makes federal laws?", "Legislative branch", ["Executive branch", "Judicial branch", "Local branch"], "Congress is the legislative branch and makes federal laws."),
    question("Which branch carries out federal laws?", "Executive branch", ["Legislative branch", "Judicial branch", "State branch"], "The president and executive departments enforce laws."),
    question("Which branch interprets laws?", "Judicial branch", ["Executive branch", "Legislative branch", "Military branch"], "Courts decide how laws apply and whether they follow the Constitution."),
    question("Why are powers divided among three branches?", "To prevent one branch from becoming too powerful", ["To make maps easier", "To create more holidays", "To avoid holding elections"], "Separation of powers creates checks and balances."),
    question("What is a citizen's responsibility?", "Obey laws", ["Ignore jury duty", "Choose every law alone", "Skip all taxes"], "Citizens are expected to follow laws and take part in civic life."),
    question("What right does the First Amendment protect?", "Freedom of speech", ["The right to drive at any age", "The right to ignore laws", "The right to own every public building"], "The First Amendment protects speech, religion, press, assembly, and petition."),
    question("Who leads a city government?", "A mayor", ["A governor", "A president", "A senator from every state"], "Many cities elect a mayor to lead the local executive government."),
    question("What is an election?", "A process in which people vote for leaders or issues", ["A court trial", "A school lesson", "A weather report"], "Elections let eligible citizens make choices by voting."),
    question("What does rule of law mean?", "Everyone must follow the law", ["Leaders are above the law", "Only visitors follow laws", "Rules change for each person"], "Rule of law means laws apply to citizens and leaders alike."),
  ]),
  Economics: expandToTwenty([
    question("What is a need?", "Something necessary for living", ["A toy wanted for fun", "A special dessert", "A collectible card"], "Food, water, shelter, and clothing are basic needs."),
    question("What is a good?", "A physical item people buy or use", ["Work someone does", "A rule made by Congress", "A line on a map"], "Goods are products such as books, shoes, or fruit."),
    question("What is a service?", "Work done for someone else", ["A physical product only", "Money kept in a jar", "A natural resource"], "Haircuts, repairs, and teaching are examples of services."),
    question("What does a producer do?", "Makes goods or provides services", ["Buys every product", "Uses only free resources", "Sets all government laws"], "Producers create the goods and services people use."),
    question("What does a consumer do?", "Buys or uses goods and services", ["Prints all money", "Creates every law", "Owns every business"], "Consumers make choices about what to buy and use."),
    question("What is a budget?", "A plan for earning, spending, and saving money", ["A list of continents", "A type of bank building", "A free product"], "A budget helps people decide how to use limited money."),
    question("Why do people save money?", "To use it for future needs or goals", ["To make it disappear", "To avoid every purchase forever", "To increase the price of goods"], "Saving sets money aside for later."),
    question("What is scarcity?", "Having limited resources to meet many wants", ["Having endless supplies", "Giving every item away", "Making only services"], "Scarcity means people must make choices because resources are limited."),
    question("What is opportunity cost?", "The next best choice given up", ["The price printed on a tag", "Money found on the ground", "A reward for saving"], "Choosing one option means giving up another valuable option."),
    question("What usually happens when demand rises but supply stays low?", "Price may rise", ["Price must become zero", "The item becomes a service", "Money is no longer needed"], "High demand for a scarce product can push its price upward."),
  ]),
};

export function getKnowledgeSubject(
  topic: KnowledgeTopicName,
): KnowledgeSubjectName {
  return [
    "Plants & Animals",
    "Earth & Space",
    "Matter & Energy",
    "Science Skills",
  ].includes(topic)
    ? "Science"
    : "Social Studies";
}
