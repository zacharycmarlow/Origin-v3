export interface Palette {
  bg: string;
  ink: string;
  accent: string;
  veil: string;
  glow: string;
  shadow?: string;
  dark?: boolean;
}

export interface BreathConfig {
  pattern?: string;
  label: string;
  cycles: number;
}

export interface AfterLine {
  kind: 'note' | 'shame' | 'breath';
  text: string;
}

export interface ScenePrompt {
  key: string;
  placeholder: string;
  rows: number;
  big?: boolean;
}

export interface GatherLine {
  label: string;
  key: string | null;
  fixed?: boolean;
}

export interface SceneCodeLore {
  title: string;
  body: string;
}

export interface Scene {
  kind: 'arrive' | 'breath' | 'prompt' | 'reflection' | 'shame' | 'threshold' | 'voices' | 'gratitude' | 'declaration' | 'gathering' | 'outside' | 'movement' | 'embody' | 'broadcast' | 'finale';
  title?: string;
  subtitle?: string;
  label?: string;
  body?: string;
  code?: SceneCodeLore;
  middle?: string;
  lore?: SceneCodeLore;
  closing?: string;
  key?: string;
  rows?: number;
  breath?: BreathConfig;
  breathAfter?: BreathConfig;
  after?: AfterLine[];
  prompt?: ScenePrompt;
  items?: string[];
  keys?: string[];
  lines?: GatherLine[];
  seconds?: number;
  minutes?: number;
}

export interface Chapter {
  roman: string;
  title: string;
  subtitle: string;
  palette: Palette;
  invocation: string;
  transition?: string;
  scenes: Scene[];
}

