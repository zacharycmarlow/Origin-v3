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

export interface Scene {
  kind: 'arrive' | 'breath' | 'prompt' | 'reflection' | 'shame' | 'threshold' | 'voices' | 'gratitude' | 'declaration' | 'gathering' | 'outside' | 'movement' | 'embody' | 'broadcast' | 'finale';
  title?: string;
  label?: string;
  body?: string;
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

export interface LoreContent {
  essence: string;
  expandedContent: string;
}

export interface Chapter {
  roman: string;
  title: string;
  subtitle: string;
  palette: Palette;
  invocation: string;
  code: { title: string; essence: string; body: string };
  lore: LoreContent;
  outside?: boolean;
  scenes: Scene[];
}

const CHAPTERS: Chapter[] = [
  {
    roman: "I",
    title: "The Prologue",
    subtitle: "Everything you have lived is the opening chapter of a story only you can tell.",
    palette: {
      bg: "#ece1c3",
      ink: "#4a3a24",
      accent: "#c89838",
      veil: "#e3d6b2",
      glow: "#4ff0d6",
      shadow: "#8a5a24",
      dark: false
    },
    invocation: "Every great story begins before the hero knows they are in one. Before the call comes, before the quest takes shape, there is the ordinary world. The life that made you. The accumulation of everything that happened and everything that was done to you and done for you, every accident and inevitability that conspired across years and generations to produce the exact person sitting here, right now, at this exact threshold.\n\nYour whole life up to this moment is the prologue to a story not yet started. And the prologue has to be told before anything can be planted in it.\n\nA story that never properly ends becomes a loop, a pattern repeating itself until someone has the courage to write its last page and mean it. That someone is you. That moment is now.",
    code: {
      title: "The Code",
      essence: "The observer quiets the default — there is an awareness behind the thinking that is not the thinking itself.",
      body: "The brain's default narrative system, the machinery that generates the continuous story of who you are, measurably quiets when you shift into pure observation. There is an awareness behind the thinking that is not the thinking itself. Watching your life from the audience produces a fundamentally different neurological state than reliving it. The emotional charge decreases, perspective widens, and things that were overwhelming become workable. That awareness behind the watching is where the author lives."
    },
    lore: {
      essence: "The acorn.",
      expandedContent: "The Dagara of West Africa hold a tradition where the community gathers before a child is born to communicate with the incoming soul, to learn what it is bringing, what the village will need to provide so this particular life can do what it came to do. The child arrives already known, already needed. James Hillman called it the acorn theory: every life organized around something present from the beginning. The acorn does not decide to become an oak. It already is one, and everything that happens to it either feeds that becoming or tries to prevent it, but the pattern was there from the start. Vipassana, Sufi muraqaba, centering prayer, Vedantic self-inquiry — every tradition of depth developed a practice of witnessing rather than following the mind. They arrived at the same recognition from different angles: there is something watching. It was there before the first thought and it will be there after the last one. Inhabiting it is the most practical thing a person can do."
    },
    scenes: [
      {
        kind: "arrive",
        title: "The Theater",
        body: "Close your eyes. Imagine you are sitting in a theater. The lights go down, the screen fills, and the film that begins to play is your whole life, from the very first scene to this moment. You are in the audience. From out here you can see things the character up there has never been able to see from inside: the shape of the whole thing, the recurring themes, the force that has been pulling the story somewhere across every chapter. Watch without reaching for the remote.",
        breath: { pattern: "4-7", label: "Four in, seven out", cycles: 3 }
      },
      {
        kind: "prompt",
        title: "The Seed",
        body: "Before anyone shaped you, there was something already there. A personality, a temperament, a way you were wired from the jump. The games you gravitated toward as a kid, the things that fascinated you before anyone told you what should be fascinating, the questions you wouldn't stop asking. That pull was there before any of the conditioning arrived, and it has been running underneath everything since. What was pulling this character forward before the world shaped them?",
        key: "p1_seed",
        after: [
          { kind: "note", text: `Whatever you just touched, that is the seed. The Dagara gather before a child is born to learn what the incoming soul is bringing. The acorn does not decide to become an oak — the pattern was there from the start.` },
          { kind: "shame", text: `If shame whispers that the fascination you just named is small — recognize the first mask. The seed was never small.` }
        ]
      },
      {
        kind: "prompt",
        title: "The Arc",
        body: "When you look at your whole life as one connected story, patterns emerge. The detours were the route. The things that went wrong opened doors that going right never would have. Pick one chapter that felt like a disaster at the time. Hold it in the question: what was this steering them toward? What door did the disaster open?",
        key: "p1_thread"
      },
      {
        kind: "prompt",
        title: "The Third Person",
        body: `When you say "I am stuck," that is an identity, and examining it triggers shame which locks the structure tighter. When you say "there was a person who got stuck in a pattern that made complete sense given everything they had been through," that is a character with a history, and you can hold them with compassion. Begin with "There was a person who…" and tell their story. Past tense. Let it be the epic it actually was.`,
        key: "p1_thirdperson",
        rows: 10,
        after: [
          { kind: "note", text: `Notice what loosened when you stepped outside. Something that was clenched when it was "I" just released. Let that space stay open.` }
        ]
      },
      {
        kind: "threshold",
        label: "The First Page",
        body: "The character you are about to describe arrived on this planet carrying something they did not choose, moved through chapters shaped by forces beyond their control, adapted brilliantly, was marked by what those forces did, and somehow ended up here, at this doorway. Tell it from outside. Past tense. Third person. With the kind of love you would give a character whose journey you found remarkable.",
        prompt: { key: "p1_prologue", placeholder: "The prologue begins…", rows: 12 }
      }
    ]
  },
  {
    roman: "II",
    title: "The Tension",
    subtitle: "Discover that the more tension in your story, the more powerful the resolution.",
    palette: {
      bg: "#3a1020",
      ink: "#f0d4c4",
      accent: "#d47060",
      veil: "#5c2030",
      glow: "#e07060",
      shadow: "#a03040",
      dark: true
    },
    invocation: "Every great story runs on tension. The tension is what makes you lean forward, what builds the character, tests them, reveals what they are made of. The most compelling characters in any story are always the ones who have been through the most. The more conflict, the more interesting. The more resolution, the better the story gets.\n\nYou already know what the tension in your story is. It shows up in the patterns that keep repeating, the places where progress stalls, the voice that fires before you can choose a different response.\n\nThis chapter asks you to see it the way a storyteller sees it: with honesty, with craft, with the understanding that this is exactly what the story needed. We are looking for the high score.",
    code: {
      title: "The Code",
      essence: "The body keeps the score — and we are looking for the high score.",
      body: "Van der Kolk showed that the body stores what happened as sensation, tension pattern, and postural reflex, firing faster than conscious thought, below the level of narrative. The loop that produces the tension lives in the tissue. You cannot think your way out of a pattern that runs faster than thought. You have to work at the level where it lives. Stephen Porges showed that the autonomic nervous system is literally entrained by the nervous systems of early caregivers — your threat responses, your relational patterns, your default ways of reading a room run code written by whoever was in the room when you were learning what the world was."
    },
    lore: {
      essence: "The initiatory descent.",
      expandedContent: "Inside the cocoon, everything that made the caterpillar liquefies completely. For a period there is only undifferentiated potential, the old form dissolved, the new one not yet assembled. The butterfly builds itself from the dissolved remains using an entirely different architecture, from the same substance. Inanna descends to the underworld and is stripped of everything at each of seven gates. The shaman's initiatory crisis is always a confrontation with dissolution, the experience of being broken apart so completely that something new becomes possible. Every tradition encoded the same truth: the descent is the prerequisite. The tension is the passage. The Aboriginal Australians speak of Songlines — invisible pathways laid down by ancestral beings who sang the world into existence. Your circumstances are your songline: the path that made you, whether you chose it or not. The detours were the route."
    },
    scenes: [
      {
        kind: "prompt",
        title: "The Score",
        body: "The body is the stage on which this story has been performed, night after night, for your entire life. Scan slowly from crown to hips. Find where the tension lives — the bracing that was there before you opened this page, the holding you have carried so long it became invisible. The jaw that has been holding something back for years. The chest that learned to stay small. The belly that clenched around danger so long it forgot what ease feels like. Where does the tension live in this body?",
        key: "p2_body"
      },
      {
        kind: "prompt",
        title: "The Conditions",
        body: "The character was born into conditions they did not choose. A specific family with specific dynamics, a specific culture with its rules about who they were allowed to be, a specific emotional weather, a specific moment in history. Those conditions wrote the character's defaults before they had language to question them. What were the real conditions — the things that went without saying about who this character was allowed to be, what they were allowed to feel, what was expected, what was punished?",
        key: "p2_conditions",
        rows: 6,
        breathAfter: { label: "Four in, seven out — give the body its ninety seconds.", cycles: 4 }
      },
      {
        kind: "voices",
        title: "The Loop",
        body: `The pattern has a shape. Different circumstances, same dynamic. Different relationships, same tension getting activated. And the voices — installed before you could argue with them, running so deep they sound like your own thinking. When your brain is being mean to you, it is doing what it learned from whoever was mean to you first. Write the voices — the exact words. "You are not enough." "Be realistic." Even the ones that make you flinch.`,
        key: "p2_voices",
        after: [
          { kind: "note", text: `Every surge of self-doubt, every old wound that flares up, is hard-won intelligence about what it feels like to be shaped by forces you didn't choose. Your intimate knowledge of that territory becomes your qualification to guide someone else through it.` },
          { kind: "note", text: `And the patterns did not only shape you. They moved through you into the world. The adaptation that kept the character safe also produced behavior — ways of relating, ways of leaving, ways of shutting down, ways of taking up too much space or not enough. People were affected. Relationships bent under the weight of patterns nobody asked for but everyone absorbed. The loops in your story did not stay inside your story.` }
        ]
      },
      {
        kind: "prompt",
        title: "Trace the Loop",
        body: `What voices have been running this character? What loops keep producing the same outcomes? And what has it cost — not just the character, but the people around them? Write the consequences the patterns produced in the lives of others.\n\nThe moment you can see the loop as a loop, something shifts permanently. Once you have seen the pattern for what it is, it can never fully pass as reality again.`,
        key: "p2_stuck_story",
        rows: 6,
        after: [
          { kind: "note", text: `Stay with the space that opens. The body without the program. What is there when this loop pauses?` }
        ]
      },
      {
        kind: "prompt",
        title: "The Unedited Version",
        body: "If you were telling someone the real story of how this character got here — the unedited version with the dark chapters and the weird coincidences and the moments that only make sense looking backward — what would it sound like? Past tense. Speak aloud if you can. We are going through, not back.",
        key: "p2_performance",
        rows: 8,
        breathAfter: { label: "Close your eyes. Feel what the telling moved. Let the body shake if it wants to.", cycles: 3 }
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "Look at this character. They were a child. They arrived into conditions they had no say in, carrying needs they couldn't articulate, trying to make sense of a world already in motion. Every adaptation, every defense, every loop — the most intelligent response available given what they had. Feel something for them before you write. Not the idea of compassion. The physical sensation in the chest. The wound is the credential. Your intimate knowledge of this territory is going to become extraordinarily valuable.",
        prompt: { key: "p2_compassion", placeholder: "What do you feel for this person? Let it come.", rows: 6 }
      }
    ]
  },
  {
    roman: "III",
    title: "The Gift",
    subtitle: "Make what happened to you happen for you.",
    palette: {
      bg: "#102a14",
      ink: "#c8e0c4",
      accent: "#60b868",
      veil: "#1a4024",
      glow: "#40d878",
      shadow: "#186030",
      dark: true
    },
    invocation: "Life is a gift. You are the gift. Everything you have experienced — the suffering and the beauty, the breaking and the building, the entire improbable chain of events that produced the exact person reading this right now — is meaningful, and you are here for a reason.\n\nThat might sound like something printed on a greeting card, but sit with it for a moment and let it actually land, because the implications are staggering: if everything that happened to you happened for you, then nothing was wasted. The pain had a purpose. The confusion was preparation. The years you thought you were lost were the years you were being trained for something you couldn't see yet.\n\nThe purpose of life is to find your gift. The meaning of life is to give it away. That second part is not an afterthought. The gift incomplete is a gift that rots. The genius that exists only for itself is a genius that circles. Everything you excavated in the Tension — the territory you know from the inside, the specific texture of the suffering, the exact way the voices whisper — that intimate knowledge is the material your gift is made from. The person on the other side of your wound is waiting for someone who has been there. Your intimate knowledge of that territory is not just a credential — it is the gift itself.",
    code: {
      title: "The Code",
      essence: "Memory reconsolidates with the meaning held during recall — hold the worst chapter inside a different question and the brain rewrites how it is stored.",
      body: "Every time you recall a memory, the neural trace becomes temporarily labile, open to revision. If you revisit it while holding a different emotional meaning, the rewritten trace embeds the new meaning permanently. Karim Nader first demonstrated this: emotional memory is not fixed. It updates with the meaning held during recall. Hold your worst chapter inside the question \"what was this preparing me for?\" while the body is open from the breath, and you are literally rewriting how that chapter is stored. Tedeschi and Calhoun's research on post-traumatic growth showed that the capacities developed through real adversity — deeper empathy, expanded sense of possibility — were capacities the comfortable path could never have produced."
    },
    lore: {
      essence: "The alchemy.",
      expandedContent: "The alchemists called it the great work: the transmutation of lead into gold. They understood that the prima materia, the base substance, already contained the philosopher's stone. The gold was in the lead. The work was recognizing what was already present in the darkness. Frankl arrived at the same understanding from inside Auschwitz: meaning is the one thing that cannot be taken. Rumi wrote that the wound is the place where the light enters. Kintsugi repairs broken pottery with gold so the fracture becomes the most luminous part of the vessel. Permaculture's first principle holds that the problem is the solution: the very difficulty contains the resource for resolving it. The Sufis understood that the heart's capacity for grief is the exact measure of its capacity for love — the same depth, differently directed. The gold in the seam is not metaphor. It is what the breaking made possible."
    },
    scenes: [
      {
        kind: "prompt",
        title: "The Genius",
        body: "What arrived in you as naturally as breathing — capacities, sensitivities, ways of seeing that feel received rather than earned? The thing you cannot stop doing, the thing that eats hours without you noticing because you are so far inside it that the clock stops mattering? Maybe it is something you have been told is impractical or unrealistic or too much, which is usually a sign you are getting warm.\n\nWhat is this character abundant in? What genius survived everything? And who else lives in the territory this character knows from the inside — who would recognize themselves in this character's story?",
        key: "p3_abundance",
        rows: 6
      },
      {
        kind: "gratitude",
        title: "The Breath",
        body: "The alchemical turn is a physical event before it is a cognitive one. The body needs space before anything can shift, and the most reliable way to create space is the breath. Place one hand on your heart. Breathe into the place where the tension lives. Long inhale, longer exhale. Do this until something softens. Then hold these in silence:",
        items: ["What have I received?", "What have I given?", "What trouble have I caused?"],
        keys: ["p3_received", "p3_given", "p3_caused"]
      },
      {
        kind: "prompt",
        title: "The Turn",
        body: "Now the turn. This character. These conditions. These years. This body. Held in a different question: what it built in them. The parts of your life that are most alive right now — the relationships that sustain you, the work that feels like purpose, the moments where everything clicks — you would not have any of them without the path that brought you here. Hold the tension from the previous chapter alongside the genius you just named. What is the line from the wound to the gift?",
        key: "p3_alchemy",
        rows: 8,
        after: [
          { kind: "note", text: `Kintsugi repairs broken pottery with gold so the break becomes the most luminous part of the vessel. Rumi: the wound is the place where the light enters. Permaculture: the problem is the solution.` },
          { kind: "shame", text: `If something tightened, stay with it. Four in, seven out. That resistance is shame insisting the pain was meaningless. You are rewriting it right now.` }
        ]
      },
      {
        kind: "declaration",
        title: "I Am",
        body: `The tension said "I am not enough." Let new declarations rise from the gift. The purpose of life is to find your gift. The meaning of life is to give it away.`,
        keys: ["p3_iam1", "p3_iam2", "p3_iam3"]
      },
      {
        kind: "threshold",
        label: "The Reason",
        body: "Whether there is some divine intelligence orchestrating the whole thing, or whether the patterns you have traced are the beautiful inevitability of cause and effect rippling through time, that is a question each person answers in their own heart. But here is what is beyond question: your life is meaningful, even if the meaning is something you create rather than discover, because the creation of meaning is the most powerful act a human being can perform. And meaning that stays private is meaning half-lived. The gift finds its form when it moves through you toward someone else.",
        prompt: { key: "p3_center", placeholder: "If nothing was wasted, what would this character do with what they carry? Whose life changes because this character stopped dimming their genius? What becomes possible — not just for them, but for the people who encounter them when they are finally living as the author?", rows: 8 }
      }
    ]
  },
  {
    roman: "IV",
    title: "The Source",
    subtitle: "The mind that built every god can make your life sacred.",
    palette: {
      bg: "#0a1838",
      ink: "#c4dcf8",
      accent: "#5090e0",
      veil: "#122040",
      glow: "#70b0f8",
      shadow: "#204080",
      dark: true
    },
    invocation: "When people ask where are you from, they almost never mean it the way the question deserves to be answered. Underneath the reflex, there is a real question reaching for something much bigger. The forces that shaped your life did not begin with you. Your parents were shaped by theirs, who were shaped by theirs, all the way back to patterns so old they feel less like history and more like gravity.\n\nAnd the thread does not stop at your family line, or your culture, or even your species. Every cell in your body is made of stardust, atoms forged in the cores of stars that exploded billions of years ago so that, eventually, impossibly, something could open its eyes and wonder where it came from.\n\nThe longing you carry for belonging, for meaning, for connection to something larger than your individual life — that longing is the original operating system remembering what it was designed for.",
    code: {
      title: "The Code",
      essence: "The faculty that built every cathedral and carried every pilgrimage is in you — and it can consecrate your own existence the moment you turn it there.",
      body: "The same network that builds the small personal self has another mode, one that turns toward the vast and dissolves the boundary between self and world. Dacher Keltner's research on awe shows that encountering something too large for the existing self-model to contain physically alters the brain: the self-boundary loosens, inflammatory markers decrease, the sense of connection expands. This is what meditation trains. This is what psychedelics trigger. This is what every religious tradition cultivated. The faculty that built every cathedral and carried every pilgrimage is in you, and it can consecrate your own existence the moment you turn it there."
    },
    lore: {
      essence: "The Law of Origin.",
      expandedContent: "The Kogi people of Colombia's Sierra Nevada de Santa Marta call it the Ley de Origen, the Law of Origin. In their understanding, the material world is a continuous expression of something that preceded it, and every living thing maintains itself in relation to the law that sustains it. The Kogi perform their ceremonies as maintenance of reality itself, tending the connection between the visible world and what holds it together, because when that connection breaks, everything suffers. Their message to the outside world, delivered rarely and with urgency, is always the same: you have forgotten the source. The roots are dying. Come back. The Vedics called the underlying order Rita. The Taoists called it the Tao. The Lakota say Mitakuye Oyasin — all my relations. The Haudenosaunee Confederacy holds every decision inside a span of seven generations past and seven generations forward, because anything smaller is a kind of amnesia. The names differ. The fire they sat around was the same."
    },
    outside: true,
    scenes: [
      {
        kind: "outside",
        body: "This is the chapter you take outside. Step away from the screen. Feel the ground under your feet. Look at the sky. Find the widest view available to you. Stand in it."
      },
      {
        kind: "prompt",
        title: "The Ancestry",
        body: "The pattern in this character's life did not begin with their birth. Their parents were responding to what their parents did to them, who were responding to what was done to them, all the way back through a chain of inherited reactions that nobody chose and everybody perpetuated. Trace the thread backward — past family, past culture, into the deep time of the species and the deeper time of the cosmos. What forces were in motion before this character arrived? What ancient pressures created the conditions they were born into?",
        key: "p4_begin",
        rows: 8,
        breathAfter: { label: "Breathe into the widest view. Let the longer exhale loosen the boundary between you and the vast.", cycles: 5 }
      },
      {
        kind: "prompt",
        title: "The Naming",
        body: "Every human being who has ever lived has had a god running in their operating system. The question is never whether. It is which one, and who installed it. A harsh parent becomes the internal god of judgment. A chaotic home becomes the god of anxiety. The market becomes the god of worth. These are gods whether you call them that — they are the forces you organize your behavior around. This chapter is where you choose. Is there a longing in you older than your biography? Something reaching toward something it cannot quite name?",
        key: "p4_longing",
        after: [
          { kind: "shame", text: `If shame whispers "who am I to name something this vast" — recognize the mask. You are as qualified as anyone who ever stood under the sky and felt the pull.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Temple",
        body: "The word sacred comes from sacer — set apart. If this body is the physical expression of the source you are about to name, if it is the instrument through which that force acts in the world, then it is also set apart. There are things you would not do to it. Things you would not put in it. Stand where you can feel the ground and the sky. Name your source out loud — to the sky, to the earth, in your own language, the name that comes from having actually felt it. Then write what would change tomorrow if you treated this body as its instrument.",
        prompt: { key: "p4_source", placeholder: "My source is…", rows: 4, big: true }
      }
    ]
  },
  {
    roman: "V",
    title: "The Narrator",
    subtitle: "Your entire reality is a story, and the one telling it is the one you mistook for yourself.",
    palette: {
      bg: "#09090b",
      ink: "#e0d8cc",
      accent: "#c89838",
      veil: "#161410",
      glow: "#e0b840",
      shadow: "#2c2010",
      dark: true
    },
    invocation: "Everything you have excavated across four chapters — the character, the tension, the gift, the source — you built as separate threads. They weren't. The voices from the Tension were this voice's scripts. The character from the Prologue was this voice's creation. The wall between you and the source was this voice's construction. The meaning the Gift shifted, this voice was holding it in place. One loom. One fabric.\n\nThere is a voice in your head that has never stopped talking. It replays what happened, rehearses what might, maintains the running account of who you are and what you are worth, so automatically you have probably never noticed you were listening. You mistook it for thinking. You mistook it for yourself.\n\nFrom this chapter forward, begin speaking in the present tense. You are no longer describing what happened. You are authoring what is.",
    code: {
      title: "The Code",
      essence: "The default mode network authors your consciousness — constructing the reality you live inside, and calling it fact.",
      body: "Neuroscience calls this the default mode network, the most energy-intensive system in your brain, running every moment you are not absorbed in something external. It uses more energy to be than to do. What it does is author your consciousness. It tells you what the past means. It builds futures so vivid your body floods with cortisol for events that have not happened. It generates the default character you become when depleted. It constructs the reality you live inside: the story shapes how you show up, how you show up shapes how people respond, how people respond confirms the story, and the loop tightens until the wall feels like a fact of nature. Marcus Raichle's research shows the brain does not receive reality — it predicts it, based on the story it has been running, and confirms the prediction. Normal is this system's masterpiece, the most powerful story ever told because it never announces itself as a story."
    },
    lore: {
      essence: "The loom.",
      expandedContent: "The Sufis called it the nafs — the self that speaks. They mapped seven stations: from the commanding nafs (the one that demands, defends, and constructs) to the pure nafs (the witness that sees without distortion). The great work of Sufi practice was not to destroy the narrator but to move it from commander to servant. The Vedic tradition named the same faculty ahamkara — the I-maker — the function that stitches sensory experience into a continuous self and announces the result as truth. The Buddhists observed citta-santana: the stream of consciousness, an unbroken river of mental formations flowing so continuously that you mistake the current for the riverbed. The Hindus called the total construction Maya. Plato placed humanity in a cave, chained so they could only see shadows projected on the wall, mistaking them for the world. Every wisdom tradition that looked carefully at the human mind found the same structure: a voice running beneath awareness, generating selfhood. The liberation was never destroying the loom — it was finally seeing that you were the one weaving."
    },
    scenes: [
      {
        kind: "broadcast",
        title: "The Broadcast",
        body: "Right now, as you read this, the voice is talking. It has been talking your entire life. Catch it in the act. Three to five minutes. Write down exactly what the voice is saying. Let the full broadcast come through: the judgments, the rehearsals, the catastrophes, the loops. Don't argue. Transcribe.",
        key: "p5_broadcast",
        minutes: 4,
        after: [
          { kind: "note", text: `Read it back as a script — written by someone, for a character. The voices from the Tension were this voice's scripts. The character from the Prologue was this voice's creation. The wall between you and the source was this voice's construction. One loom. One fabric. The Greeks called it the daimon — the spirit that accompanies each soul through life. A fallen guide. Ignorant rather than malevolent. Defaulting to itself in the absence of an author.` }
        ]
      },
      {
        kind: "prompt",
        title: "The System",
        body: `Where in your life does it feel like "that is just how it is"? Something permanent and immovable. The wall that feels like landscape is a narrative that has been running long enough to become invisible. Money is a narrative. The economy is a narrative. The career ladder is a narrative. Your limitations are narratives. Name the wall — and see the Narrator's fingerprints on it. The story creating the evidence, the loop building itself.`,
        key: "p5_wall",
        rows: 7
      },
      {
        kind: "movement",
        title: "The Break",
        body: "The narrative system runs in the mind. The body is outside its jurisdiction. Move the body before the mind can frame the movement, and the loop breaks. Stand up. Do something this character would never do. Move too freely, make a sound that surprises you, take up more space than the narrative allows. Thirty seconds. Let the body find what the narrator has been insisting isn't there.",
        seconds: 30,
        after: [
          { kind: "note", text: `The Narrator is not the enemy. Every line was forged from a real wound — a moment when the story kept you safe. And it is running code written for conditions that no longer exist. The same machine that was running you IS the machine you use to author your life. You did not destroy the loom. You took the wheel.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Wheel",
        body: "The threshold: from a life organized by the inherited narrative system to one organized by a consciously authored one. The word default comes from de-fallere — to fall away, to be absent where a choice should have been. The opposite is ad-venire — to come toward, to arrive. Ad-ventura — the adventure. The adventure begins when you show up with a framework for meaning and stop falling into the inherited default. Author the system that will run your life from here.",
        prompt: { key: "p5_author", placeholder: "If the walls revealed themselves as doors, I would write…", rows: 8 }
      }
    ]
  },
  {
    roman: "VI",
    title: "The Dream",
    subtitle: "Remember the power to dream worlds into being.",
    palette: {
      bg: "#c8ede0",
      ink: "#0d2e24",
      accent: "#2aaa8a",
      veil: "#a4dcc8",
      glow: "#3ecaaa",
      shadow: "#0a4832",
      dark: false
    },
    invocation: "Nothing is more powerful than a dream. Reality itself is a collectively accepted dream we have agreed to call normal, and everything humanity has ever built or destroyed began as a vision in someone's mind that refused to stay contained there. Dreams sent us to the moon, raised cathedrals that took centuries to complete, toppled empires and birthed new ones from the rubble.\n\nDo you remember when you could imagine? Before anyone taught you to be realistic, before the word practical entered your vocabulary like a closing door, there was a time when you could walk into a field and build a civilization in the grass, be somewhere else so completely your body responded as though it was real. That was the dreaming power, the most natural thing about you. The Narrator put it on a leash and used it to worry, to catastrophize, to build worst-case futures with breathtaking clarity. Every hour of anxiety you have ever felt was the dreaming power running in reverse. The worrier is already a masterful dreamer. The question is which direction the dreaming is pointed.\n\nAnd here is what every dreamer learns eventually: the dream that lasts is never about the dreamer. The dreams that changed the world were dreamed by people who saw something larger than their own comfort and couldn't look away. The dream growing in you right now grew from everything you went through — the wound, the gift, the source — and it carries the shape of all of it. It has other people in it. It was always going to.",
    code: {
      title: "The Code",
      essence: "The brain cannot distinguish a vividly imagined event from a real one. What you rehearse, the body builds the capacity for.",
      body: "The brain does not distinguish between a vividly imagined event and a real one. The motor cortex fires during mental rehearsal at nearly the intensity of physical practice. Studies show that people who only imagine doing strength training gain measurable strength. Heart rate rises for imagined threats. Cortisol spikes for imagined failures. Alia Crum's research showed hotel housekeepers who believed their daily work qualified as exercise showed measurable health improvements while a control group doing identical work showed none. The belief changed the biology. Viktor Frankl imagined the lecture he would give until his body organized itself around the survival that would let him give it. He survived. He gave the lecture. What you rehearse with conviction, the body builds toward."
    },
    lore: {
      essence: "The Dreamtime.",
      expandedContent: "The Aboriginal Australians did not place the Dreamtime in the past. Tjukurpa — the Dreaming — is not mythology. It is the dimension that underlies and continuously generates physical reality, accessible in every waking moment to those who have learned to move between the layers. The material world does not produce the dreaming, the dreaming produces the material world, continuously, the way a wave emerges from the ocean without separating from it. The Iroquois held dream councils: when a member of the community dreamed something significant, the community gathered to help the dreamer enact what the dream required, because the dream was not private communication. It was the soul's instruction, and the community's responsibility. The Sufi tradition speaks of the alam al-mithal — the imaginal world — a realm as real as the physical, accessible only through the creative imagination. Henry Corbin insisted the imaginal is ontologically real, requiring a different faculty of perception. Every civilization was built this way. Every lasting change in human life started as something someone saw with their eyes closed."
    },
    scenes: [
      {
        kind: "prompt",
        title: "The Inversion",
        body: "The Narrator chapter revealed that what you thought was solid was constructed from narrative. This chapter reveals the inverse: what you thought was fantasy is the raw material reality is built from. Your obstacles are stories. Your dreams are real. And the dream that keeps returning is the exact dream this particular combination of wounds and gifts and source would produce. What has been trying to come through this character across the whole arc?",
        key: "p6_quiet",
        rows: 4,
        after: [
          { kind: "note", text: `That power never left. The Narrator put it on a leash and used it for anxiety. Every hour of worry was the dreaming power running in reverse. You have been living inside someone else's dream.` }
        ]
      },
      {
        kind: "prompt",
        title: "The Vision",
        body: "Whose dream have you been living in? Every reality you have moved through was imagined into existence by someone. The career paths available to you are stories people agreed to call real. The rules about what is possible for someone like you were written by people who had reasons to write them that way. What has been dreaming through you underneath it all — the thing that keeps coming back no matter how many times the Narrator shuts it down? Say it aloud before you write it. Without editing for plausibility.\n\nAnd let it include the world. The dream that stays inside the dreamer becomes a fantasy. The dream that reaches toward other people, toward something that matters beyond the individual life, becomes a calling. You do not have to know how. You do not have to be strategic about it. Just let the dream be as large as it actually is.",
        key: "p6_whose",
        rows: 8,
        after: [
          { kind: "shame", text: `If shame says your dream is ridiculous — recognize the mask. "Be realistic" is shame's voice in this territory, defending someone else's dream against yours.` },
          { kind: "note", text: `The Lakota hanblecheyapi strips away comfort because your deepest nature can only be seen when everything else has been removed. The vision received was not a fantasy. It was an instruction.` }
        ]
      },
      {
        kind: "embody",
        title: "The Rehearsal",
        body: "The nervous system cannot tell the difference between a vividly imagined experience and a real one. Stand up. Take the physical posture of the character you are becoming. Walk as them. Breathe as them. Feel the morning they wake up to, the work they move toward, the way they carry themselves through the world. You become who you practice being.",
        seconds: 60
      },
      {
        kind: "threshold",
        label: "The Canvas",
        body: "Write the dream as vividly as you would write reality. The character you are becoming. The morning they wake up to. The work they do. The people whose lives are changed by what this character carries. Write it with enough specificity that someone reading it would know what this person does, who they do it for, and why they are the one doing it.",
        prompt: { key: "p6_vision", placeholder: "In the world I am dreaming…", rows: 14, big: true }
      }
    ]
  },
  {
    roman: "VII",
    title: "The Ending",
    subtitle: "A story told aloud to another nervous system becomes real in a way no thought can.",
    palette: {
      bg: "#f0e8d8",
      ink: "#3c3020",
      accent: "#a89868",
      veil: "#e0d4b8",
      glow: "#c8b880",
      shadow: "#6a5030",
      dark: false
    },
    invocation: "You are standing at the end of a chapter, maybe the longest one. The story that brought you here succeeded. It did its job. It carried you through everything it needed to, and now it is finished. You can feel the completeness even if part of you wants to stay in the familiar pattern because at least it is known.\n\nThe stuckness you have been feeling is the ache of something finished that has not been given permission to end. A story that never properly ends becomes a loop, a pattern repeating itself until someone has the courage to write its last page and mean it.\n\nThat someone is you. That moment is now.",
    code: {
      title: "The Code",
      essence: "The witness makes it irreversible — a story spoken aloud to another nervous system becomes real in a way no thought can.",
      body: "When you speak your story to another person, their brain mirrors yours, the same regions activate in the same sequence. Uri Hasson's research showed that during vivid storytelling, the listener's brain actually anticipates the speaker's neural patterns, running ahead of the narrative. Two nervous systems lock into a shared construction. The story becomes real between them in a way it never was inside a single mind. Inside your own mind, the narrator can revise endlessly. The moment the story enters another nervous system and that system receives it, the revision stops. The witness holds you to it. Their nervous system carries the impression. The more witnesses you gather, the more structurally irreversible the new story becomes. James Pennebaker's expressive writing research, the most replicated finding in health psychology, shows that organizing experience into coherent narrative produces measurable improvements in immune function and wellbeing."
    },
    lore: {
      essence: "The thin place.",
      expandedContent: "The Celts called them caol áit — thin places — locations and moments where the membrane between worlds grows permeable. Not metaphorical worlds: actual dimensions of reality that ordinarily remain opaque. A genuine ending is a thin place. The old form has completed its function; the new has not yet taken shape. The Aztec and Maya understood time as cyclical — each age consuming itself so that the next could emerge, every ending a composting of the ground for the next creation. The Greeks called it apokalypsis — uncovering, the removal of the veil. The Norse called it Ragnarok, the necessary fire from which a new world rises. The Buddhists call the gap state bardo: the intermediate dimension between one form of being and the next, traditionally understood as one of the most fertile spiritual territories available to a human being. For three hundred thousand years, human beings have been gathering around fires to speak their stories aloud. Every healing tradition on earth has involved speaking in the presence of a witness: confession, testimony, the talking cure, the campfire, the ceremony. You cannot think your way into a new identity. You can only speak your way there, in the presence of people who receive what you are saying and hold you to it. This is the oldest technology on earth."
    },
    scenes: [
      {
        kind: "prompt",
        title: "The Release",
        body: "What are you ready to stop telling? The patterns you refuse to carry into the next chapter. The beliefs you have outgrown. The identities you kept wearing because they were familiar. The narratives about what is possible for you that were written by someone else in conditions that no longer exist. The agreements you made with a version of reality that no longer applies. A story that ends properly does not disappear. It composts. It becomes the soil of the next story.",
        key: "p7_refuse",
        rows: 6,
        after: [
          { kind: "note", text: `Feel the weight of them. Notice what it would feel like to set them down.` }
        ]
      },
      {
        kind: "gathering",
        title: "The Gathering",
        body: "Pull from everything you have written across the seven chapters. The character from the Prologue. The tension they survived. The gift that tension forged. The source they belong to. The narrator they named and took the wheel from. The dream they authored. Bring it all together into one arc — the complete origin story of the author who is now standing here.",
        lines: [
          { label: "Everything I was up to now was the prologue.", key: null, fixed: true },
          { label: "The tension I carried was…", key: "p7_g_conditioned" },
          { label: "The gift it gave me was…", key: "p7_g_gave" },
          { label: "My source is…", key: "p7_g_source" },
          { label: "The Narrator has been telling me…", key: "p7_g_narrator" },
          { label: "The dream underneath is…", key: "p7_g_dream" },
          { label: "What I am ending today is…", key: "p7_g_ending" }
        ],
        after: [
          { kind: "note", text: `The Aztec and Maya understood time as cyclical — each destruction composting the ground for the next creation. The Buddhists speak of bardo — the gap where the old form has dissolved and the new has not taken shape. The Celts knew thin places. Every genuine ending is a thin place. You are in one now.` },
          { kind: "shame", text: `If shame shows up as the fear of taking yourself seriously enough to ritualize this — recognize the final mask. This is the last threshold. Shame knows it.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Ceremony",
        body: "The film that started in the Prologue is yours to write the ending to. How epic is your ending? The more ritualistic this moment, the more intentional, the more ceremonial, the more real it becomes. Think about where you will go — a mountain, a forest, a body of water, somewhere that has been standing longer than your problems. Think about who you will gather. Think about what you will do with your hands: write the old story on paper and burn it, bury something, release something. Make the ending worthy of the journey. Then write what you will say.",
        prompt: { key: "p7_ending", placeholder: "I am ending…", rows: 10 }
      },
      {
        kind: "finale",
        title: "The Telling",
        body: "Read it aloud. Every word. Mean it. Speak it to your witness. Slowly enough to feel each sentence land in the body. Sit in the silence that follows. That silence is the gap between stories. Everything that comes next is waiting in it.\n\nThis practice does not end here. What you learned to do across these seven chapters — to see the story, hold it from the outside, find the tension, locate the gift, trace the source, name the narrator, and author what comes next — this is yours for life. Any pattern, any habit, any relationship, any fear. Catch the story. Author the next chapter.\n\nAuthor reality. The end. Which is to say, the beginning."
      }
    ]
  }
];

export default CHAPTERS;
