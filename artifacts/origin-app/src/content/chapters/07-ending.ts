import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'ending',
  number: 'VII',
  title: 'The Ending',
  subtitle: 'Close the book and become the author.',
  epigraph: 'A story told aloud to another nervous system becomes real in a way no thought can.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'You are standing at the end of a chapter, maybe the longest chapter of your life. The story that brought you here succeeded. It did its job. It carried you through everything it needed to, and now it is finished. You can feel the completeness even when part of you wants to stay in the familiar pattern because at least it is known. The stuckness you have been feeling is the ache of something finished that has not been given permission to end.' },
    { type: 'bodyItalic', text: 'A story that never properly ends becomes a loop, a pattern repeating itself until someone inside it has the courage to write its last page and mean it.' },
    { type: 'chapterCode', id: 'ending-code', essence: 'A story told aloud to another nervous system becomes real in a way no thought can.', expandedContent: 'When you tell your story to another person, their nervous system mirrors yours, treats the narrative as real, reflects it back, and the story comes alive between you in a way thinking alone keeps circular. This is why healing traditions across all of human history involve speaking the story aloud in the presence of someone who receives it. The telling completes the circuit. The witness makes it real. This is how civilizations formed around campfires, how movements gathered force, how every lasting shift in human consciousness began. One person told a story true enough that another person\'s body recognized it, and reality reorganized around what they built together.' },
    { type: 'chapterLore', id: 'ending-lore', essence: 'The thin place.', expandedContent: 'The Aztec and Maya understood time as cyclical, worlds ending and beginning in great epochs, each destruction composting the ground for the next creation. The Buddhists speak of bardo, the gap between lives where the old form has dissolved and the new one has not yet taken shape. The Celts knew about thin places, where the boundary between the everyday and the eternal grows thin enough to step through. Every genuine ending is a thin place. You are in one now.' },
    { type: 'bodyItalic', text: 'Shame has one last mask in this chapter, the voice that says ceremonies are for other people, that taking yourself this seriously is silly. Recognize it. This is the final threshold, and shame knows it.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'prompt', id: 'ending-prompt-1', text: 'What stories are you ready to stop telling? What patterns do you refuse to carry into the new life? What beliefs have you outgrown? What identities have you been wearing because they were familiar? Name them. Feel the weight of them. Notice what it would feel like to set them down, honor what they were, and let them rest.' },
    { type: 'stepInsight', id: 'ending-insight-1', unlocksAfter: 'ending-prompt-1', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'body', text: 'Pull from everything you have excavated. Tell the whole story in one breath, in the third person, past tense, the way you would narrate a life that has just completed its longest chapter.' },
    { type: 'gather', lines: [
      { text: 'They were born into this world.', fixed: true },
      { text: 'They went through…', promptId: 'ending-gather-1' },
      { text: 'They sustained this wound…', promptId: 'ending-gather-2' },
      { text: 'They discovered this gift…', promptId: 'ending-gather-3' },
      { text: 'They reconnected to their source…', promptId: 'ending-gather-4' },
      { text: 'They took on their Narrator…', promptId: 'ending-gather-5' },
      { text: 'And they dreamed…', promptId: 'ending-gather-6' },
      { text: 'And that brings them here. At the start of this story. Because the end is the beginning.', fixed: true },
    ]},
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'somatic', text: 'Take your ending somewhere that matters. A trail, a mountaintop, a river, a quiet grove where the trees have been standing longer than your problems have existed. If you have something to burn, write the old story and let the fire take it. If all you have is your voice, that is enough. That is the oldest technology on earth.' },
    { type: 'threshold', text: 'Read the ending aloud. Speak the final words of the old story into the world so the world can hear them. Do it with a witness if you can. Sit in the silence that follows. That silence is the gap between stories, and everything that comes next is waiting in it.', promptId: 'ending-author', promptPlaceholder: 'I am ending…', promptRows: 14, promptBig: true },
    { type: 'centerText', text: 'Say the words. Mean them.\n\nThe end.' },
  ]
};

export default chapter;
