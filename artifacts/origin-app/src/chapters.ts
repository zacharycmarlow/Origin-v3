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
  locked?: boolean;
  palette: Palette;
  invocation: string;
  transition?: string;
  scenes: Scene[];
}

const CHAPTERS: Chapter[] = [
  {
    roman: "I",
    title: "The Opening",
    subtitle: "See the story you have been living inside.",
    palette: { bg: "#ece1c3", ink: "#4a3a24", accent: "#c89838", veil: "#e3d6b2", glow: "#4ff0d6", shadow: "#8a5a24", dark: false },
    invocation: "Life is a movie, and yours is playing right now, full of the drama and betrayal and comedy and devastating loss you binge on screens, the things we assume belong to fictional people in fictional worlds.\n\nThe stories that wreck you on screen wreck you because they are already in you. The grief you feel watching a stranger's loss is your grief. The hope you feel at the end is your hope. The screen is the mirror. Your life is the thing being reflected.\n\nYour brain is a story engine that treats narrative as reality. That is why you watch a film and cry. The tears are real, because some old part of you experiences the story as reality itself. So if narrative is reality to the brain, then reality is your narrative. Your life is a movie. And if story is that real to you, then your life is the most important movie ever made.\n\nYou have just been sitting so close to the screen that you forgot you were the one directing it all.\n\nIt asks four things of you. Watch the movie. See the character. See the whole plot. And tell the movie.",
    transition: "You have a film now. The scenes, the character, the plot, the whole arc visible for the first time. And you told everything the camera can see.\n\nEverything the camera cannot see is next. The footage you have been cutting from every draft. The scenes too dark or too raw for the room. Good. Every director knows the best footage is the footage that scares them.\n\nThat walk inward is what turns a decent film into the kind of story that changes a life.",
    scenes: [
      {
        kind: "arrive",
        title: "The Screen",
        subtitle: "Watch the movie",
        body: "You know what it feels like to watch a great film — to see someone's whole life unfolding on screen and feel the tenderness of knowing where it is heading before they do. That tenderness comes naturally from outside, because from the audience seat the setbacks serve the character, the wounds are shaping someone, and the whole thing has the quality of going somewhere even when it felt aimless to the person living it.\n\nClose your eyes. You're sat in a movie theatre. Front and centre. You have a bucket of popcorn.\n\nThe movie begins. You're the main character of this movie, and it plays out from your first memory all the way until you opened this guide.\n\nYour life flashes before your eyes. The broken toy or the spilled dinner. The first experience of the ocean or the mountains. The high school romance. The first job. The first car. The pain. The joy. The lessons and the victories.\n\nYour tenderness for the hero of this movie grows as you watch things outside their control unfold before them. Those lessons and victories were narrative tools, defining moments in the formation of a character being built to steal the show.\n\nWhat kind of movie is it? A drama, a comedy, a thriller, an adventure that took a wrong turn and is finding its way back? What scenes stand out as pivotal to this hero's journey?",
        code: {
          title: "The moment you watch the watcher, the spell changes hands.",
          body: "Twenty-some years ago, scientists scanning brains between tasks expected to find silence and found the opposite: a network that burns brighter when you are doing nothing than when you are solving hard problems. The most expensive thing your brain does is sit in the dark and tell you the story of you. And the spell has one condition: that you stay inside the scene. The moment you take the audience seat and watch your life as a movie, the machinery registers the change. Watching the watcher is the oldest trick in every tradition, and it is the first move in this book, because once you are outside the story, something becomes visible that could never be seen from inside."
        },
        middle: "Take the seat right now. Watch the movie of your life from the audience's point of view, and look at the character from the outside. Give it your name. Feel the shift from being the character to seeing them. That shift is the move you will use through this entire book.",
        lore: {
          title: "The first audiences ducked.",
          body: "At the very first film screenings, more than a century ago, a train rushed toward the camera, and people in the seats flinched and gasped, because their bodies believed the train. A hundred years of cinema later, you still grip the armrest at the horror film, still cry at the reunion you know is scripted. The body never learned the difference between story and reality. It was never supposed to. That is the power you are now holding in your own two hands."
        },
        closing: "See the scene the audience cannot forget.",
        key: "p1_screen"
      },
      {
        kind: "prompt",
        title: "The Role",
        subtitle: "See the character",
        body: "The world is one big stage, and this character has played their part so convincingly they forgot they were acting. The role was assigned without any auditions. Family wrote it, culture directed it, and circumstances demanded it. They read their lines so faithfully the lines became the voice, and the voice became the person you watch on screen today.\n\nWatch the performance the way a camera would. The way this character enters a room. The thing they always say. What they do when things get hard. The smile that appears on cue. The work they bury themselves in. The exits they make. Every repeated behavior is a line in the script, visible from the audience seat, and the audience can see the role where the actor only feels the part.\n\nWe are who we pretend to be. Which is a little freaky. And also the most hopeful thing in this chapter. Because if the pretending made this character, then pretending can also make them something else. The next version of you is one story away.",
        code: {
          title: "The body performs the character it believes.",
          body: "Give a person a sugar pill with a good enough story attached, and the body produces real chemistry: pain easing, symptoms lifting, measurable changes generated by a story alone. The performance runs that deep. The body acts out whatever character it believes it is playing, and the deeper mind works full-time to keep the character consistent, gathering the evidence that fits the role and quietly losing the evidence that doesn't. This is why fighting a behavior head-on so often fails. The behavior is loyal to the character. Hand the engine a new character, and the evidence starts changing sides."
        },
        middle: "Catch the performance live. Think of the last room this character walked into, and watch the role switch on: the posture, the voice, the line they always deliver. See the costume as a costume, just for a moment, while the audience takes notes.",
        lore: {
          title: "The word person means mask.",
          body: "When the ancient actors stepped onto the stage, they performed through carved masks. When the Romans needed a word for an individual human being, they reached into the theater and took the word for the mask itself: persona. Person. The languages have been telling us for two thousand years that every self is a part being played. Shakespeare said all the world's a stage, and he meant it as a key, hidden in plain sight. You have always been wearing a mask. Now you get to carve it yourself."
        },
        closing: "See the part this character has been playing.",
        key: "p1_role"
      },
      {
        kind: "prompt",
        title: "The Big Picture",
        subtitle: "See the whole plot",
        body: "Every one of us is on a journey. Every character has an arc. A good film is going somewhere.\n\nAnd an epic has sweep: many locations, spans of years, whole eras passing in a single cut. The childhood house. The city they fled to. The year everything was on fire. The stretch where nothing seemed to happen and everything was quietly being built. Zoom way out, until the whole map of this character's life is visible at once, and watch it the way you watch a great film the second time.\n\nYou know that feeling. The scene you barely noticed now carries the theme. The ending was quietly present from the very first scene, building the whole time. You just could not see it until you knew where it was going.\n\nThat is about to happen with your life.\n\nFrom this altitude, the golden thread starts to show itself: the thing running through every chapter in different costumes. And if the distance between where you are and where the thread is pulling seems vast: good. The one with the furthest to travel has the most extraordinary film ahead. That distance is the setup.\n\nFrom here, the scattered pieces start to look placed with intention, every loss opening the space the next chapter needed. A life seen as a purposeful journey and a life seen as a random sequence of events are two different lives running on the same footage. The director sees the whole thing and decides what it means.\n\nYou are deciding right now.",
        code: {
          title: "Memory is a live document. Every time you remember, you hold the pen.",
          body: "For a long time everyone assumed memory worked like a recording: fixed footage, played back on demand. Then scientists discovered something far stranger. Every time you recall a memory, the brain takes the file off the shelf, opens it, and saves it back changed by the visit. Remembering is rewriting. The past is a live document, edited every time you return to it. So when you go back to an old scene carrying new meaning, the meaning gets saved into the scene itself, and from that day forward, the same footage does different work in your life."
        },
        middle: "Test the pen. Pick one small memory, return to it from the audience seat, and carry one question into the scene: what was this building toward? Watch what the scene does when you visit it with that question in hand. You just edited the footage.",
        lore: {
          title: "The thread through the labyrinth.",
          body: "The old story says the labyrinth was unbeatable, until Ariadne handed the hero a single thread and the thread turned the maze into a path. Every life is a labyrinth from the inside: turns, dead ends, passages that seem to lead nowhere. The plot is your thread. Follow it backward through the chapters and you will find it was always in your hand, and it was always leading here."
        },
        closing: "See the whole plot at once.",
        key: "p1_bigpicture",
        rows: 6
      },
      {
        kind: "threshold",
        label: "The Movie",
        subtitle: "Author · Tell the whole film",
        body: "Here is the deepest part. Some part of you dreams the next moment before it arrives, and then the world shows up to match what it expected. Most of a life runs this way: a story playing on repeat, reality shaping itself to match, the whole thing filed under what happened to me.\n\nAnd here is the magic in the mystery. That same power will perform any story you give it, with equal conviction. The deeper mind performs whatever script it is handed, true or invented, with the same devotion, so the movie you tell here is the movie your life is about to perform.\n\nEvery creation story ever told was a technology for producing the present. That is what you are doing right now, for your life.\n\nBefore you roll camera, three clichés to dodge.\n\nThe Contrived One. Everything arranged for the camera. Coincidence doing the work that character should do. The trailer is better than the film, and nobody believes a minute of it.\n\nThe Mindless Action Flick. Explosions every five minutes, things happening for the sake of happening, and when the credits roll you cannot remember what any of it was for.\n\nMain Character Syndrome. One face gets every close-up and everyone else is cardboard. The audience quietly starts rooting against the hero.\n\nDodge all three the same way: keep it true, make it mean something, and give the other characters their scenes.",
        code: {
          title: "The whole story makes the strongest spine.",
          body: "Researchers who study how people survive the worst things keep finding the same pattern. The ones who weather life best are the ones who can tell their life as one coherent story, dark scenes included, every loss given its place in the plot. And the effect runs deeper than mood. People who write their hardest chapters into a story that holds together show real changes in the body: stress chemistry dropping, health measurably improving, because a story that makes sense costs less to carry than a past in pieces. The movie you are about to tell is structural. It is load-bearing for everything that comes next."
        },
        middle: "Now marvel. The comic book movies tried to take that word from you. Take it back. Stand back and truly marvel at this life, at the impossible wonder that made you: the odds against you existing at all, the cast that assembled itself, the timing of the doors. What if everything happened perfectly? What if it all happened for a reason? Hold that question while you watch the whole arc one more time. It changes how the movie reads.",
        lore: {
          title: "In the beginning was the word.",
          body: "Every people on earth opens its story the same way. A voice speaks, and a world appears. Light from the dark, land from the water, order from the chaos, all of it spoken into being. The creation story is the oldest form there is, and its secret has never changed: the telling produces the world. What you are about to tell is a creation story. Tell it the way they have always been told, as already true."
        },
        closing: "Imagine everything up to this moment is the opening of the film. You have just left the theater. Describe the movie: what happens, scene by scene, who this character is, what every scene was building toward. Past tense, from the audience seat, with love.",
        prompt: { key: "p1_movie", placeholder: "There was a person who…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "II",
    title: "The Conflict",
    subtitle: "Face the challenges that make the story interesting.",
    locked: true,
    palette: { bg: "#3a1020", ink: "#f0d4c4", accent: "#d47060", veil: "#5c2030", glow: "#e07060", shadow: "#a03040", dark: true },
    invocation: "There was a species so gifted at making stories it forgot the stories were there.\n\nInto that world a character was born, handed a script about what they were worth and what love costs and what had to be endured, and they absorbed it with the genius of an organism taking the shape of its container. The conflict is the alarm, and the alarm going off is the most hopeful thing that has happened in years.\n\nYou know the form this part of the story needs. Two in the morning, one more chapter, a book refusing to let you sleep. What held you there was never comfort. It was tension. The conflict is what makes a story interesting. A story without tension is boring, and so is a life.\n\nFour movements. Meet the antagonist. Feel the scars. Find the motive. And write the breaking point.",
    transition: "The breaking point is written. The character who was performing scripts they never chose just took the pen back.\n\nAnd the pen wants to write something the old script never predicted: the chapter where all this suffering turns out to have been the setup. The material that has been the heaviest thing you carry is about to become the most valuable thing you own.\n\nWhat if the worst thing that ever happened to you was the preparation for the best thing you will ever do?\n\nThat is the twist. And the twist is next.",
    scenes: [
      {
        kind: "prompt",
        title: "The Antagonist",
        subtitle: "Hold the forces in opposition",
        body: "Something has been pushing against this character since page one.\n\nThe conditions and the circumstances. The system that never explains itself. The scarcity that arrived before they did. The expectations, the gatekeepers, the storms. In a great book this force has a name: the antagonist. And the antagonist is rarely a villain. The strongest novels set their protagonist against forces: the small town and its verdicts, the war, the poverty, the institution, the sea itself.\n\nThe word is older than the form. Agon, the struggle, the contest at the center of every drama. The antagonist is what struggles against you, and agony is what the struggle feels like from inside. To be in agony is to be in the contest. You have been in the contest your whole life.\n\nSo name what has been opposing this character. The conflicts you carried into this chapter are exactly the material: the struggle that keeps finding you, the fight you keep having, the situation you do not want to be in but are.\n\nAnd as you gather them, watch for the deepest pattern of all: some of these conflicts keep returning. The same wall in different cities. The same ending with different people. The same shortage wearing different numbers. Here we go again. The recurring antagonist is the cycle, and the cycle is one of the most valuable clues in this entire book.",
        code: {
          title: "The mind cannot put down what is unresolved.",
          body: "A psychologist sitting in a café noticed something odd about the waiters: they remembered every detail of the open orders and forgot them the instant the bill was paid. The mind grips the unresolved. An open conflict forks the future into possibilities, the inner model cannot collapse to a single prediction, and attention locks on until the tension resolves. This is why the conflicts in your life feel so loud from inside: the mind is doing exactly what minds do with an unfinished story. And it is why a reader cannot put down a novel in the middle of the climax."
        },
        middle: "Hold one open conflict right now. Pick the loudest one, the one gripping your attention this week, and instead of solving it or escaping it, hold it at reading distance: give it a name, like a chapter title. Feel the grip loosen one notch the moment it has a name. That loosening is the holding working.",
        lore: {
          title: "The wheel turns until someone sees the wheel.",
          body: "Kafka wrote a whole novel called The Trial, about a man prosecuted by a system that never explains itself, and everyone who reads it recognizes their own life. The old traditions saw the deeper pattern beneath the recurrence. The Hindus named it karma: conditioning moving through action and consequence and back into conditioning, the groove deepening with every pass. The Buddhists called it samsara, the constructed reality so total that the beings inside mistake it for the world. Here we go again, says everyone who has ever watched someone they love walk into the same wall a fifth time. The wheel turns because the wheel is the only shape the system knows, and it keeps turning until someone sees the wheel. Seeing the wheel is this chapter's entire purpose."
        },
        closing: "Hold the forces in opposition.",
        key: "p2_antagonist",
        rows: 7
      },
      {
        kind: "prompt",
        title: "The Scars",
        subtitle: "Hold what it left in you",
        body: "The pain did not arrive all at once. It built the way scar tissue builds, layer over layer, each layer protecting the one beneath, until you stopped feeling the original wound and started feeling the scar instead. And then you stopped feeling even that, and started calling it your personality. The tightness in the shoulders. The thing that happens in the stomach when a certain kind of silence falls in a certain kind of room. The brace before opening certain messages.\n\nThe story embedded itself in the body. The body has been telling it ever since.\n\nNow hold the scars the way the best storytellers hold theirs: with pride. They are tattoos life gave you, each one a story unto itself. The addiction was an adaptation to a crazy environment, and surviving both is the tale. The debt is proof you dared to build something big enough to crash. The vigilance was trained into a kid who needed it, and it kept that kid alive. Worn right, the scars are credentials: evidence of what this character endured and kept going through, the exact material that makes a stranger trust them later.",
        code: {
          title: "The body performs the script, and it will perform the next one too.",
          body: "The pain firing right now is a performance happening in the present: the body running a forecast calibrated under old conditions, manufacturing the tension and the dread before the event arrives, because the script calls for dread and the body performs whatever the script calls for, with total conviction, without checking whether the script is current. The forecast then confirms itself, because the body just produced the evidence the forecast needed. And there is the cheat code hiding in plain sight: the script is the leverage point. The body performs futures. Change the script, and it will perform the one you author next with the same total conviction."
        },
        middle: "Hold the scar in the body, right now. Find the tightness, the brace, the weight, and breathe into it. Ask it: what script is performing? How long has this been on autopilot? Whose script was it before it was yours? You are reading the first text. Stay with it one breath longer than is comfortable.",
        lore: {
          title: "The body is the first text.",
          body: "\"Get it off your chest.\" \"Carrying the weight of the world.\" The language already knew what the research confirmed: the story and the body are the same text written in two scripts, and working one is working the other. The yogic traditions read the body as scripture for millennia. The shamanic traditions drummed and sweated and danced the old scripts out of the tissue, because the tissue is where the scripts live before the mind has words for them."
        },
        closing: "Hold what the struggle left in this character.",
        key: "p2_scars",
        rows: 6
      },
      {
        kind: "prompt",
        title: "The Motive",
        subtitle: "Hold the inner world",
        body: "Why did this character stay?\n\nThat is the most fascinating question in this whole novel. Why does anyone stay inside a conflict they do not want? Stay in the pattern, the cycle, the situation they complain about, the wall they keep walking into? You have watched yourself do the thing you swore you would never do again, and felt the bewilderment of acting against your own stated values. Every human alive knows that bewilderment. The novel exists because of it.\n\nYour inner narrator is unreliable too. There is the story this character tells, and there is what this character does. Said they wanted connection, kept choosing distance. Claimed to want out, kept renewing the lease. The gap between the telling and the doing is where the truth of a character lives. Finding your gap is finding the engine of your whole plot.\n\nAnd here is the answer to why they stayed: the character is plural. Part of them wanted out, and part of them was comfortable in what it knew. Each part has its own motive, its own logic, its own job. None of them is less dimensional than the others. The inner world is itself a novel with a full cast, and the conflict between those characters is what kept the cycle turning.\n\nWe contain everything. The cruelty and the grace, the part that wants to change and the part terrified of changing. Hold all of it with the novelist's curiosity, because every part was being paid. The cycle pays: in comfort, in familiarity, in the quiet relief of a prediction confirmed.",
        code: {
          title: "The cycle pays, and breaking it pays more.",
          body: "The brain rewards a confirmed prediction with something subtle: the absence of punishment. The comfort of the familiar story is real, and it is the cheapest comfort the system sells. Staying the same is thermodynamically correct, the brain succeeding brilliantly at the wrong thing. Depression is often a brain that has become extremely good at predicting a world it doesn't want to live in. And here is the twist nobody tells you: the brain pays more for breaking the loop. A genuine surprise, a real prediction error, produces a bigger spike than any confirmation ever could. The brain funds the revolution more generously than the status quo."
        },
        middle: "Hold the question without flinching. Take one pattern that kept repeating and ask it, with the novelist's curiosity instead of the judge's: what was this paying me? Comfort, safety, belonging, the relief of being right about the world? Let the answer come without shame. It is physics. And it is also the key.",
        lore: {
          title: "The line runs through every heart, and the buried parts hold the treasure.",
          body: "A man who survived the labor camps wrote that the line between good and evil runs through every human heart, and he wrote it from a place where he watched the line move through prisoners and guards alike. The wisest of the psychologists named the shadow, and he meant everything that went underground: the rage and the tenderness, the hunger and the gift, all of it pushed beneath the surface by a container with limited tolerance for the full range. The confession traditions knew the rest: naming what is hidden stops it running you in the dark. The shadow is where the family silver got buried along with the bodies. Going down to look is how you get both back."
        },
        closing: "Hold the inner world: the parts and their motives.",
        key: "p2_motive",
        rows: 8
      },
      {
        kind: "threshold",
        label: "The Novel",
        subtitle: "Author · Write the breaking point",
        body: "The pressure has been building the whole time.\n\nThe antagonist closing in. The old wounds aching. The parts pulling in opposite directions. The gap between the told story and the lived one stretching wider, chapter by chapter, until the structure cannot hold. The wall. The bottom. The morning the performance would not start. And then the scene the reader has been waiting for: the character stops, and something in them says enough. The cycle cracks. The climax of the old story is the opening of the new one.\n\nThat scene exists in your life. You may be living it right now. This is where you write it.\n\nHere is the novelist's secret: accountability and compassion, held in the same hand. Accountability without compassion is punishment, which has never transformed anyone. Compassion without accountability is avoidance, which is how the script got this far. The position that creates change holds both at once: I see exactly how this character was written, and I am the one writing what happens next.\n\nBefore you write, three clichés to dodge.\n\nThe Boring One. Nothing happens. The same chapter rewritten with different dates. The reader drifts away, because nothing is at stake and nothing ever changes.\n\nThe Melodrama. Constant crisis, and all of it somebody else's fault. The same wound in new costumes every chapter, and by the last page the character has learned nothing.\n\nThe Airport Thriller. Pure momentum. Never a quiet scene, nobody ever sits with what just happened, and at the end nothing was built.\n\nAll three are the same dodge: avoiding the interior. Write the one they are all avoiding.",
        code: {
          title: "The shape of the story predicts the future better than the events in it.",
          body: "Researchers studying thousands of life stories found something that should change how every hard chapter gets written. People whose stories carry a redemptive arc — where the suffering leads somewhere and the pain becomes the making of them — measurably thrive. People whose stories carry the same events told as pure contamination measurably struggle. The events matter less than the arc. The same life, told with a different shape, produces a different future, because the deeper mind performs the shape it is given. So write the conflict in full, spare nothing, and give it the arc of redemption: this happened, it cost what it cost, and it was the forging."
        },
        middle: "Do the novelist's pass. Read back through what you have written — the antagonist, the scars, the motives — and underline the places where they collide. The collisions are your scenes. The biggest collision is your climax. You cannot be bored by something you have never seen, and the first thing you have never seen is yourself, whole, from this seat. Feel the interest rising. That is the call to adventure.",
        lore: {
          title: "The healer's qualification is the wound they survived.",
          body: "In the old cultures, the healer was chosen by affliction. The initiatory crisis takes them apart, sometimes for years, through illness and visions the community recognizes as the spirit world reshaping a human into an instrument of healing. Chiron, the wounded one, carried an injury he could never cure and became the teacher of all who heal. The pattern repeats across every tradition for one reason: the one who has been to the bottom and come back is trustworthy in a way no credential can match. Every wound on these pages is a future qualification. Somewhere out there, someone is waiting for the person you become by surviving this."
        },
        closing: "Third person, inside the head, with the novelist's double vision: total honesty and total compassion in one hand. Let the motives speak. Give it the redemptive arc: the suffering as the forging. End at the turn.",
        prompt: { key: "p2_novel", placeholder: "The chapter where the tension snapped…", rows: 12, big: true }
      }
    ]
  },
  {
    roman: "III",
    title: "The Twist",
    subtitle: "Turn everything you survived into gold.",
    locked: true,
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
    subtitle: "Touch the source code of what you are.",
    locked: true,
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
    title: "The Reality",
    subtitle: "See through the mythology and rewrite it.",
    locked: true,
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
    subtitle: "Enter the adventure of your own future.",
    locked: true,
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
    title: "The Return",
    subtitle: "Bring the story back and make it real.",
    locked: true,
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