const CHAPTERS: Chapter[] = [
  {
    roman: "I",
    title: "The Prologue",
    subtitle: "Everything you have lived is the opening chapter of a story only you can tell.",
    palette: { bg: "#ece1c3", ink: "#4a3a24", accent: "#c89838", veil: "#e3d6b2", glow: "#4ff0d6", shadow: "#8a5a24", dark: false },
    invocation: "Every great story begins before the hero knows they are in one. Before the call comes, before the quest takes shape, there is the ordinary world. The life that made you. The accumulation of everything that happened and everything that was done to you and done for you, every accident and inevitability that conspired across years and generations to produce the exact person sitting here reading this, right now, at this exact threshold.\n\nYour whole life up to this moment is the prologue to a story not yet started. And the prologue has to be told before anything can be planted in it. You have to see the story you have been living inside, the one that was written by forces older and larger than your individual will, and you have to honor it, make meaning from it, and close it with the kind of ceremony it deserves. Because a story that never properly ends becomes a loop, a pattern repeating itself until someone has the courage to write its last page and mean it.\n\nThat someone is you. That moment is now.\n\nTell this in the past tense. Speaking about your life as something that already happened shifts you from inside the story to outside it, from a person reliving the pain to the narrator of a character's journey. Speak aloud when you can. When emotions surface, stay with them. A raw emotion, fully felt, moves through the body in about ninety seconds. Longer than that, and a story is holding it in place.",
    transition: "The character is born. The author is in the seat. Now we look at what made this story interesting.",
    scenes: [
      {
        kind: "arrive",
        title: "The Theater",
        subtitle: "Embodiment · Watch the film of your life from the audience",
        body: "Close your eyes. Imagine you are sitting in a theater. The lights go down, the screen fills, and the film that begins to play is your whole life, from the very first scene to this moment.\n\nYou are in the audience. From out here you can see things the character up there has never been able to see from inside: the shape of the whole thing, the recurring themes, the force that has been pulling the story somewhere across every chapter.",
        breath: { pattern: "4-7", label: "Four in, seven out", cycles: 3 },
        code: {
          title: "The observer quiets the default",
          body: "The brain's default narrative system, the machinery that generates the continuous story of who you are, quiets when you shift into pure observation. There is an awareness behind the thinking, older and quieter than any thought. Watching your life from the audience produces a different neurological state than reliving it. The emotional charge decreases, perspective widens, and things that were overwhelming become workable."
        },
        middle: "Let the whole film play without reaching for the remote. Watch the character's childhood, their relationships, their work, the losses, the turns that didn't make sense at the time. See it all from a distance, the way you'd watch a movie about someone whose life fascinated you.",
        lore: {
          title: "The witness",
          body: "The Vedantic tradition of India names four states of consciousness: waking, dreaming, deep sleep, and turiya, the witness that pervades and transcends all three. Turiya is the awareness aware of itself, the one who has been watching since before the first thought. The entire tradition of Advaita Vedanta, developed over millennia, is the recognition that you are turiya, and everything you have been watching, the thoughts, the emotions, the whole story of your life, is the content of consciousness passing through the one who watches. The Sufis call it the ruh, the spirit behind the nafs, the commanding self. Vipassana calls it sati, bare awareness. Every tradition of depth found it."
        },
        closing: "What is the shape of this character's life when you see it from the audience? What patterns emerge from the distance?"
      },
      {
        kind: "prompt",
        title: "The Seed",
        subtitle: "Character · What was there before anyone shaped you",
        body: "From the moment we arrive, we step into the middle of a movie already playing. The family, the culture, the historical moment, the emotional weather of the household, all of it rolling before we have a say. And somewhere in the first few years we become the character. We take on the role so completely and play it for so long that we forget it is a role. The character becomes who we are. Its limitations become our limitations. Its voice becomes our voice. And the movie keeps playing.",
        code: {
          title: "Decentering changes the brain",
          body: "Ethan Kross at the University of Michigan showed that the simple act of using third-person language to describe your own experience reduces emotional reactivity in the amygdala: the brain's threat center responds less to the same memory when the memory is held at arm's length. When participants said \"he felt\" instead of \"I feel,\" the same wound became workable. The distance created by the shift in pronouns produced a shift in the brain. This is the foundational move of everything that follows."
        },
        middle: "Somewhere underneath all the adaptations and performances and versions of yourself you assembled along the way, there was something already there. A personality, a temperament, a way you were wired from the jump. The games you gravitated toward as a kid, the things that fascinated you before anyone told you what should be fascinating, the questions you wouldn't stop asking. That pull was there before any of the conditioning arrived, and it has been running underneath everything since, showing up in different costumes across every chapter.",
        lore: {
          title: "The acorn",
          body: "The Dagara of West Africa hold a tradition where the community gathers before a child is born to communicate with the incoming soul, to learn what it is bringing, what the village will need to provide so this particular life can do what it came to do. The child arrives already known, already needed. James Hillman called it the acorn theory: every life organized around something present from the beginning. The acorn does not decide to become an oak. It already is one, and everything that happens to it either feeds that becoming or tries to prevent it, but the pattern was there from the start."
        },
        closing: "What was pulling this character forward before the world shaped them? What has been the driving force across the whole arc?",
        key: "p1_seed"
      },
      {
        kind: "prompt",
        title: "The Arc",
        subtitle: "Meaning · The story has been going somewhere all along",
        body: "When you look at your whole life as one connected story, patterns emerge. Threads you couldn't see while you were living them become obvious in retrospect, and the messy, astonishing arc of your existence starts to cohere into something that looks suspiciously like it was going somewhere all along. The detours were the route. The things that went wrong opened doors that going right never would have. The relationships that ended, the plans that fell apart, the failures that seemed catastrophic at the time, they were steering this character toward something they couldn't see yet, with a precision that starts to look less like chance and more like design once you see the whole map.",
        code: {
          title: "Every telling is a rewriting",
          body: "Memory is reconstruction. Every time you revisit a moment and hold it in a new story, the neural trace reconsolidates with whatever meaning you carry during the recall. The same childhood can feel like a tragedy at twenty and a training ground at forty. The events stayed. The meaning changed. You are actively rebuilding your autobiography right now. Every word you write here is a renovation."
        },
        middle: "Pick one chapter of this character's story that felt like a disaster at the time. Hold it in the question: what was this steering them toward? What door did the disaster open?",
        lore: {
          title: "The monomyth",
          body: "Joseph Campbell found the same skeleton underneath every myth on earth: a character living in the ordinary world receives a call, crosses a threshold into the unknown, descends into territory that breaks them apart, and returns transformed, carrying something the community needs. Separation, initiation, return. Every culture mapped it because every culture was mapping the same territory: the actual shape of human transformation. You are living it now."
        },
        closing: "What has been the recurring force in this character's story, the energy that kept showing up in different forms across every chapter? Where has the arc been heading?",
        key: "p1_arc",
        rows: 6
      },
      {
        kind: "threshold",
        label: "The First Page",
        subtitle: "Author · Step outside and write the prologue",
        body: "When you say \"I am stuck\" that is an identity, and examining it triggers shame which locks the structure tighter. When you say \"there was a person who got stuck in a pattern that made complete sense given everything they had been through,\" that is a character with a history, and you can hold them with compassion, even admiration for how brilliantly they adapted to what they found.\n\nThat shift is everything. From here, you work with a character. The character is you, your life, your tensions, your gifts, your whole arc, held at just enough distance to see it and shape it and love it without being consumed by it. The author's chair is where you sit now.",
        code: {
          title: "Story and reality share the same circuitry",
          body: "The brain fires identical circuits for a lived experience and a vividly held story. Uri Hasson showed that during vivid storytelling, the listener's brain mirrors the teller's pattern for pattern, and during deep understanding, the listener's brain runs ahead, predicting what comes next. Story recruits the brain's reality-construction apparatus and runs it. The story you put on this page will restructure how your past lives in you from this moment forward."
        },
        middle: "The character you are about to describe arrived on this planet carrying something they did not choose, moved through chapters shaped by forces beyond their control, adapted brilliantly, was marked by what those forces did, and somehow ended up here, at this doorway. Tell it from outside. Past tense. Third person. With the kind of love you would give a character whose journey you found remarkable.",
        lore: {
          title: "The oral tradition",
          body: "For three hundred thousand years before writing existed, human beings passed their lives through story spoken aloud. The griot tradition of West Africa carries one of the oldest continuous storytelling lineages on earth: the djeli holds the complete oral history of a community, memorized and performed across generations. The griot does not recite. They embody. Their performance includes song, rhythm, dramatic gesture, and the community's response is part of the telling. The story exists between the teller and the listeners, in the shared construction of meaning that happens when a human voice meets human attention. You are entering this lineage. You are doing the oldest thing there is."
        },
        closing: "Step outside your story. Let it be the epic it actually was.",
        prompt: { key: "p1_prologue", placeholder: "There was a person who…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "II",
    title: "The Tension",
    subtitle: "Discover that the more tension in your story, the more powerful the resolution.",
    palette: { bg: "#3a1020", ink: "#f0d4c4", accent: "#d47060", veil: "#5c2030", glow: "#e07060", shadow: "#a03040", dark: true },
    invocation: "Every great story runs on tension. The tension is what makes you lean forward, what builds the character, tests them, reveals what they are made of. This is why the most compelling characters in any story are always the ones who have been through the most. The more conflict, the more interesting. The more resolution, the better the story gets.\n\nYou already know what the tension in your story is. It shows up in the patterns that keep repeating, the places where progress stalls, the voice that fires before you can choose a different response. You have spent considerable energy trying to outrun it, manage it, perform having already resolved it.\n\nThis chapter asks you to see it the way a storyteller sees it: with honesty, with craft, with the understanding that this is exactly what the story needed. The tensions in your story are your story's engine. The more courageously you name them, the more you have to work with. To say you have already dealt with all of it is to say your story has stopped moving.\n\nWe are looking for the high score.",
    transition: "The tension has a witness now. What did it build?",
    scenes: [
      {
        kind: "prompt",
        title: "The Score",
        subtitle: "Embodiment · Feel where the tension lives in the body",
        body: "The body is the stage on which this story has been performed, night after night, for your entire life. The conditions you were born into, the adaptations you made, the voices that were installed before you could question them, all of it stored in the tissue. In the jaw that has been holding something back for years. In the chest that learned to stay small. In the belly that clenched around danger so long it forgot what ease feels like.\n\nThe body keeps score. We are looking for the high score.",
        code: {
          title: "The body stores the story",
          body: "Van der Kolk showed that the body stores what happened as sensation, tension pattern, and postural reflex, firing faster than conscious thought, below the level of narrative. The loop that produces the tension lives in the tissue. You cannot think your way out of a pattern that runs faster than thought. You have to work at the level where it lives."
        },
        middle: "Scan slowly from crown to hips. Find where the tension lives, the bracing that was there before you opened this page, the holding you have carried so long it became invisible. Stay with each place. Breathe with it. Then feel something for this body. It survived everything that happened to this character. It carried what it was given without anyone bearing witness to what it was holding. Feel the tenderness that deserves.",
        lore: {
          title: "The initiatory descent",
          body: "Inside the cocoon, everything that made the caterpillar liquefies completely. For a period there is only undifferentiated potential, the old form dissolved, the new one not yet assembled. The butterfly builds itself from the dissolved remains using an entirely different architecture, from the same substance. Inanna descends to the underworld and is stripped of everything at each of seven gates until she hangs naked in the darkness. The shaman's initiatory crisis is always a confrontation with dissolution. Every tradition encoded the same truth: the descent is the prerequisite. The tension is the passage."
        },
        closing: "Map every place you can find the tension in the body. The more honestly you map it, the more raw material you have for everything that follows.",
        key: "p2_score",
        rows: 5
      },
      {
        kind: "prompt",
        title: "The Conditions",
        subtitle: "Character · What the world made before you could choose",
        body: "The character you wrote in the Prologue was born into conditions they did not choose. A specific family with specific dynamics, a specific culture with its rules about who they were allowed to be, a specific emotional weather, a specific moment in history. Those conditions were the story's first authors. They wrote the character's defaults before the character had language to question them.\n\nAnd the character adapted. Brilliantly. Completely. They became whoever they needed to become to survive what they found, learned what to show and what to hide, what to amplify and what to suppress, how to move through the world in ways that kept them safe given what safe meant in that particular household, that particular culture, at that particular time. Those adaptations are evidence of intelligence under pressure.",
        code: {
          title: "The nervous system was shaped before language",
          body: "Stephen Porges showed that the autonomic nervous system is literally entrained by the nervous systems of early caregivers. Your threat responses, your relational patterns, your default ways of reading a room run code written by whoever was in the room when you were learning what the world was. The nervous system was shaped by attunement before you had words for any of it. Understanding this is the beginning of authorship."
        },
        middle: "Think about what it was actually like. The real conditions. The family dynamics, the things that went without saying about who this character was allowed to be, what they were allowed to feel, what was expected of them, what was punished.",
        lore: {
          title: "Karma",
          body: "Arjuna stands paralyzed on the battlefield in the Bhagavad Gita, unable to act because acting means confronting everything his conditioning has made him. His teacher is God in human form, and what God tells him across eighteen chapters comes down to one recognition: as long as you identify with the actor, the cycle owns you. Seeing the cycle, truly seeing it from outside, is the first act of freedom. Every tradition recognized this: the Norse called the binding pattern wyrd, the weight of inherited action shaping the present. The Buddhists called the wheel samsara. The wheel turns because the pattern is the only program loaded."
        },
        closing: "What conditions was this character born into? What did they become in order to survive?",
        key: "p2_conditions",
        rows: 7,
        breathAfter: { label: "Four in, seven out — give the body its ninety seconds.", cycles: 4 }
      },
      {
        kind: "voices",
        title: "The Loop",
        subtitle: "Meaning · See the pattern that has been running the story",
        body: "The pattern has a shape. Once you can see it from the outside, the same themes cycling across every chapter become unmistakable. Different circumstances, same dynamic. Different relationships, same tension getting activated. And the voices, installed before you could argue with them, running so deep they sound like your own thinking. When your brain is being mean to you, it is doing what it learned from whoever was mean to you first.",
        code: {
          title: "The narrative loop",
          body: "A story creates a thought. The thought triggers behavior. Behavior produces consequence. Consequence confirms the story. Round and round, self-reinforcing, running below awareness at a speed that bypasses conscious choice. Porges calls it neuroception, the nervous system filtering reality through stored narrative before perception even happens. The moment you can see the loop as a loop, something shifts permanently. The loop can still run, but once you have seen the pattern for what it is, it can never fully pass as reality again."
        },
        middle: "Here is the thing most people miss about those voices: every surge of self-doubt, every old wound that flares up when you least expect it, is hard-won intelligence about what it feels like to be shaped by forces you didn't choose. As you write them down, as you name them honestly and let them speak, you are doing something remarkable without realizing it: you are reading the mind of the people you are here to help. Your intimate knowledge of that territory, the texture of it, the specific weight of it, the exact way it whispers its lies, becomes your qualification to guide someone else through it.\n\nAnd the patterns did not only shape you. They moved through you into the world. The adaptation that kept the character safe also produced behavior, ways of relating, ways of leaving, ways of shutting down, ways of taking up too much space or not enough. People were affected. Relationships bent under the weight of patterns nobody asked for but everyone absorbed.",
        lore: {
          title: "The songline",
          body: "The Aboriginal Australians speak of Songlines, invisible pathways crisscrossing the continent, laid down by ancestral beings who sang the world into existence, so that to walk the land is to be sung into being by the places you pass through. Your circumstances are your songline: the path that made you, whether you chose it or not. Follow the arc honestly and something becomes visible: the detours were the route. Every step that felt like going backward was laying ground for what came next."
        },
        closing: "What voices have been running this character? What loops keep producing the same outcomes? And what has it cost — not just this character, but the people around them? Write the consequences the patterns produced in the lives of others.",
        key: "p2_loop"
      },
      {
        kind: "threshold",
        label: "The Unedited Version",
        subtitle: "Author · Write the full story from the chair of someone who loves this character",
        body: "Look at this character. They were a child. They arrived into conditions they had no say in, carrying needs they couldn't articulate, trying to make sense of a world already in motion. Every adaptation, every defense, every loop, the most intelligent response available given what they had. They could not have done anything differently with what they knew.",
        code: {
          title: "Compassion separates identity from story",
          body: "The moment you hold the character's wound with genuine compassion, the actual felt sense of love for someone who did the best they could with what they were given, the identification loosens. The author emerges from behind the character. Feel something for them before you write. The physical sensation in the chest. Let that arrive before the pen moves."
        },
        middle: "Feel something for them before you write. The physical sensation in the chest. Let that arrive before the pen moves.",
        lore: {
          title: "The wounded healer",
          body: "Every shamanic tradition understood that the healer's power comes from their wound. Among the Yakut of Siberia, the initiatory illness involves visions of being dismembered by spirits, flesh stripped from bone, the body reassembled with new organs that give the capacity to see what ordinary eyes cannot. The knowing is experiential: the shaman knows the territory of dissolution because they have been there. Your intimate knowledge of the tension, the texture of it, the specific weight of it, the exact way it whispers, becomes your qualification. The wound is the credential."
        },
        closing: "If you were telling someone the real story of how this character got here, the unedited version with the dark chapters and the weird coincidences and the moments that only make sense looking backward, what would it sound like?",
        prompt: { key: "p2_unedited", placeholder: "The unedited version goes…", rows: 10, big: true }
      }
    ]
  },
  {
    roman: "III",
    title: "The Gift",
    subtitle: "Make what happened to you happen for you.",
    palette: { bg: "#102a14", ink: "#c8e0c4", accent: "#60b868", veil: "#1a4024", glow: "#40d878", shadow: "#186030", dark: true },
    invocation: "Life is a gift. You are the gift. Everything you have experienced, the suffering and the beauty, the breaking and the building, the entire improbable chain of events that produced the exact person reading this right now, is meaningful, and you are here for a reason. That might sound like something printed on a greeting card, but sit with it for a moment and let it actually land, because the implications are staggering: if everything that happened to you happened for you, then nothing was wasted. The pain had a purpose. The confusion was preparation. The years you thought you were lost were actually the years you were being trained for something you couldn't see yet.\n\nThe purpose of life is to find your gift. The meaning of life is to give it away. That second part is not an afterthought. The gift incomplete is a gift that rots. The genius that exists only for itself is a genius that circles. Everything you excavated in the Tension, the territory you know from the inside, the specific texture of the suffering, the exact way the voices whisper, that intimate knowledge is the material your gift is made from. The person on the other side of your threshold is living in the same territory right now, feeling the same feelings, hearing the same voices. You will recognize them because you were them.",
    transition: "You just chose what your life means. Now we trace the whole story back to where it actually started.",
    scenes: [
      {
        kind: "prompt",
        title: "The Genius",
        subtitle: "Character · Feel into what was given before it was earned",
        body: "What arrived in you as naturally as breathing — capacities, sensitivities, ways of seeing that feel received rather than earned? The thing you cannot stop doing, the thing that eats hours without you noticing because you are so far inside it that the clock stops mattering? Maybe it is something you have been told is impractical or unrealistic or too much, which is usually a sign you are getting warm.\n\nThe character you have been following did not only survive their conditions. They were built by them. Every wound left behind something it didn't take. Every difficulty forged something in the fire. This chapter is where you find it.",
        code: {
          title: "Post-traumatic growth",
          body: "Tedeschi and Calhoun spent decades studying people who experienced genuine transformation after severe adversity. The capacities they developed, deeper empathy, expanded sense of possibility, a restructured understanding of what matters, were capacities the comfortable path could never have produced. The character who went through the most has, in some specific and irreplaceable way, the most to offer."
        },
        lore: {
          title: "The alchemy",
          body: "The alchemists called it the great work: the transmutation of lead into gold. They understood that the prima materia, the base substance, already contained the philosopher's stone. The gold was in the lead. The work was recognizing what was already present in the darkness. Frankl arrived at the same understanding from inside Auschwitz: meaning is the one thing that cannot be taken. Rumi wrote that the wound is the place where the light enters. The Japanese art of kintsugi repairs broken pottery with gold so the fracture becomes the most luminous part of the vessel, and a kintsugi bowl is worth more after breaking than it was when it was whole, because the gold tells the story of what the vessel survived."
        },
        closing: "What is this character abundant in? What genius survived everything? And who else lives in the territory this character knows from the inside, who would recognize themselves in this character's story? Name the genius. Be specific. What did the tension build that nothing easier could have built?",
        key: "p3_genius",
        rows: 7
      },
      {
        kind: "prompt",
        title: "The Breath",
        subtitle: "Embodiment · Create the conditions for the turn",
        body: "The alchemical turn is a physical event before it is a cognitive one. The body needs space before anything can shift, and the most reliable way to create space is the breath. The long exhale shifts the body from contraction into openness, creating the physiological conditions in which something new can actually land.\n\nThe breath is the only autonomic function under voluntary control, the precise intersection of what happens to you and what you choose. In this it is the perfect practice for this chapter.",
        breath: { label: "Long inhale, longer exhale — until something softens.", cycles: 6 },
        code: {
          title: "The breath opens the field",
          body: "Sustained slow breathing activates the parasympathetic system through the vagus nerve, shifts the body from threat-detection into the open state associated with creativity, connection, and meaning-making. Gratitude requires an open body. The long exhale creates the opening."
        },
        middle: "Breathe into the place in the body where the tension lives. Long inhale, longer exhale. Do this until something softens. Feel what happens when oxygen and attention reach the contracted place.",
        lore: {
          title: "Breath as threshold",
          body: "Pranayama built an entire science around this lever. Dozens of breathing techniques, each producing a specific state: kapalabhati to clear the channels, nadi shodhana to balance the hemispheres, kumbhaka, the held breath, to produce states of profound stillness. The yogis understood three thousand years ago what the neuroscience now confirms: the breath is the threshold between what happens to you and what you do with it. To breathe deliberately is to take voluntary control of the body's most fundamental process. It is the intersection of the involuntary and the chosen."
        },
        closing: "From the softened place, hold the wound inside a different question: what was this preparing me for? Write what shifts.",
        key: "p3_breath",
        rows: 5
      },
      {
        kind: "prompt",
        title: "The Turn",
        subtitle: "Meaning · Hold the same events in a different question",
        body: "This character. These conditions. These years. This body. Held in a different question: what it built in them.\n\nThe parts of your life that are most alive right now, the relationships that sustain you, the work that feels like purpose, the moments where everything clicks, you would not have any of them without the path that brought you here. The disasters and the beauty are woven from the same thread. That is the alchemy: seeing the weave.",
        code: {
          title: "Memory reconsolidation through meaning change",
          body: "Karim Nader demonstrated that emotional memory updates with the meaning held during recall. Hold your worst chapter inside the question \"what was this preparing me for?\" while the body is open from the breath, and you are literally rewriting how that chapter is stored. The events stay. What they mean changes. And the meaning shapes everything downstream."
        },
        middle: "Hold the tension from the previous chapter alongside the genius you just named. What connects them? What is the line from the wound to the gift?",
        lore: {
          title: "Rumi and the wound",
          body: "Rumi was a conventional scholar when Shams of Tabriz shattered everything. His books burned, his reputation destroyed, his comfortable self-understanding demolished. When Shams disappeared, the grief broke Rumi open into the poet he became. The Masnavi, over twenty-five thousand verses of mystical poetry, poured out of the rupture. \"The wound is the place where the light enters you,\" he wrote, and he was describing the mechanism he had lived: the breaking of the container is what allows the contents to be seen. Nietzsche's eternal recurrence poses the ultimate test: could you choose this life again, every wound included? The capacity to say yes is the alchemy."
        },
        closing: "How did the worst chapters of this character's story lead to their greatest capacity?",
        key: "p3_turn",
        rows: 8,
        after: [
          { kind: "shame", text: `If something tightened, stay with it. Four in, seven out. That resistance is shame insisting the pain was meaningless. You are rewriting it right now.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Reason",
        subtitle: "Author · Write from the author who believes nothing was wasted",
        body: "Whether there is some divine intelligence orchestrating the whole thing, or whether the patterns you have traced are the beautiful inevitability of cause and effect rippling through time, that is a question each person answers in their own heart. But here is what is beyond question: your life is meaningful, even if the meaning is something you create rather than discover, because the creation of meaning is the most powerful act a human being can perform. And meaning that stays private eventually suffocates. The meaning you make wants to move through you into the world. It wants to be lived in a way other people can feel.",
        code: {
          title: "Authoring meaning permanently rewrites the architecture",
          body: "When you consciously choose what your suffering means, held with the body open from the breath, in the frame of third-person compassion, the reconsolidation is permanent. The past means what you decide it means. This has always been true. The difference is that now you are doing it on purpose."
        },
        middle: "Hold everything: the character, the tension, the genius, the breath, the turn. What has this life been preparing this character for?",
        lore: {
          title: "Frankl and the last freedom",
          body: "Frankl held one thing inside Auschwitz they could not take: the capacity to choose his response to what was happening. He held the image of the lecture he would give about the psychology of the concentration camp so vividly that his body organized itself around the survival required to deliver it. He survived. He gave the lecture. The meaning he made from his suffering became his life's work, which became the lives of millions of people he never met."
        },
        closing: "If nothing was wasted, what would this character do with what they carry? Whose life changes because this character stopped dimming their genius?",
        prompt: { key: "p3_reason", placeholder: "Nothing was wasted because…", rows: 10, big: true }
      }
    ]
  },
  {
    roman: "IV",
    title: "The Source",
    subtitle: "The mind that built every god can make your life sacred.",
    palette: { bg: "#0a1838", ink: "#c4dcf8", accent: "#5090e0", veil: "#122040", glow: "#70b0f8", shadow: "#204080", dark: true },
    invocation: "When people ask where are you from? they almost never mean it the way the question deserves to be answered. It is a reflex, a social gesture, and the answers we give are just as automatic, a city, a neighborhood, a country. But underneath the reflex, there is a real question reaching for something much bigger, and this chapter is where you answer it.\n\nThe forces that shaped your life did not begin with you. Your parents were shaped by theirs, who were shaped by theirs, all the way back to patterns so old they feel less like history and more like gravity. And the thread does not stop at your family line, or your culture, or even your species. Every cell in your body is made of stardust, atoms forged in the cores of stars that exploded billions of years ago so that, eventually, impossibly, something could open its eyes and wonder where it came from. Each heartbeat in your chest is the fruit of cosmically improbable collisions, extinctions, survivals, and mutations stretching back through four billion years of life finding its way forward on a rock hurtling through space.\n\nThe longing you carry for belonging, for meaning, for connection to something larger than your individual life, that longing is the original operating system remembering what it was designed for.",
    transition: "There is a voice you need to meet.",
    scenes: [
      {
        kind: "prompt",
        title: "The Ancestry",
        subtitle: "Character · Trace the pattern through everything that made you",
        body: "The pattern in this character's life did not begin with their birth. Their parents were responding to what their parents did to them, who were responding to what was done to them, all the way back through a chain of inherited reactions that nobody chose and everybody perpetuated. The beliefs absorbed before they could question them, the emotional patterns learned before they had language for them, the assumptions about what is possible, all of it handed down by people who received it the same way.",
        code: {
          title: "You are the latest expression of an ancient pattern",
          body: "Rachel Yehuda's research on Holocaust survivors' children found epigenetic changes in genes governing the stress response, altered cortisol profiles in people who never experienced the trauma directly. The parents' experience had altered the children's biology. Your nervous system was shaped by your parents' childhoods and their parents' before them."
        },
        middle: "If you follow the thread past your own biography, past your family, past your culture, into the deep time of the species and the deeper time of the cosmos, what does that reveal about why this character is here now, at this particular moment, carrying these particular gifts?",
        lore: {
          title: "The ancestral web",
          body: "The Haudenosaunee Confederacy holds every decision accountable to seven generations back and seven generations forward, because they understand that every present moment exists inside a web extending in both directions through time. The African philosophy of Ubuntu, umuntu ngumuntu ngabantu, a person is a person through other people, expresses the same recognition: the self is produced by the community, and the community is produced by the forces that preceded it. In many Aboriginal cultures, the individual is understood as a particular expression of the Dreaming, the ancestral force that moves through them. You are the ancestors in their current expression. What made you is worth knowing."
        },
        closing: "Trace the thread backward. What forces were in motion before this character arrived? What historical currents, what inherited patterns, what ancient pressures created the conditions they were born into?",
        key: "p4_ancestry",
        rows: 8,
        breathAfter: { label: "Breathe into the widest view. Let the longer exhale loosen the boundary between you and the vast.", cycles: 5 }
      },
      {
        kind: "prompt",
        title: "The Naming",
        subtitle: "Meaning · Name the source your story has been rooted in",
        body: "The brain is a pattern-seeking machine. It looks for order in chaos, agency behind events, meaning inside suffering. This is the faculty that built every god humanity has ever worshipped, because pattern-seeking organisms in chaotic environments always produce agents. Forces with intention. Forces that demand something. Forces worth organizing a life around.\n\nEvery human being who has ever lived has had a god running in their operating system. The question is never whether. It is which one, and who installed it. A harsh parent becomes the internal god of judgment. A chaotic home becomes the god of anxiety. The market becomes the god of worth. These are gods whether you call them that, they are the forces you organize your behavior around, that determine what is sacred and what is disposable, what is worth sacrificing for and what is not.\n\nThis chapter is where you choose.",
        code: {
          title: "The brain builds gods. You can choose yours",
          body: "Dacher Keltner's research on awe shows that encountering something vast physically alters the brain: the self-boundary loosens, inflammatory markers decrease, the sense of connection expands. Andrew Newberg's neuroimaging shows the brain region that maintains the boundary between self and world quieting during mystical experience. The faculty that built every cathedral and carried every pilgrimage is in you. It can consecrate your own existence the moment you turn it there."
        },
        middle: "Is there a longing in you older than your biography? Something reaching toward something it cannot quite name, coming from further back than your individual life, pointing toward something further forward than your individual death?",
        lore: {
          title: "The Law of Origin",
          body: "The Kogi people of Colombia's Sierra Nevada de Santa Marta call it the Ley de Origen, the Law of Origin. In their understanding, the material world is a continuous expression of something that preceded it, and every living thing maintains itself in relation to the law that sustains it. The Kogi perform their ceremonies as maintenance of reality itself, tending the connection between the visible world and what holds it together, because when that connection breaks, everything suffers. Their message to the outside world, delivered rarely and with urgency, is always the same: you have forgotten the source. The roots are dying. Come back. The Vedics called the underlying order Rita. The Taoists called it the Tao. The Lakota say Mitakuye Oyasin, all my relations. The names differ. The fire they sat around was the same."
        },
        closing: "Name it. Out loud. To the sky, to the earth, to whatever is listening. In your own language, the name that comes from having actually felt it.",
        key: "p4_naming",
        rows: 5,
        after: [
          { kind: "shame", text: `If shame whispers "who am I to name something this vast" — recognize the mask. You are as qualified as anyone who ever stood under the sky and felt the pull.` }
        ]
      },
      {
        kind: "prompt",
        title: "The Temple",
        subtitle: "Embodiment · Treat the body as the instrument of the source",
        body: "The word sacred comes from sacer, set apart. Consecrated. Dedicated to something beyond ordinary use. A sacred object is one that has been removed from casual circulation, treated differently because it belongs to something larger.\n\nIf this body is the physical expression of the source you just named, if it is the instrument through which that force acts in the world, then it is also set apart. There are things you would not do to it. Things you would not put in it. The sacrifice implicit in the sacred is the giving up of ordinary, unconscious treatment.",
        code: {
          title: "You believe what you practice in your body",
          body: "What you actually believe is what you do with your body. The Kogi restrict their diet, their movement, their sleep according to the Law of Origin. The Muslims pray five times a day, prostrating before what is greater. Repetition is how you install anything in a nervous system. Each repetition is a line of code, writing the chosen source deeper into the tissue until it runs automatically."
        },
        middle: "What would change tomorrow if you treated this body as the instrument of your source? What rituals would emerge around morning, eating, movement, rest? And what would you sacrifice?",
        lore: {
          title: "Every body, a temple",
          body: "The Lakota sun dance offers the body as proof of dedication. Over four days, dancers fast from food and water while performing a continuous dance facing the sun, often with skewers inserted through the skin of the chest, attached to a sacred pole. The dance imprints the dedication into the tissue permanently. Sun dance chiefs report that the experience restructures the dancer's relationship to their body, their community, and their purpose in ways no other practice reaches. Every tradition that lasted understood: the body is the proof of what you actually hold sacred."
        },
        closing: "What practices emerge from treating this body as the instrument of your source? What would you sacrifice, what gets removed from casual use now that this body is set apart? Make it specific enough to do tomorrow.",
        key: "p4_temple",
        rows: 7
      },
      {
        kind: "threshold",
        label: "The Elevation",
        subtitle: "Author · Write the arc from the perspective of the source",
        body: "Write from the perspective of the source itself looking at this character's arc. The force that preceded this life, watching the conditions, the tension, the gift, the naming, the consecration of the body, from the elevation of what produced it all.",
        code: {
          title: "The widest view reveals what close reading cannot",
          body: "Construal Level Theory shows that psychological distance changes how events are represented. Close events are concrete and emotionally charged. Distant events organize around their essential meaning. When you shift from close to distant, the same life events become organized around their purpose rather than their pain."
        },
        middle: "Hold everything you have written so far. The character, the tension, the gift, the source, the practices. See the whole arc from the widest possible view.",
        lore: {
          title: "Based on a true story",
          body: "Every creation myth is the source telling the story of what it made. The Kogi creation story begins in the thought of the Mother of Origin. The Lakota stories place the human at the center of a web of relations. In every case, the source has a story it is telling through the lives it produces. This character is one of those lives."
        },
        closing: "Write this character's arc from God's eye view. What has this life been in service of?",
        prompt: { key: "p4_elevation", placeholder: "From the elevation of the source…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "V",
    title: "The Narrator",
    subtitle: "Your entire reality is a story, and the one telling it is the one you mistook for yourself.",
    palette: { bg: "#09090b", ink: "#e0d8cc", accent: "#c89838", veil: "#161410", glow: "#e0b840", shadow: "#2c2010", dark: true },
    invocation: "Everything you have excavated across four chapters, the character, the tension, the gift, the source, you built as separate threads. They weren't.\n\nThe voices from the Tension were this voice's scripts. The character from the Prologue was this voice's creation. The wall between you and the source was this voice's construction. The meaning the Gift shifted, this voice was holding it in place. One loom. One fabric.\n\nThere is a voice in your head that has never stopped talking. It replays what happened, rehearses what might, maintains the running account of who you are and what you are worth, so automatically you have probably never noticed you were listening. You mistook it for thinking. You mistook it for yourself.\n\nBut it is a narrative system. It constructs reality, past, future, self, possibility, meaning, and presents the construction as the world itself. This is the chapter where you see the whole loom at once.\n\nFrom this chapter forward, begin speaking in the present tense. You are no longer describing what happened. You are authoring what is.",
    transition: "Underneath everything, there was a power. Imagination. Your imagination has been pointed at things that were not true. Let's take it back.",
    scenes: [
      {
        kind: "broadcast",
        title: "The Broadcast",
        subtitle: "Character · Catch the voice in the act",
        body: "Right now, as you read this, the voice is talking. It has been talking your entire life. It is telling you something about this process, something about your life, something about who you are and what is possible. It sounds like thinking. It sounds like you.",
        code: {
          title: "The default mode network generates the self",
          body: "Neuroscience calls it the default mode network, the most energy-intensive system in the brain, running every moment you are not absorbed in something external. Georg Northoff's research shows that this network generates the sense of self from moment to moment, stitching memory, anticipation, and evaluation into a continuous character. It produces the default version of you, the one who shows up when you are not actively choosing, the one you fall back into whenever your energy drops."
        },
        middle: "Write down exactly what the voice is saying right now. Then keep writing, three to five minutes. Let the full broadcast come through: the judgments, the rehearsals, the catastrophes, the loops. Don't argue. Transcribe. Then read it back as a script written by a character. See the character the voice has been writing. Notice how the same themes cycle in different costumes. That is the program, written in your own hand.",
        lore: {
          title: "The daimon",
          body: "The Greeks called it the daimon, the spirit that accompanies each soul through life. Socrates claimed to be guided by a daimonion, a divine sign that, significantly, spoke only to stop him, never to direct him. Remarkably consistent with what neuroscience now sees: the default system generates warnings, rehearsals of catastrophe, repetitions of past failure. It is more comfortable with stopping than with starting, because its primary function is protection of the existing self-model. Christianity collapsed this companion into the demon, stripping its complexity. The original understanding was closer to the truth: the voice is real, it lives in the architecture of the brain, it was built to protect you in a chaotic world, and it is still running code written for conditions that no longer exist. A fallen guide. Defaulting to itself in the absence of an author."
        },
        closing: "This is your demon. Not evil, just stuck. Give it a character, a shape, a name if one comes. It is easier to see something you can look at.",
        key: "p5_broadcast",
        minutes: 4
      },
      {
        kind: "prompt",
        title: "The System",
        subtitle: "Meaning · See the narrative system that constructs your reality",
        body: "This system generates reality. It runs a loop: the narrative creates a thought, the thought shapes behavior, the behavior produces consequence, the consequence confirms the narrative. Round and round, self-reinforcing, presenting itself as the world rather than as a story being told about the world.\n\nNormal is this system's masterpiece. The most powerful story ever told, because it never announces itself as a story. Money is a narrative. The economy is a narrative. The career ladder is a narrative. Every system you move through was imagined by someone, communicated vividly enough that others entered it, and now it feels like the way things are. Your limitations are narratives. Your possibilities are narratives. The wall that feels like landscape is a narrative that has been running long enough to become invisible.",
        code: {
          title: "The narrative system constructs reality before perception",
          body: "Raichle's research shows that the default mode network constructs the experienced world from top-down prediction, filling in experience based on existing narrative before the senses even report. The brain predicts reality based on the story it has been running, and confirms the prediction. This is why insight alone rarely changes behavior: the prediction shapes experience before conscious choice can intervene."
        },
        middle: "The system that was running you is the same system you use to author your life. The narrative-generator, the meaning-maker, the reality-constructor, all the same instrument. It was running on autopilot. Now it is available to you deliberately.",
        lore: {
          title: "The veil",
          body: "The Hindus called it Maya, and the depth of the concept is often lost in translation. Maya is the creative power by which ultimate reality manifests as the apparent multiplicity of the world. The illusion is that the way you perceive reality is the way reality is. Shankara, the eighth-century philosopher, used the image of a rope on the ground mistaken for a snake: genuine fear, real physiological arousal, real behavior change, all in response to a perception that is constructed rather than received. When the light improves and the rope is seen as a rope, the snake does not go somewhere. It was always the prediction. The Buddhists described samsara, the wheel turning because the beings on it cannot see the wheel. You are seeing through it now."
        },
        closing: "Where does the narrative still feel like reality? Something permanent, immovable, a feature of the landscape rather than a story being told about the landscape. See the narrator's fingerprints on it.",
        key: "p5_system",
        rows: 7
      },
      {
        kind: "movement",
        title: "The Break",
        subtitle: "Embodiment · Move the body before the mind can frame it",
        body: "The narrative system runs in the mind. The body is outside its jurisdiction. This is literal. The narrative system operates through cognitive machinery, memory, prediction, self-referential processing. It cannot run the body without routing through the mind first. Move the body before the mind can frame the movement, and the loop breaks. The body discovers what the narrative would never authorize.",
        seconds: 30,
        code: {
          title: "The body bypasses the narrative system",
          body: "Peter Levine observed that animals in the wild rarely develop post-traumatic stress. After a life-threatening event, the animal discharges the activation energy through involuntary shaking, trembling, and deep breathing. Humans interrupt this discharge with thinking and social performance, trapping the activation energy in the tissue. Levine's work shows that the body can complete what the narrative interrupted, even years or decades after the original event."
        },
        middle: "Stand up. Do something this character would never do. Move too freely, make a sound that surprises you, take up more space than the narrative allows. Thirty seconds. Let the body find what the narrator has been insisting isn't there.\n\nThen go through the body center by center: throat, chest, belly, jaw, shoulders. Each one has been holding a part of the story the narrator wrote. A protector. A defense. A sub-character installed for conditions that may no longer exist. Address each one directly, out loud if you can: what story is this part holding? What was it protecting? What does the author write for it now?",
        lore: {
          title: "The parts that hold the story",
          body: "Richard Schwartz, developing Internal Family Systems therapy through clinical observation, found that every person contains an inner community of sub-personalities: protectors who organize daily life to prevent the vulnerable parts from being triggered, firefighters who activate in emergencies with compulsive force, and exiles, the wounded parts frozen at the age the wound occurred. The therapeutic process involves what Schwartz calls the Self, the witnessing awareness behind all parts, establishing direct relationship with each part and renegotiating its role. The throat that was taught silence. The chest that learned to armor. The belly that contracted around danger. Each one responds to the author's attention. Each one can be given a new story to carry."
        },
        closing: "What shifted in the body after breaking the pattern? What did each center reveal when you addressed it directly?"
      },
      {
        kind: "threshold",
        label: "The Wheel",
        subtitle: "Author · Build the narrative system that will run your life from here",
        body: "The system that was running you is the system you now use to author consciously. The narrative-generator, the meaning-maker, the reality-constructor, all the same instrument, available now deliberately.\n\nThe threshold: from a life organized by the inherited narrative system to one organized by a consciously authored one. A framework for meaning you chose. When this shift happens, life changes texture. Events stop being random and start being legible. The flow state of meaning-making. The adventure that begins when you show up with a system and stop falling into the inherited default.\n\nAnd the old patterns are included in this. The narrator that was running you served the story upstream of everything. It protected you. It brought you exactly here. The new framework holds the whole arc, the conditions, the tension, the gift, the source, as necessary, purposeful, part of the design. That is what makes a narrative system rather than just a story: it accounts for all of it.",
        code: {
          title: "Authored narrative produces coherence, and coherence produces health",
          body: "Pennebaker's expressive writing research, the most replicated finding in health psychology, shows that organizing raw experience into coherent narrative produces measurable improvements in immune function, physical health, and psychological wellbeing. Frankl built logotherapy on a single observation: the will to meaning is the primary human drive, and a person with a framework can endure almost anything."
        },
        middle: "The word default comes from the Latin de-fallere, to fall away, to be absent where a choice should have been. The narrator is what runs when the author is absent. The opposite is ad-venire, to come toward, to arrive, to show up. The advent. And from that root: ad-ventura. The adventure. The adventure begins when you show up with a framework for meaning and stop falling into the inherited default.",
        lore: {
          title: "The first cosmologies",
          body: "The Maya calendar organized all of time into a framework that made events meaningful and navigable. Every individual day had a place within a cosmic narrative of creation, destruction, and renewal. The calendar was a way of meaning time, of ensuring that every moment belonged to a larger pattern. The I Ching maps every possible configuration of change, reading the present moment as a specific arrangement within a larger field of transformations. The Vedic system of dharma gave each person a framework for their place in the cosmic order. These were operating systems, consciously authored frameworks for meaning that organized individual experience within a larger pattern and gave suffering its place in a structure that could hold it. You are building yours now."
        },
        closing: "Author the narrative system. Name the narrator and what it served. Write the framework for meaning you are choosing, the operating system that will organize the stories going forward.",
        prompt: { key: "p5_wheel", placeholder: "The narrator I am taking the pen from is… The framework I am choosing is…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "VI",
    title: "The Dream",
    subtitle: "Remember the power to dream worlds into being.",
    palette: { bg: "#c8ede0", ink: "#0d2e24", accent: "#2aaa8a", veil: "#a4dcc8", glow: "#3ecaaa", shadow: "#0a4832", dark: false },
    invocation: "Nothing is more powerful than a dream. Reality itself is a collectively accepted dream we have agreed to call normal, and everything humanity has ever built or destroyed began as a vision in someone's mind that refused to stay contained there. Dreams sent us to the moon, raised cathedrals that took centuries to complete, toppled empires and birthed new ones from the rubble. The economy is a dream. Money is a dream. Every system you move through was imagined first, spoken second, and built third by people who treated their vision as more real than the reality they were standing in.\n\nDo you remember when you could imagine? Before anyone taught you to be realistic. Before the word practical entered your vocabulary like a closing door. There was a time when you could walk into a field and build a civilization in the grass, be somewhere else so completely your body responded as though it was real. That was the dreaming power, the most natural thing about you.\n\nThe narrator put it on a leash and used it for anxiety, building worst-case futures with breathtaking specificity, flooding the body with chemistry for events that have not happened. Every hour of worry you have ever experienced was the dreaming power pointed in the wrong direction, the body treating the simulation as real because the body has no way of knowing the difference.\n\nThe worrier is already a masterful dreamer. The question is which direction the dreaming is pointed.\n\nAnd here is what every dreamer learns eventually: the dream that lasts is never only about the dreamer. The dreams that changed the world were dreamed by people who saw something larger than their own comfort and couldn't look away. The dream growing in you right now grew from everything you went through, the wound, the gift, the source, and it carries the shape of all of it. It has other people in it. It was always going to.",
    transition: "Your nervous system is building toward what you just wrote. The next chapter makes it real.",
    scenes: [
      {
        kind: "prompt",
        title: "The Inversion",
        subtitle: "Meaning · Your obstacles are stories and your dreams are real",
        body: "The Narrator chapter revealed that what you thought was solid was constructed from narrative. This chapter reveals the inverse: what you thought was fantasy is the raw material reality is built from. Your obstacles are stories. Your dreams are real.\n\nAnd here is what most people miss about their dreams: they are not arbitrary. The dream that keeps returning is the exact dream this particular combination of wounds and gifts and source would produce. The disasters and the beauty grew from the same thread. The dream grew from both.",
        code: {
          title: "A coherent future rewrites how the past is stored",
          body: "Frankl held the image of his future lecture so vividly that his body organized itself around the survival needed to deliver it. Alia Crum's research showed hotel housekeepers who believed their daily work qualified as exercise showed measurable health improvements while a control group doing identical work showed none. The belief changed the biology. What you rehearse with conviction, the body builds toward."
        },
        middle: "What has been trying to come through this character across the whole arc? What dream connects to the wound, the gift, the source?",
        lore: {
          title: "In the beginning was the Word",
          body: "The Aboriginal Dreamtime places the dreaming before and beneath all physical reality, the material world continuously emerging from the dreaming the way a wave emerges from the ocean. The ancestral beings who traveled across the land during the Dreaming created every feature of the landscape through their songs. The physical world is the Dreaming made visible, and the song is still being sung. Every creation myth encodes the same principle: something is envisioned, something is spoken, and the world assembles around the vision. Blake declared imagination the divine body in every person. The Iroquois governed by dreams because they understood that the soul communicates its true nature through the imagination, and the imagination, honored and embodied, builds the world."
        },
        closing: "Write the dream as if it is already true. The life this character came here to live.",
        key: "p6_inversion",
        rows: 8
      },
      {
        kind: "prompt",
        title: "The Vision",
        subtitle: "Character · Name what has been dreaming through you",
        body: "Whose dream have you been living in? Every reality you have moved through was imagined into existence by someone. The career paths available to you are stories people agreed to call real. The rules about what is possible for someone like you were written by people who had reasons to write them that way. You inherited their construction and called it the world.\n\nSociety tells you to follow your dreams and then puts you in debt for going to school, crushes you when you try to build something real, and rewards you for staying in line. A world full of people who have abandoned their dreams is a world that has become a collective nightmare everyone accepts as normal. Dreams without reality are nightmares, yes, but reality without dreams is the nightmare we are already living in.",
        code: {
          title: "The DMN uses the dreaming faculty as its primary tool",
          body: "The default mode network builds reality from imagination, simulating futures, constructing possible selves, rehearsing scenarios the body responds to as real. Imagination pointed at catastrophe produces the chemistry of catastrophe. Pointed at a vivid future, it produces the chemistry of that future."
        },
        lore: {
          title: "The vision quest",
          body: "The Lakota hanblecheyapi strips away comfort and certainty until what remains is what you actually are. The seeker goes alone to a high place, fasting for one to four days, praying continuously, exposed to the elements, stripped of everything that ordinarily cushions the interface between the individual and the vast. The vision that arrives, if it arrives, is understood as an instruction from the spirit world, a specific communication about the seeker's purpose. The community holds the seeker accountable to it. The vision is the assignment."
        },
        closing: "What has been dreaming through you? The unnamed ache behind the busyness, the restlessness you scroll past at two in the morning? Let it include the world. Say it aloud before you write it. Without editing for plausibility.",
        key: "p6_vision",
        rows: 8,
        after: [
          { kind: "shame", text: `If shame says your dream is ridiculous — recognize the mask. "Be realistic" is shame's voice in this territory, defending someone else's dream against yours.` }
        ]
      },
      {
        kind: "embody",
        title: "The Rehearsal",
        subtitle: "Embodiment · Inhabit the character you are becoming",
        body: "The nervous system cannot tell the difference between a vividly imagined experience and a real one. Art is the highest form of this practice, the actor who disappears into a role, the dancer who embodies a story, the musician who channels something beyond themselves. These are human beings using the dreaming power at full capacity. Performance, creativity, expression are the most advanced forms of active embodied imagination.",
        seconds: 60,
        code: {
          title: "Mental rehearsal installs the character",
          body: "Alvaro Pascual-Leone showed that subjects who only imagined practicing a piano exercise showed nearly identical motor cortex expansion as those who physically practiced. The body builds toward what it rehearses, even when the rehearsal is imagined. You become who you practice being."
        },
        middle: "Stand up. Take the physical posture of the character you are becoming. Walk as them. Breathe as them. Feel the morning they wake up to, the work they move toward, the way they carry themselves through the world.",
        lore: {
          title: "The Dreamtime",
          body: "The Australian Aboriginal understanding places the Dreamtime before, beneath, and within all physical reality. The dreaming produces the material world, continuously, the way a wave emerges from the ocean without separating from it. The Tibetan practice of dream yoga trains practitioners to recognize that waking and dreaming share the same nature, both constructions of consciousness, both shapeable by awareness. The dreamer who knows they are dreaming can change what is being dreamed."
        },
        closing: "What changes in the body when you inhabit the dreamed character? What becomes possible from this posture?"
      },
      {
        kind: "threshold",
        label: "The Canvas",
        subtitle: "Author · Paint the world you are authoring into being",
        body: "Write the dream as vividly as you would write reality. The character you are becoming. The morning they wake up to. The work they do. The people whose lives are changed by what this character carries. Write it with enough specificity that someone reading it would know what this person does, who they do it for, and why they are the one doing it.",
        code: {
          title: "Sustained imagination alters biology",
          body: "Steve Cole at UCLA showed that a sense of purpose changes gene expression: reduced inflammation, enhanced antiviral response. The nervous system optimizes for the future the organism most vividly believes is coming. The biology follows the belief."
        },
        middle: "Hold the character you just inhabited. The posture, the breath, the way of moving through the world. Write from that body.",
        lore: {
          title: "The alam al-mithal",
          body: "The Sufi tradition speaks of the alam al-mithal, the imaginal world, a realm as real as the physical, accessible only through the creative imagination. Henry Corbin insisted on the term imaginal rather than imaginary to distinguish it from fantasy. The imaginal is ontologically real, as real as a table or a tree, requiring a different faculty of perception. Every civilization was built by someone who held a vision with enough specificity that others entered it and began building it around them. Every lasting change in human life started as something someone saw with their eyes closed."
        },
        closing: "Author the dream in full. Paint the world.",
        prompt: { key: "p6_canvas", placeholder: "In the world I am authoring…", rows: 14, big: true }
      }
    ]
  },
  {
    roman: "VII",
    title: "The Ending",
    subtitle: "A story told aloud to another nervous system becomes real in a way no thought can.",
    palette: { bg: "#f0e8d8", ink: "#3c3020", accent: "#a89868", veil: "#e0d4b8", glow: "#c8b880", shadow: "#6a5030", dark: false },
    invocation: "You are standing at the end of a chapter, maybe the longest one. The story that brought you here succeeded. It did its job. It carried you through everything it needed to, and now it is finished. You can feel the completeness even if part of you wants to stay in the familiar pattern because at least it is known.\n\nA story that never properly ends becomes a loop, a pattern repeating itself until someone has the courage to write its last page and mean it. That someone is you. That moment is now.",
    transition: "Author reality. The end. Which is to say, the beginning.",
    scenes: [
      {
        kind: "prompt",
        title: "The Release",
        subtitle: "Meaning · Set down what you are finished carrying",
        body: "What are you ready to stop telling? The patterns you refuse to carry into the next chapter. The beliefs you have outgrown. The identities you have been wearing because they were familiar. The narratives about what is possible for you that were written by someone else in conditions that no longer exist. The agreements you made with a version of reality that no longer applies.",
        code: {
          title: "Narrative closure enables the new chapter",
          body: "The Zeigarnik effect: incomplete tasks occupy more cognitive bandwidth than complete ones. The brain keeps open files active, pulling attention back to the unfinished story. The ritual of ending, the formal, spoken, witnessed act of speaking a story closed, resolves the open file. The bandwidth releases."
        },
        middle: "A story that ends properly does not disappear. It composts. It becomes the soil of the next story.",
        lore: {
          title: "The apocalypse",
          body: "The Greek word apokalypsis means uncovering, the removal of what was hidden. The Maya understood time as cyclical, each great epoch ending in a cataclysm that composted the ground for the next creation. The destruction was agriculture. The Norse called it Ragnarok, the necessary fire from which a new world rises. The Buddhists describe bardo, the gap between death and rebirth where everything is possible because nothing is fixed. Every genuine ending is a thin place. You are in one now."
        },
        closing: "Name what this character is setting down. Feel the weight of each one as you write it.",
        key: "p7_release",
        rows: 7
      },
      {
        kind: "gathering",
        title: "The Gathering",
        subtitle: "Character · Tell the whole arc as one coherent story",
        body: "Pull from everything you have written across the seven chapters. The character from the Prologue. The tension they survived. The gift that tension forged. The source they belong to. The narrator they named and took the wheel from. The dream they authored. Bring it all together into one arc, the complete origin story of the author who is now standing here.\n\nThis gathering is the practice of seeing your whole life as one coherent story with archetypal beats, a journey that followed the oldest pattern humanity knows. Separation, initiation, return.",
        code: {
          title: "Narrative coherence reorganizes identity",
          body: "Dan McAdams's research on life narrative shows that the ability to construct a coherent story of one's life is one of the most robust predictors of psychological wellbeing. The coherent narrative does not require that everything made sense in the moment. It requires that the author can see the sense in retrospect."
        },
        middle: "Write the full origin story as one flowing narrative. Third person, past tense. The complete arc. Because the ending is always the beginning.",
        lore: {
          title: "The hero's return",
          body: "Every initiation tradition ends with the return. The shaman returns with healing. The visionary returns with the dream. The warrior returns with the knowledge of what matters. The return is what gives the descent its meaning, because without it the descent is merely personal crisis. With it, the descent becomes service. What you carry back from this is for everyone who will encounter you going forward, and for everyone who needs what only your particular combination of wounds and gifts and source can produce."
        },
        closing: "Speak each beat of the arc. Let the whole story come together.",
        lines: [
          { label: "They were born into this world, into conditions that shaped them in ways they could not choose…", key: null, fixed: true },
          { label: "They survived what the conditions made of them…", key: "p7_g_survived" },
          { label: "They discovered what the survival built in them…", key: "p7_g_built" },
          { label: "They connected to the source their story has always been rooted in…", key: "p7_g_source" },
          { label: "They saw the system that had been writing their life, and they took the pen…", key: "p7_g_pen" },
          { label: "And they dreamed, they remembered the power and pointed it forward…", key: "p7_g_dream" },
          { label: "And that brings them here. At the threshold of the story they are now going to live.", key: "p7_g_threshold" }
        ]
      },
      {
        kind: "threshold",
        label: "The Ceremony",
        subtitle: "Embodiment · Make the ending as epic as it deserves",
        body: "The film that started in the Prologue is yours to write the ending to. Imagine the final scene. The character who has been through everything, all seven chapters, all the territory, all the transformation, stands in a place that matters. And they speak. The old story closed, the new one opened. And the people gathered to witness are changed by what they hear.\n\nHow epic is your ending? The more ritualistic this moment, the more intentional, the more ceremonial, the more real it becomes. Every witness you bring into the ending holds you to the new reality afterward. Their nervous systems receive what yours transmits. The more people present, the more irreversible the declaration.",
        code: {
          title: "The voice activates neural coupling",
          body: "Hasson's research showed that during vivid storytelling, the listener's brain mirrors the speaker's and actually anticipates the speaker's patterns, running ahead of the narrative. Two nervous systems lock into a shared construction. The story becomes real between them in a way it never was inside a single mind. The witness makes it irreversible."
        },
        middle: "Think about where you will go. A mountain, a forest, a body of water, a place that has held human ceremony before, somewhere that has been standing longer than your problems have existed. Think about who you will gather, your people, however many, whoever they are. Think about what you will do with your hands: write the old story on paper and burn it, bury something, release something. Make the ending worthy of the journey. The more beauty, the more intention, the more ritual, the more your nervous system knows this is real.",
        lore: {
          title: "The campfire",
          body: "For three hundred thousand years, human beings have been gathering around fires to speak their stories aloud. Polly Wiessner's research on campfire conversations among the Ju/'hoansi San found that while daytime conversation is overwhelmingly practical, eighty-one percent of nighttime campfire talk is storytelling. The firelight creates a different social space, a liminal zone between the activity of day and the vulnerability of sleep, in which something deeper becomes possible. The circuit between teller and witness is how human beings have always made things real. You cannot think your way into a new identity. You can only speak your way there, in the presence of people who receive what you are saying and hold you to it."
        },
        closing: "Write the plan for your ending ritual. Where will you go? Who will witness? What ceremony will you create? Then write what you will say when you speak.",
        prompt: { key: "p7_ceremony", placeholder: "I will go to… I will gather… I will say…", rows: 12, big: true }
      },
      {
        kind: "finale",
        title: "The Telling",
        subtitle: "Author · Speak the ending and become the storyteller",
        body: "Read it aloud. Every word. Mean it. Speak it to your witness. Slowly enough to feel each sentence land in the body. Watch what happens: where something releases as a word leaves the mouth, where the voice catches because something real is moving through it, where the silence between sentences holds more than the words can.\n\nSit in the silence that follows. That silence is the gap between stories. Everything that comes next is waiting in it.",
        code: {
          title: "The witness makes it irreversible",
          body: "Inside your own mind, the narrator can revise endlessly. The moment the story enters another nervous system and that system receives it, the revision stops. The witness carries the impression into every subsequent interaction. The more witnesses, the more irreversible the new story becomes."
        },
        lore: {
          title: "The thin place",
          body: "The Celts knew about thin places, locations and moments where the membrane between the ordinary and the sacred grows permeable. A genuine ending is always a thin place. The old form has dissolved. The new one forming. You are standing in the gap, the silence from which new worlds emerge. Every creation myth begins here. Before the dreaming, there was the silence. You are in the silence now. What you speak from here will shape what assembles around you next."
        },
        closing: "Speak the ending aloud to your witness. Then write what the speaking produced, what moved, what shifted, what became real in the telling. Then write the first line of what comes next."
      }
    ]
  }
];

export default CHAPTERS;
