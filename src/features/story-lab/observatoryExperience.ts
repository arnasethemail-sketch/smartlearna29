import type { StoryExperience } from './types';

export const observatoryExperience: StoryExperience = {
  id: 'observatory',
  label: 'B',
  title: 'The Observatory Between Stars',
  subtitle: 'Follow a missing light into a secret above the city.',
  tone: 'Magical exploration · friendship · mystery',
  hook: 'A light above the clouds has vanished, and the message calling for help is addressed to you.',
  estimatedMinutes: 6,
  scenes: [
    {
      id: 'a-message-in-the-rain',
      title: 'A Message in the Rain',
      location: 'The rooftop garden',
      paragraphs: [
        'Every puddle on the roof reflects the same impossible thing: a staircase climbing through the stars. Then letters ripple across the water. BEACON SEVEN HAS VANISHED. PLEASE COME. Beneath the message is your name.',
        'Nia arrives carrying a telescope case. Bark Bolt follows, his paws shining with starlight. “You saw it too,” Nia whispers. She touches the puddle. The staircase becomes solid beneath your feet.',
        'Above the clouds waits an observatory shaped like an open hand. Six golden beams sweep across its glass ceiling. A seventh window is dark. Beside it, a little green light blinks steadily. Something inside is still working. You and Nia exchange a look. Where should you investigate first?',
      ],
      interaction: {
        kind: 'choice',
        prompt: 'Choose your first way to investigate.',
        options: [
          {
            id: 'inspect',
            text: 'Examine the dark window with Nia.',
            response: 'The glass is warm. Nia finds tiny silver scales caught along its edge. “Something small was here.”',
            clue: 'Warm glass and silver scales beside the dark window.',
          },
          {
            id: 'listen',
            text: 'Listen beside the window with Bark Bolt.',
            response: 'Bark Bolt tilts his head. Behind the warm glass, you hear a soft flutter, then silence.',
            clue: 'Soft wingbeats behind the warm, dark window.',
          },
        ],
      },
    },
    {
      id: 'the-spiral-stair',
      title: 'The Spiral Stair',
      location: 'Inside the observatory',
      paragraphs: [
        'A silver scale clings to the stair rail. Another rests on the next step. You follow them upward while constellations drift beneath the transparent floor. Nia walks close beside you. Looking down feels like standing over an ocean with no bottom.',
        'Halfway up, the stair’s golden light faltered. It flickered once in a sudden gust, then shone steadily again. You pause together until the wind passes.',
        'At the landing, Bark Bolt noses open a keeper’s notebook. One page shows a silver-winged lantern moth. “Drawn to warmth and moonflower nectar,” Nia reads. A blue bowl beneath the picture smells sweet. Beyond the door, something brushes the dark window. This time, you hear many wings.',
      ],
      interaction: {
        kind: 'question',
        skill: 'Vocabulary',
        prompt: 'The golden light “faltered.” What does that mean in this scene?',
        options: [
          { id: 'brighter', text: 'It grew brighter and stayed bright.' },
          { id: 'moved', text: 'It moved to another staircase.' },
          { id: 'unsteady', text: 'It became unsteady for a moment.' },
          { id: 'gone', text: 'It disappeared and never returned.' },
        ],
        correctOptionId: 'unsteady',
        success: 'Exactly. It flickered briefly, then became steady again.',
        explanation: 'The next sentence explains the word: the light flickered once during the gust and then shone steadily.',
        clue: 'The light still works; the interruption was brief.',
      },
    },
    {
      id: 'the-missing-beacon',
      title: 'The Missing Beacon',
      location: 'Beacon Seven’s glass chamber',
      paragraphs: [
        'You ease the door open. A hundred lantern moths cover the inside of Beacon Seven’s lens. Their folded wings form a silver curtain. Behind them, the lamp glows gold. Beside the lens, every gear turns smoothly.',
        'Through a smaller window, you can see the real stars. None have vanished. When one moth lifts its wing, a thin golden beam escapes through the gap. Then the wing settles, and the beam disappears.',
        '“The beacon hasn’t gone out,” you whisper. Nia nods. Below the lens, three tiny moths sleep in a nest. Bark Bolt lies down quietly beside you. Whatever you do next, those little ones need to stay warm and undisturbed.',
      ],
      interaction: {
        kind: 'question',
        skill: 'Reading clues',
        prompt: 'Why did Beacon Seven’s beam disappear?',
        options: [
          { id: 'lamp', text: 'The lamp stopped glowing.' },
          { id: 'wings', text: 'The moths’ wings blocked the light leaving the lens.' },
          { id: 'gears', text: 'The gears broke and stopped turning.' },
          { id: 'stars', text: 'All the real stars disappeared.' },
        ],
        correctOptionId: 'wings',
        success: 'You found the cause: a curtain of wings, with a working lamp behind it.',
        explanation: 'The lamp glows and the gears turn. Most clearly, a beam escapes whenever a moth lifts its wing.',
        clue: 'Light escapes through gaps between the moths’ wings.',
      },
    },
    {
      id: 'a-gentle-solution',
      title: 'A Gentle Solution',
      location: 'The sheltered moon balcony',
      paragraphs: [
        'The keeper’s notebook has another drawing: adult moths feeding from the blue bowl while their young rest beside a warm lamp. A sheltered balcony outside the chamber has room for the bowl. Its glass walls will keep the wind away.',
        'Nia fills the bowl with moonflower nectar. You find the silver shutter that leads onto the balcony. It must stay closed until the bowl is outside, ready to guide the adult moths away from the lens.',
        'Bark Bolt keeps watch beside the nest. Nia lifts the bowl and waits for your instruction. The lamp hums behind its silver curtain. Now you know what happened. A carefully worded sentence can help you put it right.',
      ],
      interaction: {
        kind: 'question',
        skill: 'Grammar',
        prompt: 'Which instruction clearly puts the bowl outside before you open the shutter?',
        options: [
          { id: 'before', text: 'Before Nia places the bowl outside, open the silver shutter.' },
          { id: 'while', text: 'Open the silver shutter while Nia fills the bowl inside.' },
          { id: 'first', text: 'First open the silver shutter, then put the bowl outside.' },
          { id: 'after', text: 'After Nia places the bowl outside, open the silver shutter.' },
        ],
        correctOptionId: 'after',
        success: 'The word “after” puts your actions in the right order.',
        explanation: '“After Nia places the bowl outside” means placing the bowl happens first. Opening the shutter happens next.',
        clue: 'Bowl outside first. Shutter open second.',
      },
    },
  ],
  writing: {
    prompt: 'Leave a note for the next keeper. Explain why the beam disappeared and how to guide the moths away gently. Include a clue you noticed.',
    placeholder: 'We discovered that… Our clue was… To help the moths…',
    minWords: 15,
  },
  ending: {
    title: 'Seven Lights Again',
    paragraphs: [
      'With the bowl outside, you open the shutter. The adult moths drift toward the nectar. Their young stay snug beside the lamp. A golden beam sweeps across the ceiling: seven lights again.',
      'You leave your note in the keeper’s notebook. Nia smiles. “Our first night. Our first solved mystery.”',
    ],
    teaser: 'Then an eighth light appears on the star map. It is moving toward Earth.',
  },
};
