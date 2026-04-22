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

export interface Chapter {
  roman: string;
  title: string;
  subtitle: string;
  palette: Palette;
  invocation: string;
  code: { title: string; body: string };
  outside?: boolean;
  scenes: Scene[];
}

const CHAPTERS: Chapter[] = [
  {
    roman: "I",
    title: "The Prologue",
    subtitle: "Remember who you were before the world rewrote you.",
    palette: {
      bg: "#ece1c3",
      ink: "#4a3a24",
      accent: "#c89838",
      veil: "#e3d6b2",
      glow: "#4ff0d6",
      shadow: "#8a5a24",
      dark: false
    },
    invocation: "Your whole life — the entire arc, even your wildest success — is the prologue to what comes next. We are going to reconnect with who you were before the world started shaping you, and watch the whole arc unfold as one story going somewhere all along.",
    code: {
      title: "The Code",
      body: "Story and reality share the same circuitry. Your brain constructs reality rather than receiving it. The same neural circuits fire for a lived experience as for a vividly told one. Every time you revisit your life and hold it in a different story, the emotional architecture rewrites permanently."
    },
    scenes: [
      {
        kind: "arrive",
        title: "Arrive",
        body: "Close your eyes. Breathe in through the nose, out through the mouth, the exhale longer than the inhale. Watch the thoughts pass without following them. That awareness behind the thinking is where we are working from.",
        breath: { pattern: "4-7", label: "Four in, seven out", cycles: 3 }
      },
      {
        kind: "prompt",
        title: "The Seed",
        body: "Go back. Before the world shaped you, before anyone approved or disapproved. Who were you? What fascinated you? What pulled you forward before you had words for why?",
        key: "p1_seed",
        after: [
          { kind: "note", text: `Whatever you just touched, that is the seed. The Dagara gather before a child is born to learn what the incoming soul is bringing. James Hillman called it the acorn theory: every life organized around something present from the beginning. The acorn does not decide to become an oak.` },
          { kind: "shame", text: `If shame whispers that the fascination you just named is small — recognize the first mask. The seed was never small.` }
        ]
      },
      {
        kind: "prompt",
        title: "Trace The Thread",
        body: "That fascination — has it been showing up your whole life? Different costumes, same energy underneath? Trace the thread.",
        key: "p1_thread"
      },
      {
        kind: "prompt",
        title: "The Third Person",
        body: `When you say "I am stuck," that is an identity, and examining it triggers shame. When you say "there was a person who got stuck in a pattern that made complete sense given everything they had been through," that is a character with an author. Begin with "There was a person who…" and tell their story. Past tense. Let it be the epic it actually was.`,
        key: "p1_thirdperson",
        rows: 10,
        after: [
          { kind: "note", text: `Notice what loosened when you stepped outside. Something that was clenched when it was "I" just released. Let that space stay open.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "Hold the whole arc as one story, told in the third person, as the opening chapter of something much larger. The person you just described has been living an epic, especially the chapters they thought were failures. Becoming is remembering. Tell the prologue — from the seed to this moment — as one arc.",
        prompt: { key: "p1_prologue", placeholder: "The prologue begins…", rows: 12 }
      }
    ]
  },
  {
    roman: "II",
    title: "The Wound",
    subtitle: "Discover that what broke you is exactly what built you.",
    palette: {
      bg: "#3a1020",
      ink: "#f0d4c4",
      accent: "#d47060",
      veil: "#5c2030",
      glow: "#e07060",
      shadow: "#a03040",
      dark: true
    },
    invocation: "Every character carries a wound. The wound drives the quest, qualifies the hero, connects them to everyone carrying the same mark. You are about to look directly at the wound the character you just described has been carrying. The wound does not appreciate being examined. The closer you look, the louder the alarms. Those alarms are the treasure.",
    code: {
      title: "The Code",
      body: "The loop runs from story, and story lives in the body. Thought → action → behavior → habit → character → identity → life story → next thought. Thoughts are downstream. They regenerate from the story, and the story lives in the tissue. You have to work at the source."
    },
    scenes: [
      {
        kind: "prompt",
        title: "The Body Already Knows",
        body: "Before any thinking — feel into your body right now. What is already there? Tension, bracing, a low hum you have been carrying so long you stopped noticing. Where is it?",
        key: "p2_body"
      },
      {
        kind: "prompt",
        title: "The Conditions",
        body: "What conditions were you born into? Family, economics, emotional weather, cultural expectations — before you had any say?",
        key: "p2_conditions",
        rows: 6,
        breathAfter: { label: "Four in, seven out — give the body its ninety seconds.", cycles: 4 }
      },
      {
        kind: "voices",
        title: "The Voices",
        body: `What did those conditions teach you about what was allowed and what was punished? What did you become to survive? Write the voices — the exact words. "You are not enough." "Be realistic." Even the ones that make you flinch.`,
        key: "p2_voices",
        after: [
          { kind: "note", text: `Where do those voices live in your body? They have a physical address. The Aboriginal Australians speak of Songlines — invisible pathways sung into existence. Your circumstances are your songline. The detours were the route.` }
        ]
      },
      {
        kind: "prompt",
        title: "A Story You Are Stuck In",
        body: `Name a story you are stuck in right now. "I cannot afford to." "It is too late." Is this a fact or a story? When was it installed? Whose voice was it? What shifts when you hold it as something done to you rather than something true about you?`,
        key: "p2_stuck_story",
        rows: 6,
        after: [
          { kind: "note", text: `Stay with the space that opens. The body without the program. What is there when this loop pauses?` }
        ]
      },
      {
        kind: "prompt",
        title: "The Real Story",
        body: "Now tell the real story of how this person got here. The unedited version. Past tense. Speak aloud if you can. We are going through, not back.",
        key: "p2_performance",
        rows: 8,
        breathAfter: { label: "Close your eyes. Feel what the telling moved. Let the body shake if it wants to.", cycles: 3 }
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "Look at this character. They were a child carrying wounds they did not choose, shaped by forces beyond their control, and none of it was their fault. Can you feel compassion for them? Can you hold them the way they deserved to be held and never were? Somewhere in the world right now, someone is carrying the same wound. Your intimate knowledge of this territory is going to become extraordinarily valuable.",
        prompt: { key: "p2_compassion", placeholder: "What do you feel for this person? Let it come.", rows: 6 }
      }
    ]
  },
  {
    roman: "III",
    title: "The Gift",
    subtitle: "Hold your life as a gift and watch what it becomes.",
    palette: {
      bg: "#102a14",
      ink: "#c8e0c4",
      accent: "#60b868",
      veil: "#1a4024",
      glow: "#40d878",
      shadow: "#186030",
      dark: true
    },
    invocation: "Life is a gift. You are the gift. If that sounds like a greeting card, let it land before you dismiss it: if your life is a gift, then everything in it was given — the beauty and the breaking, the losses and the lucky accidents. Gratitude is the master alchemist. It does not change what happened. It changes what it means.",
    code: {
      title: "The Code",
      body: "Memory rewrites permanently when the meaning changes. Every time you revisit a memory while holding a different meaning, the brain rewrites the emotional trace permanently. This is memory reconsolidation. The memories do not change. What they mean changes. And what they mean is what drives everything downstream."
    },
    scenes: [
      {
        kind: "prompt",
        title: "Abundance & Genius",
        body: "What are you abundant in — capacities, sensitivities, ways of seeing that feel given rather than earned? And what is the thing you cannot stop doing, the thing that eats hours? That is your genius. Name both.",
        key: "p3_abundance",
        rows: 6
      },
      {
        kind: "gratitude",
        title: "Place One Hand On Your Heart",
        body: "Feel gratitude as a physical sensation. For yourself, for surviving all of it. If someone shaped you through pain, thank them silently — for what it made you. Hold these in silence:",
        items: ["What have I received?", "What have I given?", "What trouble have I caused?"],
        keys: ["p3_received", "p3_given", "p3_caused"]
      },
      {
        kind: "prompt",
        title: "The Alchemy",
        body: "Now the turn. Hold your gifts alongside the wound. The same events. The same story. A different question: what did it give you? Look at the worst of it. What capacity do you carry that you could only have received by going through exactly what you went through?",
        key: "p3_alchemy",
        rows: 8,
        after: [
          { kind: "note", text: `Kintsugi repairs broken pottery with gold so the break becomes the most beautiful part of the vessel. Rumi: the wound is the place where the light enters. Permaculture: the problem is the solution.` },
          { kind: "shame", text: `If something tightened, stay with it. Four in, seven out. That resistance is shame insisting the pain was meaningless. You are rewriting it right now.` }
        ]
      },
      {
        kind: "declaration",
        title: "I Am",
        body: `The wound said "I am not enough." Let new declarations rise from the gift. The purpose of life is to find your gift. The meaning of life is to give it away.`,
        keys: ["p3_iam1", "p3_iam2", "p3_iam3"]
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "Feel the meaning shift in the body. The same wounds held as gifts produce a different felt sense. Everything — the worst included — composting into something alive. If nothing was wasted, if the gift is real and it is yours, what would you do with it?",
        prompt: { key: "p3_center", placeholder: "They would…", rows: 8 }
      }
    ]
  },
  {
    roman: "IV",
    title: "The Source",
    subtitle: "Discover that the force that shaped your story shaped everything.",
    palette: {
      bg: "#0a1838",
      ink: "#c4dcf8",
      accent: "#5090e0",
      veil: "#122040",
      glow: "#70b0f8",
      shadow: "#204080",
      dark: true
    },
    invocation: "The forces that shaped you did not begin with your birth. Their parents were shaped by theirs, all the way back, until you reach something that precedes all the wounds. Something underneath everything.",
    code: {
      title: "The Code",
      body: "The brain was built to find the source. The human brain has not changed in three hundred thousand years — only the stories have. When the meaning-maker is pointed past the personal and into the infinite, it produces the experience traditions across all of human history have called sacred. Whatever you call what it finds is yours to name."
    },
    outside: true,
    scenes: [
      {
        kind: "outside",
        body: "This is the chapter you take outside. Step away from the screen. Feel the ground under your feet. Look at the sky. Find the widest view available to you. Stand in it."
      },
      {
        kind: "prompt",
        title: "Trace It Back",
        body: "Where did your wounds begin? Trace it back through your parents, through history. What was in motion before you arrived? Then past family, past culture — every cell in your body is made of stardust, atoms forged in stars that exploded billions of years ago so that, eventually, something could open its eyes and wonder where it came from. Follow it.",
        key: "p4_begin",
        rows: 8,
        breathAfter: { label: "Breathe into the widest view. Let the longer exhale loosen the boundary between you and the vast.", cycles: 5 }
      },
      {
        kind: "prompt",
        title: "The Longing",
        body: "For three hundred thousand years, humans organized around this pull. The Kogi believe everything emerged from a prior order. The Haudenosaunee hold their decisions between seven generations back and seven generations forward. Is there a longing in you that feels older than your biography?",
        key: "p4_longing",
        after: [
          { kind: "shame", text: `If shame whispers "who am I to name something this vast" — recognize the mask. You are as qualified as anyone who ever stood under the sky and felt the pull.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "Stand where you can feel the ground and the sky. Feel the thread running from the seed through the wound through the gift through deep time. Name it. Out loud. To the sky, to the earth. What is your source? The origin underneath all the origins? Feel it moving through you. Ancient and alive. This is what you come back to.",
        prompt: { key: "p4_source", placeholder: "My source is…", rows: 4, big: true }
      }
    ]
  },
  {
    roman: "V",
    title: "The Narrator",
    subtitle: "Meet the voice that constructed your entire reality.",
    palette: {
      bg: "#09090b",
      ink: "#e0d8cc",
      accent: "#c89838",
      veil: "#161410",
      glow: "#e0b840",
      shadow: "#2c2010",
      dark: true
    },
    invocation: "Everything you excavated — the seed, the wound, the gift, the source — you built as separate threads. You are about to discover they were one fabric, woven by one loom. There is a voice in your head that has never stopped talking. You mistook it for thinking. You mistook it for you.",
    code: {
      title: "The Code",
      body: "The Narrator authors your consciousness on autopilot. Neuroscience calls it the default mode network — the most energy-intensive system in the brain. It decides what your memories mean, builds futures so vivid your body floods with cortisol for events that have not happened, and constructs the reality you inhabit. Normal is the Narrator's masterpiece — the most powerful story ever told, because it does not announce itself as a story."
    },
    scenes: [
      {
        kind: "broadcast",
        title: "The Broadcast",
        body: "Catch the voice. What is it saying right now? Three to five minutes. Let the broadcast pour out. Do not edit. Just transcribe.",
        key: "p5_broadcast",
        minutes: 4,
        after: [
          { kind: "note", text: `Read it back as a script — written by someone, for a character. The voices from the Wound were this voice's scripts. The character from the Prologue was this voice's creation. The wall between you and the source was this voice's construction. One loom. One fabric.` }
        ]
      },
      {
        kind: "prompt",
        title: "The Wall",
        body: `Where in your life does it feel like "that is just how it is"? Something permanent and immovable. Name it. Is it the same place the wound lives? Can you see the Narrator's fingerprints on it — the story creating the reality, the belief creating the evidence, the loop building itself until it became invisible?`,
        key: "p5_wall",
        rows: 7
      },
      {
        kind: "movement",
        title: "Outside Its Jurisdiction",
        body: "Do something this character would never do. Stand up. Shake. Move as someone who does not have this limitation. Thirty seconds. The body is outside the Narrator's jurisdiction.",
        seconds: 30,
        after: [
          { kind: "note", text: `The Narrator is not the enemy. Every line was forged from a real wound — a moment when the story kept you safe. And it is running code written for conditions that no longer exist. The same machine that was running you IS the machine you use to author your life. You did not destroy the loom. You took the wheel.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "The power to construct reality is yours. What you believed were obstacles are stories — feel them shift from solid to rewritable. The past means what you decide. The future is the one you build. The word default comes from de-fallere — to fall away, to be absent where a choice should have been. The opposite is ad-venire — to come toward, to arrive. Ad-ventura — the adventure.",
        prompt: { key: "p5_author", placeholder: "If the walls revealed themselves as doors, I would write…", rows: 8 }
      }
    ]
  },
  {
    roman: "VI",
    title: "The Dream",
    subtitle: "Remember when you could build worlds.",
    palette: {
      bg: "#d6eef8",
      ink: "#0c2838",
      accent: "#2898c0",
      veil: "#b0d8f0",
      glow: "#50c8f0",
      shadow: "#0a4060",
      dark: false
    },
    invocation: "Do you remember when you could imagine? Before anyone taught you to be practical, there was a time when you could walk into a field and build a civilization in the grass. That was the dreaming power. The most natural thing about you.",
    code: {
      title: "The Code",
      body: "Imagination and reality run on the same hardware. The brain builds future simulations from the same materials it uses to store memories. Where you are going is what makes the past make sense. Viktor Frankl held one thing they could not take from him in Auschwitz: the capacity to imagine a future vividly enough to generate the conditions for his survival. Worry is imagination pointed at the wrong future. Dreams are the instructions for building reality."
    },
    scenes: [
      {
        kind: "prompt",
        title: "Where Does It Live?",
        body: "Close your eyes. Remember the sensation. The ease. The aliveness. Where does that power live in your body?",
        key: "p6_quiet",
        rows: 4,
        after: [
          { kind: "note", text: `That power never left. The Narrator put it on a leash and used it to worry — to build worst-case futures with breathtaking clarity. Every hour of anxiety was the dreaming power running in reverse. And you have been living inside someone else's dream.` }
        ]
      },
      {
        kind: "prompt",
        title: "Whose Dream?",
        body: "Whose dream have you been living in? And what has been dreaming through you underneath it — the thing that keeps coming back no matter how many times the Narrator shuts it down? Say it out loud. Without editing for plausibility.",
        key: "p6_whose",
        rows: 8,
        after: [
          { kind: "shame", text: `If shame says your dream is ridiculous — recognize the mask. "Be realistic" is shame's voice in this territory, defending someone else's dream against yours.` },
          { kind: "note", text: `The Iroquois understood dreams as the language of the soul. The Aboriginals placed the Dreamtime beneath all physical reality — the generative source from which the material world continuously emerges.` }
        ]
      },
      {
        kind: "embody",
        title: "Practice Being The Person",
        body: "Close your eyes. Enter the world. Feel the morning, the air, the light, the people. Stand up and walk like them. Breathe like them. The inner child who built worlds before breakfast — that power never left. Embody the new character so vividly your nervous system learns it.",
        seconds: 60
      },
      {
        kind: "threshold",
        label: "The Threshold",
        body: "Describe the dream as vividly as reality. Paint the world with enough conviction that someone reading it would believe it already exists.",
        prompt: { key: "p6_vision", placeholder: "In the world I am dreaming…", rows: 14, big: true }
      }
    ]
  },
  {
    roman: "VII",
    title: "The Ending",
    subtitle: "Close the book and become the author.",
    palette: {
      bg: "#f0e8d8",
      ink: "#3c3020",
      accent: "#a89868",
      veil: "#e0d4b8",
      glow: "#c8b880",
      shadow: "#6a5030",
      dark: false
    },
    invocation: "The story that brought you here succeeded. It is finished. The stuckness you feel is the ache of something complete that has not been given permission to end. A story that never properly ends becomes a loop.",
    code: {
      title: "The Code",
      body: "Story becomes real through the circuit between teller and witness. When you tell your story to another person, their nervous system mirrors yours, treats it as real, reflects it back. The telling completes the circuit. The witness makes it real. This is how civilizations formed around campfires, how every lasting shift in consciousness began."
    },
    scenes: [
      {
        kind: "prompt",
        title: "What You Are Setting Down",
        body: "What stories are you ready to stop telling? What beliefs have you outgrown? What identities have you been wearing because they were familiar? What are you setting down?",
        key: "p7_refuse",
        rows: 6,
        after: [
          { kind: "note", text: `Feel the weight of them. Notice what it would feel like to set them down.` }
        ]
      },
      {
        kind: "gathering",
        title: "The Gathering",
        body: "Pull from everything. Let the ending gather it all:",
        lines: [
          { label: "Everything I was up to now was the prologue.", key: null, fixed: true },
          { label: "The wound I carried was…", key: "p7_g_conditioned" },
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
        label: "The Threshold",
        body: "Take your ending somewhere that matters. A trail, a mountaintop, a quiet grove where the trees have been standing longer than your problems. Stand up. Speak it aloud. With a witness if you can. Record it. The telling makes it real. Sit in the silence that follows. That silence is the gap between stories.",
        prompt: { key: "p7_ending", placeholder: "I am ending…", rows: 10 }
      },
      {
        kind: "finale",
        title: "The End",
        body: "Say the words. Mean them. The end.\n\nAuthor reality. The new self is the old self taken seriously. The seed from the Prologue, the child who built worlds before breakfast, the one who was there before the wound, before the Narrator, before shame taught you to shrink. That one. Standing at the threshold of authorship, finally.\n\nFind one person and tell them your story. The real version. Then ask about theirs. That exchange is the oldest technology on earth."
      }
    ]
  }
];

export default CHAPTERS;
