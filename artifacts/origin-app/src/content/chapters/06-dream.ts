import type { ChapterDef } from '../types';

const chapter: ChapterDef = {
  id: 'dream',
  number: 'VI',
  title: 'The Dream',
  subtitle: 'Remember when you could build worlds.',
  epigraph: 'The world you want to live in does not exist yet, and you are the one dreaming it into being.',
  elements: [
    { type: 'sectionLabel', text: 'REALIZE' },
    { type: 'body', text: 'Do you remember when you could imagine? Before anyone taught you to be practical, before the word realistic entered your vocabulary, before the dreams got trained out of you by a world that needed you compliant, there was a time when you could walk into a field and build a civilization in the grass. Close your eyes and be somewhere else so completely your body responded as though it was real. Spend an afternoon in a world you invented and come back changed by what happened there.' },
    { type: 'body', text: 'That was the dreaming power. And it was the most natural thing about you. That power never left. The Narrator put it on a leash and used it to worry, to catastrophize, to build worst-case futures with breathtaking clarity and then flood your body with the chemistry of events that had not happened. Every hour of anxiety you have ever felt was the dreaming power running in reverse, imagination pointed at the wrong future.' },
    { type: 'bodyItalic', text: 'Reality itself is a collectively accepted dream we have agreed to call normal. Everything humanity has ever built or destroyed began as a vision in someone\'s mind that refused to stay contained there. Your biggest obstacles are stories. Your dreams are real.' },
    { type: 'chapterCode', id: 'dream-code', essence: 'The world you want to live in does not exist yet, and you are the one dreaming it into being.', expandedContent: 'The brain does not distinguish between a vividly imagined event and a real one. The motor cortex fires during mental rehearsal at nearly the intensity of physical practice. Studies show that people who only imagine doing strength training gain measurable strength. Elite athletes install their performance by running the neural program hundreds of times before the body executes it. Visualization is not metaphor. It is rehearsal. The body prepares for what you imagine. Heart rate rises for imagined threats. Cortisol spikes for imagined failures. The autonomic nervous system cannot tell the difference. What you rehearse, the body builds the capacity for. Viktor Frankl imagined the lecture he would give until his body organized itself around the survival that would let him give it. He survived. He gave the lecture. Dreaming, practiced with conviction, is how humans have always built the future they are standing in.' },
    { type: 'chapterLore', id: 'dream-lore', essence: 'The dreaming.', expandedContent: 'The Iroquois understood dreams as the language of the soul communicating its true desires, and built entire governance systems around honoring what came through in the night. The dreamer did not carry it alone. The community was responsible for bringing it into being. The Australian Aboriginals placed the Dreamtime before and beneath all of physical reality, the generative source from which the material world continuously emerges. Every tradition that lasted long enough to be remembered understood what modern people have forgotten: dreams are the instructions for building reality.' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'PRACTICE' },
    { type: 'somatic', text: 'Close your eyes. Remember what it felt like to imagine like that. The ease. The aliveness. The way the world bent to meet whatever you were creating. Where does that power live in your body? The chest, the hands, behind the eyes?' },
    { type: 'prompt', id: 'dream-prompt-1', text: 'When did the dreaming go quiet? What was the moment, or the slow accumulation of moments, when you learned to stop building worlds and start being realistic? Whose dream have you been living in? What version of reality were you handed and told was the only one?' },
    { type: 'prompt', id: 'dream-prompt-2', text: 'Feel the tension between the dream you carry and the dream you have been living inside. What has been dreaming through you? What keeps coming back no matter how many times the Narrator shuts it down? Say it aloud. Without editing for plausibility.' },
    { type: 'stepInsight', id: 'dream-insight-1', unlocksAfter: 'dream-prompt-2', codeEssence: 'PLACEHOLDER', loreEssence: 'PLACEHOLDER' },
    { type: 'rule' },
    { type: 'sectionLabel', text: 'AUTHOR' },
    { type: 'somatic', text: 'Dream yourself. Close your eyes and enter the world. Feel the morning. The air. The light. Walk like the person you are dreaming into being. Breathe like them. Hold yourself the way they hold themselves. The inner child who built worlds before breakfast never left. Embody the new character so vividly your nervous system learns it.' },
    { type: 'centerText', text: 'Author your story.' },
    { type: 'threshold', text: 'Paint the dream with enough detail and conviction that someone reading would believe it already exists. Because it does — in the only place a world ever begins.', promptId: 'dream-author', promptPlaceholder: 'In the world I am dreaming…', promptRows: 16, promptBig: true },
  ]
};

export default chapter;
