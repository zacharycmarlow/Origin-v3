import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'gift',
  number: 'III',
  title: 'The Gift',
  subtitle: 'Hold your life as a gift and watch what it becomes.',
  epigraph: 'The meaning you give your life is the life you get to live.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'Life is a gift. You are the gift. If that sounds like something printed on a card, sit with it for a moment and let it actually land, because the implications are enormous. If everything that happened to you happened for you, then nothing was wasted. The pain had a purpose. The confusion was preparation. The years you thought you were lost were the years you were being trained for something you could not see yet.' },
    { type: 'body', text: 'Gratitude is the alchemist. It does not change what happened. It changes what it means. And what it means is what drives everything downstream — every decision, every relationship, every future you can see from where you are standing. We do not discover meaning. We make it. The meaning we make from our suffering is the most powerful choice a human being can exercise.' },
    { type: 'chapterCode', id: 'gift-code', essence: 'The meaning you give your life is the life you get to live.', expandedContent: 'Every time you recall a memory, the neural trace becomes temporarily labile, open to revision. If you revisit it while holding a different emotional meaning, the rewritten trace embeds the new meaning permanently. Researchers call this memory reconsolidation. The memories do not change. What they mean changes, which changes what they do in you from that moment on. Hold your worst chapter inside "what was this preparing me for" while the body is in gratitude, and you are literally rewriting how it is stored.' },
    { type: 'chapterLore', id: 'gift-lore', essence: 'The golden repair.', expandedContent: 'The Japanese art of kintsugi repairs broken pottery with gold so the break becomes the most beautiful part of the vessel. Rumi spent his life writing about this, that the wound is the place where the light enters. Permaculture says it from inside the garden: the problem is the solution, the energy trapped in the dysfunction is the energy needed to resolve it. Every tradition that lasted long enough to be remembered understood the same thing. The wound and the gift are one thing viewed from two angles.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'somatic', text: 'Place one hand on your heart and one on your belly. Feel gratitude as a physical sensation. Warmth in the chest. Softness in the face. For yourself, for surviving all of it. For being here at all.' },
    { type: 'prompt', id: 'gift-prompt-1', text: 'Three questions held in silence:\n\nWhat have I received?\n\nWhat have I given?\n\nWhat trouble have I caused?' },
    { type: 'body', text: 'If someone shaped you through pain, someone whose pressure forged something that would not exist without them, thank them silently. For what it made you.' },
    { type: 'prompt', id: 'gift-prompt-2', text: 'Now the turn. Hold everything you touched in the Wound inside this new question. The same events. The same story. Held in gratitude instead of grief. How did the worst thing that ever happened to this character lead to the best? What capacity do they carry that they could only have received by going through exactly what they went through?' },
    { type: 'stepInsight', id: 'gift-insight-1', unlocksAfter: 'gift-prompt-2', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'bodyItalic', text: 'If something tightened, stay with it. Breathe, four in, seven out. That resistance is shame insisting the pain was meaningless. You are rewriting it right now.' },
    { type: 'body', text: 'The genius is what the suffering built. The thing you cannot stop doing. The capacity people keep pointing out. The sensitivity that has been called too much. These were forged in the wound. Your weakness became your advantage. Your wound became your qualification.' },
    { type: 'prompt', id: 'gift-prompt-3', text: 'Speak new "I AM" declarations. The wound said I am not enough, I am too much, I am broken. Let new declarations rise from the gift.\n\nI am ___.\nI am ___.\nI am ___.' },
    { type: 'stepInsight', id: 'gift-insight-2', unlocksAfter: 'gift-prompt-3', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'threshold', text: 'Feel the meaning shift in the body. The grief composting into a cosmic appreciation for this exact path that produced this exact person standing at this threshold. If nothing was wasted, if every wound was preparation, if the gift is real and it is theirs — what would this character do with it?', promptId: 'gift-author', promptPlaceholder: 'The gift they carry…', promptRows: 14, promptBig: true },
  ]
};

export default chapter;
