import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'source',
  number: 'IV',
  title: 'The Source',
  subtitle: 'Discover that the force that shaped your story shaped everything.',
  epigraph: 'The mind that built every god can make your life sacred.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'When people ask where are you from, they almost never mean it the way the question deserves to be answered. A city name, a neighborhood, a country. Underneath the reflex, there is a real question reaching for something much bigger, and this chapter is where you answer it.' },
    { type: 'body', text: 'The forces that shaped the character you just described did not begin with their birth. Their parents were shaped by theirs, who were shaped by theirs, all the way back to patterns so old they feel less like history and more like gravity. The thread does not stop at your family line, your culture, or your species. Every cell in your body is made of stardust, atoms forged in the cores of stars that exploded billions of years ago so that, eventually, impossibly, something could open its eyes and wonder where it came from. The brain thinking these thoughts is the brain that people three hundred thousand years ago, before they even had language, marveled at the universe with.' },
    { type: 'body', text: 'The longing you feel for belonging, for meaning, for connection to something larger than your individual life, is the original operating system remembering what it was designed for.' },
    { type: 'chapterCode', id: 'source-code', essence: 'The mind that built every god can make your life sacred.', expandedContent: 'The same network that builds the small personal self has another mode, one that turns toward the vast and dissolves the boundary between you and everything. This is what meditation trains. This is what psychedelics trigger. This is what every religious tradition cultivated. The experience of unity, awe, belonging, the sacred. You are not reaching outside yourself for it. The faculty that built every cathedral and carried every pilgrimage is in you, and it can consecrate your own existence the moment you turn it there.' },
    { type: 'chapterLore', id: 'source-lore', essence: 'The law of origin.', expandedContent: 'The Kogi people of Colombia\'s Sierra Nevada call this the Ley de Origen, the Law of Origin. They understand that everything emerged from a prior order, that the material world is an expression of the Mother of Origin, and that every element maintains itself in relation to the Law that preceded it. Their task as human beings is to align with this original order. The Haudenosaunee hold their decisions accountable to seven generations forward and seven generations back, because every present moment is held between deep past and deep future. For three hundred thousand years, the first stories told around the first fires were stories about the source.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'somatic', text: 'This is the chapter you take outside. Step away from the screen. Walk somewhere. Feel the ground under your feet. Look at the sky. Find the widest view available to you — a horizon, a body of water, a mountain, a field — and stand in it.' },
    { type: 'prompt', id: 'source-prompt-1', text: 'Where did the wounds begin? What event, what relationship, what inheritance planted the patterns this character has been living inside? Trace it further back. What shaped that beginning? What acted on your parents, your community — what were they responding to that got passed down?' },
    { type: 'prompt', id: 'source-prompt-2', text: 'Go further still. Past family, past culture, past the history you were taught. Breathe into the deep time. Let the aperture widen until you can feel the scale of what preceded you. Is there a longing in you older than your biography? A pull toward something you cannot quite name, coming from further back than your individual life? Stay with it.' },
    { type: 'stepInsight', id: 'source-insight-1', unlocksAfter: 'source-prompt-2', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'bodyItalic', text: 'If shame whispers "who am I to name something this vast" — recognize the mask. You are as qualified as anyone who ever stood under the sky and felt the pull.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'somatic', text: 'Stand where you can feel the ground and the sky. Feel the thread running from the seed, through the wound, through the gift, through deep time, all the way to whatever preceded everything. And name it. Out loud. To the sky, to the earth, to the world.' },
    { type: 'threshold', text: 'Name the source. The origin underneath all the origins. Speak it aloud. Then write what it means, what it connects this character to, how it changes the whole story.', promptId: 'source-author', promptPlaceholder: 'My source is…', promptRows: 10, promptBig: true },
  ]
};

export default chapter;
