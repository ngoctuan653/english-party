import { Timestamp } from 'firebase/firestore';
import rawQuestions from './generated/cefr-questions.json';
import rawVocabulary from './generated/cefr-vocabulary.json';
import type { Question, CefrSkill } from '@/types/question';
import type { VocabWord } from '@/types/vocabulary';
import type { CefrLevel } from '@/types/cefr';
import { cefrLevelFromDifficulty } from '@/types/cefr';

export interface QuestionBankFilters {
  exam?: string;
  skill?: CefrSkill;
  part?: number;
  topic?: string;
  difficulty?: number;
  type?: string;
  cefrLevel?: CefrLevel;
}

const bundledQuestions: Question[] = (rawQuestions as any[]).map((item) => ({
  ...item,
  exam: 'cefr',
  skill: item.skill as CefrSkill,
  cefrLevel: (item.cefrLevel ?? cefrLevelFromDifficulty(item.difficulty)) as CefrLevel,
  type: item.type as Question['type'],
  createdAt: Timestamp.fromMillis(0),
  updatedAt: Timestamp.fromMillis(0),
}));

const bundledVocabulary: VocabWord[] = (rawVocabulary as any[]).map((item) => ({
  ...item,
  exam: 'cefr',
  cefrLevel: (item.cefrLevel ?? 'B2') as CefrLevel,
  createdAt: Timestamp.fromMillis(0),
}));

export function getBundledQuestions(filters: QuestionBankFilters = {}): Question[] {
  if (filters.exam && filters.exam !== 'cefr') return [];

  return bundledQuestions.filter((item) => {
    if (filters.skill && item.skill !== filters.skill) return false;
    if (filters.part && item.part !== filters.part) return false;
    if (filters.topic && item.topic !== filters.topic) return false;
    if (filters.difficulty && item.difficulty !== filters.difficulty) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
    return true;
  });
}

export function getBundledLevelCount(level: CefrLevel, type?: string): number {
  return getBundledQuestions({ cefrLevel: level, type }).length;
}

export function getBundledQuestionCount(skillOrPart: CefrSkill | number, topic?: string, cefrLevel?: CefrLevel): number {
  if (typeof skillOrPart === 'string') {
    return getBundledQuestions({ skill: skillOrPart, topic, cefrLevel }).length;
  }
  return getBundledQuestions({ part: skillOrPart, topic, cefrLevel }).length;
}

export function getBundledTopics(skillOrPart: CefrSkill | number, cefrLevel?: CefrLevel): Array<{ topic: string; count: number }> {
  const counts = new Map<string, number>();
  const filter = typeof skillOrPart === 'string' ? { skill: skillOrPart, cefrLevel } : { part: skillOrPart, cefrLevel };

  getBundledQuestions(filter).forEach((item) => {
    counts.set(item.topic, (counts.get(item.topic) ?? 0) + 1);
  });

  return Array.from(counts, ([topic, count]) => ({ topic, count })).sort((a, b) =>
    a.topic.localeCompare(b.topic),
  );
}

export function getBundledVocabulary(filters: { topic?: string; cefrLevel?: CefrLevel; search?: string } = {}): VocabWord[] {
  return bundledVocabulary.filter((item) => {
    if (filters.topic && filters.topic !== 'all' && item.topic.toLowerCase() !== filters.topic.toLowerCase()) return false;
    if (filters.cefrLevel && item.cefrLevel !== filters.cefrLevel) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchWord = item.word.toLowerCase().includes(q);
      const matchDef = (item.definitionNative || '').toLowerCase().includes(q) || item.definition.toLowerCase().includes(q);
      if (!matchWord && !matchDef) return false;
    }
    return true;
  });
}

export function getBundledVocabTopicCounts(cefrLevel?: CefrLevel): Record<string, number> {
  const counts: Record<string, number> = {};
  bundledVocabulary.forEach((item) => {
    if (!cefrLevel || item.cefrLevel === cefrLevel) {
      counts[item.topic] = (counts[item.topic] || 0) + 1;
    }
  });
  return counts;
}
