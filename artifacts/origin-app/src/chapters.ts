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
    title: "The Story",
    subtitle: "See the story you have been living inside.",
    palette: { bg: "#ece1c3", ink: "#4a3a24", accent: "#c89838", veil: "#e3d6b2", glow: "#4ff0d6", shadow: "#8a5a24", dark: false },
    invocation: "Your brain is making you up as it goes along, and it has never once asked your permission. It is writing the next moment of your life before it arrives, performing it so convincingly you experience the performance as reality, and it has been doing this since before you had words to think with. The self you take yourself to be, the feelings you call yours, the world you think you are looking at, all authored in real time by a machine loaded with a script you did not write. The wild part, the part that makes this whole guide work: the machine will run whatever script you give it with the same conviction, the same chemistry, the same reality-producing power. You can change the script.\n\nThis chapter is where you step outside the movie of your life and see it as a movie. You are going to watch the whole arc from the audience seat, find the thread that has been running through it the whole time, and tell the story of how this character arrived at this doorway. You have been seeking something your whole life, a pull toward meaning that showed up at two in the morning no matter how good the day had been, and that seeking is the authoring machine reaching for a better story, running on dopamine, the chemistry of \"what happens next.\" The seeking is the engine. This is where you point it at your own life and start.\n\nTell this in past tense, third person, spoken aloud when you can. When emotions come up, stay with them. A raw emotion actually felt moves through in about ninety seconds. Longer than that, and a story is holding it in place.",
    transition: "The character is on the page. The arc is visible. The thread is showing itself. And the seeking that has been pulling this character forward through chapter after chapter is about to lead somewhere you have been avoiding, because everything the story needs next is waiting in the territory you have been calling your problem.",
    scenes: [
      {
        kind: "arrive",
        title: "The Theater",
        subtitle: "Embodiment · Step outside the frame",
        body: "You know what it feels like to watch a great film, to see someone's whole life unfolding on screen and feel the tenderness of knowing where it is heading before they do. That tenderness comes naturally from outside, because from the audience seat the setbacks serve the character, the wounds are shaping someone, and the whole thing has the quality of going somewhere even when it felt aimless to the person living it.\n\nClose your eyes. Let the film of your life play from the beginning, watching from outside the way you would watch a character you care about. Let it run from the earliest thing you remember to the present moment. Stay with whatever feelings arrive.",
        breath: { pattern: "4-7", label: "Four in, seven out", cycles: 3 },
        code: {
          title: "Step into the observer and the narrator idles.",
          body: "Your brain has a system that generates the feeling of being you, moment to moment, and it never shuts off. But Judson Brewer found that when people step into the observer position, this system goes quiet, the fixed self loosens, and a wider awareness opens behind it. Robin Carhart-Harris found the same thing under psilocybin. Andrew Newberg found it in contemplatives across traditions. The observer is a real neurological state, and from inside it you can hold your whole life with a kind of gentleness the panic of living it would never allow."
        },
        middle: "Let the whole film play without reaching for the remote. Watch the character's childhood, their relationships, their work, the losses, the turns that didn't make sense at the time. See it all from a distance, the way you'd watch a movie about someone whose life fascinated you.",
        lore: {
          title: "The witness",
          body: "The Buddhists call it vipassana, clear seeing, and the practice is so simple it sounds like a joke: observe. Watch the breath, watch the sensation, watch the mind thinking without following the thought. Thousands of hours of patient watching teach you the thing that changes everything, that the one who watches is not the one who thinks. That still point behind the turbulence can be inhabited, and once you are standing there, everything that was overwhelming becomes workable, the way a river looks different from the bank than it did when you were drowning in it. The Sufis found the same place through muraqaba. The Vedantic tradition named it turiya. Different names for the same room."
        },
        closing: "What is the shape of this character's life from the audience? What patterns emerge from the distance?"
      },
      {
        kind: "prompt",
        title: "The Role",
        subtitle: "Character · The character you have been playing",
        body: "You were born completely open and the world got to work on you immediately, teaching you which version of yourself kept you safe, which expressions got love, which parts of you had better disappear. You have been performing that version ever since, so long the mask fused to the face. And here is the thing that makes the whole guide work: if the self is a character, the character can change. The person on the other side of this journey is you, just closer to what was always true about you before the world started editing.",
        code: {
          title: "Move the identity and the behavior follows on its own.",
          body: "Identity is upstream of behavior, which is why willpower alone never holds. As long as the character stays the same, the behavior loops back to the same wall. James Clear spent years documenting this and arrived at the same place the contemplatives reached from the opposite direction: identity-based change holds, behavior-based change reverts. The character is the lever."
        },
        middle: "Write this character the way a novelist would — who they have been performing, how they carry themselves, what the performance is hiding.\n\nWhere did they learn the role? What were the conditions? And who is the one underneath?",
        lore: {
          title: "The persona",
          body: "The Greeks gave us persona, from the masks their actors wore where the whole point of the form was that the actor and the role were visibly different things. The Sanskrit jiva names the individual soul caught in the play of identification, while the deeper tradition points at atman, the witness behind the performance, and Krishna teaches Arjuna that liberation comes when you recognize yourself as the witness rather than the role. The Buddhist anatta, the self empty of fixed essence, which is the most hopeful thing anyone has ever said about identity, because it means you can rewrite it."
        },
        closing: "Who is the character you have been playing?",
        key: "p1_seed"
      },
      {
        kind: "prompt",
        title: "The Journey",
        subtitle: "Meaning · The thread of your becoming",
        body: "When you look at your whole life as one continuous story from outside, the patterns that were invisible while you were living them start to show themselves. The detours become the route. The things that went wrong start to look like they were steering you somewhere with a precision that looks less like chance and more like design from this altitude. Something has been there from the beginning underneath all the adaptations, a pull, a way of seeing, questions you kept asking before anyone told you what the right questions were. That pull has been wearing different costumes across every chapter, and it was there even in the chapters where you thought you had lost it, and seeing the thread that connects the things that did not seem to go together, the story coheres the way a novel coheres when you reach the chapter that explains the earlier ones.",
        code: {
          title: "Recall the memory inside a new meaning and the memory itself changes.",
          body: "Here is a magic trick your brain does that the scientific community did not believe was real until Karim Nader proved it. When you recall a memory, it becomes briefly malleable, and whatever meaning you hold during the recall gets woven back into the trace when it re-consolidates. You are not passively remembering right now. You are actively rebuilding, and the deeper you go the more the rewriting takes, because the brain integrates meaning proportionally to the honesty of the reflection."
        },
        middle: "Trace the thread that connects the chapters of this life into one continuous arc.\n\nPick one chapter that felt like a disaster at the time and hold it in the question: where was this taking them?",
        lore: {
          title: "The monomyth",
          body: "Joseph Campbell spent a lifetime tracing it. A character receives a call, crosses a threshold into territory that takes them apart, gets reassembled by what they find there, and returns carrying something the community needs. The Sumerian Inanna descended through seven gates, stripped of everything until she hung in the underworld and was reborn. The Lakota hanblecheyapi sent the seeker to a hilltop alone until the vision came. The shape keeps showing up because it maps to something real in how transformation actually works."
        },
        closing: "What has been the recurring force across this character's story?",
        key: "p1_arc",
        rows: 6
      },
      {
        kind: "threshold",
        label: "The Storyteller",
        subtitle: "Author · Tell the story you have been living",
        body: "If you were telling someone the real story of how you got here, not the version you tell at dinner parties, the real one, with the dark chapters and the weird coincidences and the moments that only make sense in retrospect, what would it sound like?\n\nOnce upon a time, there was a person who came into this world carrying something they did not yet understand. They moved through chapters shaped by forces beyond their control. They adapted brilliantly. They were marked. And somehow they ended up here, at this doorway.",
        code: {
          title: "Tell the story to another nervous system and both brains rewrite together.",
          body: "Your brain treats a vividly told story and a lived experience as the same thing, which is why your palms sweat during thrillers and your chest aches during love stories. Uri Hasson's imaging work confirmed something the grandmothers always knew: when you tell your story to someone, their brain mirrors yours, and in moments of deep understanding their brain runs ahead of yours, predicting what comes next before you say it. Two nervous systems locking into a shared construction that rewires both."
        },
        middle: "Tell the origin story of how this character arrived at this doorway, in past tense, third person, with love.\n\nWhat did they come into this world carrying? Who shaped them? What kept pulling them forward? How did they end up here?",
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
    subtitle: "Take on the challenges that make the story interesting.",
    palette: { bg: "#3a1020", ink: "#f0d4c4", accent: "#d47060", veil: "#5c2030", glow: "#e07060", shadow: "#a03040", dark: true },
    invocation: "You have been carrying something heavy for a long time, and you have gotten so used to the weight of it that you forgot it was there. The patterns that keep cycling through your relationships, the anxiety that shows up in the same places at the same hours, the voice in your head that tells you you are not enough, the ways you go small when the moment asks you to go big. These are the tensions of your story, and they feel so real in your body that you have probably never questioned whether they are part of the landscape or part of the production.\n\nThey are part of the production. The brain manufactures chemistry to make its stories feel absolutely real in the tissue, the way a film uses special effects to make you forget you are watching a screen. Cortisol turns a predicted threat into actual terror in your chest and your gut and your jaw, so the anxiety is indistinguishable from the situation itself, because at the level of the body there is no difference between a real danger and a story about danger. Dopamine rewards the brain for confirming its predictions, which is why the same painful patterns keep cycling, because each time the pattern fires and produces the expected result, the brain pays itself a little hit of confirmation. Familiar suffering is neurochemically rewarding. That is why it is so hard to stop. The brain has been paying you to stay inside the loop.\n\nHere is the reframe that changes everything about how you carry what you have been carrying: the problems in your life are narrative complications. They are what make the story interesting. Without them there is no character development, no arc, no reason anyone would want to hear your story at all. The harder the chapter, the more compelling the character who walks out the other side, and you have been through some chapters.\n\nThis is the practice of riding toward the difficult thing instead of away from it, and it is a practice, something you get better at, a muscle you build, because the tensions do not stop coming. New ones show up. The skill is learning to own them as yours, to stop placing the problem outside yourself where the victim has no pen, and to meet each one with the courage to say: this is my story, I am holding the pen, and I am going to find out what this tension is carrying. Because every tension in a great story is carrying a gift, and you will not find out what it is until you ride toward it.",
    transition: "The tension has a witness now. What did it build?",
    scenes: [
      {
        kind: "prompt",
        title: "The Score",
        subtitle: "Embodiment · The story is in the tissue",
        body: "Check in with your jaw right now. Is it clenched? The shoulders, are they up around your ears? The belly, is it tight, and has it been tight so long you forgot it could be soft?\n\nThe story lives in your body. It lives in the places that brace when certain topics come up, in the depth of your breath, in the posture you carry without choosing it. The character you have been playing has a physical shape and that shape has been reinforcing itself for years, breath by breath, until the body and the story became the same thing and neither one can change without the other.\n\nAnd here is why this matters so much: the body is not just storing old tension like files in a drawer. The body is actively feeding signals to the brain that shape what the brain authors next.",
        code: {
          title: "Change the body signal and you change what the brain authors next.",
          body: "The body is the input device for the authoring machine. The tight jaw is the body's vote in the brain's ongoing prediction about whether the world is dangerous right now. When you breathe into the tension and the tension softens, the body sends new data, and the brain updates its prediction because the input changed. This is why bodywork and somatic practices produce psychological shifts that talk therapy alone sometimes cannot reach, because they are working at the level of the input, below where language lives."
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
        title: "The Adaptation",
        subtitle: "Character · The courage to own your story",
        body: "You showed up on this planet and the whole thing was already in motion. The country, the language, the economic reality of the household, the emotional weather of the family, all of it was set before you drew your first breath. You adapted to whatever you found, brilliantly, completely. The fact that you survived is proof of how well you read what was required and became whoever you needed to become to get through it.\n\nNow comes the part that takes courage. \"I am broken.\" \"I am anxious.\" \"I am too much.\" \"I am not enough.\" These feel like facts. They are residue. The character collapsed into the circumstance so completely that the circumstance became the identity, and as long as the problem is something you ARE, the victim has no pen. Taking accountability for the narrative is difficult and merciful at the same time. Take the same material and hold it differently. \"I went through this, I adapted by becoming this, and the adaptation protected me.\" Feel the difference in your body when you say that. The person who speaks those words is standing outside the story, holding it with firmness and love. That person is the author.",
        code: {
          title: "The operating system was installed before you had a vote.",
          body: "Stephen Porges showed that your nervous system was shaped by the nervous systems of your caregivers before you had language, which means your threat responses, your relational patterns, your default ways of reading a room were loaded by whoever was in the room when you were learning what the world was. Allan Schore showed the emotional patterns laid down in the first two years become the template for every relationship that follows. By the time you were three, the operating system was largely loaded. The adaptation was intelligence under pressure. Understanding this is the beginning of authorship, because you cannot rewrite code you cannot see."
        },
        middle: "Write the character the way a novelist would — what they adapted to, who they had to become, what the adaptation cost and what it saved.\n\nWhat conditions shaped them? What did they have to perform? What would it mean to own that fully?",
        lore: {
          title: "Karma",
          body: "The Sanskrit karma means action, and its deepest teaching is that unconscious action generates binding consequence, that the wheel turns because the pattern is the only program loaded. Arjuna stands paralyzed on the battlefield because acting means confronting everything his conditioning made him. Krishna's teaching across eighteen chapters reduces to one recognition: as long as you identify with the actor, the cycle owns you. Seeing the loop is the first act of freedom. The Buddhist vasana, the Norse Wyrd, wherever humans looked closely at why suffering perpetuates, they found the same answer: because the pattern is invisible to the one inside it."
        },
        closing: "What conditions was this character born into? What did they become in order to survive?",
        key: "p2_conditions",
        rows: 7,
        breathAfter: { label: "Four in, seven out — give the body its ninety seconds.", cycles: 4 }
      },
      {
        kind: "voices",
        title: "The Cycle",
        subtitle: "Meaning · Why the patterns persist",
        body: "The patterns that hurt you persist because your brain pays itself to run them. Sit with that for a moment. The seeking system rewards itself in chemistry every time the pattern fires, familiar suffering paying better neurochemically than unfamiliar peace, the cycle of self-attack running on a dopamine drip because each repetition confirms what the system expected and confirmation is the reward. This is what addiction is. This is what compulsion is. This is what the traditions called karma. The brain has been paying you to stay inside the loop.\n\nYou have been reacting, and the reactions felt like choices because you could not see the cycle underneath them, the same dynamic running through different decades, the same tension activating in relationships that look nothing alike on the surface. Real choosing only becomes possible once you can see the loop for what it is.\n\nAnd the cycle did not stop with you. The adaptations that kept you safe produced behavior, and people around you absorbed it. Seeing how what you inherited moved through you into other lives is the hardest part of this chapter and the most freeing, because a cycle you can see is a cycle you can break.",
        code: {
          title: "The loop runs faster than awareness and rewards itself for running.",
          body: "The brain runs prediction loops continuously. The story generates a feeling, the feeling drives a behavior, the behavior produces a consequence, the consequence confirms the story. Porges calls the deepest layer neuroception, the nervous system filtering reality through stored narrative before the conscious mind gets a vote. You are responding to the predicted version of what is in front of you. The moment you see the loop as a loop, it can still run, but it can never fully pass as reality again."
        },
        middle: "Here is the thing most people miss about those voices: every surge of self-doubt, every old wound that flares up when you least expect it, is hard-won intelligence about what it feels like to be shaped by forces you didn't choose. As you write them down, as you name them honestly and let them speak, you are doing something remarkable without realizing it: you are reading the mind of the people you are here to help. Your intimate knowledge of that territory, the texture of it, the specific weight of it, the exact way it whispers its lies, becomes your qualification to guide someone else through it.\n\nAnd the patterns did not only shape you. They moved through you into the world. The adaptation that kept the character safe also produced behavior, ways of relating, ways of leaving, ways of shutting down, ways of taking up too much space or not enough. People were affected. Relationships bent under the weight of patterns nobody asked for but everyone absorbed.",
        lore: {
          title: "The songline",
          body: "The Aboriginal Australians speak of Songlines, invisible pathways crisscrossing the continent, laid down by ancestral beings who sang the world into existence. Each feature of the landscape is a solidified note of the ancestor's song, and to walk the land is to re-sing it into being. A person who knows their songline can cross hundreds of miles of desert using nothing but the verses. Your circumstances are your songline, the path that made you, whether you chose it or not. The Celtic imbas, the inspired knowledge that comes from the specific path walked. Follow the arc honestly and something becomes visible: the detours were the route."
        },
        closing: "What voices have been running this character? What loops keep producing the same outcomes? And what has it cost — not just this character, but the people around them? Write the consequences the patterns produced in the lives of others.",
        key: "p2_loop"
      },
      {
        kind: "threshold",
        label: "The Victim",
        subtitle: "Author · The unedited story, fully owned",
        body: "You were born a tiny human, completely open, and the world got to work on you immediately. Whatever society you were born into decided what you should be, and you had no control over any of it. The people raising you were carrying their own unresolved stories, and the child navigating all of it was doing the best they could with tools they had not yet been given.\n\nThis is the part where you tell the whole thing. The unedited version. The dark chapters, the things that were done, the things you did in return, the wreckage and the survival. From the perspective of someone who has the courage to hold themselves accountable and the compassion to do it without cruelty, because accountability without compassion is punishment and compassion without accountability is avoidance.",
        code: {
          title: "Vulnerability is what makes the story magnetic.",
          body: "Kristin Neff's research showed that self-compassion opens the field that shame contracts, producing measurable shifts in resilience and emotional regulation. And here is the part nobody tells you about telling your real story: the flawed character is the compelling one. Imaging studies consistently show that morally complex, vulnerable characters produce stronger neural synchronization in the listener's brain than polished ones. The character who shows you their wound is the one you cannot look away from. Hiding the difficult parts makes the story less powerful. The unedited version is the magnetic one."
        },
        middle: "Tell the descent chapter of this character's origin story — what they struggled with, what shaped them, what they survived, what it cost.\n\nWhat were the dark chapters? What did they do under pressure? What did the survival build in them?",
        lore: {
          title: "The wounded healer",
          body: "In Siberia, the future shaman is identified by affliction. The initiatory crisis takes them apart, sometimes for years, through illness and visions the community recognizes as the spirit world reshaping a human into an instrument of healing. The vocation chooses them through the wound. The Greek Asclepius was raised underground by Chiron, the wounded healer who could not heal his own wound and so became the teacher of all who heal. Wherever transformation was studied seriously, the same pattern: the one who has been opened by suffering is the one qualified to open others."
        },
        closing: "Write the unedited version. Fully owned. Nothing left out.",
        prompt: { key: "p2_unedited", placeholder: "The unedited version goes…", rows: 10, big: true }
      }
    ]
  },
  {
    roman: "III",
    title: "The Gift",
    subtitle: "Resolve the tensions that make the story good.",
    palette: { bg: "#102a14", ink: "#c8e0c4", accent: "#60b868", veil: "#1a4024", glow: "#40d878", shadow: "#186030", dark: true },
    invocation: "Everything you survived built something. You are about to hold every dark chapter up to the light and find, with a specificity that will surprise you, that the wound and the genius are the same thing seen from two angles. The gap between the disaster and the gold is the gift, and the further the distance between them, the more powerful the gift becomes, the harder the chapter the better the story gets, and you have been through some chapters that would make a screenwriter jealous.\n\nThis is the heart of the journey, the treasure at the bottom of the descent, the moment every great myth spirals around. You came looking for relief from the tension. What you are about to find is that the tension was carrying your gift the whole time, wearing the costume of the thing you thought was your damage. And the gift is incomplete until it moves through you into the world, because the person on the other side of your threshold is living in the same territory right now, and you know the landscape from the inside, and that knowledge is the credential no institution can grant.",
    transition: "The gold is in your hands. And something deeper is pulling underneath it, something the gift came from, something the whole journey came from. This next chapter is where you follow the thread all the way back to where you actually came from, which is much further back and much larger than anything you have been told.",
    scenes: [
      {
        kind: "prompt",
        title: "The Genius",
        subtitle: "Character · What was already there before anyone shaped you",
        body: "What arrived in you as naturally as breathing? The thing you cannot stop doing, the thing that eats hours without you noticing because the clock stops mattering when you are inside it? Maybe it is something you have been told is impractical or too much, which is usually a sign you are getting warm.\n\nThis is where the identification shifts. The Tension caught the I-am of the wound: I am broken, I am anxious, I am not enough. This beat is the I-am of the gift. I am grateful. I am abundant. I am here for a reason. Say it aloud and feel what the body knows about it before the mind talks you out of it.\n\nPeople can feel the difference between someone broadcasting the original signal and someone performing a copy, the way you can feel the difference between a fire that is burning and a photograph of one. Your genius is where the original signal is clearest. When you operate from there, other nervous systems lock onto yours the way they lock onto a storyteller who is telling the truth. The performance repels. The real thing attracts.",
        code: {
          title: "The wound adds capacity that comfort cannot produce.",
          body: "The human child arrives more neurally connected and capable of learning than at any later point in their life, and what happens over time is pruning, the capacities the environment does not call for getting cut back. The genius is what survived the pruning. Tedeschi and Calhoun studied people who came through severe adversity and found them carrying capacities they did not have before — deeper empathy, expanded possibility, clarity about what matters that the comfortable path never builds. They called it post-traumatic growth and found it across cultures, demographics, and types of adversity. The wound added to the genius. Comfort would not have."
        },
        lore: {
          title: "The genius",
          body: "The Latin genius comes from gignere, to generate, and the Romans understood it as a spirit inhabiting each person from birth, the force that works through you, that fills you and wants to move out through what you make. The Greeks called it the daimon, the spirit accompanying each soul with the pattern of its purpose. Socrates said his guided him by negation, telling him when to stop but never what to do, which is its own kind of teaching. The Persians had the fravashi. The Egyptians had the ka. Of course they all found it. It is the most obvious thing about being alive."
        },
        closing: "Name what you are abundant in, the genius that survived everything.\n\nWho lives in the territory you know from the inside, and what would they recognize in you?",
        key: "p3_genius",
        rows: 7
      },
      {
        kind: "prompt",
        title: "The Breath",
        subtitle: "Embodiment · The first practice of self-love",
        body: "There is a moment when you realize your exhale can change how afraid you are. You are in the middle of it, the racing heart, the constricted chest, and you discover you have one lever you can actually pull. The long exhale. The heart slows. The chest opens. Something cracks open, because you just found agency inside machinery that has been running without your consent your entire life.\n\nThe breath is the only autonomic function under voluntary control, the place where the involuntary and the chosen meet. It is the doorway into self-love, because the moment you start working with your breath you are caring for this body in a way it recognizes immediately, and this body has been carrying everything without complaint for a very long time.\n\nSit upright. Breathe in for four counts, out for eight. Direct the exhale into wherever the Score found the deepest tension. Do this for five minutes. Stay with it until something softens.",
        breath: { label: "Long inhale, longer exhale — until something softens.", cycles: 6 },
        code: {
          title: "The breath is the beginning of free will over your own nervous system.",
          body: "You have one lever inside the autonomic system that you can pull on purpose, and pulling it changes everything downstream. Lengthen the exhale and the whole regime shifts — cortisol drops, heart rate variability spikes, the field that was contracted by the tension opens, and the body starts feeding different data to the brain's authoring system in real time. Decades of research across clinical psychology, contemplative neuroscience, and trauma recovery all landed on the same finding and none of them could quite believe how simple it was: conscious breathing produces measurable shifts in autonomic state that rival pharmacological intervention. You have a pharmacy in your ribcage. Six breaths per minute is the dosage."
        },
        middle: "Breathe into the place in the body where the tension lives. Long inhale, longer exhale. Do this until something softens. Feel what happens when oxygen and attention reach the contracted place.",
        lore: {
          title: "Breath as threshold",
          body: "Every tradition that took consciousness seriously started here, at the one function that belongs to both the involuntary and the chosen. Pranayama built an entire science around it. The hesychast monks synchronized prayer with breath until it descended from the head into the heart. The Tibetan tummo practitioners generated heat the body cannot produce through any other means, drying wet sheets in subzero temperatures while researchers watched. Of course they all started with the breath. It is the oldest doorway into authorship over your own body, and the simplest, and the one that has been sitting in your ribcage your entire life waiting for you to use it."
        },
        closing: "From the softened place, hold the wound inside a different question: what was this preparing me for?",
        key: "p3_breath",
        rows: 5
      },
      {
        kind: "prompt",
        title: "The Alchemy",
        subtitle: "Meaning · The wound becomes the gold",
        body: "You are holding the same events, the same years, the same body, and something is rotating. Right now, as you sit with this, the thing you carried as evidence of your damage is starting to look like preparation. The capacity you took for granted, the one that felt so obvious you assumed everyone had it, is turning out to be the specific gift the specific wound produced. You can feel the weave coming together, the disasters and the beauty woven from the same thread, and the feeling is physical, something shifting in the chest, something clicking into place that has been waiting a very long time.\n\nThis is the gold the alchemists were talking about. The lead was the prima materia, and the gold was inside it from the beginning. The work was never about adding something missing. It was about recognizing what was already there. And the alchemy includes the giving, because the capacity the wound built is here for others, the person on the other side of your threshold is living in this territory right now, and you will recognize them because you were them.",
        code: {
          title: "Hold the wound inside a new question and the memory itself rewrites.",
          body: "The recall has to contain something that genuinely contradicts what the memory expects, a prediction error. The wound predicts damage. \"What was this preparing me for\" predicts preparation. The mismatch is the trigger that opens the trace for rewriting. Nader showed memory becomes malleable during recall, and Ecker showed the gate: the recall has to surprise the nervous system with a meaning the wound did not predict. The events stay. What they mean in your body changes. And McAdams found that the structure of the story, whether the bad leads to good or the good gets overwhelmed by bad, predicts mental health more reliably than what actually happened."
        },
        middle: "Hold the tension alongside the genius. What connects them? What is the line from the wound to the gold, and from the gold to the people who need it?",
        lore: {
          title: "The wound is the place where the light enters.",
          body: "Rumi was a conventional scholar when Shams of Tabriz entered his life and dismantled every framework he had built. When Shams disappeared, the grief broke him open into the poet. Twenty-five thousand verses poured out of the rupture, and he spent the rest of his life writing about one thing: the breaking of the container is what allows the contents to be seen. The Japanese kintsugi repairs broken pottery with gold so the fracture becomes the most luminous part of the vessel. Frankl called the capacity to choose your response the last human freedom, and he said it from inside Auschwitz, which means he earned it."
        },
        closing: "How did the worst chapters lead to the greatest capacity? Who is waiting on the other side?",
        key: "p3_turn",
        rows: 8,
        after: [
          { kind: "note", text: `If something tightened, stay with it. Four in, seven out. The body completes what the mind tries to interrupt.` }
        ]
      },
      {
        kind: "threshold",
        label: "The Gratitude",
        subtitle: "Author · Write from thankfulness for the whole story",
        body: "Now write the whole thing from thankfulness. The earned kind, the kind that comes from having seen what you went through and what it built and who you are because of it, the kind where you would choose it again.",
        code: {
          title: "Gratitude alters the biology of the body that practices it.",
          body: "Organizing experience into coherent narrative produces measurable improvements in immune function and wellbeing, and the magnitude of the effect is proportional to the meaning made during the writing. Pennebaker spent forty years documenting this across populations. Emmons added that gratitude practice specifically produces stronger biological effects than any other single positive psychology intervention, dose-dependent, the deeper you go the more the body shifts. Your biology is listening to the story you tell about your life, and it responds to the version where you are grateful for all of it differently than it responds to the version where you are a victim of it."
        },
        middle: "Write the gold chapter of this character's origin story, from thankfulness for what the survival built.\n\nIf nothing was wasted, what would this character do with what they carry?",
        lore: {
          title: "A person with a framework of meaning can endure almost anything.",
          body: "Frankl saw it from inside Auschwitz. The ones who survived were the ones who could hold their suffering inside a frame that gave it purpose. He held one thing they could not take, the capacity to choose his response, and he held the image of the lecture he would give after liberation so vividly his body organized survival around delivering it. He survived. He gave the lecture. George Bailey in It's a Wonderful Life is the same truth told as fable, a man ready to end his life shown what the world would look like without him in it, and the film's last act is gratitude for his own life exactly as it was. The meaning you make becomes the lives of people you will never meet."
        },
        closing: "Whose life changes because this character stopped dimming their genius?",
        prompt: { key: "p3_reason", placeholder: "Nothing was wasted because…", rows: 10, big: true }
      }
    ]
  },
  {
    roman: "IV",
    title: "The Source",
    subtitle: "Reconnect to the source of truth that transcends your limits.",
    palette: { bg: "#0a1838", ink: "#c4dcf8", accent: "#5090e0", veil: "#122040", glow: "#70b0f8", shadow: "#204080", dark: true },
    invocation: "There is a place underneath your biography where you actually come from, and it is much further back and much larger than the city or the country you put on forms. This chapter is about going there, tracing the thread of your lineage all the way back, past your parents and their parents, past the culture and the nation, past the layers of civilization piled on top of what was there before, all the way to the original human on the land three hundred thousand years ago, with the same brain you carry, telling stories around a fire that was the center of the world. You are going to find the source that precedes all the stories you have been living inside, connect to it, choose the god your life will be organized around on purpose rather than by accident, build rituals that produce the chemistry of mattering in your body, and come back down carrying something the character's problems cannot touch.\n\nEveryone alive today is indigenous to somewhere. The longing you carry for belonging, for meaning, for connection to something larger, is the original operating system remembering what it was designed for. Humanity has forgotten its origin, and when you do not know where you came from, you do not know what you are, and any story can tell you what you are. This chapter is where you find out for yourself. The character has limits. The source has none.",
    transition: "You touched the source, saw the arc from above, and know now that what is real has none of the character's limits. And now you come back down carrying that knowledge, because there is a voice to meet, the system that has been authoring your reality without asking. You could not see through it before. Now you can.",
    scenes: [
      {
        kind: "prompt",
        title: "The Lineage",
        subtitle: "Character · Shaped by everything that came before",
        body: "Somewhere in a city or a village you may never visit, people whose names you may never know were living through things you can barely imagine, and the ripples of those decisions traveled forward through generations and landed in the nervous system you were born with. The beliefs your parents held came from somewhere. The fears came from somewhere. The silences, the ambitions, the things they could never discuss, all of it arrived as inherited weather and you grew up inside it the way a fish grows up inside water.\n\nFollow the thread past your grandparents, past the culture and the nation, past the empires and the migrations, and you arrive at the original human on the land, three hundred thousand years ago, living in small bands, embedded in the rhythms of the living world, organized by stories told around fires. That is where you actually come from. Everything between there and here is what was laid on top.",
        code: {
          title: "What your ancestors lived through is in you, and it is not metaphorical.",
          body: "Trauma marks the genome. Yehuda showed measurable epigenetic markers passed from Holocaust survivors to their children, the experience written into the chemistry of inheritance by events that happened to someone else. Dias and Ressler confirmed inherited fear responses to stimuli the offspring never encountered. What they went through is literally in you, coded into the biology before you were born. And so is everything they loved, everything they survived, every capacity they built under pressure."
        },
        middle: "Trace the lineage backward as far as you can, the people, the cultures, the forces that shaped the conditions you were born into.\n\nWhat kind of human do you find when you follow the thread all the way back?",
        lore: {
          title: "You are not just yourself. You are a thread passing through.",
          body: "The Haudenosaunee hold every decision accountable to seven generations back and seven generations forward. Imagine sitting at that council fire, making a decision for people who will live a hundred and fifty years from now, answerable to people who lived a hundred and fifty years ago. Ubuntu says I am because we are. The Aboriginal Songlines are paths the ancestors sang into being and the descendants are still walking. Of course you are more than your biography. Every tradition that survived long enough to know what survival requires understood this."
        },
        closing: "Trace the thread backward. What forces were in motion before this character arrived?",
        key: "p4_ancestry",
        rows: 8,
        breathAfter: { label: "Breathe into the widest view. Let the longer exhale loosen the boundary between you and the vast.", cycles: 5 }
      },
      {
        kind: "prompt",
        title: "The Return",
        subtitle: "Meaning · Choose your source and come back carrying it",
        body: "Every human who has ever lived has had a god running in their operating system whether they called it that or not. The brain looks for order in chaos, agency behind events, meaning inside suffering, and it will not rest until the chaos has a face. A harsh parent becomes the god of judgment. A chaotic home becomes the god of anxiety. The market becomes the god of worth. These are gods because they are the forces you organize your behavior around, and the question was never whether you have one. It was which one, and who installed it.\n\nThis is where you choose on purpose. The faculty that built gods across human history is running in you right now, and you can aim it. You traced the lineage all the way back. You felt the body in the conditions it was designed for. You saw the arc from above. Now you name the source your life will be organized around from here, and you come back down carrying it into the life that is waiting for you at the bottom of the mountain, because the mountaintop was never the point. The return is the point.",
        code: {
          title: "Awe loosens the fixed self and opens the window for reauthoring.",
          body: "Keltner showed that encountering something too large for the existing self-model to contain physically alters the brain: the self-boundary loosens, inflammatory markers decrease, connection expands. Van Elk's fMRI showed the regions maintaining the fixed sense of self go quiet during awe, the same signature Brewer found in meditators and Carhart-Harris found under psilocybin. The apparatus that has been generating the fixed identity temporarily stands down, and in that window the identity can be rewritten. The faculty that raised cathedrals and carried pilgrimages across continents is in you, and it can consecrate your own existence the moment you turn it there."
        },
        middle: "Name the source your life will be organized around from here. Say it out loud, in your own language, the name that comes from having actually felt it.\n\nWhat changes when you come back down carrying it?",
        lore: {
          title: "The source precedes the material world.",
          body: "The Kogi call it the Ley de Origen. The material world is a continuous expression of something that preceded it, and the Kogi perform their ceremonies as maintenance of reality itself, tending the connection between the visible and what holds it together. Their message to the outside world is always the same: you have forgotten the source, the roots are dying, come back. The Vedics called it Rita. The Taoists called it the Tao. The Lakota say Mitakuye Oyasin. Of course they all found it. It was never hidden. We just stopped looking."
        },
        closing: "What does your life look like organized around this source?",
        key: "p4_naming",
        rows: 5,
        after: [
          { kind: "note", text: `You are as qualified as anyone who ever stood under the sky and felt the pull.` }
        ]
      },
      {
        kind: "prompt",
        title: "The Temple",
        subtitle: "Embodiment · The world around you is the temple",
        body: "Nature is the original temple. The human organism was shaped across three hundred thousand years to live under sun, to move on uneven ground, to eat food gathered with hands, to fall asleep knowing the names of the people around you. These are the conditions under which the brain produces serotonin, the chemistry that tells you your life means something and your place in the world is secure. Morning light triggers it. Movement triggers it. Belonging triggers it. Contributing something valuable to people who recognize you triggers it.\n\nCivilization removed these conditions and replaced them with substitutes that do not work, which is why the absence of serotonin, which we call depression, is so often a sane response to a life that no longer contains what mattering requires.\n\nIf this body is the physical expression of the source you just named, then the body is sacred. And the temple is larger than the body. The temple is the world around you, the setting of your life, the environment you wake up inside every morning. What you do with your body is what you actually believe, regardless of what you say you believe, and right now most people are practicing rituals they never chose — the screen at dawn, the processed fuel, the fluorescent light, the distance from soil and sky — training their nervous system daily in the religion of disconnection.\n\nGo outside. Put your feet on earth if you can. Feel the sun. Walk without destination for ten minutes, paying attention to what the body recognizes when it is in the conditions it was designed for.",
        code: {
          title: "The rituals you practice install identity in the nervous system.",
          body: "Repetition is how anything gets written into a nervous system, each repetition encoding the pattern deeper into the tissue until it runs automatically. The practices you repeat shape the identity you become more powerfully than any belief held only in the mind. Decades of habit research converge on the same finding from every direction: the body learns what it practices, and what the body learns becomes who you are. The question is whether you are practicing rituals you chose or rituals that were chosen for you."
        },
        middle: "Name the rituals you perform daily that separate you from the origin, then name the rituals that would reconnect you.\n\nWhat would your morning look like? Who would you see? What would you contribute?",
        lore: {
          title: "The land is the partner, and the body is the proof of what you hold sacred.",
          body: "The Aboriginal Australians speak of Country, the specific land you belong to, and the belonging runs in both directions. Walking the land is prayer. Singing the songlines is maintenance of reality. The Kogi tend the Sierra Nevada as the heart of the world, their ceremonies understood as keeping the connection between the visible and what holds it together. The Lakota offer the body in the sun dance. The yogis built asana across centuries. Of course they all made the body the proof and the land the partner. What else would you build a sacred practice from?"
        },
        closing: "What practices emerge from treating your body and your world as temple?",
        key: "p4_temple",
        rows: 7
      },
      {
        kind: "threshold",
        label: "The God's Eye",
        subtitle: "Author · Write the arc from the perspective of the source",
        body: "Something happens when you hold your whole life at once and widen the lens until you are seeing it from the perspective of whatever produced it. The events that felt random from inside cohere into something that looks designed. The wound was preparation. The gold was the wound transformed. The conditions were the specific training ground for the specific work. The arc has a shape, and it is only visible from this altitude, the way a river's path makes sense from the air when it made no sense from inside the current.",
        code: {
          title: "Psychological distance reveals pattern that close reading cannot.",
          body: "Trope and Liberman showed that increasing distance — temporal, spatial, social — shifts cognition toward abstraction, pattern recognition, and meaning. The same life that felt chaotic from inside becomes legible from outside, which is why traditions seeking wisdom have always sought altitude. The mountaintop, the hermitage, the vision quest, the forty days in the desert. They were not escaping the life. They were getting high enough to read it."
        },
        middle: "Write the cosmology chapter of this character's origin story, from the widest possible perspective, the source telling the story through this life.\n\nWhat has this life been in service of?",
        lore: {
          title: "The source has a story it is telling through the lives it produces.",
          body: "The Kogi creation story begins in the thought of Aluna before the world was material, everything that would become physical existing first as thought, the material world continuously unfolding from that original thought into form. The Lakota place the human at the center of a web of relations extending through visible and invisible worlds. The Maya Long Count places each individual day inside a cosmic narrative so that nothing happens outside of meaning. Of course the source has a story. The question is whether you can get high enough to read yours."
        },
        closing: "Write this character's arc from the source's perspective. What has this life been in service of?",
        prompt: { key: "p4_elevation", placeholder: "From the elevation of the source…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "V",
    title: "The Narrative",
    subtitle: "Author the meaning that makes life an adventure.",
    palette: { bg: "#09090b", ink: "#e0d8cc", accent: "#c89838", veil: "#161410", glow: "#e0b840", shadow: "#2c2010", dark: true },
    invocation: "Everything flashing through your phone, the unspoken rules everyone follows without anyone having called a meeting, the scripts people recite about who they are and what they do, all of it is story, made in the mind, reinforced through the culture, performed by everyone who shows up including you including now. And the voice in your head making sense of all of it, the narrator running so seamlessly you mistook it for thinking, is the same kind of construction, built by a machine that never shuts off, never identifies itself as a machine, because the moment it did the whole spell would break.\n\nYou are running a belief system you did not choose, installed by a system that never announced itself as a story, maintained by a culture that calls itself normal. Normal is this system's masterpiece. And every day you live inside the inherited script, you are training your brain for mediocrity, because the neural patterns required for compliance are different patterns than the ones required for authorship, and the brain wires for what it does.\n\nHere is what makes this the most exciting chapter in the guide: the machine running this production is the most powerful narrative engine in the known universe, and it has been loaded with someone else's software. This is where you see it, catch the demon, see the system for what it is, and take the pen. And the life that opens on the other side of that moment is the one you were built for.\n\nFrom this chapter forward, speak in the present tense. You are no longer describing what happened. You are authoring what is.",
    transition: "You took the pen. The demon has been named. The belief system has been seen. And the seeking that has been pulling you forward through every chapter is about to find its highest target.",
    scenes: [
      {
        kind: "broadcast",
        title: "The Script",
        subtitle: "Character · Catch the narrator and name the demon",
        body: "Listen. There it is, right now, underneath the reading. Something commenting, evaluating, predicting what comes next. It has been doing this your entire life, and it sounds like thinking, and it sounds like you.\n\nThe voice has an address. It lives in the medial prefrontal cortex, the self-evaluation center of the default mode network, the region that locks into a hyperactive loop in depression and goes quiet during meditation, flow, awe, and psychedelic ego dissolution. The inner critic can be silenced. It has been, reliably, across traditions and across laboratories, which means the voice is a function, and the function can stand down.",
        code: {
          title: "Catch the narrator and the narrator loses its grip.",
          body: "The default mode network generates your sense of self moment to moment, and everything else flows downstream — identity from the narrative, behavior from the identity, the words that come out of your mouth on autopilot from the behavior. The whole chain starts in this one system, running a script assembled from conditions you never chose. Brewer watched meditators' default mode networks go quiet and the practitioners reported from inside what the scans confirmed from outside: the fixed self loosened, a wider awareness opened. The moment you can observe the narrator, you are observing from somewhere else, which means the narrator is no longer all of you. That separation is the beginning of authorship."
        },
        middle: "Write down exactly what the voice is saying right now. Then keep writing, three to five minutes. Let the full broadcast come through: the judgments, the rehearsals, the catastrophes, the loops. Don't argue. Transcribe. Then read it back as a script written by a character. See the character the voice has been writing. Notice how the same themes cycle in different costumes. That is the program, written in your own hand.",
        lore: {
          title: "The Sufis mapped the inner narrator a thousand years before neuroscience had instruments.",
          body: "The Sufis mapped the inner narrator a thousand years before neuroscience had instruments to see it. They named it the nafs and traced its evolution through stages: nafs al-ammara, the commanding self that runs the show; nafs al-lawwama, the self-accusing self that begins recognizing its own patterns; nafs al-mulhama, the inspired self when guidance arrives from beyond the conditioning; nafs al-mutma'inna, the self at peace, transparent to something larger. You are at the threshold of stage two. The voice is starting to sound like someone else's voice. Of course the Sufis mapped it. Of course there were stages. The narrator has been running in every human skull since consciousness showed up, and anyone who sat still long enough was bound to find it."
        },
        closing: "Give the demon a name. A shape, if one comes. It is easier to be free of something you can look in the eye.",
        key: "p5_broadcast",
        minutes: 4
      },
      {
        kind: "prompt",
        title: "The System",
        subtitle: "Meaning · The belief system generating your reality",
        body: "The voice is the surface. Underneath it is the whole system, an entire answer to what is real and what is possible and what you are worth, running silently for your entire life. You are living inside stories you chose none of: separation, that you are fundamentally alone; the career, that you are what you produce; scarcity, that there will never be enough; the inherited weather your grandparents carried and passed forward before anyone had language for what was being transmitted.\n\nAnd the system itself, the one everyone simply calls the system, the systematized narratives that became rigid, became rules, became the selling of time and the sitting at desks and the scrolling at two in the morning, all of it so normalized nobody sees the rituals as rituals. Because that is what they are. The rituals of a civilization that forgot the origin, performed daily, without choosing them.",
        code: {
          title: "The brain authors reality from the story before the senses report, then filters perception for confirmation.",
          body: "The default mode network constructs experience from top-down narrative before sensory data arrives, and the reticular activating system calibrates to whatever meaning-frame is loaded, flagging what confirms the story and dismissing what contradicts it. Barrett showed that even emotions are authored before the event, the brain building the feeling and presenting it as if it were a response to reality. Friston formalized the whole system: the brain would rather distort what it perceives than update what it predicts. Which means the stories you cannot see are the ones running you. Each one you can name is one you are no longer fully inside."
        },
        middle: "Name the stories you are living inside, starting close with what your family believed about money, love, and who you were allowed to be, then widening to what the system told you about worth, success, and what your time is for.",
        lore: {
          title: "The mind constructs a reality and mistakes the construction for the world.",
          body: "Shankara gave this its enduring image eight centuries ago. A person walking in dim light sees a coiled rope and perceives a snake. Genuine fear, real arousal, real behavior change, all in response to something that was never there. The rope was always a rope. The snake was always a prediction. When the light improves the snake does not retreat because it was never there in the first place. Plato placed humanity in a cave watching shadows. The Buddhists described samsara, the wheel that turns because the beings on it cannot see the wheel. Of course they all found the same thing. The obstacle to seeing clearly is that the obstacle presents itself as the view."
        },
        closing: "Where does the narrative still feel like reality?",
        key: "p5_system",
        rows: 7
      },
      {
        kind: "movement",
        title: "The Parts",
        subtitle: "Embodiment · The system in the tissue",
        body: "The narrative you just named lives in your body as much as in your thinking. Your posture right now is the character the narrator wrote, performed in flesh, and the body holding it is several minds, each running its own chemical weather, each playing its part with the commitment of someone who forgot they were cast in a role.\n\nThe body knows things the narrator has been overriding. The throat knows what it has been swallowing. The gut, producing ninety-five percent of the body's serotonin, knows what the mind has been calling irrational. The heart, with forty thousand neurons of its own, knows what the armor has been protecting against. The gap between the story you perform and the person you actually are is felt in the body as a kind of wrongness, the wrongness of waking up into a life that no longer fits the soul living in it.\n\nSit quietly. Move your attention through each center from crown to root. At each one, ask what story it is holding. Do not think the answer. Wait for the body to respond. It will respond differently at each center, because each center is its own mind.",
        seconds: 30,
        code: {
          title: "The body holds multiple intelligence centers, each running a different dimension of the narrative.",
          body: "The yogic tradition mapped seven centers along the spine and the descriptions held across millennia because the yogis were reporting from inside what they actually found when they sat still long enough. Western neuroscience has been arriving at the same map from outside: the enteric nervous system with a hundred million neurons, the cardiac neural network with its own memory, the polyvagal system through throat and face governing connection and expression. The Taoists mapped dan tian, the Kabbalists sefirot, the Sufis lataif. Different instruments, same territory. The body is a parliament, and the parliament has been operating without a speaker."
        },
        middle: "Go through the body from crown to root and write what each center is holding.\n\nWhere is the dissonance loudest between the story being performed and the person actually living in this body?",
        lore: {
          title: "You are a community of intelligences, each cast in a part.",
          body: "The yogic chakra system mapped seven because the practitioners who sat in deep meditation kept finding the same seven. Root holds belonging and survival. Sacral holds creativity and desire. Solar plexus holds will and power. Heart holds love and grief. Throat holds expression and truth. Third eye holds vision and intuition. Crown holds connection to the vast. Internal Family Systems arrived at the same multiplicity through Western psychology, naming sub-personalities, protectors, exiles, each frozen at the age of the wound they carry. Of course we are not one voice. The question is who is speaking for the whole."
        },
        closing: "What did each center reveal when you addressed it directly?"
      },
      {
        kind: "threshold",
        label: "The Adventure",
        subtitle: "Author · Install the new belief system",
        body: "You have been living in someone else's story, your entire life organized by what runs when you are not choosing. The word for that is default, from the Latin de-fallere, to fall away, to be absent where a choice should have been. The opposite is ad-venire, to come toward, to arrive. And from that root: adventure.\n\nThe machine that has been running someone else's story is the most powerful narrative engine in the known universe, and it does not care whose story it runs. It will run yours with the same conviction, the same chemistry, the same reality-producing power it has been using to run the old one. The moment you load a new story, the moment the task you are doing serves a narrative you actually believe in, something extraordinary happens in the brain. The dreaming network and the doing network stop fighting each other and start working together, the inner critic goes quiet while the story-maker stays on, and the felt experience of being alive shifts from grinding through someone else's script to flowing inside your own. Csikszentmihalyi spent his life studying this state and called it flow. The Taoists called it wu wei, water finding its way around stone, carving canyons because it moves with reality rather than against it. Flow is what your nervous system feels like when the story it is inside is the story it was designed to author. It was always the natural state. Default was the interruption.",
        code: {
          title: "Choose the frame and the biology follows.",
          body: "Pennebaker showed that organizing experience into coherent narrative produces measurable improvements in immune function, proportional to the coherence of the story. Frankl observed from inside Auschwitz that a framework of meaning determines survival. Crum showed that housekeepers told their work IS exercise showed measurable health improvements in weeks while a control group doing identical work showed none. The story changed the biology. The biology did not ask whether the story was objectively true. It asked whether the organism believed it, and it complied."
        },
        middle: "Write the rules of the world you are now living inside, the new belief system you are installing on purpose.\n\nWhat kind of story are you in? What does it mean when something goes wrong? What will you do today that serves it?",
        lore: {
          title: "When you align with the story you have chosen, you stop fighting reality and start playing with it.",
          body: "Lao Tzu describes the sage as water, yielding, finding the path of least resistance, carving canyons because it moves with reality rather than against it. The Hindus called it Lila, cosmic play, the recognition that the whole thing is a game the awakened being plays consciously. Coyote, Anansi, Hermes, the Trickster figures across cultures who see through the construction and play with it. Of course once you see the game you want to play. The only people who do not play are the ones who still think the game is the world."
        },
        closing: "Author the narrative system. Name the narrator and what it served. Write the framework for meaning you are choosing, the operating system that will organize the stories going forward.",
        prompt: { key: "p5_wheel", placeholder: "The narrator I am taking the pen from is… The framework I am choosing is…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "VI",
    title: "The Dream",
    subtitle: "Cast yourself into the life on the other side.",
    palette: { bg: "#c8ede0", ink: "#0d2e24", accent: "#2aaa8a", veil: "#a4dcc8", glow: "#3ecaaa", shadow: "#0a4832", dark: false },
    invocation: "Do you remember when you could imagine? Before anyone taught you to be realistic, before the word practical entered your vocabulary like a closing door. There was a time when you could walk into a field and build a civilization in the grass, inhabiting somewhere else so completely your body responded as though it were real. That was the dreaming power, the most natural thing about you, and the neuroscience of memory says something astonishing about it: the system you use to remember the past and the system you use to imagine the future are the same system. Memory evolved as a database for constructing simulations of possible futures. Dreaming your future is the brain being used for its original purpose. The narrator hijacked it for anxiety, building worst-case scenarios with breathtaking specificity, but the worrier is already a masterful dreamer. The only question is which direction the dreaming is pointed.\n\nEverything humanity has ever built or destroyed began as a vision in someone's mind that refused to stay contained there. The dream growing in you, shaped by your wound and your gold and your source, is already formed. Your job is to step into it fully enough that the body recognizes it as real, because the body builds toward whatever it most consistently inhabits.\n\nThis chapter shifts tense. You write as the future self looking back, because the brain treats a vividly remembered future as the past it is building toward. \"I want\" tells the brain there is a gap, and the body produces the chemistry of reaching. \"I am the person who did this\" tells the brain the identity is loaded, and the body produces the chemistry of someone who already is. Tense matters. The dream written as memory becomes the blueprint.",
    transition: "The dream is in the body. The character you are becoming is present in the tissue. One move left. The old story closes, the new one opens, and the speaking is what makes it real.",
    scenes: [
      {
        kind: "prompt",
        title: "The Inversion",
        subtitle: "Meaning · Your obstacles are stories. Your dreams are real.",
        body: "The things you have been calling obstacles are narratives. The things you have been dismissing as dreams are the raw material reality is built from. The dream that keeps returning grew from everything, wound, gold, source, authorship, with the precision of something designed.",
        code: {
          title: "A coherent future rewrites how the past is stored.",
          body: "When you can see where you are going with enough clarity, the brain reorganizes how it stores what happened, and everything begins to look like it was leading here. Frankl held the image of the post-liberation lecture so vividly his body organized survival around delivering it. Crum showed beliefs alter biology in real time. The future you hold with conviction reaches backward through time and rewrites the meaning of the past that produced it, because the brain stores memory in service of the future it is predicting."
        },
        middle: "Name what has been trying to come through this character across the whole arc, the dream that connects the wound, the gold, the source.",
        lore: {
          title: "What becomes real was dreamt first.",
          body: "The Aboriginal Dreamtime places the dreaming before and beneath all physical reality, the ancestral beings still present, still generating the world from underneath. Brahma dreams the universe into being. Genesis opens in the mind of God before light. Blake declared imagination the divine body in every person. The Iroquois governed by dreams because they understood that the soul communicates through the imagination, and imagination honored and embodied builds the world. Of course the dream comes first. Where else would reality come from?"
        },
        closing: "Write the dream as if it is already true. The life this character came here to live.",
        key: "p6_inversion",
        rows: 8
      },
      {
        kind: "prompt",
        title: "The Becoming",
        subtitle: "Character · Cast yourself as the character on the other side",
        body: "Who do you need to become to walk this particular journey? What version of yourself would carry this gold, live from this source, walk this dream? Step into them. Feel the morning they wake up to, the work they move toward, the way they carry themselves through a room.",
        code: {
          title: "You become who you practice being.",
          body: "The brain treats sustained imagined identity as real. The motor cortex fires during imagined action at nearly the intensity of physical action, and the nervous system organizes around the identity it most consistently rehearses. Method actors know this from inside the practice: take on the posture, the gait, the breath, the inner monologue, and the nervous system stops distinguishing between the performance and the self. The character begins to live in the actor. The line between them dissolves. You are about to use the same mechanism on purpose, loading the identity you are becoming until the body cannot tell the difference between rehearsal and reality."
        },
        middle: "Speaking as the person you are becoming, looking back from a life already lived: who did they become, what did they value, what did they refuse?\n\nWhen we suppress our dreams, they go underground. They rule us in secret, the undertow beneath our decisions, the unnamed ache behind our busyness, the restlessness we medicate and distract and scroll past at two in the morning.",
        lore: {
          title: "You have to leave the known world to receive who you are becoming.",
          body: "The Lakota hanblecheyapi strips everything. You go alone to a hilltop, no food, no water, no shelter, the ordinary personality worn thin by fasting and solitude until what remains is what you actually are. The vision that comes is understood as instruction, what becomes audible when the noise is removed, and the community holds you accountable to it when you return. The Sufi khalwa, the Celtic pilgrimage, the Aboriginal walkabout, the biblical wilderness. Different terrain, same recognition: who you are becoming cannot be received inside the life you are leaving. You have to step out to step in."
        },
        closing: "Who is this character becoming? Let it include the world. Say it aloud before you write it. Without editing for plausibility.",
        key: "p6_vision",
        rows: 8,
        after: [
          { kind: "note", text: `If a voice says your dream is ridiculous, notice it and keep writing. "Be realistic" is often someone else's dream defending itself against yours.` }
        ]
      },
      {
        kind: "embody",
        title: "The Rehearsal",
        subtitle: "Embodiment · Step into the character with your body",
        body: "Stand up. Take the physical posture of the character you are becoming. Walk as them. Sit as them. Breathe as them. Speak as them, out loud, for at least five minutes. Do not narrate what you are doing. Do not observe it from outside. Just be them. Let the body figure out what the mind has not caught up to yet, because the body is faster than the mind at this, and it already knows things about this character that will surprise you.",
        seconds: 60,
        code: {
          title: "The body that practices a future becomes the body of that future.",
          body: "Sustained imagined practice produces measurable physical adaptations in people who never moved. Sports psychologists found this first with Olympic athletes, then replicated it across populations: strength gains, skill refinement, performance improvement, all from rehearsal alone. The motor cortex fires during imagined action at nearly the intensity of physical practice, and the autonomic nervous system entrains to the state most consistently performed. The body does not check whether the rehearsal is happening in the world or in the mind. It builds toward whatever it most vividly inhabits."
        },
        middle: "Write what the body already knew about this character that the mind did not.\n\nWhat was familiar? What surprised you?",
        lore: {
          title: "The dreamer who knows they are dreaming can shape what is being dreamed.",
          body: "Tibetan dream yoga trains practitioners to recognize that waking and dreaming share the same constructive nature and can both be shaped by awareness. The practice begins with lucid dreaming, recognizing you are dreaming while inside the dream, and extends to lucid waking, the recognition that the same faculty is building waking experience and the dreamer who sees the construction can reshape it. The Sufi alam al-mithal, the imaginal world, understood as ontologically real, accessible only through trained imagination. Corbin spent his life insisting it was as real as any table. Of course it is. The body just confirmed it."
        },
        closing: "What changed in the body when you stepped into this character?"
      },
      {
        kind: "threshold",
        label: "The Future",
        subtitle: "Author · Cast the world you are bringing into being",
        body: "Write about the dream without editing it for plausibility, without shrinking it to fit what you think is possible. Think magically. Then let it get specific enough that someone reading would know what this person does, who they do it for, and why they are the one doing it. Let the dream include the people whose lives change because of what you carry, because the dream that reaches toward others is the dream that lasts, and the dream that stays inside the dreamer is just a fantasy with good lighting.\n\nThe quest is to stop pretending you do not have the gold, to stop dimming what makes you come alive because it felt too big or too much. The purpose of life is to find your gift. The meaning of life is to give it away.",
        code: {
          title: "Sustained imagination alters biology, and tense determines direction.",
          body: "The nervous system optimizes for the future the organism most vividly believes is coming, and it takes its cues from the tense you hold while you dream. \"I want\" tells the brain there is a gap between you and what you are reaching for, and the body produces the chemistry of lack. \"I am the person who did this\" tells the brain the identity is already loaded, and the body produces the chemistry of someone who already is. Crum's housekeepers were told their work IS exercise, not will be, IS, and their biology followed the prior within weeks. The dream written as memory becomes the blueprint. The body does not check whether the memory happened yet. It builds toward it regardless."
        },
        middle: "Tell the story of this life from the other side, looking back from the future you are stepping into, in past tense, told by the one who lived it.\n\nWhat did they finally let themselves want? Who did they become? Whose lives changed? What was the world they authored?",
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
    subtitle: "Speak the new story into being.",
    palette: { bg: "#f0e8d8", ink: "#3c3020", accent: "#a89868", veil: "#e0d4b8", glow: "#c8b880", shadow: "#6a5030", dark: false },
    invocation: "The story that got you here cannot get you further. That is what evolution is: a death that makes room for what comes next. The caterpillar fully liquefies in the cocoon. The star collapses so the elements that build everything after it can scatter. The species figured this out around fires a long time ago and built the recognition into every transformation story it told: the hero has to die for the larger Self to walk forward.\n\nThis chapter is where you do it on purpose while you still have the chance to choose what dies. You are going to run the simulation of the unchanged future, declare what ends, speak the new story to a witness, and step into the role your species has always held sacred: the storyteller, the one who speaks worlds into being.",
    transition: "Author reality. The end. Which is to say, the beginning.",
    scenes: [
      {
        kind: "prompt",
        title: "The Threshold",
        subtitle: "Meaning · What has to die for what comes next to live",
        body: "The character that got you here cannot get you further. Some part of you has known this for a while, has felt the old version getting heavier, has noticed how much energy it takes to keep performing a role that no longer fits the soul living in this body. They got you here, they did their job, and they cannot cross this line, because the next chapter is not theirs.\n\nThe brain keeps unresolved stories running in the background like an app you closed but never killed, still draining the battery. As long as that file stays open, the next story cannot fully load. The only thing that closes it is a declaration, spoken aloud, where the body pushes the words into the world and another nervous system catches them.\n\nBefore you can declare what dies, you have to see what continues if you do not.",
        code: {
          title: "Run the simulation of the unchanged future, then declare what dies.",
          body: "Your brain cannot tell the difference between a vivid simulation and something that actually happened, same chemistry, same somatic markers, same encoding in the tissue. This is the magic trick the species figured out around fires a long time ago, the reason a cautionary tale about the one who broke the taboo could load a thousand listeners with the body knowledge of why not to. Fighter pilots crash the plane a thousand virtual times so the body knows the stakes before the real emergency. You are about to use the same technology on your own life, running the simulation of the future where nothing changes with enough specificity that your body responds, so that when the old story tries to seduce you back inside its familiarity, your nervous system already knows what staying costs."
        },
        middle: "Write the unchanged future first, five, ten, twenty years out, specific enough your body responds when you read it back.\n\nWhere do the patterns go? What do they cost?\n\nNow declare what dies, named with weight, spoken like vows.",
        lore: {
          title: "Apocalypse means uncovering.",
          body: "The Greek is apokalypsis, the veil pulled back, the moment what was always there becomes visible. The Christian story put a cross at the center because there is no resurrection without the death, three days in the tomb, the body broken, and only on the other side, the rising. The Buddhists mapped the same passage as the bardo, the spacious in-between where nothing has solidified and everything is possible, and trained their entire lives to walk through it conscious instead of asleep. Of course the ending is the revelation. What else would be on the other side of everything you were afraid to let go of, except what you were afraid to let yourself become?"
        },
        closing: "What is becoming visible as the old version steps aside?",
        key: "p7_release",
        rows: 7
      },
      {
        kind: "gathering",
        title: "The Gathering",
        subtitle: "Character · Who you are when the small self is released",
        body: "Everything you have played, every role, every shadow, every gift buried, every god prayed to and every demon battled, all of it is you. The big you. Jung called it the Self, the totality, conscious and unconscious integrated, the thing the whole journey has been walking toward. You have been catching glimpses of it the entire time, every time the observer opened behind the narrator, every time the source had none of the character's limits, every time the future self looking back held a steadiness the present self could not explain. That was the Self, showing through the cracks in the performance.\n\nThe Self is who you actually are when you stop performing the small self. You are much bigger than any character you have played, and the journey you just walked was the process of remembering that, layer by layer, chapter by chapter, until what remains is what you actually are.",
        code: {
          title: "Narrative coherence reorganizes identity at the deepest level.",
          body: "McAdams spent decades studying narrative identity and found that the people who can hold their whole life in one coherent story, integrating the difficulties, the contradictions, the changes, the shadow alongside the light, show higher resilience, better mental health, and greater capacity to navigate uncertainty than those who cannot. The integrated self is the resilient self. The fragmented self is the vulnerable one. The work you have been doing across seven chapters is the work of integration, gathering the pieces into a whole, and the whole is more than the sum of the pieces because the coherence itself produces capacities that the fragments could not."
        },
        middle: "Hold the whole arc at once, character, tension, gold, source, narrative, dream, and feel them gather into one. Write from the Self, the one who has been all of it.",
        lore: {
          title: "What you really are is much larger than any character you have been playing.",
          body: "The Vedantic tradition went furthest in articulating it. The atman, the individual self, is also Brahman, the universal Self. The wave is not separate from the ocean. The character is not separate from the source that authors the character. Realization is the recognition of what was always there, masked by identification with the small self. Christ consciousness, that I and the Father are one. Buddha nature, the awareness that has always been the ground. The Sufi fana followed by baqa, the dissolution into the larger one followed by the abiding in it. Of course you are bigger than the character. The character was always a costume. The Self is what was wearing it."
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
        body: "When you have written the ending, take it somewhere that matters. A trail, a mountaintop, a river, a grove where the trees have been standing longer than your problems. Bring a witness, someone whose presence you trust enough to be fully seen in. Bring something to burn or bury or release. Speak the old story closed, out loud, slowly enough to feel each sentence land in your body on its way out into the world.\n\nHow epic is your ending? The answer matters more than you think, because the nervous system calibrates the significance of an experience to the ritual surrounding it. A thought in your head is a thought. A sentence written in a journal is heavier. A declaration spoken aloud is heavier still. A declaration spoken aloud to a witness, in a place that matters, with fire or water or earth as participant, is the heaviest thing a human being can do with language. The grandmothers knew this. The neuroscience confirms it.",
        code: {
          title: "The body and the witness co-author the new reality.",
          body: "When you speak with your whole body, the interoceptive signals feeding back to your brain confirm what you are saying, the body co-signing the story in real time. And when a witness is present, their nervous system mirrors yours, two systems locking into a shared construction more real than anything either mind could produce alone. Oxytocin flows in both, the bonding chemistry that makes the shared construction hold. This is why the spoken ceremony produces changes that journaling alone cannot, because the story has entered a second nervous system and taken up residence there, and the witness will hold you to it in every subsequent interaction whether they mean to or not."
        },
        middle: "Plan your ceremony. Where will you go? Who will witness? What will you do with your hands?\n\nWhat ritual does this ending deserve?",
        lore: {
          title: "The body has always been the temple where the transformation gets sealed.",
          body: "The Lakota offered the body through the sun dance, four days without food or water, dancing toward the sun, because the offering of the body is the offering the spirit world cannot refuse. The Sufis spun until the small self fell away. The Aboriginal initiates marked the body with the songs of their Country. The Christian baptism submerges the old self in water and raises the new one dripping and gasping. Of course the body seals it. A transformation the body has not participated in is an idea. A transformation the body has been through is a fact."
        },
        closing: "Write the plan for your ending ritual. Where will you go? Who will witness? What ceremony will you create? Then write what you will say when you speak.",
        prompt: { key: "p7_ceremony", placeholder: "I will go to… I will gather… I will say…", rows: 12, big: true }
      },
      {
        kind: "finale",
        title: "The Telling",
        subtitle: "Author · Speak the new story into being",
        body: "Read your ending aloud to the witness. Speak slowly enough to feel each sentence land, and watch where the voice catches, because something real is moving through, something older than you, something that has been moving through human beings in exactly this way for as long as there have been fires to gather around.\n\nWhen the Buddha came down from the mountain, he did not meditate in silence for the rest of his life. He told the story. He walked from village to village for forty-five years telling anyone who would listen what he had seen, because the seeing was incomplete without the telling, because insight that stays private is insight that dies with the one holding it. Every prophet descends with a message. Every revolutionary speaks a new world into the ears of the one that exists. The grandmother gathering children around a dying fire is wielding the same power, because the power is the same: a human voice carrying a true story into another nervous system where it takes root and grows and outlives the one who planted it. You are stepping into that lineage now. The storyteller has always been the most powerful person in the room, and the role has been waiting for you.",
        code: {
          title: "Story is the original coordination technology, and you are using it for its original purpose.",
          body: "Hasson showed that when you tell your story, the listener's brain mirrors yours, and in moments of deep understanding their brain runs ahead, predicting your neural patterns before you produce them, two nervous systems locking into a shared construction that rewires both. Dunbar showed this is how human groups grew beyond grooming size and cohered into something larger, one voice around a fire synchronizing the nervous systems of an entire band, transmitting knowledge, values, and identity through the medium the brain was built to receive. Story was the first technology that allowed civilization to scale. The campfire three hundred thousand years ago is the same circuit forming between you and your witness right now. You are using the original tool for its original purpose, at the end of one story and the beginning of the next."
        },
        middle: "Speak the new story to the witness, then write what happened between you, what moved, what shifted, what became real in the telling that was not real before.\n\nThen write the first line of the next chapter.",
        lore: {
          title: "The storyteller shapes the world, and you are the storyteller now.",
          body: "All words are magic words. The grammar of story is the grammar of reality. Every world that has ever existed, including the one you are sitting inside right now, was spoken into being by someone who believed it hard enough to say it out loud and found others who believed it hard enough to live inside it. That is what money is. That is what a nation is. That is what a marriage is. A story enough people are telling at the same time. You are the storyteller now, carrying the story of your own transformation, and every time you tell it the circuit fires and the story becomes more real and the world it describes gets closer to arriving."
        },
        closing: "Speak the ending aloud to your witness. Then write what the speaking produced, what moved, what shifted, what became real in the telling. Then write the first line of what comes next."
      }
    ]
  }
];

export default CHAPTERS;
