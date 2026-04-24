const NS = 'origin.v2';

function genId(): string {
  return 'anon-' + Math.random().toString(36).slice(2, 10);
}

interface UserData {
  userId: string;
  currentChapterId: string;
  completedChapters: string[];
  responses: Record<string, string>;
  unlockedStepInsights: string[];
  unlockedChapterCodes: string[];
  unlockedChapterLore: string[];
}

function load(): UserData {
  try {
    const raw = localStorage.getItem(NS);
    if (raw) return JSON.parse(raw) as UserData;
  } catch {}
  return {
    userId: genId(),
    currentChapterId: '',
    completedChapters: [],
    responses: {},
    unlockedStepInsights: [],
    unlockedChapterCodes: [],
    unlockedChapterLore: [],
  };
}

function persist(data: UserData): void {
  localStorage.setItem(NS, JSON.stringify(data));
}

export const UserStore = {
  getData(): UserData { return load(); },

  getUserId(): string { return load().userId; },

  getCurrentChapterId(): string { return load().currentChapterId; },
  setCurrentChapterId(id: string): void {
    const d = load(); d.currentChapterId = id; persist(d);
  },

  getCompletedChapters(): string[] { return load().completedChapters; },
  isChapterCompleted(id: string): boolean { return load().completedChapters.includes(id); },

  completeChapter(chapterId: string, codeId: string, loreId: string): void {
    const d = load();
    if (!d.completedChapters.includes(chapterId)) d.completedChapters.push(chapterId);
    if (!d.unlockedChapterCodes.includes(codeId)) d.unlockedChapterCodes.push(codeId);
    if (!d.unlockedChapterLore.includes(loreId)) d.unlockedChapterLore.push(loreId);
    persist(d);
  },

  saveResponse(promptId: string, text: string): void {
    const d = load(); d.responses[promptId] = text; persist(d);
  },
  getResponse(promptId: string): string { return load().responses[promptId] || ''; },

  unlockInsight(insightId: string): void {
    const d = load();
    if (!d.unlockedStepInsights.includes(insightId)) d.unlockedStepInsights.push(insightId);
    persist(d);
  },
  isInsightUnlocked(id: string): boolean { return load().unlockedStepInsights.includes(id); },

  isCodeUnlocked(id: string): boolean { return load().unlockedChapterCodes.includes(id); },
  isLoreUnlocked(id: string): boolean { return load().unlockedChapterLore.includes(id); },

  reset(): void { localStorage.removeItem(NS); },
};
