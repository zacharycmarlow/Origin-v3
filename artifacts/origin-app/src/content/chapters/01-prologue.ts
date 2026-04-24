import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'prologue',
  number: 'I',
  title: 'The Prologue',
  subtitle: 'Remember who you were before the world rewrote you.',
  epigraph: 'Everything you have lived is the opening chapter of a story only you can tell.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'Your whole life, everything you have built and lost and survived, is backstory. The prologue to a story not yet started, the title crawl setting context before the real action begins. You have scars from that backstory, and those scars are still showing up. We are here to find the story underneath what happened, the recurring thread, the pattern that kept reappearing no matter how many times the circumstances changed. Think like a storyteller. What is the shape of the arc?' },
    { type: 'body', text: 'When you look at your whole life as one connected story, patterns emerge. Threads you could not see while you were living them become obvious in retrospect, and the messy, astonishing arc of your existence starts to cohere into something that looks suspiciously like it was going somewhere all along. Somewhere underneath all of it, before any of it happened, there was something already there. A temperament. A fascination. A way you were wired from the jump.' },
    { type: 'chapterCode', id: 'prologue-code', essence: 'Everything you have lived is the opening chapter of a story only you can tell.', expandedContent: 'The brain stitches experience into continuity. Memory is not a recording, it is a reconstruction, and every time you tell your life, the neural architecture rewrites. Each time you hold the arc in a different story, the emotional weight of what happened updates. You are not remembering your life. You are rebuilding it every time you tell it.' },
    { type: 'chapterLore', id: 'prologue-lore', essence: 'The acorn.', expandedContent: 'The Dagara people of West Africa gather before a child is born to communicate with the incoming soul, to learn what it is bringing, what the village will need to provide. The child arrives already known. The Greeks spoke of the daimon, the guiding spirit accompanying each person into life. James Hillman called it the acorn theory: every life organized around something present from the beginning. The acorn does not decide to become an oak. It already is one.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'somatic', text: 'Close your eyes. Breathe in through the nose, out through the mouth, letting the exhale run longer than the inhale. Let the thoughts pass without following them. That awareness behind the thinking is where we work from.' },
    { type: 'breath', id: 'prologue-breath-1', pattern: '4-7', duration: 60, label: 'Arrival breath — four in, seven out' },
    { type: 'stepInsight', id: 'prologue-insight-0', unlocksAfter: 'prologue-breath-1', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'prompt', id: 'prologue-prompt-1', text: 'Before the world shaped you, before anyone approved or disapproved, there was a thread. A fascination. An energy pulling you toward something you could not yet name. What was it? Trace the thread. Where has it appeared across the chapters of your life — in different jobs, relationships, obsessions, crises? Different costumes, same energy.' },
    { type: 'stepInsight', id: 'prologue-insight-1', unlocksAfter: 'prologue-prompt-1', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'body', text: 'Now step outside the story. When you say "I am stuck," that is an identity, and examining it triggers shame, which locks the whole structure tighter. When you say "there was a person who got stuck in a pattern that made complete sense given everything they had been through," that is a character with a history, and you can hold them with compassion, even admiration for how brilliantly they adapted. A character can transform in ways a fixed identity never could, because a character has an author, and the author can change the story.' },
    { type: 'prompt', id: 'prologue-prompt-2', text: 'Begin with "There was a person who..." and tell the prologue of their life. The seed, the thread, the whole arc to this moment. Past tense. Third person. Let it be the epic it actually was.' },
    { type: 'stepInsight', id: 'prologue-insight-2', unlocksAfter: 'prologue-prompt-2', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'threshold', text: 'Meet the character. Hold the whole arc — the wounds, the accidents, the turns — as one story. A prologue. Told from outside. The opening chapter of something far larger than one person\'s life.', promptId: 'prologue-author', promptPlaceholder: 'The prologue begins…', promptRows: 14, promptBig: true },
  ]
};

export default chapter;
