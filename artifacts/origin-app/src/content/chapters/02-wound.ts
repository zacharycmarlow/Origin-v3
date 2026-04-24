import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'wound',
  number: 'II',
  title: 'The Wound',
  subtitle: 'Discover that what broke you is exactly what built you.',
  epigraph: 'What you carry as who you are is the story your brain made out of what happened.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'Every character carries a wound. The wound drives the quest, qualifies the hero for the journey, connects them to everyone carrying the same mark. You are about to look directly at the wound the character you just described has been carrying, the conditions that shaped them, the voices narrating their worth since before they had language to argue.' },
    { type: 'body', text: 'The wound does not appreciate being examined. The closer you look, the louder the alarms. Those alarms are the treasure. Shame has many masks in this chapter. The urge to minimize: it was not that bad. The performance of strength: I have already done the work. The retreat into privacy: I do not need to go there. Each is the old story\'s immune system doing its job. If you have done the work, this will go fast. If you have not, this is where it starts. The wound is where the treasure is buried. There is no skipping it.' },
    { type: 'chapterCode', id: 'wound-code', essence: 'What you carry as who you are is the story your brain made out of what happened.', expandedContent: 'Something happened, and the brain asked what does this mean about me, and the answer fused to identity. You stopped being someone who experienced harm and started being someone who is the harm. I am broken. I am too much. I am not enough. These feel like facts, but they are constructions, held in place by the body that stores the emotional signature, running as rumination. The stuckness is not that you cannot release the wound. It is that the wound became the self, and releasing it feels like dissolution. What we are doing is separating you from it, carefully, so you can see it is a story and the author can choose a different one.' },
    { type: 'chapterLore', id: 'wound-lore', essence: 'The songline.', expandedContent: 'The Aboriginal Australians speak of Songlines, invisible pathways laid down by ancestral beings who sang the world into existence, so that to walk the land is to be sung into being by the places you pass through. The Stoics called it amor fati, the love of fate, the practice of embracing what happens as necessary, the recognition that the obstacle was always the way. Follow the arc honestly and something strange appears: the detours were the route.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'somatic', text: 'Before any story, feel into your body. What is already there? Tension, bracing, a low hum you have been carrying so long you stopped noticing. Where does it live?' },
    { type: 'prompt', id: 'wound-prompt-1', text: 'What conditions was this character born into? The family dynamics, the economics, the emotional weather, the unspoken rules about who they were allowed to be?' },
    { type: 'somatic', text: 'Breathe. In through the nose, four counts. Out through the mouth, seven. Give the body its ninety seconds.' },
    { type: 'breath', id: 'wound-breath-1', pattern: '4-7', duration: 90, label: 'Four in, seven out — give the body its ninety seconds' },
    { type: 'prompt', id: 'wound-prompt-2', text: 'What did those conditions teach them about what was allowed and what was punished? What did they become in order to survive?' },
    { type: 'body', text: 'The wound spoke in voices. Installed by caregivers and culture and circumstance before you could question them, they have been narrating your worth and your limits so continuously they sound like your own thoughts. When your brain is being mean to you, it is doing what it learned from whoever was mean to you first.' },
    { type: 'prompt', id: 'wound-prompt-3', text: 'Write the voices down. The exact words. "You are not enough." "Be realistic." "Who do you think you are." Write them all, even the ones that make you flinch. Where do those voices live in your body? They have a physical address — chest, throat, stomach, jaw, sacrum.', rows: 8 },
    { type: 'stepInsight', id: 'wound-insight-1', unlocksAfter: 'wound-prompt-3', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'prompt', id: 'wound-prompt-4', text: 'Name one story running your life right now. "I cannot afford to." "It is too late." The specific script that fires when you approach the edge of change. When was it installed? Whose voice was it? What shifts in the body when you hold it as something done to this character rather than something true about them?' },
    { type: 'stepInsight', id: 'wound-insight-2', unlocksAfter: 'wound-prompt-4', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'bodyItalic', text: 'Somewhere in the world right now, someone is sitting inside the same wound, hearing the same voices, feeling the same holding in the same tissue. Your intimate knowledge of that territory is going to become valuable in ways the character telling this story cannot imagine yet.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'body', text: 'Look at this character. They were a child carrying wounds they did not choose, shaped by forces beyond their control, suffering for it, and none of it was their fault. They could not have done anything differently. Stop being strong. Stop performing past-it. They deserve to be held the way they deserved to be held and never were. Feel compassion for them.' },
    { type: 'threshold', text: 'Tell the real story of how this character got here. The unedited version, the dark chapters, the forces, what was done to them. Past tense. Speak aloud if you can. We are going through, not back.', promptId: 'wound-author', promptPlaceholder: 'The real story…', promptRows: 14, promptBig: true },
  ]
};

export default chapter;
