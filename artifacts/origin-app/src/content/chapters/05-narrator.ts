import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'narrator',
  number: 'V',
  title: 'The Narrator',
  subtitle: 'Meet the voice that constructed your entire reality.',
  epigraph: 'Your entire reality is a story, and the one telling it is the one you mistook for yourself.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'Everything you have excavated across four chapters — the seed, the character, the wound, the voices, the loops, the gifts hidden inside the wounds, the source underneath it all — you built as separate threads. You are about to discover they were one fabric, woven by one loom, so continuously you never saw the weaving.' },
    { type: 'centerText', text: 'Stop. Right now. Listen.' },
    { type: 'body', text: 'There is a voice in your head that has never stopped talking. It replays what happened, rehearses what might, maintains the running account of who you are and what you are worth, so automatically you have probably never noticed you were listening. You mistook it for thinking. You mistook it for yourself.' },
    { type: 'chapterCode', id: 'narrator-code', essence: 'Your entire reality is a story, and the one telling it is the one you mistook for yourself.', expandedContent: 'Neuroscience calls this the default mode network, the most energy-intensive system in your brain, running every moment you are not absorbed in something external. It uses more energy to be than to do. What it does is author your consciousness. It tells you what the past means. It builds futures so vivid your body floods with cortisol for events that have not happened. It generates the default character you become when depleted. It constructs the reality you live inside: the story shapes how you show up, how you show up shapes how people respond, how people respond confirms the story, and the loop tightens until the wall feels like a fact of nature. Normal is this system\'s masterpiece. The most powerful story ever told, because it does not announce itself as a story.' },
    { type: 'chapterLore', id: 'narrator-lore', essence: 'The daimon.', expandedContent: 'Every culture in human history has described a disembodied voice guiding, tormenting, narrating the self. The Greeks called it the daimon, a spirit companion, neither good nor evil, that accompanied each person through life. Christianity collapsed it into the demon. The ancients were closer to the truth: the voice is real, it lives in the architecture of the brain, and it was built to protect you, to make meaning in a chaotic world, to construct a reality stable enough to survive inside. It is not malevolent. It is ignorant — a fallen angel, still running code written for conditions that no longer exist, defaulting to itself in the absence of an author.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'somatic', text: 'Catch it in the act. What is it saying right now? About you, about this process, about your life? Write it down for three to five minutes. Let the broadcast pour onto the page. The judgments, the rehearsals, the catastrophes, the identities. Do not edit. Do not argue. Transcribe what you hear.' },
    { type: 'prompt', id: 'narrator-broadcast', text: 'Three to five minutes. The voice, unedited. Everything it is saying right now.', rows: 12 },
    { type: 'body', text: 'Now read it back. Read it as a script written by someone, for a character. See the character the voice has been writing. See the plot it has been running. Notice how the same three or four themes cycle over and over in different costumes. That is the program, written in your own hand.' },
    { type: 'body', text: 'The voices you wrote down in the Wound were this voice\'s scripts. The character in the Prologue was this voice\'s creation. The wall between you and the source was this voice\'s construction. One loom. One fabric. One system running all of it.' },
    { type: 'prompt', id: 'narrator-prompt-2', text: 'Give it a shape, a character, a name if one comes. Where in your life does it still feel like "that is just how it is"? A relationship, a financial pattern, a limitation you accepted as fact. Name the wall. Can you see the Narrator\'s fingerprints on it — the story creating the reality, the belief creating the evidence, the loop building itself until it became invisible?' },
    { type: 'stepInsight', id: 'narrator-insight-1', unlocksAfter: 'narrator-prompt-2', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'somatic', text: 'Now do something this character would never do. Stand up. Shake your body out. Make a sound. Move in a way that surprises you. The Narrator runs in the mind. The body is outside its jurisdiction.' },
    { type: 'body', text: 'The Narrator is not the enemy. Every line it speaks was forged from a real wound, a real moment when the story kept you safe. It is keeping you small in a container you outgrew a long time ago. The system that was running you IS the instrument you use to author your life consciously. You did not destroy the loom. You took the wheel.' },
    { type: 'body', text: 'The word default comes from the Latin de-fallere, to fall away, to be absent where a choice should have been. The demon is what runs in the absence of the author. The opposite is ad-venire, to come toward, to arrive, to show up. The advent. And ad-ventura, the thing that comes toward you because you moved toward it. The adventure.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'centerText', text: 'Author your consciousness.' },
    { type: 'threshold', text: 'The power to construct reality, to rewrite the past, to build the future, to generate an identity so convincing it becomes the world. This power is yours. It has been authoring your consciousness without your knowledge or consent. What story will you tell? What reality will you build? What character will you become?', promptId: 'narrator-author', promptPlaceholder: 'The story I choose to tell…', promptRows: 14, promptBig: true },
  ]
};

export default chapter;
