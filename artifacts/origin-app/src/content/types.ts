export type ElementType =
  | 'body' | 'bodyItalic' | 'sectionLabel'
  | 'chapterCode' | 'chapterLore' | 'stepInsight'
  | 'somatic' | 'breath' | 'prompt' | 'threshold'
  | 'centerText' | 'rule' | 'gather';

export interface BodyElement       { type: 'body';         text: string }
export interface BodyItalicElement { type: 'bodyItalic';   text: string }
export interface SectionLabelElement { type: 'sectionLabel'; text: string }
export interface ChapterCodeElement {
  type: 'chapterCode'; id: string;
  essence: string; expandedContent: string;
}
export interface ChapterLoreElement {
  type: 'chapterLore'; id: string;
  essence: string; expandedContent: string;
}
export interface StepInsightElement {
  type: 'stepInsight'; id: string; unlocksAfter: string;
  codeEssence: string; loreEssence: string;
}
export interface SomaticElement    { type: 'somatic';      text: string }
export interface BreathElement     { type: 'breath'; id: string; pattern: string; duration: number; label: string }
export interface PromptElement     { type: 'prompt'; id: string; text: string; rows?: number; big?: boolean }
export interface ThresholdElement  {
  type: 'threshold'; text: string;
  promptId?: string; promptPlaceholder?: string; promptRows?: number; promptBig?: boolean;
}
export interface CenterTextElement { type: 'centerText';   text: string }
export interface RuleElement       { type: 'rule' }
export interface GatherLine        { text: string; promptId?: string; fixed?: boolean }
export interface GatherElement     { type: 'gather'; lines: GatherLine[] }

export type ChapterElement =
  | BodyElement | BodyItalicElement | SectionLabelElement
  | ChapterCodeElement | ChapterLoreElement | StepInsightElement
  | SomaticElement | BreathElement | PromptElement | ThresholdElement
  | CenterTextElement | RuleElement | GatherElement;

export interface ChapterDef {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  epigraph: string;
  elements: ChapterElement[];
}
